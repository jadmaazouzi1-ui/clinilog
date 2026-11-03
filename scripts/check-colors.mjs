// Fails when a colour literal appears outside the theme. Run by `npm run lint`.
//
// Every colour lives in src/styles/theme.css. Surfaces that cannot read CSS
// variables (jsPDF, canvas, emails, generated images) import
// src/lib/palette.ts, and this script also checks that every value there is
// defined in theme.css, so the two cannot drift.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const THEME = "src/styles/theme.css";
const PALETTE = "src/lib/palette.ts";
const EXEMPT = new Set([THEME, PALETTE]);

const RULES = [
  // #abc, #abcd, #aabbcc, #aabbccdd; not HTML entities like &#8478;
  { name: "hex colour", re: /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g },
  { name: "rgb/hsl/oklch colour", re: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[\d.]/g },
  {
    name: "Tailwind palette class",
    re: /\b(?:bg|text|border|fill|stroke|ring|from|via|to|accent|outline|shadow|divide|decoration|caret|placeholder)-(?:red|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|orange|amber|yellow|lime|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g,
  },
  { name: "named colour in a style", re: /(?:color|background|fill|stroke|border(?:Color)?)\s*[:=]\s*["'`]?(?:white|black|red|green|blue|gray|grey|orange|purple|yellow)\b/gi },
  { name: "jsPDF numeric colour", re: /\bset(?:Fill|Text|Draw)Color\(\s*\d/g },
  { name: "RGB tuple", re: /\[number, number, number\]\s*=\s*\[\s*\d/g },
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(?:tsx?|jsx?|mjs|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const problems = [];
for (const abs of walk(path.join(ROOT, "src"))) {
  const rel = path.relative(ROOT, abs);
  if (EXEMPT.has(rel)) continue;
  const lines = fs.readFileSync(abs, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { name, re } of RULES) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) problems.push(`${rel}:${i + 1}  ${name}: ${m[0]}`);
    }
  });
}

// palette.ts must not invent colours the theme does not define.
const theme = fs.readFileSync(path.join(ROOT, THEME), "utf8").toUpperCase();
const palette = fs.readFileSync(path.join(ROOT, PALETTE), "utf8");
for (const m of palette.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
  if (!theme.includes(m[0].toUpperCase())) problems.push(`${PALETTE}  ${m[0]} is not defined in ${THEME}`);
}

if (problems.length) {
  console.error(`check-colors: ${problems.length} colour literal(s) outside ${THEME}:\n`);
  for (const p of problems) console.error("  " + p);
  console.error(`\nUse a semantic token from ${THEME}, or PALETTE from ${PALETTE} where CSS variables cannot be read.`);
  process.exit(1);
}
console.log("check-colors: no colour literals outside the theme.");
