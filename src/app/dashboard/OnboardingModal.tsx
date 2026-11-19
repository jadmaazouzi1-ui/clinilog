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
  const inputProps = { className: "field" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 };
  // A bordered, non-interactive mockup used to preview a page/feature
  // inside onboarding without mounting the real (data-fetching) component.
  const previewBox: React.CSSProperties = {
    border: "1px dashed var(--border-strong)",
    borderRadius: "var(--radius-card)",
    padding: "var(--sp-3)",
    marginBottom: "var(--sp-3)",
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
      <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" style={{ maxWidth: 560, width: "100%", padding: "0 var(--sp-3) var(--sp-6)" }}>
        {/* Progress bar */}
        <div style={{ position: "sticky", top: 0, background: "var(--surface)", paddingTop: "1.5rem", paddingBottom: "1rem", zIndex: 1 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Getting set up</span>
            <span className="text-xs tnum" style={{ color: "var(--text-muted)" }}>
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="meter">
            <div
              style={{
                height: "100%",
                width: `${(step / TOTAL_STEPS) * 100}%`,
                background: "var(--data-1)",
              }}
            />
          </div>
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}><Logo size={36} /></div>
            <h2 id="onboarding-title" className="text-2xl" style={{ marginBottom: 12 }}>
              Welcome to ClinicLog MD
            </h2>
            <p className="text-base" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
              One place to log clinical hours, compare schools against your numbers, and keep track of your application.
            </p>
          </div>
        )}

        {/* ── Step 2: Hours Tracker ── */}
        {step === 2 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 className="text-xl" style={{ marginBottom: 16 }}>
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
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{k}</span>
                    <span className="text-xs font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Each entry has dates, hours, a category and a description. When AMCAS opens, these are what you copy into the Work and Activities section.
            </p>
          </div>
        )}

        {/* ── Step 3: School Explorer ── */}
        {step === 3 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 className="text-xl" style={{ marginBottom: 16 }}>
              Compare schools
            </h2>
            <div style={previewBox}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                <thead>
                  <tr>
                    {["School", "Average GPA", "Average MCAT"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "4px 0", borderBottom: "1px solid var(--border-strong)", fontSize: "var(--text-xs)" }}>{h}</th>
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
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Compare {SCHOOLS.length} medical schools by the GPA and MCAT figures each one publishes, and by state. Figures come from each school&apos;s website and can be out of date, so confirm them there before you apply.
            </p>
          </div>
        )}

        {/* ── Step 4: Your Archetype ── */}
        {step === 4 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 className="text-xl" style={{ marginBottom: 16 }}>
              See your pattern
            </h2>
            <div style={{ ...previewBox, textAlign: "center" }}>
              <p className="meta" style={{ marginBottom: 8 }}>1 of 15</p>
              <p className="display text-xl" style={{ marginBottom: 6 }}>{SAMPLE_ARCHETYPE.name}</p>
              <p className="text-xs" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>{SAMPLE_ARCHETYPE.tagline}</p>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              Once you log 3 experiences, AI reads your entries and names the pattern they show, one of 15, with schools that fit it. Treat it as a starting point, not a verdict.
            </p>
          </div>
        )}

        {/* ── Step 5: AI Tools ── */}
        {step === 5 && (
          <div>
            <p style={labelStyle}>Sample preview</p>
            <h2 className="text-xl" style={{ marginBottom: 16 }}>
              Ask the AI Advisor
            </h2>
            <div style={previewBox}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <span style={{ background: "var(--surface-alt)", color: "var(--text)", padding: "6px 10px", fontSize: "var(--text-xs)", maxWidth: "75%", borderRadius: "var(--radius-card)" }}>
                  Am I ready to apply with 120 clinical hours?
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <span style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "6px 10px", fontSize: "var(--text-xs)", maxWidth: "75%", borderRadius: "var(--radius-card)" }}>
                  120 clinical hours is within the range many applicants report. Your research and volunteering totals are worth a look next.
                </span>
              </div>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 8 }}>
              The AI Advisor can see your logged totals and answers questions about applying. It can be wrong, so check anything important with your advisor.
            </p>
          </div>
        )}

        {/* ── Step 6: Your First Entry ── */}
        {step === 6 && (
          <div>
            <h2 className="text-xl" style={{ marginBottom: 8 }}>
              Your first entry
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>
              Add one experience you have already done. You can edit it later, or skip this step.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="ob-title" style={labelStyle}>Title</label>
                <input {...inputProps} id="ob-title" type="text" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Emergency department scribe" />
              </div>
              <div>
                <label htmlFor="ob-org" style={labelStyle}>Organization</label>
                <input {...inputProps} id="ob-org" type="text" value={expOrg} onChange={(e) => setExpOrg(e.target.value)} placeholder="Hospital, clinic, lab or group" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-type" style={labelStyle}>Category</label>
                  <select id="ob-type" className="field" value={expType} onChange={(e) => setExpType(e.target.value)}>
                    <option value="shadowing">Shadowing</option>
                    <option value="volunteer">Volunteering</option>
                    <option value="clinical_work">Clinical Work</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ob-hours" style={labelStyle}>Hours</label>
                  <input {...inputProps} id="ob-hours" type="number" min={0.1} max={1000} step="any" value={expHours} onChange={(e) => setExpHours(e.target.value)} placeholder="40" />
                </div>
              </div>
              <div>
                <label htmlFor="ob-desc" style={labelStyle}>Description</label>
                <textarea
                  id="ob-desc"
                  className="field"
                  rows={3}
                  value={expDesc}
                  placeholder="What you did, in a sentence or two"
                  onChange={(e) => setExpDesc(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <label className="text-xs" style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--text-muted)", cursor: "pointer" }}>
                <input type="checkbox" checked={remindMe} onChange={(e) => setRemindMe(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Email me if I go 14 days without logging. You can change or stop this in Profile.</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Nav row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, gap: 12 }}>
          <button className="btn btn-ghost" disabled={isPending || step === 1} onClick={goBack}>
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button className="btn btn-primary" disabled={isPending} onClick={goNext}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" disabled={isPending} aria-busy={isPending} onClick={handleFirstEntrySubmit}>
              {isPending ? "Saving…" : "Finish"}
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={handleSkip}
            disabled={isPending}
            className="btn btn-sm btn-ghost"
            style={{ color: "var(--text-muted)" }}
          >
            Skip setup
          </button>
        </div>
      </div>
    </div>
  );
}
