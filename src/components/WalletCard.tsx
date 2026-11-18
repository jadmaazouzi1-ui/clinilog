"use client";

import { Experience, formatHours } from "@/lib/types";
import { rgb } from "@/lib/palette";

/* jsPDF renders outside the DOM and cannot read CSS variables, so these
   come from the palette that mirrors src/styles/theme.css. */
const LABEL = rgb("stone700");
const LINE = rgb("stone200");
const INK = rgb("black");


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

    // Name and document
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ClinicLog MD", M, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...LABEL);
    doc.text("Experience summary", W - M, 15, { align: "right" });
    doc.setDrawColor(...LINE);
    doc.line(M, 21, W - M, 21);

    // Holder
    doc.setTextColor(...INK);
    doc.setTextColor(...INK);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(name.length > 30 ? `${name.slice(0, 29)}…` : name, M, 51);

    if (archetype) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...LABEL);
      doc.text(archetype.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()), M, 62);
    }

    // Figures row
    doc.setDrawColor(...LINE);
    doc.line(M, 70, W - M, 70);

    const cols: [string, string][] = [
      ["Hours", formatHours(totalHours)],
      ["Entries", String(experiences.length)],
      ["Organizations", String(orgs)],
    ];
    cols.forEach(([label, value], i) => {
      const x = M + i * ((W - M * 2) / 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...LABEL);
      doc.text(label, x, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(value, x, 93);
    });

    doc.setDrawColor(...LINE);
    doc.line(M, 100, W - M, 100);

    // Top placements
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...LABEL);
    doc.text("Most hours", M, 110);
    doc.setTextColor(...INK);

    let y = 120;
    for (const e of top3) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const title = e.title.length > 34 ? `${e.title.slice(0, 33)}…` : e.title;
      doc.text(title, M, y);
      doc.text(`${formatHours(e.hours)} hrs`, W - M, y, { align: "right" });
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
      className="btn btn-secondary"
    >
      Download wallet card (PDF)
    </button>
  );
}
