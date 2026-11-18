// Raw palette for surfaces that cannot read CSS variables: jsPDF, canvas,
// HTML emails and the generated OG image and icons. Mirrors the raw scale in
// src/styles/theme.css; scripts/design-check.mjs fails if a value here does
// not appear there.

export const PALETTE = {
  black: "#000000",
  ink: "#111111",
  paper: "#FBF9F3",
  white: "#FFFFFF",
  stone50: "#F1EEE6",
  stone200: "#DCD6C8",
  stone300: "#B9B3A5",
  stone400: "#8E897D",
  stone600: "#5C5850",
  stone700: "#57534A",
  gold700: "#7A5F1E",
  gold500: "#9E7E38",
  gold300: "#C9A85C",
  cream: "#F5F1E6",
  cream200: "#D9D2C0",
  creamMuted: "#B8B2A2",
  night300: "#8F897A",
  night400: "#6B6659",
  red700: "#B3261E",
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** [r, g, b] for jsPDF's setFillColor / setTextColor / setDrawColor. */
export function rgb(key: PaletteKey): [number, number, number] {
  const h = PALETTE[key].slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Category colours on the black band, in CATEGORY_ORDER. Matches --data-inverse-*. */
export const PATH_COLORS = [PALETTE.cream, PALETTE.cream200, PALETTE.creamMuted, PALETTE.night300, PALETTE.night400] as const;
/** Category colours on white, in CATEGORY_ORDER. Matches --data-*. */
export const CHART_COLORS = [PALETTE.ink, PALETTE.stone600, PALETTE.stone400, PALETTE.stone300, PALETTE.stone200] as const;
