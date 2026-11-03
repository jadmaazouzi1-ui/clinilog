"use client";

import { Experience, formatHours } from "@/lib/types";
import { rgb } from "@/lib/palette";

/* jsPDF renders outside the DOM and cannot read CSS variables, so these
   come from the palette that mirrors src/styles/theme.css. */
const BAND = rgb("black");
const RULE = rgb("gold500");
const LABEL = rgb("gold700");
const LINE = rgb("gray300");
const INK = rgb("black");
const ON_BAND = rgb("cream");


/**
 * Wallet card PDF, at true card dimensions (3.375 x 2.125 in = 243 x 153 pt),
 * laid out like an insurance or medical ID card: issuer strip, holder name,
 * a figures row, and the top placements on the reverse half.
 */
export default function WalletCard({
  name,
  experiences,
  archetype,
}: {
  name: string;
  experiences: Experience[];
  archetype: string | null;
}) {
  async function exportCard() {
    const { jsPDF } = await import("jspdf");
    const W = 243.36;
    const H = 153.36;
    const doc = new jsPDF({ unit: "pt", format: [W, H] });
    const M = 14;

    const totalHours = experiences.reduce((s, e) => s + Number(e.hours ?? 0), 0);
    const orgs = new Set(experiences.map((e) => e.organization)).size;
    const top3 = [...experiences].sort((a, b) => Number(b.hours) - Number(a.hours)).slice(0, 3);

    // Issuer strip
    doc.setFillColor(...BAND);
    doc.rect(0, 0, W, 22, "F");
    doc.setFillColor(...RULE);
    doc.rect(0, 22, W, 1.5, "F");
    doc.setTextColor(...ON_BAND);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CLINICLOG MD", M, 14.5);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.text("EXPERIENCE RECORD", W - M, 14.5, { align: "right" });

    // Holder
    doc.setTextColor(...INK);
    doc.setFont("courier", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...LABEL);
    doc.text("HOLDER", M, 38);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(name.length > 30 ? `${name.slice(0, 29)}…` : name, M, 51);

    if (archetype) {
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...LABEL);
      doc.text(archetype.toUpperCase(), M, 62);
    }

    // Figures row
    doc.setDrawColor(...LINE);
    doc.line(M, 70, W - M, 70);

    const cols: [string, string][] = [
      ["TOTAL HRS", formatHours(totalHours)],
      ["ENTRIES", String(experiences.length).padStart(2, "0")],
      ["ORGS", String(orgs).padStart(2, "0")],
    ];
    cols.forEach(([label, value], i) => {
      const x = M + i * ((W - M * 2) / 3);
      doc.setFont("courier", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...LABEL);
      doc.text(label, x, 80);
      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(value, x, 93);
    });

    doc.setDrawColor(...LINE);
    doc.line(M, 100, W - M, 100);

    // Top placements
    doc.setFont("courier", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...LABEL);
    doc.text("TOP PLACEMENTS", M, 110);
    doc.setTextColor(...INK);

    let y = 120;
    for (const e of top3) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const title = e.title.length > 34 ? `${e.title.slice(0, 33)}…` : e.title;
      doc.text(title, M, y);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.text(`${formatHours(e.hours)}h`, W - M, y, { align: "right" });
      y += 10;
    }
    if (top3.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...LINE);
      doc.text("No experiences logged yet", M, y);
    }

    doc.save("cliniclog-wallet-card.pdf");
  }

  return (
    <button
      type="button"
      onClick={exportCard}
      className="btn-ghost text-xs font-semibold"
      style={{ padding: "8px var(--sp-2)" }}
    >
      Download wallet card (PDF)
    </button>
  );
}
