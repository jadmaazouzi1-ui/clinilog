// Builds every icon file from the one mark geometry in src/lib/logo.ts.
// Run with `node scripts/generate-icons.mjs` after changing the mark or the
// palette. Outputs are committed so the build does not depend on sharp.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

// Pull the values from the source files rather than repeating them here.
const logo = read("src/lib/logo.ts");
const palette = read("src/lib/palette.ts");
const PLUS = logo.match(/MARK_PLUS = "([^"]+)"/)[1];
const hex = (k) => palette.match(new RegExp(`${k}: "(#[0-9A-Fa-f]{6})"`))[1];
const BG = hex("black");
const FG = hex("gold500");

const mark = (size, inset = 0) => {
  // inset: fraction of the canvas left as black margin on each side (maskable).
  const s = 32 / (1 - inset * 2);
  const o = -(s - 32) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${o} ${o} ${s} ${s}"><rect x="${o}" y="${o}" width="${s}" height="${s}" fill="${BG}"/><path d="${PLUS}" fill="${FG}"/></svg>`;
};

const png = (size, inset) => sharp(Buffer.from(mark(size, inset))).png().toBuffer();

function ico(images) {
  // ICO with embedded PNGs (supported by every current browser).
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const out = (f, data) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), data);
  console.log("wrote", f);
};

out("src/app/icon.svg", mark(32) + "\n");
out("src/app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))));
out("src/app/apple-icon.png", await sharp(await png(180)).flatten({ background: BG }).png().toBuffer());
out("public/icon-192.png", await png(192));
out("public/icon-512.png", await png(512));
out("public/icon-maskable-512.png", await png(512, 0.1));
