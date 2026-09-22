"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingExperience, markOnboardingComplete } from "./onboarding-actions";

const TOTAL_STEPS = 6;

export default function OnboardingModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 6 fields — the user's first real experience entry.
  const [expTitle, setExpTitle] = useState("Hospital Shadowing");
  const [expOrg, setExpOrg] = useState("Local Hospital");
  const [expType, setExpType] = useState("shadowing");
  const [expHours, setExpHours] = useState("8");
  const [expDesc, setExpDesc] = useState(
    "Shadowed physicians across multiple departments, observing patient consultations and procedures."
  );

  if (done) return null;

  function goNext() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSkip() {
    startTransition(async () => {
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
      await markOnboardingComplete();
      setDone(true);
      router.refresh();
    });
  }

  // ── Shared styles ──────────────────────────────────────────────────────
  const inputProps = { className: "input-dark px-3.5 py-2.5 rounded-xl text-sm w-full" };

  const primaryBtn: React.CSSProperties = {
    backgroundColor: "var(--accent)", color: "#FFFFFF",
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
    background: "#FFFFFF",
    color: "var(--text-primary)",
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
    color: "rgba(22,36,29,0.55)",
    marginBottom: 6,
  };
  // A bordered, non-interactive mockup used to preview a page/feature
  // inside onboarding without mounting the real (data-fetching) component.
  const previewBox: React.CSSProperties = {
    border: "1px solid var(--border-strong)",
    padding: "1.25rem",
    marginBottom: "1.5rem",
    background: "#FFFFFF",
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
        background: "#FFFFFF",
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%", padding: "0 1.25rem 3rem" }}>
        {/* Progress bar */}
        <div style={{ position: "sticky", top: 0, background: "#FFFFFF", paddingTop: "1.5rem", paddingBottom: "1rem", zIndex: 1 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
              SETUP
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
              {step} OF {TOTAL_STEPS}
            </span>
          </div>
          <div style={{ height: 6, background: "#FFFFFF", border: "1px solid var(--border-strong)" }}>
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
            <h2 style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 12 }}>
              Welcome to ClinicLog MD
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(22,36,29,0.65)", marginBottom: 32 }}>
              A single free record for every clinical hour, every school comparison, and every step of your medical school application.
            </p>
          </div>
        )}

        {/* ── Step 2: Hours Tracker ── */}
        {step === 2 && (
          <div>
            <p style={labelStyle}>Feature 1 of 4</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 16 }}>
              Hours Tracker
            </h2>
            <div style={previewBox}>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Title", "Hospital Shadowing"],
                  ["Organization", "City General Hospital"],
                  ["Category", "Clinical Work"],
                  ["Hours", "12.5"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(22,36,29,0.15)", paddingBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "rgba(22,36,29,0.5)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(22,36,29,0.65)", marginBottom: 8 }}>
              Log every clinical hour as you go - dates, hours, descriptions, and category. This becomes your application foundation.
            </p>
          </div>
        )}

        {/* ── Step 3: School Explorer ── */}
        {step === 3 && (
          <div>
            <p style={labelStyle}>Feature 2 of 4</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 16 }}>
              School Explorer
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
                  {[
                    ["UCLA David Geffen SOM", "3.72", "515"],
                    ["Morehouse School of Medicine", "3.55", "504"],
                    ["Johns Hopkins SOM", "3.91", "521"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ padding: "6px 0", borderBottom: "1px solid rgba(22,36,29,0.12)" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(22,36,29,0.65)", marginBottom: 8 }}>
              Filter 149 medical schools by GPA, MCAT, mission focus, and state preference to find programs that match your profile.
            </p>
          </div>
        )}

        {/* ── Step 4: Your Archetype ── */}
        {step === 4 && (
          <div>
            <p style={labelStyle}>Feature 3 of 4</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 16 }}>
              Your Archetype
            </h2>
            <div style={{ ...previewBox, textAlign: "center" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(22,36,29,0.5)", marginBottom: 8 }}>01 / 15</p>
              <p style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>The Community Healer</p>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(22,36,29,0.6)" }}>Medicine as service. Service as identity.</p>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(22,36,29,0.65)", marginBottom: 8 }}>
              After logging 3 or more experiences, ClinicLog MD analyzes your profile and assigns you one of 15 pre-med archetypes with personalized school matches.
            </p>
          </div>
        )}

        {/* ── Step 5: AI Tools ── */}
        {step === 5 && (
          <div>
            <p style={labelStyle}>Feature 4 of 4</p>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 16 }}>
              AI Tools
            </h2>
            <div style={previewBox}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <span style={{ background: "var(--accent)", color: "#FFFFFF", padding: "6px 10px", fontSize: 12, maxWidth: "75%" }}>
                  Am I ready to apply with 120 clinical hours?
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <span style={{ background: "#FFFFFF", border: "1px solid var(--border-strong)", padding: "6px 10px", fontSize: 12, maxWidth: "75%" }}>
                  120 hours is a solid clinical base - let&apos;s look at your research and volunteering next.
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(22,36,29,0.65)", marginBottom: 8 }}>
              Your AI Pre-Med Advisor knows your hours and profile. Ask it anything about med school, applications, or your journey.
            </p>
          </div>
        )}

        {/* ── Step 6: Your First Entry ── */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 8 }}>
              Your First Entry
            </h2>
            <p style={{ fontSize: 14, color: "rgba(22,36,29,0.65)", marginBottom: 20 }}>
              Let&apos;s log your first experience to get started.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input {...inputProps} type="text" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Organization</label>
                <input {...inputProps} type="text" value={expOrg} onChange={(e) => setExpOrg(e.target.value)} />
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
                  <input {...inputProps} type="number" min={0.1} max={1000} step="any" value={expHours} onChange={(e) => setExpHours(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  className="input-dark px-3.5 py-2.5 rounded-xl text-sm w-full"
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
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
              color: "rgba(22,36,29,0.45)",
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
