"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { formatHours } from "@/lib/types";

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
  lines.push(`Total logged hours: ${formatHours(ctx.totalHours)}`);
  lines.push(`Experiences logged: ${ctx.experienceCount}`);
  if (Object.keys(ctx.hoursByType).length > 0) {
    const breakdown = Object.entries(ctx.hoursByType)
      .map(([type, hrs]) => `${type.replace("_", " ")}: ${formatHours(hrs)} hrs`)
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
  const [remaining, setRemaining] = useState<number | null>(null);
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
          content: "Hi! I'm your AI pre-med advisor. I can see your ClinicLog profile and logged hours. What questions do you have about your medical school journey?",
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
      let data: { reply?: string; error?: string; remaining?: number } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        const snippet = raw.slice(0, 180).replace(/\s+/g, " ").trim();
        setMessages(prev => [...prev, { role: "assistant", content: `Server returned non-JSON (status ${res.status}): ${snippet || "empty body"}` }]);
        return;
      }
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      if (res.status === 429) setRemaining(0);
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
        className="fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "#000000",
          borderRadius: 0,
          border: "2px solid #000000",
        }}
      >
        <span className="mono" style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em" }}>AI</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          backgroundColor: "#FFFFFF",
          borderLeft: "2px solid #000000",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "2px solid #000000" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: "#000000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em" }}>AI Pre-Med Advisor</p>
            <p className="text-xs mono" style={{ color: "rgba(0,0,0,0.45)", letterSpacing: "0.08em" }}>
              {remaining !== null ? `${remaining} OF 20 MESSAGES LEFT TODAY` : "POWERED BY GEMINI · KNOWS YOUR PROFILE"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 transition-opacity hover:opacity-60 flex-shrink-0"
            style={{ color: "#000000" }}
          >
            <span className="mono text-[11px] font-bold tracking-widest">CLOSE</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { backgroundColor: "#000000", color: "#FFFFFF", border: "2px solid #000000", borderRadius: 0, fontWeight: 500 }
                    : { backgroundColor: "#FFFFFF", color: "#000000", border: "2px solid #000000", borderRadius: 0 }
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
                className="px-4 py-3"
                style={{ backgroundColor: "#FFFFFF", border: "2px solid #000000", borderRadius: 0 }}
              >
                <span className="loading-text">Thinking</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ borderTop: "2px solid #000000" }}
        >
          <div
            className="flex items-end gap-2 px-3 py-2"
            style={{ backgroundColor: "#FFFFFF", border: "2px solid #000000", borderRadius: 0 }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about MCAT, clinical hours, schools..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{ color: "#000000", maxHeight: "120px" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 px-3 py-1.5 mono text-[11px] font-bold tracking-widest"
              style={{
                backgroundColor: input.trim() && !loading ? "#000000" : "#FFFFFF",
                color: input.trim() && !loading ? "#FFFFFF" : "rgba(0,0,0,0.4)",
                border: "2px solid #000000",
                borderRadius: 0,
              }}
            >
              SEND
            </button>
          </div>
          <p className="text-center mt-2 text-xs mono" style={{ color: "rgba(0,0,0,0.35)", letterSpacing: "0.08em" }}>
            ENTER TO SEND · SHIFT+ENTER NEW LINE
          </p>
        </div>
      </div>

      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 1; }
        }
      `}</style>
    </>
  );
}
