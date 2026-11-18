"use client";

import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { PDF_HAIRLINE, PDF_LABEL, PDF_MUTED, PDF_RULE, PDF_SANS, PDF_SERIF, PDF_TEXT, drawHeaderBand } from "@/lib/pdfBrand";
import { recordPdfExport } from "./export-actions";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

interface ExportAllButtonProps {
  experiences: Experience[];
}

export default function ExportAllButton({ experiences }: ExportAllButtonProps) {
  if (experiences.length === 0) return null;

  const handleExport = async () => {
    const gate = await recordPdfExport();
    if (!gate.allowed) {
      alert(gate.error ?? "Export limit reached.");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;

    const totalHours = experiences.reduce((sum, e) => sum + e.hours, 0);
    const totalHoursDisplay = formatHours(totalHours);

    // ── Cover page: totals by category, in AMCAS order ─────────────────────
    const stamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    let y = drawHeaderBand(doc, "ClinicLog MD", { sub: `Exported ${stamp}` }) + 72;

    doc.setFont(PDF_SERIF, "bold");
    doc.setFontSize(28);
    doc.setTextColor(...PDF_TEXT);
    doc.text("Experiences", margin, y);
    y += 22;
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_MUTED);
    doc.text("For the AMCAS Work and Activities section. One entry per page.", margin, y);
    y += 40;

    const byType = new Map<ExperienceType, { hours: number; count: number }>();
    for (const e of experiences) {
      const t = byType.get(e.type) ?? { hours: 0, count: 0 };
      byType.set(e.type, { hours: t.hours + e.hours, count: t.count + 1 });
    }
    doc.setDrawColor(...PDF_RULE);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
    const right = pageWidth - margin;
    for (const type of ["clinical_work", "shadowing", "research", "volunteer", "other"] as ExperienceType[]) {
      const row = byType.get(type);
      if (!row) continue;
      doc.setFont(PDF_SANS, "normal");
      doc.setFontSize(11);
      doc.setTextColor(...PDF_TEXT);
      doc.text(TYPE_LABELS[type], margin, y);
      doc.setTextColor(...PDF_MUTED);
      doc.text(`${row.count} ${row.count === 1 ? "entry" : "entries"}`, right - 90, y, { align: "right" });
      doc.setTextColor(...PDF_TEXT);
      doc.text(`${formatHours(row.hours)} hrs`, right, y, { align: "right" });
      y += 10;
      doc.setDrawColor(...PDF_HAIRLINE);
      doc.line(margin, y, right, y);
      y += 18;
    }
    doc.setFont(PDF_SANS, "bold");
    doc.setFontSize(11);
    doc.text("Total", margin, y);
    doc.text(`${experiences.length} ${experiences.length === 1 ? "entry" : "entries"}`, right - 90, y, { align: "right" });
    doc.text(`${totalHoursDisplay} hrs`, right, y, { align: "right" });

    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_MUTED);
    doc.text("cliniclogmd.com", margin, pageHeight - 30);

    // ── One page per experience ──────────────────────────────────────────────
    for (const experience of experiences) {
      doc.addPage();
      y = drawHeaderBand(doc, "ClinicLog MD", { sub: TYPE_LABELS[experience.type] }) + 40;

      // Title
      doc.setFont(PDF_SERIF, "bold");
      doc.setFontSize(18);
      doc.setTextColor(...PDF_TEXT);
      doc.text(experience.title, margin, y);
      y += 6;

      y += 14;

      // Organization
      doc.setFont(PDF_SANS, "normal");
      doc.setFontSize(11);
      doc.setTextColor(...PDF_MUTED);
      doc.text(experience.organization, margin, y);
      y += 18;

      // Date range + hours
      doc.setFontSize(10);
      doc.setTextColor(...PDF_MUTED);
      const dateRange = `${formatDate(experience.start_date)} to ${
        experience.end_date ? formatDate(experience.end_date) : "now"
      }`;
      doc.text(dateRange, margin, y);
      y += 14;

      const hoursDisplay =
        formatHours(experience.hours);
      doc.setFont(PDF_SANS, "bold");
      doc.text(`${hoursDisplay} hours`, margin, y);
      y += 22;

      // Divider
      doc.setDrawColor(...PDF_HAIRLINE);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 18;

      // Description
      doc.setFont(PDF_SANS, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...PDF_LABEL);
      doc.text("Description", margin, y);
      doc.setFont(PDF_SANS, "normal");
      doc.text(`${(experience.description ?? "").length} of 700 characters`, pageWidth - margin, y, { align: "right" });
      y += 14;

      doc.setFont(PDF_SANS, "normal");
      doc.setFontSize(10);
      doc.setTextColor(...PDF_TEXT);
      const descLines = doc.splitTextToSize(experience.description, contentWidth) as string[];
      doc.text(descLines, margin, y);
      y += descLines.length * 14 + 14;

      // Reflection (if present)
      if (experience.reflection) {
        doc.setDrawColor(...PDF_HAIRLINE);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;

        doc.setFont(PDF_SANS, "bold");
        doc.setFontSize(10);
        doc.setTextColor(...PDF_LABEL);
        doc.text("Reflection", margin, y);
        y += 14;

        doc.setFont(PDF_SANS, "normal");
        doc.setFontSize(10);
        doc.setTextColor(...PDF_TEXT);
        const reflLines = doc.splitTextToSize(experience.reflection, contentWidth) as string[];
        doc.text(reflLines, margin, y);
      }

      // Footer on each page
      doc.setFont(PDF_SANS, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...PDF_MUTED);
      doc.text("cliniclogmd.com", margin, pageHeight - 30);
    }

    doc.save("clinilog-experiences.pdf");
  };

  return (
    <button onClick={handleExport} className="btn btn-secondary">
      Export PDF
    </button>
  );
}
