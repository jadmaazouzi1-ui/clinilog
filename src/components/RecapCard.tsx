"use client";

import { useRef, useState } from "react";
import { formatHours } from "@/lib/types";
import { markRects } from "@/lib/logo";
import { PALETTE } from "@/lib/palette";

/* A canvas renders outside the DOM and cannot read CSS variables, so the
   colours come from the palette that mirrors src/styles/theme.css. Black
   field, the same as the Your path panel. Gold is only the mark. */
const FIELD = PALETTE.black;
const TEXT = PALETTE.cream;
const LABEL = PALETTE.creamMuted;
const MARK = PALETTE.gold500;
const HAIR = PALETTE.night400;

const TYPE_LABELS: Record<string, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

/**
 * Shareable monthly recap, drawn on a canvas and downloaded as a PNG.
 *
 * Rendered at 2x and scaled down so the text is sharp on a phone screen,
 * which is where a shared image is usually seen.
 */
export default function RecapCard({
  monthLabel,
  hours,
  entries,
  topCategory,
  archetype,
}: {
  monthLabel: string;
  hours: number;
  entries: number;
  topCategory: string | null;
  archetype: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  function draw(): HTMLCanvasElement | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const S = 2;
    const W = 540;
    const H = 675;
    canvas.width = W * S;
    canvas.height = H * S;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(S, S);

    // The page's own faces, so the image matches the app.
    const root = getComputedStyle(document.documentElement);
    const SERIF = `${root.getPropertyValue("--font-newsreader").trim() || "Georgia"}, Georgia, serif`;
    const SANS = `${root.getPropertyValue("--font-public-sans").trim() || "system-ui"}, system-ui, sans-serif`;

    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, W, H);

    // The mark and the name
    const mark = markRects(32, 30, 22);
    ctx.fillStyle = MARK;
    for (const [x, y, w, h] of mark.arms) ctx.fillRect(x, y, w, h);
    ctx.fillStyle = TEXT;
    ctx.font = `600 15px ${SANS}`;
    ctx.fillText("ClinicLog MD", 64, 46);
    ctx.fillStyle = LABEL;
    ctx.textAlign = "right";
    ctx.fillText("Monthly recap", W - 32, 46);
    ctx.textAlign = "left";
    ctx.fillStyle = HAIR;
    ctx.fillRect(32, 72, W - 64, 1);

    // Period
    ctx.fillStyle = TEXT;
    ctx.font = `500 40px ${SERIF}`;
    ctx.fillText(monthLabel, 32, 132);

    // Headline figure
    ctx.fillStyle = LABEL;
    ctx.font = `400 15px ${SANS}`;
    ctx.fillText("Hours logged", 32, 196);
    ctx.fillStyle = TEXT;
    ctx.font = `500 96px ${SERIF}`;
    ctx.fillText(formatHours(hours), 28, 290);

    // Secondary figures
    const row = (label: string, value: string, y: number) => {
      ctx.fillStyle = LABEL;
      ctx.font = `400 15px ${SANS}`;
      ctx.fillText(label, 32, y);
      ctx.fillStyle = TEXT;
      ctx.font = `600 21px ${SANS}`;
      ctx.textAlign = "right";
      ctx.fillText(value, W - 32, y + 2);
      ctx.textAlign = "left";
      ctx.fillStyle = HAIR;
      ctx.fillRect(32, y + 20, W - 64, 1);
    };
    row("Entries added", String(entries), 350);
    row("Most hours in", topCategory ? (TYPE_LABELS[topCategory] ?? topCategory) : "None", 402);
    if (archetype) row("Archetype", archetype.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()), 454);

    ctx.fillStyle = LABEL;
    ctx.font = `400 13px ${SANS}`;
    ctx.fillText("cliniclogmd.com", 32, H - 40);

    return canvas;
  }

  function download() {
    const canvas = draw();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cliniclog-recap-${monthLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    }, "image/png");
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
      <button onClick={download} className="btn btn-secondary">
        {done ? "Downloaded" : "Download recap (PNG)"}
      </button>
    </>
  );
}
