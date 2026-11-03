"use client";

import { useState, useTransition } from "react";
import Logo from "@/components/brand/Logo";
import { useRouter } from "next/navigation";
import { saveOnboardingExperience, markOnboardingComplete } from "./onboarding-actions";
import { SCHOOLS } from "@/lib/schools";
import { ARCHETYPES } from "@/lib/archetypes";

// Preview rows come from the real school data so they always match Schools.
const SAMPLE_SCHOOLS = [
  "Wake Forest University School of Medicine",
  "UNC School of Medicine",
  "East Carolina Brody School of Medicine",
]
  .map((name) => SCHOOLS.find((s) => s.name === name))
  .filter((s): s is (typeof SCHOOLS)[number] => !!s)
  .map((s) => [s.name, s.avgGpa?.toFixed(2) ?? "Not reported", s.avgMcat ? String(s.avgMcat) : "Not reported"]);
const SAMPLE_ARCHETYPE = ARCHETYPES[0];

const TOTAL_STEPS = 6;

export default function OnboardingModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 6 fields: the user's first real entry. Empty on purpose, with
  // examples as placeholders, so nothing is saved that the student did not type.
  const [expTitle, setExpTitle] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expType, setExpType] = useState("shadowing");
  const [expHours, setExpHours] = useState("");
  const [expDesc, setExpDesc] = useState("");
  // The one-time reminder offer. Unchecked by default; either way it is
  // recorded as answered so it is never asked again.
  const [remindMe, setRemindMe] = useState(false);

  if (done) return null;

  function goNext() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function answerReminderOffer() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminders_enabled: remindMe, answeringOffer: true }),
    }).catch(() => {});
  }

  function handleSkip() {
    startTransition(async () => {
      // Only counts as an answer if they reached the step that asks.
      if (step === TOTAL_STEPS) await answerReminderOffer();
      await markOnboardingComplete();
      setDone(true);
      router.refresh();
    });
  }

  function handleFirstEntrySubmit() {
    startTransition(async () => {
      await saveOnboardingExperience({
        title: expTitle,
        organization: expOrg,
        type: expType,
        hours: expHours,
        description: expDesc,
      });
      await answerReminderOffer();
      await markOnboardingComplete();
      setDone(true);
      router.refresh();
    });
  }

  // ── Shared styles ──────────────────────────────────────────────────────
  const inputProps = { className: "input-dark px-3.5 py-2.5 rounded-xl text-sm w-full" };

  const primaryBtn: React.CSSProperties = {
    backgroundColor: "var(--accent)", color: "var(--on-accent)",
    padding: "0.75rem 1.5rem",
    fontWeight: 800,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "1px solid var(--border-strong)",
    cursor: isPending ? "not-allowed" : "pointer",
    opacity: isPending ? 0.6 : 1,
  };
  const ghostBtn: React.CSSProperties = {
    background: "var(--surface)",
    color: "var(--text)",
    padding: "0.75rem 1.5rem",
    fontWeight: 800,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "1px solid var(--border-strong)",
    cursor: isPending ? "not-allowed" : "pointer",
    opacity: isPending ? 0.6 : 1,
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-jetbrains-mono, monospace)",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
    marginBottom: 6,
  };
  // A bordered, non-interactive mockup used to preview a page/feature
  // inside onboarding without mounting the real (data-fetching) component.
  const previewBox: React.CSSProperties = {
    border: "1px solid var(--border-strong)",
    padding: "1.25rem",
    marginBottom: "1.5rem",
    background: "var(--surface)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--surface)",
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%", padding: "0 1.25rem 3rem" }}>
        {/* Progress bar */}
        <div style={{ position: "sticky", top: 0, background: "var(--surface)", paddingTop: "1.5rem", paddingBottom: "1rem", zIndex: 1 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
              SETUP
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
              {step} OF {TOTAL_STEPS}
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface)", border: "1px solid var(--border-strong)" }}>
            <div
              style={{
                height: "100%",
                width: `${(step / TOTAL_STEPS) * 100}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}><Logo size={36} /></div>
            <h2 style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 12 }}>
              Welcome to ClinicLog MD
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 32 }}>
              One place to log clinical hours, compare schools against your numbers, and keep track of your application.
            </p>
          </div>
        )}

        {/* ── Step 2: Hours Tracker ── */}
        {step === 2 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 16 }}>
              Log hours as you go
            </h2>
            <div style={previewBox}>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Title", "Emergency department scribe"],
                  ["Organization", "Sample hospital"],
                  ["Category", "Clinical Work"],
                  ["Hours", "12.5"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-strong)", paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Each entry has dates, hours, a category and a description. When AMCAS opens, these are what you copy into the Work and Activities section.
            </p>
          </div>
        )}

        {/* ── Step 3: School Explorer ── */}
        {step === 3 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 16 }}>
              Compare schools
            </h2>
            <div style={previewBox}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["SCHOOL", "AVG GPA", "AVG MCAT"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "4px 0", borderBottom: "1px solid var(--border-strong)", fontSize: 10, letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_SCHOOLS.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--border-strong)" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Filter {SCHOOLS.length} medical schools by GPA, MCAT, mission and state. Averages are approximate, so confirm them on each school&apos;s site.
            </p>
          </div>
        )}

        {/* ── Step 4: Your Archetype ── */}
        {step === 4 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 16 }}>
              See your pattern
            </h2>
            <div style={{ ...previewBox, textAlign: "center" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 8 }}>01 / 15</p>
              <p style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>{SAMPLE_ARCHETYPE.name}</p>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-muted)" }}>{SAMPLE_ARCHETYPE.tagline}</p>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Once you log 3 experiences, AI reads your entries and names the pattern they show, one of 15, with schools that fit it. Treat it as a starting point, not a verdict.
            </p>
          </div>
        )}

        {/* ── Step 5: AI Tools ── */}
        {step === 5 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 16 }}>
              Ask the AI Advisor
            </h2>
            <div style={previewBox}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <span style={{ background: "var(--accent)", color: "var(--on-accent)", padding: "6px 10px", fontSize: 12, maxWidth: "75%" }}>
                  Am I ready to apply with 120 clinical hours?
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <span style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", padding: "6px 10px", fontSize: 12, maxWidth: "75%" }}>
                  120 clinical hours is within the range many applicants report. Your research and volunteering totals are worth a look next.
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              The AI Advisor can see your logged totals and answers questions about applying. It can be wrong, so check anything important with your advisor.
            </p>
          </div>
        )}

        {/* ── Step 6: Your First Entry ── */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: 8 }}>
              Your first entry
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
              Add one experience you have already done. You can edit it later, or skip this step.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input {...inputProps} type="text" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Emergency department scribe" />
              </div>
              <div>
                <label style={labelStyle}>Organization</label>
                <input {...inputProps} type="text" value={expOrg} onChange={(e) => setExpOrg(e.target.value)} placeholder="e.g. Atrium Health Wake Forest Baptist" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Category</label>
                  <select className="input-dark px-3.5 py-2.5 rounded-xl text-sm w-full" value={expType} onChange={(e) => setExpType(e.target.value)}>
                    <option value="shadowing">Shadowing</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="clinical_work">Clinical Work</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Hours</label>
                  <input {...inputProps} type="number" min={0.1} max={1000} step="any" value={expHours} onChange={(e) => setExpHours(e.target.value)} placeholder="e.g. 40" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  className="input-dark px-3.5 py-2.5 rounded-xl text-sm w-full"
                  rows={3}
                  value={expDesc}
                  placeholder="What you did, in a sentence or two"
                  onChange={(e) => setExpDesc(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
                <input type="checkbox" checked={remindMe} onChange={(e) => setRemindMe(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Email me if I go 14 days without logging. You can change or stop this in Profile.</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Nav row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, gap: 12 }}>
          <button style={ghostBtn} disabled={isPending || step === 1} onClick={goBack} aria-disabled={step === 1}>
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button style={primaryBtn} disabled={isPending} onClick={goNext}>
              Next
            </button>
          ) : (
            <button style={primaryBtn} disabled={isPending} onClick={handleFirstEntrySubmit}>
              {isPending ? "Saving..." : "Finish"}
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={handleSkip}
            disabled={isPending}
            style={{
              background: "none",
              border: "none",
              fontSize: 12,
              color: "var(--text-subtle)",
              textDecoration: "underline",
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            Skip setup
          </button>
        </div>
      </div>
    </div>
  );
}
