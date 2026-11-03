// Shared jsPDF branding: the black header band with a gold rule and the mark.
// jsPDF cannot read CSS variables, so colours come from the palette.
import type { jsPDF } from "jspdf";
import { markRects } from "./logo";
import { rgb } from "./palette";

export const PDF_TEXT = rgb("black");
export const PDF_MUTED = rgb("gray700");
export const PDF_LABEL = rgb("gold700");
export const PDF_RULE = rgb("gold500");
export const PDF_HAIRLINE = rgb("gray300");

/** Draws the band across the top of the page and returns the y below it. */
export function drawHeaderBand(doc: jsPDF, title: string, opts: { height?: number; sub?: string } = {}): number {
  const w = doc.internal.pageSize.getWidth();
  const h = opts.height ?? 64;
  doc.setFillColor(...rgb("black"));
  doc.rect(0, 0, w, h, "F");
  doc.setFillColor(...PDF_RULE);
  doc.rect(0, h, w, 3, "F");

  const size = 26;
  const { tile, arms } = markRects(40, (h - size) / 2, size);
  doc.setFillColor(...rgb("black"));
  doc.rect(...tile, "F");
  doc.setFillColor(...PDF_RULE);
  for (const a of arms) doc.rect(...a, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...rgb("cream"));
  doc.text(title, 78, h / 2 + (opts.sub ? -2 : 4));
  if (opts.sub) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...rgb("gold300"));
    doc.text(opts.sub, 78, h / 2 + 11);
  }
  doc.setTextColor(...PDF_TEXT);
  return h + 3;
}

/** Restores the body text colour after a coloured label. */
export function bodyText(doc: jsPDF) {
  doc.setTextColor(...PDF_TEXT);
}
