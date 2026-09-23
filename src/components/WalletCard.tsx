"use client";

import { Experience, formatHours } from "@/lib/types";

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
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, W, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CLINICLOG MD", M, 14.5);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.text("EXPERIENCE RECORD", W - M, 14.5, { align: "right" });

    // Holder
    doc.setTextColor(0, 0, 0);
    doc.setFont("courier", "normal");
    doc.setFontSize(6);
    doc.setTextColor(120);
    doc.text("HOLDER", M, 38);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(name.length > 30 ? `${name.slice(0, 29)}…` : name, M, 51);

    if (archetype) {
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(90);
      doc.text(archetype.toUpperCase(), M, 62);
    }

    // Figures row
    doc.setDrawColor(200);
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
      doc.setTextColor(120);
      doc.text(label, x, 80);
      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(value, x, 93);
    });

    doc.setDrawColor(200);
    doc.line(M, 100, W - M, 100);

    // Top placements
    doc.setFont("courier", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(120);
    doc.text("TOP PLACEMENTS", M, 110);
    doc.setTextColor(0);

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
      doc.setTextColor(140);
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
