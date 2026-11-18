// Shared jsPDF styling. The PDFs are printed documents, so they follow the
// page, not the app chrome: white paper, the small mark and name at the top,
// a hairline, Times for headings (the nearest built-in face to Newsreader),
// Helvetica for text. Gold appears only in the mark. jsPDF cannot read CSS
// variables, so colours come from the palette.
import type { jsPDF } from "jspdf";
import { markRects } from "./logo";
import { rgb } from "./palette";

export const PDF_TEXT = rgb("ink");
export const PDF_MUTED = rgb("stone700");
/** Small labels above a block of text: muted, sentence case. */
export const PDF_LABEL = rgb("stone700");
/** The rule under a heading. */
export const PDF_RULE = rgb("ink");
export const PDF_HAIRLINE = rgb("stone200");
export const PDF_SERIF = "times";
export const PDF_SANS = "helvetica";
export const PDF_MARGIN = 60;

/** Draws the running header and returns the y below it. `title` is kept for
 *  the callers' signature; the header always reads ClinicLog MD, and `sub`
 *  names the document on the right. */
export function drawHeaderBand(doc: jsPDF, _title: string, opts: { height?: number; sub?: string } = {}): number {
  const w = doc.internal.pageSize.getWidth();
  const top = 36;
  const size = 14;

  const { tile, arms } = markRects(PDF_MARGIN, top, size);
  doc.setFillColor(...rgb("black"));
  doc.rect(...tile, "F");
  doc.setFillColor(...rgb("gold500"));
  for (const a of arms) doc.rect(...a, "F");

  doc.setFont(PDF_SANS, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_TEXT);
  doc.text("ClinicLog MD", PDF_MARGIN + size + 8, top + 10.5);

  if (opts.sub) {
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_MUTED);
    doc.text(opts.sub, w - PDF_MARGIN, top + 10.5, { align: "right" });
  }

  const ruleY = top + size + 10;
  doc.setDrawColor(...PDF_HAIRLINE);
  doc.setLineWidth(0.75);
  doc.line(PDF_MARGIN, ruleY, w - PDF_MARGIN, ruleY);
  doc.setTextColor(...PDF_TEXT);
  return ruleY + 6;
}

/** Restores the body text colour after a coloured label. */
export function bodyText(doc: jsPDF) {
  doc.setTextColor(...PDF_TEXT);
}
