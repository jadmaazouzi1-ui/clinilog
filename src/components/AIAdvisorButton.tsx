"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserContext {
  name: string | null;
  school: string | null;
  gradYear: string | null;
  specialty: string | null;
  totalHours: number;
  hoursByType: Record<string, number>;
  experienceCount: number;
}

function buildContextString(ctx: UserContext): string {
  const lines: string[] = [];
  if (ctx.name) lines.push(`Name: ${ctx.name}`);
  if (ctx.school) lines.push(`Undergraduate school: ${ctx.school}`);
  if (ctx.gradYear) lines.push(`Expected graduation year: ${ctx.gradYear}`);
  if (ctx.specialty) lines.push(`Interested specialty: ${ctx.specialty}`);
  lines.push(`Total logged hours: ${ctx.totalHours}`);
  lines.push(`Experiences logged: ${ctx.experienceCount}`);
  if (Object.keys(ctx.hoursByType).length > 0) {
    const breakdown = Object.entries(ctx.hoursByType)
      .map(([type, hrs]) => `${type.replace("_", " ")}: ${hrs} hrs`)
      .join(", ");
    lines.push(`Hours breakdown: ${breakdown}`);
  }
  if (!ctx.name && !ctx.school && ctx.totalHours === 0) {
    lines.push("Note: The student has not yet filled in their profile or logged any hours.");
  }
  return lines.join("\n");
}

export default function AIAdvisorButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCtx, setUserCtx] = useState<string>("");
  const [ctxLoaded, setCtxLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadContext = useCallback(async () => {
    if (ctxLoaded) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, expRes] = await Promise.all([
      supabase.from("profiles").select("full_name, school, grad_year, specialty").eq("id", user.id).single(),
      supabase.from("experiences").select("type, hours"),
    ]);

    const profile = profileRes.data;
    const exps = expRes.data ?? [];

    const hoursByType: Record<string, number> = {};
    let totalHours = 0;
    for (const e of exps) {
      hoursByType[e.type] = (hoursByType[e.type] ?? 0) + e.hours;
      totalHours += e.hours;
    }

    const ctx: UserContext = {
      name: profile?.full_name ?? null,
      school: profile?.school ?? null,
      gradYear: profile?.grad_year ?? null,
      specialty: profile?.specialty ?? null,
      totalHours,
      hoursByType,
      experienceCount: exps.length,
    };

    setUserCtx(buildContextString(ctx));
    setCtxLoaded(true);
  }, [ctxLoaded, supabase]);

  useEffect(() => {
    if (open) {
      loadContext();
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm your AI pre-med advisor. I can see your CliniLog profile and logged hours. What questions do you have about your medical school journey?",
        }]);
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, loadContext, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userContext: userCtx }),
      });
      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        const snippet = raw.slice(0, 180).replace(/\s+/g, " ").trim();
        setMessages(prev => [...prev, { role: "assistant", content: `Server returned non-JSON (status ${res.status}): ${snippet || "empty body"}` }]);
        return;
      }
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply! }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.error ?? `Request failed (status ${res.status}).` }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown fetch error";
      setMessages(prev => [...prev, { role: "assistant", content: `Could not reach /api/advisor: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI advisor"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{
          backgroundColor: "#00D4FF",
          boxShadow: "0 0 20px rgba(0,212,255,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        {/* Stethoscope icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          backgroundColor: "rgba(10,22,40,0.99)",
          borderLeft: "1px solid rgba(0,212,255,0.2)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.15)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
              <circle cx="20" cy="10" r="2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: "#F8FAFC" }}>AI Pre-Med Advisor</p>
            <p className="text-xs" style={{ color: "rgba(0,212,255,0.8)" }}>Powered by Gemini · Knows your profile</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: "rgba(248,250,252,0.5)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                  style={{ backgroundColor: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.25)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                    <circle cx="20" cy="10" r="2" />
                  </svg>
                </div>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { backgroundColor: "#00D4FF", color: "#0A1628", borderBottomRightRadius: "4px" }
                    : { backgroundColor: "rgba(30,42,58,0.8)", color: "rgba(248,250,252,0.9)", border: "1px solid rgba(0,212,255,0.12)", borderBottomLeftRadius: "4px" }
                }
              >
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                style={{ backgroundColor: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.25)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </div>
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                style={{ backgroundColor: "rgba(30,42,58,0.8)", border: "1px solid rgba(0,212,255,0.12)", borderBottomLeftRadius: "4px" }}
              >
                {[0, 1, 2].map(d => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: "#00D4FF",
                      animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ borderTop: "1px solid rgba(0,212,255,0.12)" }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about MCAT, clinical hours, schools..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{ color: "#F8FAFC", maxHeight: "120px" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity"
              style={{
                backgroundColor: input.trim() && !loading ? "#00D4FF" : "rgba(0,212,255,0.25)",
                opacity: input.trim() && !loading ? 1 : 0.6,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke={input.trim() && !loading ? "#0A1628" : "#00D4FF"} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: "rgba(248,250,252,0.25)" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
