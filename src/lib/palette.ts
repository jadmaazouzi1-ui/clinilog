// Raw palette for surfaces that cannot read CSS variables: jsPDF, canvas,
// HTML emails and the generated OG image and icons. Mirrors the raw scale in
// src/styles/theme.css; scripts/check-colors.mjs fails if a value here does
// not appear there.

export const PALETTE = {
  black: "#000000",
  ink: "#111111",
  paper: "#FBF9F3",
  white: "#FFFFFF",
  gold700: "#7A5F1E",
  gold500: "#9E7E38",
  gold300: "#C9A85C",
  gold200: "#E8D9A8",
  gold100: "#F3ECDA",
  gray700: "#3A3A3A",
  gray500: "#6B6B6B",
  gray400: "#8A8A8A",
  gray300: "#BDBDBD",
  cream: "#F5F1E6",
  creamMuted: "#B8B2A2",
  red700: "#B3261E",
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** [r, g, b] for jsPDF's setFillColor / setTextColor / setDrawColor. */
export function rgb(key: PaletteKey): [number, number, number] {
  const h = PALETTE[key].slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Category colours on the black Your Path card, in CATEGORY_ORDER. */
export const PATH_COLORS = [PALETTE.gold300, PALETTE.cream, PALETTE.gold500, PALETTE.gray400, PALETTE.gold200] as const;
/** Category colours on white, in CATEGORY_ORDER. */
export const CHART_COLORS = [PALETTE.black, PALETTE.gold500, PALETTE.gold300, PALETTE.gray500, PALETTE.gray300] as const;
