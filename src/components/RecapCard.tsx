"use client";

import { useRef, useState } from "react";
import { formatHours } from "@/lib/types";

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

    // Field
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // Issuer strip
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, 54);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 15px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("CLINICLOG MD", 32, 33);
    ctx.font = "500 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    ctx.fillText("MONTHLY RECAP", W - 32, 33);
    ctx.textAlign = "left";

    // Registration ticks
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    const tick = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + dx, y);
      ctx.moveTo(x, y); ctx.lineTo(x, y + dy);
      ctx.stroke();
    };
    tick(20, 74, 14, 14);
    tick(W - 20, 74, -14, 14);
    tick(20, H - 20, 14, -14);
    tick(W - 20, H - 20, -14, -14);

    // Period
    ctx.fillStyle = "#888888";
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.fillText("PERIOD", 32, 108);
    ctx.fillStyle = "#000000";
    ctx.font = "700 30px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(monthLabel, 32, 142);

    // Perforated rule
    ctx.strokeStyle = "#CCCCCC";
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(32, 168); ctx.lineTo(W - 32, 168); ctx.stroke();
    ctx.setLineDash([]);

    // Headline figure
    ctx.fillStyle = "#888888";
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.fillText("HOURS LOGGED", 32, 206);
    ctx.fillStyle = "#000000";
    ctx.font = "700 92px ui-monospace, Menlo, monospace";
    ctx.fillText(formatHours(hours), 32, 290);

    // Secondary figures
    const row = (label: string, value: string, y: number) => {
      ctx.fillStyle = "#888888";
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.fillText(label, 32, y);
      ctx.fillStyle = "#000000";
      ctx.font = "700 26px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, W - 32, y + 4);
      ctx.textAlign = "left";
      ctx.strokeStyle = "#E4E4E4";
      ctx.beginPath(); ctx.moveTo(32, y + 22); ctx.lineTo(W - 32, y + 22); ctx.stroke();
    };
    row("ENTRIES ADDED", String(entries).padStart(2, "0"), 350);
    row("TOP CATEGORY", topCategory ? (TYPE_LABELS[topCategory] ?? topCategory) : "None", 402);
    if (archetype) row("ARCHETYPE", archetype.replace(/_/g, " ").toUpperCase(), 454);

    // EKG footer
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    let x = 32;
    const baseY = 560;
    ctx.moveTo(x, baseY);
    while (x < W - 32) {
      ctx.lineTo(x + 26, baseY);
      ctx.lineTo(x + 30, baseY - 6);
      ctx.lineTo(x + 34, baseY + 16);
      ctx.lineTo(x + 39, baseY - 22);
      ctx.lineTo(x + 43, baseY + 6);
      ctx.lineTo(x + 47, baseY);
      x += 60;
    }
    ctx.stroke();

    ctx.fillStyle = "#888888";
    ctx.font = "500 11px ui-monospace, Menlo, monospace";
    ctx.fillText("cliniclogmd.com", 32, H - 44);

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
      <button onClick={download} className="btn-ghost text-xs font-semibold" style={{ padding: "7px var(--sp-2)" }}>
        {done ? "Downloaded" : "Download recap (PNG)"}
      </button>
    </>
  );
}
