"use client";

import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { PDF_HAIRLINE, PDF_LABEL, PDF_MUTED, PDF_SANS, PDF_SERIF, PDF_TEXT, drawHeaderBand } from "@/lib/pdfBrand";
import { recordPdfExport } from "../export-actions";

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

interface ExportButtonProps {
  experience: Experience;
}

export default function ExportButton({ experience }: ExportButtonProps) {
  const handleExport = async () => {
    const gate = await recordPdfExport();
    if (!gate.allowed) {
      alert(gate.error ?? "Export limit reached.");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;
    let y = drawHeaderBand(doc, "ClinicLog MD", { sub: TYPE_LABELS[experience.type] }) + 40;

    // Title
    doc.setFont(PDF_SERIF, "bold");
    doc.setFontSize(18);
    doc.setTextColor(...PDF_TEXT);
    doc.text(experience.title, margin, y);
    y += 18;

    // Organization
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_MUTED);
    doc.text(experience.organization, margin, y);
    y += 20;

    // Date range + hours
    doc.setFont(PDF_SANS, "normal");
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
    y += 24;

    // Divider
    doc.setDrawColor(...PDF_HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Description section
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
    y += descLines.length * 14 + 16;

    // Reflection section (if present)
    if (experience.reflection) {
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        y = 60;
      }

      doc.setDrawColor(...PDF_HAIRLINE);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

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

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_MUTED);
    doc.text("cliniclogmd.com", margin, pageHeight - 30);

    doc.save(`${experience.title}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-secondary">
      Export PDF
    </button>
  );
}
