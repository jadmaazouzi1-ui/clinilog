// Fails when the code drifts from DESIGN.md. Runs in `npm run lint` and
// before every build (`prebuild`), so a deploy cannot ship a violation.
//
//   colours     no colour literal outside src/styles/theme.css and
//               src/lib/palette.ts, and palette.ts may only use theme values
//   gradients   none, anywhere
//   shadows     box-shadow only "none" or var(--shadow-overlay)
//   type scale  font sizes only from the scale: 13 15 16 17 21 28 40 60 84
//   emoji       none in components
//   dashes      no em dash in source, docs, tests or design files
//   voice       none of the banned phrases from the voice guide, and no
//               exclamation marks in interface copy
//   retired     none of the medical-costume class names

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rel = (abs) => path.relative(ROOT, abs);

const THEME = "src/styles/theme.css";
const PALETTE = "src/lib/palette.ts";

// Fixed-size renders with their own canvas: an OG image, PDF pages and PNG
// cards. They use the palette, but their type is sized for paper or a bitmap,
// not the screen scale.
const FIXED_RENDERS = new Set([
  "src/app/opengraph-image.tsx",
  "src/components/RecapCard.tsx",
  "src/components/WalletCard.tsx",
  "src/app/dashboard/ExportAllButton.tsx",
  "src/app/dashboard/[id]/ExportButton.tsx",
  "src/app/schools/ExportTargetList.tsx",
  "src/lib/pdfBrand.ts",
]);
// The AI prompt lists the banned words so the model avoids them, and the
// text cleaner strips exclamations the model adds.
const VOICE_EXEMPT = new Set(["src/lib/aiText.ts"]);

const SCALE_PX = new Set([13, 15, 16, 17, 21, 28, 40, 60, 84]);
const SCALE_REM = new Set(["0.8125", "0.9375", "1", "1.0625", "1.3125", "1.75", "2.5", "3.75", "5.25"]);

const BANNED = [
  "unlock", "supercharge", "seamless", "elevate", "empower", "leverage", "journey", "revolutioniz",
  "game-changer", "game changer", "cutting-edge", "cutting edge", "streamline", "fast-paced world",
  "next level", "whether you're", "whether you are", "not just", "delve", "robust", "tapestry",
  "effortless", "harness", "skyrocket", "next-gen",
];

const RETIRED = [
  "teal-glow", "glass-card", "clinical-card", "vital-card", "tick-corners", "tear-line", "tear-tab",
  "chart-margin", "dept-header", "field-input", "input-dark", "cat-tag", "beta-pill", "rx-mark",
  "signature-line", "record-no", "tab-index", "ekg-divider", "ekg-loader", "oscilloscope", "binder-tab",
];

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.test(e.name)) out.push(p);
  }
  return out;
}

const problems = [];
const flag = (file, line, rule, text) => problems.push(`${file}:${line}  ${rule}: ${text.trim().slice(0, 90)}`);

const code = walk(path.join(ROOT, "src"), /\.(?:tsx?|jsx?|mjs|css)$/);

for (const abs of code) {
  const file = rel(abs);
  const isCss = file.endsWith(".css");
  const isTsx = file.endsWith(".tsx");
  const lines = fs.readFileSync(abs, "utf8").split("\n");
  let inPrint = false;

  lines.forEach((line, i) => {
    const n = i + 1;
    if (isCss && /@media print/.test(line)) inPrint = true;

    // ── colours ──
    if (file !== THEME && file !== PALETTE) {
      const hex = line.match(/(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/);
      if (hex) flag(file, n, "colour literal", hex[0]);
      const fn = line.match(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[\d.]/);
      if (fn) flag(file, n, "colour literal", fn[0]);
      const tw = line.match(/\b(?:bg|text|border|fill|stroke|ring|from|via|to|outline|shadow|divide|decoration|caret|placeholder)-(?:red|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|orange|amber|yellow|lime|slate|gray|zinc|neutral|stone|white|black)(?:-\d{2,3})?\b/);
      if (tw) flag(file, n, "Tailwind palette colour", tw[0]);
      const named = line.match(/(?:color|background|fill|stroke|border(?:Color)?)\s*[:=]\s*["'`]?(?:white|black|red|green|blue|gray|grey|orange|purple|yellow)\b/i);
      if (named) flag(file, n, "named colour", named[0]);
      if (/\bset(?:Fill|Text|Draw)Color\(\s*\d/.test(line)) flag(file, n, "jsPDF numeric colour", line);
    }

    // ── gradients ──
    if (/(?:linear|radial|conic)-gradient\(|\bbg-gradient-|\bbg-(?:linear|radial|conic)-/.test(line)) flag(file, n, "gradient", line);

    // ── shadows ──
    const css = line.match(/box-shadow\s*:\s*([^;]+)/);
    if (css && file !== THEME && !/^(?:none|var\(--shadow-overlay\))(?:\s*!important)?$/.test(css[1].trim())) flag(file, n, "shadow", css[0]);
    const js = line.match(/boxShadow\s*:\s*(["'`])([^"'`]*)\1/);
    if (js && !/^(?:none|var\(--shadow-overlay\))$/.test(js[2].trim())) flag(file, n, "shadow", js[0]);
    const twShadow = line.match(/\bshadow-(?:sm|md|inner|\[[^\]]*\])/);
    if (isTsx && twShadow) flag(file, n, "shadow", twShadow[0]);

    // ── type scale ──
    if (!FIXED_RENDERS.has(file)) {
      const cssSize = line.match(/font-size\s*:\s*([^;"'`]+)/);
      if (cssSize && file !== THEME) {
        const v = cssSize[1].trim().replace(/\s*!important$/, "");
        const ok = /^var\(--text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\)$/.test(v) || v === "inherit" || v === "1em" ||
          (/^(\d+)px$/.test(v) && SCALE_PX.has(+v.slice(0, -2))) || (inPrint && /^\d+pt$/.test(v));
        if (!ok) flag(file, n, "font size off the scale", cssSize[0]);
      }
      const jsSize = line.match(/fontSize\s*:\s*(["'`][^"'`]*["'`]|\d+(?:\.\d+)?)(?=\s*[,}])/);
      if (jsSize) {
        const raw = jsSize[1].replace(/["'`]/g, "");
        const ok = /^var\(--text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\)$/.test(raw) || (/^\d+$/.test(raw) && SCALE_PX.has(+raw)) ||
          (/^\d+px$/.test(raw) && SCALE_PX.has(parseInt(raw, 10))) ||
          (/^\d+(?:\.\d+)?rem$/.test(raw) && SCALE_REM.has(raw.slice(0, -3)));
        if (!ok) flag(file, n, "font size off the scale", jsSize[0]);
      }
      for (const m of line.matchAll(/\btext-\[(\d+(?:\.\d+)?)(px|rem)\]/g)) {
        if (!(m[2] === "px" ? SCALE_PX.has(+m[1]) : SCALE_REM.has(m[1]))) flag(file, n, "font size off the scale", m[0]);
      }
      if (/\btext-(?:6xl|7xl|8xl|9xl)\b/.test(line)) flag(file, n, "font size off the scale", line.match(/\btext-\dxl\b/)[0]);
    }

    // ── emoji ──
    if (isTsx) {
      const e = line.match(/(?![©®™↔-↙↩↪])\p{Extended_Pictographic}/u);
      if (e) flag(file, n, "emoji", e[0]);
    }

    // ── voice ──
    if (!isCss && !VOICE_EXEMPT.has(file)) {
      const lower = line.toLowerCase();
      for (const w of BANNED) if (lower.includes(w)) flag(file, n, `banned phrase "${w}"`, line);
      const bang = line.match(/[A-Za-z)][!](?=["'`<]|\s+[A-Z"'`<])/);
      if (bang && !/!==?|\/\/.*!/.test(line.slice(Math.max(0, bang.index - 1), bang.index + 4))) flag(file, n, "exclamation mark", line);
    }

    // ── retired costume ──
    if (isCss || /className|class=/.test(line)) {
      for (const c of RETIRED) if (new RegExp(`(?<![\\w-])${c}(?![\\w-])`).test(line)) flag(file, n, `retired class "${c}"`, line);
    }
  });
}

// ── em dashes: everything we write, not only src ──
const prose = [
  ...walk(path.join(ROOT, "src"), /\.(?:tsx?|jsx?|mjs|css)$/),
  ...walk(path.join(ROOT, "scripts"), /\.(?:mjs|js|ts)$/),
  ...walk(path.join(ROOT, "tests"), /\.ts$/),
  ...walk(path.join(ROOT, "docs"), /\.(?:md|html|txt)$/),
  ...["DESIGN.md", "DESIGN_LOG.md", "README.md", "AGENTS.md", "CLAUDE.md"].map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f)),
];
for (const abs of prose) {
  fs.readFileSync(abs, "utf8").split("\n").forEach((line, i) => {
    if (line.includes("\u2014")) flag(rel(abs), i + 1, "em dash", line);
  });
}

// palette.ts may not invent colours the theme does not define.
const theme = fs.readFileSync(path.join(ROOT, THEME), "utf8").toUpperCase();
for (const m of fs.readFileSync(path.join(ROOT, PALETTE), "utf8").matchAll(/#[0-9a-fA-F]{6}\b/g)) {
  if (!theme.includes(m[0].toUpperCase())) problems.push(`${PALETTE}  ${m[0]} is not defined in ${THEME}`);
}

if (problems.length) {
  console.error(`design-check: ${problems.length} problem(s). See DESIGN.md.\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("design-check: no colour literals, gradients, stray shadows, off-scale type, emoji, em dashes or banned phrases.");
