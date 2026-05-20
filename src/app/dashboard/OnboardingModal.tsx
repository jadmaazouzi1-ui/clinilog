"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveOnboardingProfile,
  saveOnboardingExperience,
  markOnboardingComplete,
} from "./onboarding-actions";

export default function OnboardingModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [specialty, setSpecialty] = useState("");

  // Step 2 fields
  const [expTitle, setExpTitle] = useState("Hospital Shadowing");
  const [expOrg, setExpOrg] = useState("Local Hospital");
  const [expType, setExpType] = useState("shadowing");
  const [expHours, setExpHours] = useState("8");
  const [expDesc, setExpDesc] = useState(
    "Shadowed physicians across multiple departments, observing patient consultations and procedures. Gained insight into the daily responsibilities of hospital-based medicine."
  );

  if (done) return null;

  // ── Progress indicator ──────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Experience" },
    { num: 3, label: "Explore" },
  ];

  function StepIndicator() {
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, idx) => {
          const completed = step > s.num;
          const active = step === s.num;

          const circleStyle: React.CSSProperties = completed
            ? { background: "#00D4FF", border: "2px solid #00D4FF" }
            : active
            ? { background: "transparent", border: "2px solid #00D4FF" }
            : { background: "transparent", border: "2px solid rgba(248,250,252,0.2)" };

          const numColor = completed
            ? "transparent"
            : active
            ? "#00D4FF"
            : "rgba(248,250,252,0.3)";

          return (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  style={{
                    ...circleStyle,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {completed ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: numColor }}>
                      {s.num}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: active || completed ? "#00D4FF" : "rgba(248,250,252,0.3)",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: 64,
                    height: 2,
                    marginBottom: 18,
                    background:
                      step > s.num
                        ? "#00D4FF"
                        : "rgba(248,250,252,0.12)",
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Shared input style ──────────────────────────────────────────────────────

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    className: "input-dark px-3.5 py-2.5 rounded-xl text-sm w-full",
  };

  // ── Step 1 ──────────────────────────────────────────────────────────────────

  function handleSaveProfile() {
    startTransition(async () => {
      await saveOnboardingProfile({ fullName, school, gradYear, specialty });
      setStep(2);
    });
  }

  // ── Step 2 ──────────────────────────────────────────────────────────────────

  function handleSaveExperience() {
    startTransition(async () => {
      await saveOnboardingExperience({
        title: expTitle,
        organization: expOrg,
        type: expType,
        hours: expHours,
        description: expDesc,
      });
      setStep(3);
    });
  }

  // ── Step 3 ──────────────────────────────────────────────────────────────────

  function handleExploreSchools() {
    startTransition(async () => {
      await markOnboardingComplete();
      router.push("/schools");
    });
  }

  function handleGoToDashboard() {
    startTransition(async () => {
      await markOnboardingComplete();
      setDone(true);
    });
  }

  // ── Button styles ───────────────────────────────────────────────────────────

  const tealBtn: React.CSSProperties = {
    backgroundColor: "#00D4FF",
    color: "#0A1628",
    padding: "10px 20px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    border: "none",
    cursor: isPending ? "not-allowed" : "pointer",
    opacity: isPending ? 0.7 : 1,
    transition: "opacity 0.15s",
  };

  const ghostBtn: React.CSSProperties = {
    background: "transparent",
    color: "rgba(248,250,252,0.5)",
    padding: "10px 20px",
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 14,
    border: "1px solid rgba(248,250,252,0.15)",
    cursor: isPending ? "not-allowed" : "pointer",
    opacity: isPending ? 0.6 : 1,
    transition: "opacity 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(248,250,252,0.6)",
    marginBottom: 6,
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: 512,
          width: "100%",
          background: "rgba(15,28,50,0.97)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 24,
          padding: 32,
        }}
      >
        <StepIndicator />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>
              Welcome to CliniLog 👋
            </h2>
            <p style={{ fontSize: 14, color: "rgba(248,250,252,0.6)", marginBottom: 24 }}>
              Let&apos;s set up your profile so we can personalize your experience.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  {...inputProps}
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>School</label>
                <input
                  {...inputProps}
                  type="text"
                  placeholder="University of California, Los Angeles"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Graduation Year</label>
                <input
                  {...inputProps}
                  type="number"
                  min={2020}
                  max={2040}
                  placeholder="2026"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Intended Specialty</label>
                <input
                  {...inputProps}
                  type="text"
                  placeholder="Internal Medicine"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 28,
                gap: 12,
              }}
            >
              <button
                style={ghostBtn}
                disabled={isPending}
                onClick={() => setStep(2)}
              >
                Skip for now
              </button>
              <button
                style={tealBtn}
                className="teal-glow"
                disabled={isPending}
                onClick={handleSaveProfile}
              >
                {isPending ? "Saving…" : "Save & Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>
              Log your first experience
            </h2>
            <p style={{ fontSize: 14, color: "rgba(248,250,252,0.6)", marginBottom: 24 }}>
              Add a clinical experience you&apos;ve already completed, or use our example to get started.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  {...inputProps}
                  type="text"
                  name="title"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Organization</label>
                <input
                  {...inputProps}
                  type="text"
                  name="organization"
                  value={expOrg}
                  onChange={(e) => setExpOrg(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  className="input-dark px-3.5 py-2.5 rounded-xl text-sm w-full"
                  name="type"
                  value={expType}
                  onChange={(e) => setExpType(e.target.value)}
                >
                  <option value="shadowing">Shadowing</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="clinical_work">Clinical Work</option>
                  <option value="research">Research</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Hours</label>
                <input
                  {...inputProps}
                  type="number"
                  name="hours"
                  min={0.1}
                  max={1000}
                  step="any"
                  value={expHours}
                  onChange={(e) => setExpHours(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  className="input-dark px-3.5 py-2.5 rounded-xl text-sm w-full"
                  name="description"
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 28,
                gap: 12,
              }}
            >
              <button
                style={ghostBtn}
                disabled={isPending}
                onClick={() => setStep(3)}
              >
                Skip for now
              </button>
              <button
                style={tealBtn}
                className="teal-glow"
                disabled={isPending}
                onClick={handleSaveExperience}
              >
                {isPending ? "Saving…" : "Save Experience & Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,212,255,0.12)",
                border: "1.5px solid #00D4FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 14L11 20L23 8"
                  stroke="#00D4FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", marginBottom: 10 }}>
              Your CliniLog is ready
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(248,250,252,0.6)",
                marginBottom: 28,
                maxWidth: 360,
                margin: "0 auto 28px",
              }}
            >
              Start exploring 150+ medical schools or head to your dashboard to log more experiences.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                style={{ ...tealBtn, width: "100%", padding: "12px 20px" }}
                className="teal-glow"
                disabled={isPending}
                onClick={handleExploreSchools}
              >
                {isPending ? "Loading…" : "Explore Schools →"}
              </button>
              <button
                style={{ ...ghostBtn, width: "100%", padding: "12px 20px" }}
                disabled={isPending}
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
