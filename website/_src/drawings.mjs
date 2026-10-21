// Technische Schemazeichnungen ("Bauzeichnung") als Inline-SVG.
// Farben kommen ausschließlich über CSS-Klassen (.dw ...), damit die Zeichnungen
// auf hellen und dunklen Flächen funktionieren.

let uid = 0;
const nid = (p) => `${p}${++uid}`;

const patterns = (id) => `
  <defs>
    <pattern id="${id}-asp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="pat-l" x1="0" y1="0" x2="0" y2="6"/></pattern>
    <pattern id="${id}-bin" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="pat-l" x1="0" y1="0" x2="0" y2="7"/><line class="pat-l" x1="0" y1="0" x2="7" y2="0"/></pattern>
    <pattern id="${id}-trg" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line class="pat-l" x1="0" y1="0" x2="0" y2="5"/></pattern>
    <pattern id="${id}-grv" width="10" height="10" patternUnits="userSpaceOnUse"><circle class="pat-d" cx="2" cy="3" r="1.1"/><circle class="pat-d" cx="7" cy="8" r="1.4"/><circle class="pat-d" cx="8" cy="2" r=".8"/></pattern>
    <pattern id="${id}-soil" width="22" height="16" patternUnits="userSpaceOnUse"><circle class="pat-d" cx="4" cy="4" r=".9"/><line class="pat-l" x1="12" y1="11" x2="18" y2="11"/></pattern>
    <pattern id="${id}-sand" width="4" height="4" patternUnits="userSpaceOnUse"><circle class="pat-d" cx="1" cy="1" r=".55"/></pattern>
    <marker id="${id}-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="f-ink" d="M0 1 L9 5 L0 9z"/></marker>
  </defs>`;

const tick = (x, y) => `<line class="l" x1="${x - 4}" y1="${y + 4}" x2="${x + 4}" y2="${y - 4}"/>`;
const dimH = (x1, x2, y, label) =>
  `<line class="l-thin" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>${tick(x1, y)}${tick(x2, y)}<text class="t" x="${(x1 + x2) / 2}" y="${y - 7}" text-anchor="middle">${label}</text>`;
const dimV = (x, y1, y2, label, side = "left") => {
  const tx = side === "left" ? x - 8 : x + 8;
  const anchor = side === "left" ? "end" : "start";
  return `<line class="l-thin" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>${tick(x, y1)}${tick(x, y2)}<text class="t" x="${tx}" y="${(y1 + y2) / 2 + 4}" text-anchor="${anchor}">${label}</text>`;
};
const leader = (x1, y1, x2, y2, label, anchor = "start", cls = "t") => {
  const tx = anchor === "start" ? x2 + 6 : x2 - 6;
  return `<polyline class="l-thin" points="${x1},${y1} ${x2},${y2}"/><circle class="f-ink" cx="${x1}" cy="${y1}" r="2"/><text class="${cls}" x="${tx}" y="${y2 + 4}" text-anchor="${anchor}">${label}</text>`;
};

const svg = (vb, label, inner, cls = "") =>
  `<svg class="dw ${cls}" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// 1 · Straßenoberbau im Querschnitt
export function road({ dark = false } = {}) {
  const id = nid("rd");
  const x0 = 58, x1 = 430;
  const L = [
    ["asp", 120, 136, "Asphaltdeckschicht 4 cm"],
    ["bin", 136, 160, "Asphaltbinderschicht 8 cm"],
    ["trg", 160, 200, "Asphalttragschicht 14 cm"],
    ["grv", 200, 280, "Frostschutzschicht 40 cm"],
    ["soil", 280, 340, "Planum / Untergrund"],
  ];
  const layers = L.map(([p, a, b]) => `<rect x="${x0}" y="${a}" width="${x1 - x0}" height="${b - a}" fill="url(#${id}-${p})"/><line class="l" x1="${x0}" y1="${b}" x2="${x1}" y2="${b}"/>`).join("");
  const labels = L.map(([, a, b, t], i) => leader(x1 - 14, (a + b) / 2, x1 + 34, 118 + i * 46, t)).join("");
  return svg("0 0 700 380", "Schema Straßenoberbau im Querschnitt", `${patterns(id)}
    <rect class="f-paper" x="${x0}" y="120" width="${x1 - x0}" height="220"/>
    ${layers}
    <line class="l" x1="${x0}" y1="120" x2="${x1}" y2="120"/>
    <path class="l f-soft" d="M40 96 H58 V214 H40 Z"/>
    <path class="l" d="M40 214 H70"/>
    <line class="l-thin" x1="${x1}" y1="110" x2="${x1}" y2="350"/>
    <line class="l-dash" x1="330" y1="56" x2="330" y2="352"/>
    <text class="t" x="330" y="48" text-anchor="middle">Achse</text>
    <line class="l-thin" x1="300" y1="96" x2="196" y2="96" marker-end="url(#${id}-ar)"/>
    <text class="t-b" x="248" y="88" text-anchor="middle">q = 2,5 %</text>
    ${dimV(22, 120, 280, "", "left")}
    <text class="t-b" x="16" y="206" transform="rotate(-90 16 206)" text-anchor="middle">66 cm</text>
    <path class="l-red" d="M${x0} 120 H${x1}"/>
    ${labels}
    <text class="t" x="40" y="368">Hochbord</text>`, dark ? "on-dark-dw" : "");
}

// 2 · Glasfaser-Trasse im Querschnitt mit Hausanschluss
export function trench({ dark = false } = {}) {
  const id = nid("tr");
  return svg("0 0 700 380", "Schema Glasfasertrasse im Querschnitt", `${patterns(id)}
    <rect x="20" y="120" width="660" height="240" fill="url(#${id}-soil)"/>
    <rect class="f-paper" x="240" y="120" width="120" height="216"/>
    <rect x="20" y="112" width="220" height="12" fill="url(#${id}-asp)"/>
    <rect x="360" y="112" width="160" height="12" fill="url(#${id}-asp)"/>
    <rect x="240" y="112" width="120" height="12" fill="url(#${id}-bin)"/>
    <line class="l" x1="20" y1="112" x2="520" y2="112"/>
    <rect x="240" y="124" width="120" height="156" fill="url(#${id}-grv)"/>
    <rect x="240" y="280" width="120" height="56" fill="url(#${id}-sand)"/>
    <path class="l" d="M240 112 V336 H360 V112"/>
    <line class="l-red" x1="246" y1="236" x2="354" y2="236" stroke-dasharray="7 5"/>
    ${[[300, 306], [282, 306], [318, 306], [291, 290], [309, 290], [273, 290], [327, 290]]
      .map(([cx, cy], i) => `<circle class="${i === 0 ? "f-red" : "f-paper"}" cx="${cx}" cy="${cy}" r="8"/><circle class="l" cx="${cx}" cy="${cy}" r="8"/>`).join("")}
    ${leader(250, 118, 214, 84, "Oberfläche wiederhergestellt", "end")}
    ${leader(262, 190, 214, 170, "Verfüllung, verdichtet", "end")}
    ${leader(250, 236, 214, 236, "Trassenwarnband", "end", "t-red")}
    ${leader(275, 300, 214, 304, "Speedpipes im Sandbett", "end")}
    ${dimV(394, 112, 298, "0,60–0,80 m", "right")}
    ${dimH(240, 360, 360, "b ≈ 0,40 m")}
    <path class="l f-soft" d="M520 40 H660 V112 M520 40 V112"/>
    <path class="l" d="M520 112 V220 H660 V112"/>
    <rect class="f-paper" x="521" y="113" width="138" height="106"/>
    <rect class="f-red" x="600" y="168" width="26" height="18"/>
    <text class="t-b" x="613" y="202" text-anchor="middle">HÜP</text>
    <path class="l-red" d="M327 290 C 430 290, 470 250, 520 178 L600 178"/>
    <text class="t-red" x="430" y="262">Hausanschluss FTTH</text>
    <path class="l" d="M520 40 L590 6 L660 40"/>`, dark ? "on-dark-dw" : "");
}

// 3 · Lärmschutzwand in der Ansicht
export function noiseWall({ dark = false, pv = false } = {}) {
  const id = nid("lw");
  const G = 300, posts = [56, 200, 344, 488, 632];
  const top = (i) => (i < 2 ? 210 : 174); // Feld 1–2: 2,50 m · Feld 3–4: 3,50 m
  let panels = "";
  for (let i = 0; i < 4; i++) {
    const a = posts[i] + 4, b = posts[i + 1] - 4, t = top(i);
    panels += `<rect class="f-soft" x="${a}" y="${t}" width="${b - a}" height="${G - t}"/>`;
    for (let y = t; y < G; y += 18) panels += `<line class="l-thin" x1="${a}" y1="${y}" x2="${b}" y2="${y}"/>`;
    panels += `<rect class="l" x="${a}" y="${t}" width="${b - a}" height="${G - t}"/>`;
    if (pv && i >= 2) panels += `<rect class="f-red" x="${a + 1}" y="${t + 1}" width="${b - a - 2}" height="34" opacity=".9"/>` +
      Array.from({ length: 5 }, (_, k) => `<line class="l-thin" x1="${a + (k + 1) * (b - a) / 6}" y1="${t}" x2="${a + (k + 1) * (b - a) / 6}" y2="${t + 36}"/>`).join("");
  }
  const postsSvg = posts.map((x, i) => {
    const t = Math.min(top(Math.max(0, i - 1)), top(Math.min(3, i))) - 6;
    return `<rect class="f-ink" x="${x - 4}" y="${t}" width="8" height="${G - t}"/><rect class="l-dash" x="${x - 12}" y="${G}" width="24" height="64"/>`;
  }).join("");
  return svg("0 0 700 380", pv ? "Schema Lärmschutzwand mit integrierter Photovoltaik" : "Schema Lärmschutzwand in der Ansicht", `${patterns(id)}
    <rect x="16" y="${G}" width="668" height="74" fill="url(#${id}-soil)"/>
    ${panels}${postsSvg}
    <line class="l" x1="16" y1="${G}" x2="684" y2="${G}"/>
    ${dimH(56, 200, 140, "Stützenachse 4,00 m")}
    ${dimV(30, 210, G, "", "left")}
    <text class="t-b" x="30" y="200" text-anchor="middle">2,50 m</text>
    ${dimV(668, 174, G, "", "right")}
    <text class="t-b" x="668" y="164" text-anchor="middle">3,50 m</text>
    ${leader(130, 250, 130, 60, "Aluminium-Kassetten, hochabsorbierend")}
    ${leader(344, 230, 400, 96, "Stahlstütze HEA")}
    ${leader(56, 340, 96, 352, "Gründung")}
    ${pv ? leader(560, 192, 560, 60, "PV-Elemente integriert", "start", "t-red") : ""}`, dark ? "on-dark-dw" : "");
}

// 4 · Gebäudeschnitt (Rohbau / Schlüsselfertigbau)
export function building({ dark = false, floors = 3 } = {}) {
  const id = nid("hb");
  const axes = floors === 1 ? [140, 300, 460, 560] : [100, 260, 420, 580];
  const G = 300, h = floors === 1 ? 110 : 90;
  const levels = Array.from({ length: floors + 1 }, (_, i) => G - i * h);
  const slabs = levels.map((y, i) => `<rect class="${i === 0 ? "f-mid" : "f-ink"}" x="${axes[0] - 10}" y="${i === 0 ? y : y - 10}" width="${axes[axes.length - 1] - axes[0] + 20}" height="${i === 0 ? 12 : 10}"/>`).join("");
  let cols = "";
  for (let i = 0; i < floors; i++) axes.forEach((x) => { cols += `<rect class="f-ink" x="${x - 5}" y="${levels[i + 1]}" width="10" height="${h - 10}"/>`; });
  const axisMarks = axes.map((x, i) => `<line class="l-dash" x1="${x}" y1="${levels[floors] - 34}" x2="${x}" y2="${G + 50}"/><circle class="f-paper" cx="${x}" cy="${levels[floors] - 46}" r="11"/><circle class="l" cx="${x}" cy="${levels[floors] - 46}" r="11"/><text class="t-b" x="${x}" y="${levels[floors] - 42}" text-anchor="middle">${"ABCD"[i]}</text>`).join("");
  const kote = levels.map((y, i) => `<path class="f-ink" d="M${axes[axes.length - 1] + 40} ${y - (i ? 10 : 0)} l-7 -9 h14z"/><text class="t" x="${axes[axes.length - 1] + 54}" y="${y - (i ? 10 : 0) - 1}">${i === 0 ? "±0,00" : "+" + (i * (floors === 1 ? 4.2 : 3.2)).toFixed(2).replace(".", ",")}</text>`).join("");
  const chain = axes.slice(1).map((x, i) => dimH(axes[i], x, G + 74, floors === 1 ? ["8,00", "8,00", "5,00"][i] + " m" : "6,00 m")).join("");
  const stair = floors > 1 ? `<polyline class="l-thin" points="${axes[2] + 14},${G} ${axes[3] - 14},${levels[1]}"/><polyline class="l-thin" points="${axes[2] + 14},${levels[1]} ${axes[3] - 14},${levels[2]}"/>` : `<rect class="l" x="${axes[0] + 30}" y="${G - 70}" width="70" height="60"/><text class="t" x="${axes[0] + 65}" y="${G - 36}" text-anchor="middle">Glas</text>`;
  return svg("0 0 700 400", "Schema Gebäudeschnitt", `${patterns(id)}
    <rect x="16" y="${G + 12}" width="668" height="60" fill="url(#${id}-soil)"/>
    <line class="l" x1="16" y1="${G + 12}" x2="684" y2="${G + 12}"/>
    ${axes.map((x) => `<rect class="l f-soft" x="${x - 22}" y="${G + 12}" width="44" height="22"/>`).join("")}
    <line class="l-red" x1="${axes[0] - 10}" y1="${G + 13}" x2="${axes[axes.length - 1] + 10}" y2="${G + 13}" stroke-width="3"/>
    ${slabs}${cols}${stair}
    <rect class="f-ink" x="${axes[0] - 10}" y="${levels[floors] - 22}" width="6" height="14"/><rect class="f-ink" x="${axes[axes.length - 1] + 4}" y="${levels[floors] - 22}" width="6" height="14"/>
    ${axisMarks}${kote}${chain}
    ${leader(axes[1] + 60, G + 13, axes[1] + 100, G + 46, "Bauwerksabdichtung", "start", "t-red")}`, dark ? "on-dark-dw" : "");
}

// 5 · Markierung in der Draufsicht
export function marking({ dark = false } = {}) {
  const id = nid("mk");
  const dashes = [20, 200, 380, 560].map((x) => `<rect class="f-red" x="${x}" y="157" width="60" height="6"/>`).join("");
  const stalls = Array.from({ length: 17 }, (_, i) => `<line class="l" x1="${60 + i * 25}" y1="282" x2="${60 + i * 25}" y2="332"/>`).join("");
  return svg("0 0 700 380", "Schema Fahrbahn- und Parkplatzmarkierung in der Draufsicht", `${patterns(id)}
    <rect x="10" y="80" width="680" height="160" fill="url(#${id}-asp)"/>
    <rect class="f-ink" x="10" y="86" width="680" height="4"/>
    <rect class="f-ink" x="10" y="230" width="680" height="4"/>
    ${dashes}
    <path class="f-ink" d="M470 194 h44 v-8 l18 14 l-18 14 v-8 h-44z"/>
    <path class="f-ink" d="M230 118 h-44 v-8 l-18 14 l18 14 v-8 h44z"/>
    ${dimH(20, 80, 60, "6,00 m")}
    ${dimH(80, 200, 60, "12,00 m")}
    ${dimV(676, 90, 160, "3,50 m", "left")}
    <rect x="40" y="270" width="470" height="74" fill="url(#${id}-asp)"/>
    ${stalls}
    <line class="l" x1="60" y1="282" x2="460" y2="282"/>
    <path class="f-red" d="M372 296 h12 v12 h-12z"/>
    ${dimH(60, 85, 362, "2,50")}
    ${dimV(474, 282, 332, "5,00 m", "right")}
    ${leader(300, 160, 300, 30, "Leitlinie 6 m Strich / 12 m Lücke", "start", "t-red")}
    ${leader(560, 232, 590, 258, "Fahrbahnrand")}
    <text class="t" x="560" y="306">Parkstände</text>
    <text class="t" x="560" y="322">Kaltplastik 2K</text>`, dark ? "on-dark-dw" : "");
}

// 6 · Natursteinpflaster im wilden Verband mit Brunnen (Draufsicht)
export function plaza({ dark = false } = {}) {
  const id = nid("pz");
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let stones = "";
  for (let y = 12; y < 372;) {
    const rh = 20 + Math.round(rnd() * 14);
    for (let x = 12 - Math.round(rnd() * 30); x < 690;) {
      const w = 26 + Math.round(rnd() * 46);
      const op = (0.04 + rnd() * 0.14).toFixed(2);
      stones += `<rect class="l-thin" x="${x + 1}" y="${y + 1}" width="${w - 3}" height="${rh - 3}" rx="2" style="fill:currentColor;fill-opacity:${op}"/>`;
      x += w;
    }
    y += rh;
  }
  return svg("0 0 700 380", "Schema Natursteinpflaster im wilden Verband mit Brunnen", `
    <clipPath id="${id}-c"><rect x="10" y="10" width="680" height="360"/></clipPath>
    <g clip-path="url(#${id}-c)">${stones}</g>
    <rect class="l" x="10" y="10" width="680" height="360"/>
    <circle class="f-paper" cx="440" cy="190" r="92"/>
    <circle class="l" cx="440" cy="190" r="92"/>
    <circle class="l-red" cx="440" cy="190" r="76"/>
    <circle class="f-soft" cx="440" cy="190" r="76"/>
    <circle class="l" cx="440" cy="190" r="14"/>
    ${[0, 1, 2].map((k) => `<circle class="l-thin" cx="440" cy="190" r="${30 + k * 14}"/>`).join("")}
    <rect class="f-paper" x="40" y="318" width="250" height="34"/>
    <text class="t-b" x="52" y="340">Naturstein, wilder Verband</text>
    <rect class="f-paper" x="520" y="34" width="130" height="30"/>
    <text class="t-red" x="532" y="54">Brunnenanlage</text>`, dark ? "on-dark-dw" : "");
}

export const drawings = { road, trench, noiseWall, building, marking, plaza };

// Hero: Bildmarke im Großformat, rotes Band als Laufschrift
export function heroMark(tickerText, tickerLen) {
  const grid = [];
  for (let x = -300; x <= 1000; x += 120) grid.push(`<line x1="${x}" y1="-160" x2="${x}" y2="1240"/>`);
  for (let y = -150; y <= 1240; y += 120) grid.push(`<line x1="-300" y1="${y}" x2="1000" y2="${y}"/>`);
  const seg = (x) => `<text class="band-text" x="${x}" y="1000" textLength="${tickerLen}" lengthAdjust="spacing">${tickerText}</text>`;
  return `<svg viewBox="-300 -40 1300 1270" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="hero-band"><path d="M385 852 959 521V810L385 1144Z"/></clipPath></defs>
    <g class="grid">${grid.join("")}</g>
    <path class="pillar" d="M7 530.6 461 272.5V1230H7Z"/>
    <path class="pillar" d="M505 258 959 4V1230H505Z"/>
    <g class="band-g">
      <path class="band" d="M385 852 959 521V810L385 1144Z"/>
      <g clip-path="url(#hero-band)"><g transform="rotate(-29.97 385 852)"><g class="ticker">${seg(150)}${seg(150 + tickerLen)}</g></g></g>
    </g>
    <path class="dim" d="M385 1144 H600"/>
    <path class="dim" d="M540 1144 A155 155 0 0 0 519 1066.5"/>
    <text class="dim-text" x="552" y="1118">30°</text>
    <path class="dim" d="M-40 1226 V272 M-52 272 H-28 M-52 1226 H-28"/>
    <text class="dim-text" x="-62" y="760" transform="rotate(-90 -62 760)" text-anchor="middle">FAMILIENUNTERNEHMEN SEIT 1750</text>
  </svg>`;
}
