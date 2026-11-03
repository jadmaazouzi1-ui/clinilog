// The ClinicLog MD mark: a square black tile with a gold medical plus. One
// geometry, used by the <Logo> component, the generated icons, the OG image,
// emails and PDFs, so the mark is identical everywhere.
//
// 32-unit grid. The plus arms are 6.4 units thick (20% of the width) so the
// mark still reads at 16px; each arm spans 60% of the tile.

import { PALETTE } from "./palette";

export const MARK_VIEWBOX = 32;
export const MARK_PLUS = "M12.8 6.4h6.4v6.4h6.4v6.4h-6.4v6.4h-6.4v-6.4H6.4v-6.4h6.4z";

/** Standalone SVG markup, for surfaces that cannot render React. */
export function markSvg(size: number, { bg = PALETTE.black, fg = PALETTE.gold500 } = {}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}"><rect width="${MARK_VIEWBOX}" height="${MARK_VIEWBOX}" fill="${bg}"/><path d="${MARK_PLUS}" fill="${fg}"/></svg>`;
}

/** A data: URI of the mark, for <img> in emails and generated images. */
export function markDataUri(size: number): string {
  return `data:image/svg+xml;base64,${Buffer.from(markSvg(size)).toString("base64")}`;
}

/** jsPDF draws the mark from rectangles in its own units. */
export function markRects(x: number, y: number, size: number): { tile: [number, number, number, number]; arms: [number, number, number, number][] } {
  const u = size / MARK_VIEWBOX;
  return {
    tile: [x, y, size, size],
    arms: [
      [x + 6.4 * u, y + 12.8 * u, 19.2 * u, 6.4 * u],
      [x + 12.8 * u, y + 6.4 * u, 6.4 * u, 19.2 * u],
    ],
  };
}
