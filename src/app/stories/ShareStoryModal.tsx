"use client";

import { useState } from "react";
import { submitStory } from "./actions";

export default function ShareStoryModal() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary"
      >
                Share Your Story
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "var(--scrim)" }}>
      <div
        className="w-full max-w-lg rounded-2xl p-8 relative"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)" }}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl mb-1">Share your story</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Inspire the next generation of first-gen pre-med students. All submissions are reviewed before publishing.
        </p>

        <form action={submitStory} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name-input" className="label">
                First name <span style={{ color: "var(--text)" }}>*</span>
              </label>
              <input id="name-input"
                name="name"
                type="text"
                required
                placeholder="Jane"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="undergrad-school-input" className="label">
                Undergrad school
              </label>
              <input id="undergrad-school-input"
                name="undergrad_school"
                type="text"
                placeholder="UC Riverside"
                className="field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="medical-school-input" className="label">
              Medical school accepted to <span style={{ color: "var(--text)" }}>*</span>
            </label>
            <input id="medical-school-input"
              name="medical_school"
              type="text"
              required
              placeholder="UCLA David Geffen School of Medicine"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="background-input" className="label">
              Your first-generation background <span style={{ color: "var(--text)" }}>*</span>
            </label>
            <input id="background-input"
              name="background"
              type="text"
              required
              placeholder="e.g. Parents immigrated from Mexico, first in family to attend college"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="quote-input" className="label">
              Your story <span style={{ color: "var(--text)" }}>*</span>
            </label>
            <textarea id="quote-input"
              name="quote"
              required
              rows={4}
              placeholder="2 or 3 sentences: what you did and what you wish you had known"
              className="field"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border-strong)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Submit Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
