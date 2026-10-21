// HEIM Logo-System 2026: Bildmarke (zwei Pfeiler unter einer 30°-Dachlinie, verbunden
// durch das Türkisband) + Wortmarke in Geist. Erzeugt alle Logo-Dateien als reine SVG-Pfade.
//   node _src/logo.mjs   (Geist-TTFs aus dem npm-Paket "geist")
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets/brand");
const fontDir = process.argv[2] || path.resolve(ROOT, "../node_modules/geist/dist/fonts/geist-sans");
const bold = opentype.loadSync(path.join(fontDir, "Geist-Bold.ttf"));
const medium = opentype.loadSync(path.join(fontDir, "Geist-SemiBold.ttf"));

export const BRAND = { ink: "#1b2422", green: "#00a383", white: "#ffffff" };

// Bildmarke auf 100 × 128 Einheiten, Dachneigung 30° (tan 30° = 0,57735)
const T = Math.tan(Math.PI / 6);
const roof = (x) => 57.735 - T * x;
const r = (n) => +n.toFixed(2);
const pillarL = `M0 ${r(roof(0))}L44 ${r(roof(44))}V128H0Z`;
const pillarR = `M56 ${r(roof(56))}L100 0V128H56Z`;
const bandTop = (x) => 50 + T * (100 - x);
const band = `M30 ${r(bandTop(30))}L100 50V74L30 ${r(bandTop(30) + 24)}Z`;

function textPath(font, str, size, x, y, tracking = 0) {
  let cx = x; const parts = [];
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    parts.push(g.getPath(cx, y, size).toPathData(2));
    cx += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  const first = font.charToGlyph(str[0]).getBoundingBox(), last = font.charToGlyph(str[str.length - 1]);
  const lb = (last.getBoundingBox().x2 - last.advanceWidth) / font.unitsPerEm * size;
  // optische Breite: vom linken Glyphenrand des ersten bis zum rechten Rand des letzten Zeichens
  return { d: parts.join(""), width: cx - x - tracking + lb - (first.x1 / font.unitsPerEm) * size, lsb: (first.x1 / font.unitsPerEm) * size };
}
const capH = (font, size) => (font.tables.os2.sCapHeight / font.unitsPerEm) * size;

let maskId = 0;
function mark(fillInk, fillBand) {
  if (fillInk !== fillBand) return `<path fill="${fillInk}" d="${pillarL}${pillarR}"/><path fill="${fillBand}" d="${band}"/>`;
  // Einfarbig: Band durch eine schmale Fuge von den Pfeilern trennen
  const id = `hm${++maskId}`;
  return `<mask id="${id}"><rect x="-2" y="-2" width="104" height="132" fill="#fff"/><path d="${band}" fill="none" stroke="#000" stroke-width="5"/></mask><g mask="url(#${id})"><path fill="${fillInk}" d="${pillarL}${pillarR}"/><path fill="${fillBand}" d="${band}"/></g>`;
}

function lockup({ ink, green, descriptor = true, stacked = false }) {
  // Wortmarke "HEIM": Versalhöhe = 52 % der Markenhöhe
  const markH = 128, hSize = (markH * 0.52) / (capH(bold, 1));
  const heim = textPath(bold, "HEIM", hSize, 0, 0, -hSize * 0.01);
  const dSize = hSize * 0.205;
  // Deskriptor auf Breite der Wortmarke sperren
  const dRaw = textPath(medium, "INFRASTRUKTURBAU", dSize, 0, 0, 0);
  const dTrack = (heim.width - dRaw.width) / 15;
  const heimCap = capH(bold, hSize), dCap = capH(medium, dSize);
  const gapV = markH * 0.11;
  const blockH = heimCap + gapV + dCap;
  if (!stacked) {
    const x0 = 100 + markH * 0.22;
    const yHeim = markH - (descriptor ? blockH : 0) + heimCap - (descriptor ? 0 : 0);
    const h = textPath(bold, "HEIM", hSize, x0 - heim.lsb, descriptor ? markH - dCap - gapV : markH, -hSize * 0.01);
    const d = descriptor ? textPath(medium, "INFRASTRUKTURBAU", dSize, x0 - dRaw.lsb, markH, dTrack) : null;
    const W = r(x0 + heim.width);
    return { w: W, h: markH, body: `${mark(ink, green)}<path fill="${ink}" d="${h.d}"/>${d ? `<path fill="${ink}" d="${d.d}"/>` : ""}` };
  }
  const scale = 100 / heim.width; // gestapelt: Wortmarke so breit wie die Bildmarke × 1,6
  const tw = 160, ts = tw / heim.width;
  const hs = hSize * ts, ds = dSize * ts, tr = dTrack * ts;
  const y1 = markH + markH * 0.2 + capH(bold, hs);
  const xOff = (tw - 100) / 2;
  const h = textPath(bold, "HEIM", hs, -heim.lsb * ts, y1, -hs * 0.01);
  const d = textPath(medium, "INFRASTRUKTURBAU", ds, -dRaw.lsb * ts, y1 + capH(medium, ds) + markH * 0.09, tr);
  return { w: tw, h: r(y1 + capH(medium, ds) + markH * 0.09), body: `<g transform="translate(${xOff} 0)">${mark(ink, green)}</g><path fill="${ink}" d="${h.d}"/><path fill="${ink}" d="${d.d}"/>` };
}

const svg = (w, h, body, label = "HEIM Infrastrukturbau", pad = 0) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${r(w + 2 * pad)} ${r(h + 2 * pad)}" role="img" aria-label="${label}">${body}</svg>\n`;

const files = {};
const variants = { "": [BRAND.ink, BRAND.green], "-weiss": [BRAND.white, BRAND.green], "-schwarz": [BRAND.ink, BRAND.ink], "-negativ": [BRAND.white, BRAND.white] };
for (const [suf, [ink, green]] of Object.entries(variants)) {
  const h = lockup({ ink, green });
  files[`heim-logo-horizontal${suf}.svg`] = svg(h.w, h.h, h.body);
  const s = lockup({ ink, green, stacked: true });
  files[`heim-logo-vertikal${suf}.svg`] = svg(s.w, s.h, s.body);
  files[`heim-bildmarke${suf}.svg`] = svg(100, 128, mark(ink, green), "HEIM");
}
const short = lockup({ ink: BRAND.ink, green: BRAND.green, descriptor: false });
files["heim-logo-kurz.svg"] = svg(short.w, short.h, short.body, "HEIM");
// App-Icon / Favicon: Bildmarke weiß auf Türkis, quadratisch
files["heim-icon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="HEIM"><rect width="160" height="160" fill="${BRAND.green}"/><g transform="translate(40 24) scale(.875)">${mark(BRAND.white, BRAND.ink)}</g></svg>\n`;
files["favicon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 140">${mark(BRAND.ink, BRAND.green)}</svg>\n`;

fs.mkdirSync(OUT, { recursive: true });
for (const [f, c] of Object.entries(files)) fs.writeFileSync(path.join(OUT, f), c);
console.log(Object.keys(files).length + " Logo-Dateien in " + OUT);
