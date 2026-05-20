"use client";

import { useState } from "react";
import { submitStory } from "./actions";

export default function ShareStoryModal() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="teal-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
        style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Share Your Story
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      <div
        className="w-full max-w-lg rounded-2xl p-8 relative"
        style={{ backgroundColor: "rgba(15,28,50,0.98)", border: "1px solid rgba(0,212,255,0.2)" }}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(248,250,252,0.5)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-1" style={{ color: "#F8FAFC" }}>Share Your Story</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(248,250,252,0.55)" }}>
          Inspire the next generation of first-gen pre-med students. All submissions are reviewed before publishing.
        </p>

        <form action={submitStory} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                First Name <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Jane"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                Undergrad School
              </label>
              <input
                name="undergrad_school"
                type="text"
                placeholder="UC Riverside"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
              Medical School Accepted To <span style={{ color: "#FF4757" }}>*</span>
            </label>
            <input
              name="medical_school"
              type="text"
              required
              placeholder="UCLA David Geffen School of Medicine"
              className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
              Your First-Gen Background <span style={{ color: "#FF4757" }}>*</span>
            </label>
            <input
              name="background"
              type="text"
              required
              placeholder="e.g. Parents immigrated from Mexico, first in family to attend college"
              className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
              Your Story <span style={{ color: "#FF4757" }}>*</span>
            </label>
            <textarea
              name="quote"
              required
              rows={4}
              placeholder="Share 2-3 sentences about your journey and what kept you going..."
              className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              style={{ color: "rgba(248,250,252,0.5)", border: "1px solid rgba(248,250,252,0.12)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="teal-glow flex-1 py-2.5 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
            >
              Submit Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
