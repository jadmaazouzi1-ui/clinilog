"use client";

import { School } from "@/lib/schools";
import { rgb } from "@/lib/palette";
import { PDF_SANS, PDF_SERIF, drawHeaderBand } from "@/lib/pdfBrand";

/* jsPDF renders outside the DOM and cannot read CSS variables, so these
   come from the palette that mirrors src/styles/theme.css. */
const RULE = rgb("ink");
const LABEL = rgb("stone700");
const LINE = rgb("stone200");
const INK = rgb("black");


/**
 * Clean PDF of every school marked Applying, for sharing with an advisor.
 * jsPDF is imported on click so it never lands in the initial page bundle.
 */
export default function ExportTargetList({
  schools,
  userName,
}: {
  schools: School[];
  userName: string;
}) {
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const M = 56;
    const stamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    let y = drawHeaderBand(doc, "ClinicLog MD", { sub: `Exported ${stamp}` }) + 40;

    doc.setFont(PDF_SERIF, "bold");
    doc.setFontSize(22);
    doc.text("Schools I am applying to", M, y);
    y += 18;

    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...LABEL);
    doc.text(`${userName}, ${schools.length} ${schools.length === 1 ? "school" : "schools"}`, M, y);
    doc.setTextColor(...INK);
    y += 16;

    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.75);
    doc.line(M, y, 612 - M, y);
    doc.setLineWidth(0.5);
    y += 22;

    // Column headings
    doc.setFont(PDF_SANS, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...LABEL);
    doc.text("School", M, y);
    doc.text("State", 388, y);
    doc.text("Avg GPA", 470, y, { align: "right" });
    doc.text("Avg MCAT", 612 - M, y, { align: "right" });
    doc.setTextColor(...INK);
    y += 6;
    doc.setDrawColor(...LINE);
    doc.line(M, y, 612 - M, y);
    y += 14;

    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(10);

    for (const s of schools) {
      if (y > 720) {
        doc.addPage();
        y = M;
      }
      const name = s.name.length > 52 ? `${s.name.slice(0, 51)}…` : s.name;
      doc.text(name, M, y);
      doc.text(s.state, 388, y);
      doc.text(s.avgGpa === null ? "Not reported" : s.avgGpa.toFixed(2), 470, y, { align: "right" });
      doc.text(s.avgMcat === null ? "Not reported" : String(s.avgMcat), 612 - M, y, { align: "right" });
      doc.setFont(PDF_SANS, "normal");
      doc.setFontSize(10);
      y += 8;
      doc.setDrawColor(...LINE);
      doc.line(M, y, 612 - M, y);
      y += 14;
    }

    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...LABEL);
    doc.text("Figures come from each school's own website, for the entering class shown. They can be out of date or wrong and are not", M, 744);
    doc.text("an admissions prediction. Confirm everything with the school and the AAMC or AACOM. Sources: cliniclogmd.com/data-sources", M, 756);

    doc.save("target-school-list.pdf");
  }

  if (schools.length === 0) return null;

  return (
    <button
      onClick={exportPdf}
      className="btn btn-secondary"
    >
      Export target list ({schools.length})
    </button>
  );
}
