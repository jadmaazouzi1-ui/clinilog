"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
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

  // Everything that happens on open runs in the handler, not in an effect.
  const openDrawer = useCallback(() => {
    setOpen(true);
    window.dispatchEvent(new CustomEvent("cliniclog:advisor-opened"));
    loadContext();
    setMessages((m) =>
      m.length
        ? m
        : [{
            role: "assistant",
            content: "I can see your hours, graduation year, intended specialty and the start of your descriptions and reflections for up to 12 entries. Ask me about applying, and check anything important with your pre-health advisor, since I can be wrong.",
          }],
    );
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [loadContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // The drawer has no route of its own: every trigger dispatches this event.
  useEffect(() => {
    window.addEventListener("cliniclog:open-advisor", openDrawer);
    return () => window.removeEventListener("cliniclog:open-advisor", openDrawer);
  }, [openDrawer]);

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
      {/* Opened from the header button in AppShell, or from Help and the
          mobile More sheet, through the cliniclog:open-advisor event. */}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "var(--scrim)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer. Inert while closed: it only slides off screen, so without
          this its fields stay in the tab order. */}
      <div
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="AI advisor"
        className="fixed top-0 right-0 z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          // 100dvh, not 100vh or h-full: the dynamic viewport unit shrinks
          // when the mobile keyboard opens, which keeps the composer visible
          // instead of pushing it behind the keyboard. vh is the fallback for
          // browsers without dvh.
          height: "100vh",
          maxHeight: "100dvh",
          minHeight: "100dvh",
          backgroundColor: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: open ? "var(--shadow-overlay)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--dur-slow) var(--ease-out)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
          data-tour="advisor-header"
        >
          <div className="flex-1 min-w-0">
            <h2 className="section-title" style={{ margin: 0 }}>AI advisor</h2>
            <p className="text-xs tnum" style={{ color: "var(--text-muted)" }}>
              {remaining !== null ? `${remaining} of 20 messages left today` : "20 messages a day"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
              Sends your messages and up to 12 of your entries, with the start of each description and reflection, to
              Google&apos;s Gemini. Google may use them to improve its products. Answers can be wrong, and school or
              specialty facts in them come from the model, not our sources.{" "}
              <Link href="/privacy#ai" className="link">What is sent</Link>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="btn btn-sm btn-ghost flex-shrink-0"
          >
            Close
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
                    ? { backgroundColor: "var(--surface-alt)", color: "var(--text)", borderRadius: "var(--radius-card)" }
                    : { backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)" }
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
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)" }}
              >
                <span className="loading">Writing a reply…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            className="flex items-end gap-2 px-3 py-2"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-control)" }}
            data-tour="advisor-input"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about MCAT timing, hours or schools"
              rows={1}
              aria-label="Message to the advisor"
              className="flex-1 bg-transparent text-base resize-none outline-none leading-relaxed"
              style={{ color: "var(--text)", maxHeight: "120px" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="btn btn-sm btn-primary flex-shrink-0"
              aria-busy={loading}
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Enter sends. Shift and Enter starts a new line.
          </p>
        </div>
      </div>

    </>
  );
}
