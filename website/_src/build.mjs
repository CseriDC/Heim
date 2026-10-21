// Statischer Seitengenerator für heim-live.de
//   node _src/build.mjs              → schreibt die Seiten nach website/
//   node _src/build.mjs --out <dir>  → schreibt eine Kopie (inkl. assets) nach <dir>
//   node _src/build.mjs --preview <dir> → Vorschau-Variante für claude.ai Artifacts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { company as C, services, projects, timeline, benefits, tracks, jobs, faq } from "./content.mjs";
import { drawings as D, heroMark } from "./drawings.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const previewDir = args.includes("--preview") ? path.resolve(args[args.indexOf("--preview") + 1]) : null;
const outDir = previewDir || (args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : ROOT);
const PREVIEW = Boolean(previewDir);
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const svcUrl = (s) => `${s.slug}.html`;
const jobUrl = (j) => `stelle-${j.slug}.html`;
const svcByKey = Object.fromEntries(services.map((s) => [s.key, s]));
const projBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
const photo = (rel) => (fs.existsSync(path.join(ROOT, "assets/img", rel)) ? `assets/img/${rel}` : null);

function art(name, opts = {}) {
  if (name === "noiseWallPv") return D.noiseWall({ ...opts, pv: true });
  if (name === "building1") return D.building({ ...opts, floors: 1 });
  return D[name](opts);
}
function visual(kind, slug, drawing, alt, opts) {
  const img = photo(`${kind}/${slug}.jpg`);
  return img ? `<img src="${img}" alt="${esc(alt)}" loading="lazy" decoding="async">` : art(drawing, opts);
}

// ---------- Icons ----------
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="1"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  case: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V4h6v3M3 12h18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.35h-4v-4.74c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.24-1.82 2.5v4.83h-4v-11Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.96v2.24H7.9v3h2.6V21h3Z"/></svg>',
  helmet: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M8 32a16 16 0 0 1 32 0"/><path d="M20 17v-4h8v4"/><path d="M4 32h40v5H4z"/></svg>',
  plan: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 8h36v32H6z"/><path d="M6 18h14V8M28 40V26h14"/><path d="M12 30l6-6"/></svg>',
  chart: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 40h36"/><path d="M11 40V26h7v14M21 40V16h7v24M31 40V8h7v32"/></svg>',
  cap: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 18 24 9l21 9-21 9z"/><path d="M12 22v10c4 4 20 4 24 0V22M42 19v12"/></svg>',
};
const B = {
  akademie: '<path d="M4 10 18 4l14 6-14 6z"/><path d="M10 13v7c3 3 13 3 16 0v-7"/><path class="acc" d="M30 12v9"/>',
  mentor: '<circle cx="12" cy="11" r="4"/><circle class="acc" cx="25" cy="13" r="3"/><path d="M4 30c0-5 4-8 8-8s8 3 8 8"/><path class="acc" d="M20 30c0-4 2.5-6.5 5-6.5S30 26 30 30"/>',
  vorsorge: '<path d="M18 31s-12-6.5-12-15a6.5 6.5 0 0 1 12-3.5A6.5 6.5 0 0 1 30 16c0 8.5-12 15-12 15Z"/><path class="acc" d="M13 18h10M18 13v10"/>',
  rad: '<circle cx="9" cy="23" r="6"/><circle cx="27" cy="23" r="6"/><path d="M9 23l6-11h8l4 11M15 12l5 11h-11"/><path class="acc" d="M22 8h4"/>',
  fitness: '<path d="M6 13v10M10 10v16M26 10v16M30 13v10"/><path class="acc" d="M10 18h16"/>',
  kleidung: '<path d="M12 5 6 8 3 15l5 2v14h20V17l5-2-3-7-6-3c-1 3-3 4-6 4s-5-1-6-4Z"/><path class="acc" d="M8 22h20"/>',
  praemie: '<circle cx="18" cy="14" r="8"/><path d="M12 21l-3 10 9-4 9 4-3-10"/><path class="acc" d="M15 14l2 2 4-4"/>',
  team: '<circle cx="10" cy="11" r="3.5"/><circle cx="26" cy="11" r="3.5"/><circle class="acc" cx="18" cy="9" r="4"/><path d="M3 28c0-4 3-7 7-7M33 28c0-4-3-7-7-7M10 30c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5"/>',
};
const benefitIcon = (k) => `<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${B[k]}</svg>`;

const logoMarkSvg = fs.readFileSync(path.join(ROOT, "assets/img/heim-mark.svg"), "utf8").replace("<svg ", '<svg class="brand-mark" aria-hidden="true" ').replace(/ color="#232122"/, "").replace(/ role="img" aria-label="HEIM"/, "");
const logoWordSvg = fs.readFileSync(path.join(ROOT, "assets/img/heim-wordmark.svg"), "utf8").replace("<svg ", '<svg class="brand-word" aria-hidden="true" ').replace(/ color="#232122"/, "").replace(/ role="img" aria-label="heim"/, "");

// ---------- Layout ----------
const navItems = [
  ["leistungen.html", "Leistungen", "leistungen"],
  ["projekte.html", "Projekte", "projekte"],
  ["unternehmen.html", "Unternehmen", "unternehmen"],
  ["karriere.html", "Karriere", "karriere"],
  ["kontakt.html", "Kontakt", "kontakt"],
];

function header(section) {
  const items = navItems.map(([href, label, key]) => {
    const cur = key === section ? ' aria-current="page"' : "";
    if (key !== "leistungen") return `<li><a class="nav-link" href="${href}"${cur}>${label}</a></li>`;
    return `<li class="has-mega"><a class="nav-link" href="${href}"${cur}>${label}${I.chev}</a>
      <div class="mega" role="group" aria-label="Leistungen">
        ${services.map((s) => `<a href="${svcUrl(s)}"><strong>${s.name}</strong><span>${s.nav}</span></a>`).join("")}
        <a class="mega-all" href="leistungen.html"><strong>Alle Leistungen im Überblick</strong><span>Fünf Geschäftsbereiche, ein Vertragspartner.</span></a>
      </div></li>`;
  }).join("");
  return `<a class="skip-link" href="#main">Zum Inhalt springen</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="index.html" aria-label="HEIM Infrastrukturbau, zur Startseite">
      ${logoMarkSvg}
      <span class="brand-stack">${logoWordSvg}</span>
      <span class="brand-sub">Infrastruktur<br>bau</span>
    </a>
    <nav class="main-nav" aria-label="Hauptnavigation"><ul>${items}</ul></nav>
    <div class="header-cta">
      <a class="header-tel" href="tel:${C.phoneIntl}">${C.phone}</a>
      <a class="btn" href="kontakt.html">Projekt anfragen</a>
    </div>
    <button class="burger" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobile-nav" data-burger><span></span><span></span><span></span></button>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile Navigation" hidden>
  <ul>
    ${navItems.map(([href, label, key]) => `<li><a href="${href}">${label}</a>${key === "leistungen" ? `<div class="sub">${services.map((s) => `<a href="${svcUrl(s)}">${s.name}</a>`).join("")}</div>` : ""}</li>`).join("")}
  </ul>
  <div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a></div>
  <p class="mono">${C.phone} · ${C.mail}</p>
</nav>`;
}

function footer() {
  return `<footer class="site-footer on-dark">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="assets/img/heim-logo-white.svg" alt="HEIM" width="92" height="161">
        <p>${C.name}. Straßen-, Tief-, Netz- und Hochbau, Verkehrslärmschutz und Markierung. Familienunternehmen mit Wurzeln bis 1750.</p>
        <div class="socials">
          <a href="${C.social.linkedin}" aria-label="HEIM auf LinkedIn" rel="noopener">${I.linkedin}</a>
          <a href="${C.social.instagram}" aria-label="HEIM auf Instagram" rel="noopener">${I.instagram}</a>
          <a href="${C.social.facebook}" aria-label="HEIM auf Facebook" rel="noopener">${I.facebook}</a>
        </div>
      </div>
      <div class="footer-col"><h4>Leistungen</h4><ul>${services.map((s) => `<li><a href="${svcUrl(s)}">${s.name}</a></li>`).join("")}</ul></div>
      <div class="footer-col"><h4>Unternehmen</h4><ul>
        <li><a href="unternehmen.html">Über HEIM</a></li>
        <li><a href="unternehmen.html#geschichte">Geschichte</a></li>
        <li><a href="unternehmen.html#leitbild">Leitbild</a></li>
        <li><a href="projekte.html">Projekte</a></li>
        <li><a href="unternehmen.html#verantwortung">Verantwortung</a></li>
      </ul></div>
      <div class="footer-col"><h4>Karriere</h4><ul>
        <li><a href="karriere.html#stellen">Offene Stellen</a></li>
        ${Object.entries(tracks).map(([k, t]) => `<li><a href="karriere.html#${k}">${t.name}</a></li>`).join("")}
        <li><a href="karriere.html#initiativ">Initiativbewerbung</a></li>
      </ul></div>
      <div class="footer-col"><h4>Kontakt</h4>
        <address>${C.hq.street}<br>${C.hq.zip} ${C.hq.city}<br><br>${C.phone}<br>${C.mail}</address>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>${new Date().getFullYear()}</span> ${C.name}</span>
      <ul><li><a href="impressum.html">Impressum</a></li><li><a href="datenschutz.html">Datenschutz</a></li><li><a href="kontakt.html">Standorte</a></li></ul>
    </div>
  </div>
</footer>`;
}

const orgLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: C.name,
  url: C.baseUrl,
  logo: C.baseUrl + "assets/img/heim-logo.svg",
  telephone: C.phoneIntl,
  email: C.mail,
  address: { "@type": "PostalAddress", streetAddress: C.hq.street, postalCode: C.hq.zip, addressLocality: C.hq.city, addressRegion: C.hq.region, addressCountry: "DE" },
  department: [{ "@type": "GeneralContractor", name: `${C.name} · ${C.south.label}`, address: { "@type": "PostalAddress", streetAddress: C.south.street, postalCode: C.south.zip, addressLocality: C.south.city, addressCountry: "DE" } }],
  sameAs: Object.values(C.social),
};

function page({ file, title, description, section = "", body, ld = [] }) {
  const fullTitle = title ? `${title} | HEIM Infrastrukturbau` : "HEIM Infrastrukturbau | Bauunternehmen in Göppingen";
  const canonical = C.baseUrl + (file === "index.html" ? "" : file);
  const head = `<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HEIM Infrastrukturbau">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="de_DE">
<meta name="theme-color" content="#1f1d1e">
<link rel="icon" href="assets/img/heim-mark.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/barlow-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
${PREVIEW ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">' : ""}
<link rel="stylesheet" href="assets/css/site.css">
${[orgLd, ...ld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}`;
  const content = `${header(section)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/site.js" defer></script>`;
  if (PREVIEW && file === "index.html") return `${head}\n${content}\n`;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${content}
</body>
</html>
`;
}

// ---------- Shared blocks ----------
const crumbs = (list) => `<ol class="crumbs" aria-label="Brotkrumen"><li><a href="index.html">Start</a></li>${list.map(([h, l]) => (h ? `<li><a href="${h}">${l}</a></li>` : `<li aria-current="page">${l}</li>`)).join("")}</ol>`;
const pageMark = `<div class="page-mark" aria-hidden="true"><svg viewBox="0 -20 1000 1250" preserveAspectRatio="xMaxYMax meet"><path class="pillar" d="M7 530.6 461 272.5V1230H7Z"/><path class="pillar" d="M505 258 959 4V1230H505Z"/><path class="band" d="M385 852 959 521V810L385 1144Z"/></svg></div>`;
const heroBand = `<div class="page-hero-band" aria-hidden="true"><svg viewBox="0 0 600 64" preserveAspectRatio="none"><path d="M110 64 600 0V64Z" fill="#ea1b25"/></svg></div>`;

function pageHero({ trail, eyebrow, title, lead, artHtml = "", extra = "", slim = false }) {
  return `<section class="page-hero on-dark${slim || !artHtml ? " page-hero--slim" : ""}">
  <div class="wrap page-hero-inner">
    <div class="page-hero-copy">
      ${crumbs(trail)}
      ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}
      <h1>${title}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ""}
      ${extra}
    </div>
    ${artHtml ? `<div class="page-hero-art">${artHtml}</div>` : ""}
  </div>
  ${slim || !artHtml ? pageMark : heroBand}
</section>`;
}

const ctaBand = (title = "Sprechen wir über Ihr Projekt.", text = "Ob Ausschreibung, Generalunternehmerauftrag oder erste Idee: Unsere Bauleitung meldet sich persönlich bei Ihnen.") => `<section class="cta-band">
  <div class="wrap">
    <div><h2>${title}</h2><p>${text}</p></div>
    <div class="btn-row"><a class="btn" href="kontakt.html">Anfrage senden ${I.arrow}</a><a class="btn btn--ghost" href="tel:${C.phoneIntl}">${C.phone}</a></div>
  </div>
</section>`;

function projectCard(p) {
  const s = svcByKey[p.service];
  return `<a class="pcard reveal" href="projekte.html#${p.slug}">
    <div class="pcard-art">${visual("projekte", p.slug, p.drawing, p.title)}</div>
    <div class="pcard-body">
      <span class="tag"><b>${s.name}</b></span>
      <h3>${p.title}<br>${p.place}</h3>
      <p>${p.teaser}</p>
      <div class="pcard-meta"><span class="status${p.status === "In Ausführung" ? " status--live" : ""}">${p.status}</span>${p.year ? `<span>${p.year}</span>` : ""}</div>
    </div>
  </a>`;
}

const specsDl = (specs) => `<dl class="specs">${specs.map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
const checklist = (items) => `<ul class="checklist">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

// ---------- Pages ----------
const pages = {};

// Startseite
{
  const ticker = "Straßenbau · Tiefbau · Netzbau · Glasfaser · Lärmschutz · Hochbau · Markierung · ";
  const feat = projBySlug["laermschutz-a8-muehlhausen"];
  const openJobs = (k) => jobs.filter((j) => j.track === k).length;
  pages["index.html"] = page({
    file: "index.html",
    title: "",
    description: "HEIM Infrastrukturbau GmbH aus Göppingen: Straßen- und Tiefbau, Netz- und Glasfaserbau, Verkehrslärmschutz, Hochbau und Markierung. Familienunternehmen mit Wurzeln bis 1750.",
    body: `
<section class="hero on-dark">
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <div class="hero-meta"><span>Göppingen</span><span>Baindt</span><span>Familienunternehmen seit 1750</span></div>
      <h1><span class="ln">Wir bauen</span> <span class="ln">Infrastruktur</span> <span class="ln">für <em>Generationen.</em></span></h1>
      <p class="lead">Straßen, Leitungsnetze, Lärmschutz und Gebäude aus einer Hand. Wir planen und bauen für öffentliche Auftraggeber, Versorger und Unternehmen, von Göppingen und Baindt aus.</p>
      <div class="btn-row"><a class="btn" href="leistungen.html">Leistungen ansehen ${I.arrow}</a><a class="btn btn--ghost" href="karriere.html">Karriere bei HEIM</a></div>
    </div>
  </div>
  <div class="hero-art">${heroMark(ticker.toUpperCase(), 3440)}</div>
</section>

<section class="facts" aria-label="HEIM in Zahlen">
  <div class="wrap facts-grid">
    <div class="fact"><span class="fact-num">1750</span><span class="fact-label">reichen die Wurzeln des Familienbetriebs zurück</span></div>
    <div class="fact"><span class="fact-num">10<sup>+</sup></span><span class="fact-label">Generationen der Familie Heim im Bauhandwerk</span></div>
    <div class="fact"><span class="fact-num">110<sup>+</sup></span><span class="fact-label">Mitarbeitende auf Baustellen und im Büro</span></div>
    <div class="fact"><span class="fact-num">40<sup>+</sup></span><span class="fact-label">Jahre Erfahrung im Verkehrslärmschutz</span></div>
    <div class="fact"><span class="fact-num">2</span><span class="fact-label">Standorte in Göppingen-Voralb und Baindt</span></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <div class="title-col"><span class="eyebrow">Leistungen</span><h2 class="h-section">Fünf Geschäftsbereiche.<br>Ein Vertragspartner.</h2></div>
      <p class="lead">Ob Ortsdurchfahrt, Glasfaserausbau oder Lärmschutzwand an der Autobahn: Wir übernehmen Planung, Ausführung und die Koordination aller Gewerke und bleiben über die gesamte Bauzeit Ihr fester Ansprechpartner.</p>
    </div>
    <div class="services">
      ${services.map((s, i) => `<a class="service" href="${svcUrl(s)}">
        <div class="service-art">${visual("leistungen", s.slug, s.drawing, s.name)}</div>
        <div class="service-body">
          <span class="service-index">Geschäftsbereich ${String(i + 1).padStart(2, "0")}</span>
          <h3 class="h-card">${s.name}</h3>
          <p>${s.short}</p>
          <span class="link-arrow">Mehr erfahren ${I.arrow}</span>
        </div>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="section section--concrete">
  <div class="wrap">
    <div class="section-head">
      <div class="title-col"><span class="eyebrow">Referenzen</span><h2 class="h-section">Bauwerke, die man sieht.<br>Und eines, das man nicht hört.</h2></div>
      <p class="lead">Eine Auswahl aus Straßenbau, Netzbau, Lärmschutz und Schlüsselfertigbau. Jedes Projekt mit eigenen Kolonnen, eigener Bauleitung und einem klaren Ergebnis.</p>
    </div>
    <article class="feature reveal">
      <div class="feature-art">${visual("projekte", feat.slug, feat.drawing, feat.title)}</div>
      <div class="feature-body">
        <span class="tag"><b>Verkehrslärmschutz</b> · ${feat.place} · ${feat.year}</span>
        <h3 class="h-display" style="font-size:clamp(2.2rem,1.6rem + 2vw,3.4rem)">${feat.title}</h3>
        <p class="lead" style="font-size:var(--fs-m)">${feat.text}</p>
        ${specsDl(feat.specs)}
        <a class="link-arrow" href="projekte.html#${feat.slug}">Zum Projekt ${I.arrow}</a>
      </div>
    </article>
    <div class="cards-3">
      ${["schlossplatz-goeppingen", "glasfaser-goeppingen-reusch", "mcdonalds-bad-urach"].map((k) => projectCard(projBySlug[k])).join("")}
    </div>
    <div style="margin-top:40px"><a class="btn btn--ghost" href="projekte.html">Alle Projekte ${I.arrow}</a></div>
  </div>
</section>

<section class="section">
  <div class="wrap heritage">
    <p class="quote reveal">Mit Liebe<br>ans Werk.<small>Leitbild der ${C.name}</small></p>
    <div class="heritage-text">
      <span class="eyebrow">Unternehmen</span>
      <h2 class="h-section">Ein Familienbetrieb mit über 275 Jahren Geschichte.</h2>
      <p>Die Wurzeln der Familie Heim im Bauhandwerk reichen bis 1750 zurück. Aus dem Handwerksbetrieb ist ein mittelständisches Bauunternehmen mit mehr als 110 Mitarbeitenden geworden. Geführt wird es heute von Jan-Philip Heim und Tobias Jachmann: mit kurzen Wegen, verlässlichen Zusagen und dem Anspruch, dass jedes Bauwerk Jahrzehnte hält.</p>
      <ol class="mini-timeline">
        ${timeline.filter((t) => ["1750", "1927", "1959", "1995", "2014", "2021"].includes(t[0])).map(([y, h]) => `<li><b>${y}</b><span>${h}</span></li>`).join("")}
      </ol>
      <a class="link-arrow" href="unternehmen.html">Mehr über HEIM ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section section--dark on-dark career-band">
  <div class="wrap">
    <div class="career-head">
      <div class="title-col" style="display:grid;gap:18px"><span class="eyebrow">Karriere</span><h2 class="h-display">Werden Sie <span>HEIMWerker.</span></h2></div>
      <div style="display:grid;gap:24px"><p class="lead">Wir suchen Menschen, die gerne anpacken und Verantwortung übernehmen. Auf der Baustelle, in der Bauleitung und im Büro. Mit unbefristeten Verträgen, eigener Akademie und einem Team, das zusammenhält.</p>
      <div class="btn-row"><a class="btn" href="karriere.html#stellen">${jobs.length} offene Stellen ${I.arrow}</a></div></div>
    </div>
    <div class="tracks">
      ${Object.entries(tracks).map(([k, t]) => `<a class="track" href="karriere.html#${k}">
        <span class="track-icon">${I[t.icon]}</span>
        <span class="track-count"><b>${openJobs(k)}</b> ${openJobs(k) === 1 ? "Stelle" : "Stellen"}</span>
        <h3>${t.name}</h3>
        <p>${t.text}</p>
        <span class="link-arrow">Stellen ansehen ${I.arrow}</span>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <div class="title-col"><span class="eyebrow">Standorte</span><h2 class="h-section">Zu Hause in Baden-Württemberg.</h2></div>
      <p class="lead">Von der Zentrale in Göppingen-Voralb und unserer Niederlassung Süd in Baindt aus sind wir schnell auf Ihrer Baustelle. Im Verkehrslärmschutz arbeiten wir bundesweit.</p>
    </div>
    <div class="locations">
      ${[C.hq, C.south].map((l) => `<div class="loc"><span class="mono">${l === C.hq ? "Hauptsitz" : "Oberschwaben · Bodensee · Allgäu"}</span><h3>${l.label}</h3><address>${C.name}<br>${l.street}<br>${l.zip} ${l.city}</address><a class="link-arrow" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(`${l.street}, ${l.zip} ${l.city}`)}" rel="noopener">Route planen ${I.arrow}</a></div>`).join("")}
      <div class="loc loc--cta on-dark">
        <h3>Ihr Projekt.<br>Unser Angebot.</h3>
        <div class="contact-line"><span class="k">Telefon</span><a href="tel:${C.phoneIntl}">${C.phone}</a></div>
        <div class="contact-line"><span class="k">E-Mail</span><span class="v">${C.mail}</span></div>
        <div class="btn-row"><a class="btn" href="kontakt.html">Anfrage senden ${I.arrow}</a></div>
      </div>
    </div>
  </div>
</section>`,
  });
}

// Leistungen Übersicht
pages["leistungen.html"] = page({
  file: "leistungen.html",
  title: "Leistungen",
  section: "leistungen",
  description: "Straßen- und Tiefbau, Netz- und Glasfaserbau, Verkehrslärmschutz, Hochbau und Schlüsselfertigbau sowie Markierung: die Leistungen der HEIM Infrastrukturbau GmbH.",
  body: `${pageHero({ trail: [[null, "Leistungen"]], eyebrow: "Leistungen", title: "Infrastruktur<br>aus einer Hand.", lead: "Fünf Geschäftsbereiche, eigene Kolonnen, eigene Bauleitung. Wir verbinden Tiefbau, Netzbau, Lärmschutz, Hochbau und Markierung zu Leistungen, die ineinandergreifen.", artHtml: D.road({ dark: true }) })}
<section class="section">
  <div class="wrap project-list">
    ${services.map((s, i) => `<article class="project reveal" id="${s.key}">
      <div class="project-art">${visual("leistungen", s.slug, s.drawing, s.name)}</div>
      <div class="project-body">
        <span class="tag"><b>Geschäftsbereich ${String(i + 1).padStart(2, "0")}</b></span>
        <h2>${s.name}</h2>
        <p>${s.lead}</p>
        ${checklist(s.scope.slice(0, 4).map(([t]) => t))}
        <a class="link-arrow" href="${svcUrl(s)}">${s.name} im Detail ${I.arrow}</a>
      </div>
    </article>`).join("")}
  </div>
</section>
${ctaBand()}`,
});

// Leistungsseiten
services.forEach((s, idx) => {
  const rel = s.projects.map((k) => projBySlug[k]);
  pages[svcUrl(s)] = page({
    file: svcUrl(s),
    title: s.name,
    section: "leistungen",
    description: `${s.name} von HEIM Infrastrukturbau: ${s.short}`,
    body: `${pageHero({ trail: [["leistungen.html", "Leistungen"], [null, s.name]], eyebrow: `Geschäftsbereich ${String(idx + 1).padStart(2, "0")}`, title: s.name, lead: s.lead, slim: true, extra: `<div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a></div>` })}
<section class="section">
  <div class="wrap split">
    <div style="display:grid;gap:40px">
      <div class="prose">${s.intro.map((p) => `<p>${p}</p>`).join("")}</div>
      <div style="display:grid;gap:18px"><span class="eyebrow">Leistungsumfang</span>
      <ul class="scope">${s.scope.map(([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ul></div>
    </div>
    <div style="display:grid;gap:20px">
      <figure class="drawing-panel" style="margin:0">${art(s.drawing)}<figcaption><span>${s.caption[0]}</span><span>${s.caption[1]}</span></figcaption></figure>
      <div class="aside-card"><h3>${s.asideTitle}</h3>${checklist(s.aside)}</div>
    </div>
  </div>
</section>
${rel.length ? `<section class="section section--concrete">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Referenzen</span><h2 class="h-section">Projekte aus diesem Bereich</h2></div></div>
    <div class="cards-3" style="margin-top:0">${rel.map(projectCard).join("")}</div>
  </div>
</section>` : ""}
<section class="section">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Weitere Leistungen</span><h2 class="h-section">Alles, was dazugehört.</h2></div></div>
    <div class="other-services">${services.filter((o) => o !== s).map((o) => `<a href="${svcUrl(o)}"><strong>${o.name}</strong><span>${o.nav}</span></a>`).join("")}</div>
  </div>
</section>
${ctaBand()}`,
  });
});

// Projekte
pages["projekte.html"] = page({
  file: "projekte.html",
  title: "Projekte",
  section: "projekte",
  description: "Referenzprojekte der HEIM Infrastrukturbau GmbH: Lärmschutzwand A8, Schlossplatz Göppingen, Glasfaserausbau Reusch, schlüsselfertige Gewerbebauten und mehr.",
  body: `${pageHero({ trail: [[null, "Projekte"]], eyebrow: "Referenzen", title: "Projekte", lead: "Vom historischen Stadtplatz bis zur Lärmschutzwand an der Autobahn: eine Auswahl aus unseren Geschäftsbereichen.", artHtml: D.plaza({ dark: true }) })}
<section class="section section--concrete">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Projekte filtern" data-filter-group="#project-list">
      <button class="chip" type="button" data-filter="alle" aria-pressed="true">Alle<span class="c">${projects.length}</span></button>
      ${services.filter((s) => projects.some((p) => p.service === s.key)).map((s) => `<button class="chip" type="button" data-filter="${s.key}" aria-pressed="false">${s.name}<span class="c">${projects.filter((p) => p.service === s.key).length}</span></button>`).join("")}
    </div>
    <div class="project-list" id="project-list">
      ${projects.map((p) => `<article class="project" id="${p.slug}" data-cat="${p.service}">
        <div class="project-art">${visual("projekte", p.slug, p.drawing, p.title)}</div>
        <div class="project-body">
          <span class="tag"><b>${svcByKey[p.service].name}</b> · ${p.place}${p.year ? " · " + p.year : ""}</span>
          <h2>${p.title}<br>${p.place}</h2>
          <span class="status${p.status === "In Ausführung" ? " status--live" : ""}">${p.status}</span>
          <p>${p.text}</p>
          ${specsDl(p.specs)}
          ${checklist(p.scope)}
        </div>
      </article>`).join("")}
    </div>
  </div>
</section>
${ctaBand("Ihr Projekt als nächste Referenz.", "Wir beraten Sie gerne zu Bauweise, Ablauf und Terminen, bereits in der Planungsphase.")}`,
});

// Unternehmen
pages["unternehmen.html"] = page({
  file: "unternehmen.html",
  title: "Unternehmen",
  section: "unternehmen",
  description: "Familienunternehmen mit Wurzeln bis 1750: Geschichte, Leitbild, Geschäftsführung und Verantwortung der HEIM Infrastrukturbau GmbH.",
  body: `${pageHero({ trail: [[null, "Unternehmen"]], eyebrow: "Unternehmen", title: "Familie.<br>Handwerk.<br>Verantwortung.", lead: "Seit mehr als zehn Generationen ist die Familie Heim mit dem Bauen verbunden. Heute ist HEIM Infrastrukturbau ein mittelständisches Bauunternehmen mit über 110 Mitarbeitenden und zwei Standorten in Baden-Württemberg.", artHtml: D.building({ dark: true }) })}
<section class="section">
  <div class="wrap split">
    <div class="prose">
      <span class="eyebrow">Über uns</span>
      <h2 class="h-section" style="font-size:var(--fs-2xl)">Wir bauen, was eine Region zusammenhält.</h2>
      <p>Straßen, auf denen Menschen zur Arbeit fahren. Netze, die Häuser mit schnellem Internet versorgen. Wände, die Wohngebiete vor Verkehrslärm schützen. Gebäude, in denen gearbeitet wird. Das ist unsere Arbeit, und wir machen sie mit eigenem Personal, eigenem Gerät und eigener Bauleitung.</p>
      <p>Als eigentümergeführtes Familienunternehmen entscheiden wir schnell und stehen zu unserem Wort. Unsere Kunden sind Städte und Gemeinden, Straßenbauverwaltungen, Versorgungsunternehmen und gewerbliche Bauherren. Viele von ihnen begleiten wir seit Jahrzehnten.</p>
    </div>
    <div class="aside-card">
      <h3>Auf einen Blick</h3>
      ${specsDl([["Wurzeln", "1750"], ["Mitarbeitende", "110+"], ["Standorte", "2"], ["Geschäftsbereiche", "5"], ["Rechtsform", "GmbH"], ["Sitz", "Göppingen"]])}
    </div>
  </div>
</section>
<section class="section section--concrete" id="geschichte">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Geschichte</span><h2 class="h-section">Über 275 Jahre Bauen.</h2></div><p class="lead">Jede Generation hat das Unternehmen weiterentwickelt. Geblieben sind die Werte eines Handwerksbetriebs.</p></div>
    <ol class="timeline">
      ${timeline.map(([y, h, t, key]) => `<li class="${key ? "is-key" : ""}"><span class="yr">${y}</span><div><h3>${h}</h3><p>${t}</p></div></li>`).join("")}
    </ol>
  </div>
</section>
<section class="section section--dark on-dark" id="leitbild">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Leitbild</span><h2 class="h-display">Mit Liebe<br>ans Werk.</h2></div><p class="lead">Unser Leitbild beschreibt, was uns wichtig ist. Es ist die DNA unseres Unternehmens und gilt für jede Baustelle und jeden Arbeitsplatz.</p></div>
    <div class="values">
      <div class="value"><span class="mono">Kunden</span><h3>Verlässlich bauen</h3><p>Wir halten Termine und Zusagen. Unsere Kunden haben einen festen Ansprechpartner, der Entscheidungen trifft und Verantwortung übernimmt.</p></div>
      <div class="value"><span class="mono">Gesellschaft</span><h3>Region stärken</h3><p>Wir bilden aus, beschäftigen Menschen aus der Region und engagieren uns in Sport und Gemeinschaft vor Ort.</p></div>
      <div class="value"><span class="mono">Umwelt</span><h3>Ressourcen schonen</h3><p>Langlebige Bauweisen, Lärmschutz mit integrierter Photovoltaik und unser Bekenntnis zur WIN-Charta Baden-Württemberg.</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Geschäftsführung</span><h2 class="h-section">Persönlich geführt.</h2></div><p class="lead">Bei HEIM sprechen Sie mit den Menschen, die entscheiden.</p></div>
    <div class="people">
      <div class="person"><span class="initials" aria-hidden="true">JH</span><h3>Jan-Philip Heim</h3><span class="mono">Geschäftsführer</span></div>
      <div class="person"><span class="initials" aria-hidden="true">TJ</span><h3>Tobias Jachmann</h3><span class="mono">Geschäftsführer</span></div>
      <div class="person"><span class="initials" aria-hidden="true">DH</span><h3>Dietmar Heim</h3><span class="mono">Inhaber</span></div>
    </div>
  </div>
</section>
<section class="section section--concrete" id="verantwortung">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Verantwortung</span><h2 class="h-section">Verbunden mit der Region.</h2></div></div>
    <div class="partner-row">
      <div class="partner"><span class="mono" style="color:var(--muted)">Seit 2023</span><h3>WIN-Charta &amp; KLIMA WIN</h3><p>Mit dem Beitritt zur WIN-Charta haben wir uns zu den Nachhaltigkeitszielen des Landes Baden-Württemberg verpflichtet, gemeinsam mit anderen Unternehmen aus dem Land.</p></div>
      <div class="partner"><span class="mono" style="color:var(--muted)">Businesspartner</span><h3>Ravensburg Towerstars</h3><p>Als Partner des Eishockeyclubs zeigen wir Präsenz in Oberschwaben, wo unsere Niederlassung Süd seit 2021 zu Hause ist.</p></div>
      <div class="partner"><span class="hus-word">HUS<span>.</span></span><h3>HUS Umwelttechnik + Service</h3><p>Unser Partnerunternehmen für Umwelttechnik und Service ergänzt das Leistungsspektrum rund um Bau und Infrastruktur.</p></div>
    </div>
  </div>
</section>
${ctaBand("Lernen Sie uns kennen.", "Ob als Auftraggeber, Partner oder zukünftige Kollegin und zukünftiger Kollege: Wir freuen uns auf das Gespräch.")}`,
});

// Karriere
{
  const jobRow = (j) => `<li class="job" data-cat="${j.track}"><a href="${jobUrl(j)}">
    <span class="job-title"><span>${tracks[j.track].name}</span><strong>${j.title}</strong></span>
    <span class="job-cell">${I.pin}${j.location}</span>
    <span class="job-cell">${I.clock}${j.type}</span>
    <span class="job-go" aria-hidden="true">${I.arrow}</span></a></li>`;
  pages["karriere.html"] = page({
    file: "karriere.html",
    title: "Karriere",
    section: "karriere",
    description: `Karriere bei HEIM Infrastrukturbau: ${jobs.length} offene Stellen auf der Baustelle, in Technik und Bauleitung, in Finanzen und Verwaltung sowie Ausbildung und duales Studium.`,
    body: `${pageHero({ trail: [[null, "Karriere"]], eyebrow: "Karriere", title: "Werden Sie<br>HEIMWerker.", lead: "Bei uns bauen Sie Infrastruktur, die bleibt. In einem Familienunternehmen mit kurzen Wegen, festen Ansprechpartnern und echten Entwicklungsmöglichkeiten.", extra: `<div class="btn-row"><a class="btn" href="#stellen">${jobs.length} offene Stellen ${I.arrow}</a><a class="btn btn--ghost" href="#initiativ">Initiativ bewerben</a></div>`, slim: true })}
<section class="section">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Einstieg</span><h2 class="h-section">Vier Wege zu HEIM.</h2></div><p class="lead">Ob Facharbeiterin, Bauingenieur, Buchhalterin oder Schulabgänger: Für jede Station gibt es bei uns einen Platz und eine Perspektive.</p></div>
    <div class="tracks" style="background:var(--line);border-color:var(--line)">
      ${Object.entries(tracks).map(([k, t]) => `<a class="track" href="#${k}" data-jump="${k}" style="background:var(--ink)">
        <span class="track-icon">${I[t.icon]}</span>
        <span class="track-count"><b>${jobs.filter((j) => j.track === k).length}</b> offene Stellen</span>
        <h3>${t.name}</h3><p>${t.text}</p>
        <span class="link-arrow">Stellen filtern ${I.arrow}</span></a>`).join("")}
    </div>
  </div>
</section>
<section class="section section--concrete" id="stellen">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Offene Stellen</span><h2 class="h-section">Aktuelle Stellenangebote</h2></div><p class="lead">Alle Stellen sind unbefristet, sofern nicht anders angegeben. Ihre Bewerbung dauert nur wenige Minuten.</p></div>
    <div class="job-tools">
      <div class="filters" style="margin:0" role="group" aria-label="Stellen nach Bereich filtern" data-filter-group="#job-list" data-search="#job-q">
        <button class="chip" type="button" data-filter="alle" aria-pressed="true">Alle<span class="c">${jobs.length}</span></button>
        ${Object.entries(tracks).map(([k, t]) => `<button class="chip" type="button" data-filter="${k}" id="${k}" aria-pressed="false">${t.short}<span class="c">${jobs.filter((j) => j.track === k).length}</span></button>`).join("")}
      </div>
      <label class="job-search"><span class="sr-only">Stellen durchsuchen</span>${I.search}<input id="job-q" type="search" placeholder="Stelle oder Ort suchen" autocomplete="off"></label>
    </div>
    <div>
      <ul class="jobs" id="job-list">${jobs.map(jobRow).join("")}</ul>
      <p class="jobs-empty" data-empty hidden>Keine passende Stelle gefunden. Bewerben Sie sich gerne initiativ.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Was wir bieten</span><h2 class="h-section">Gute Arbeit verdient gute Bedingungen.</h2></div><p class="lead">Unsere Leistungen gelten für alle HEIMWerker, ergänzt um Angebote, die zu Ihrer Rolle passen.</p></div>
    <div class="benefits">${benefits.map(([k, h, t]) => `<div class="benefit">${benefitIcon(k)}<h3>${h}</h3><p>${t}</p></div>`).join("")}</div>
  </div>
</section>
<section class="section section--dark on-dark">
  <div class="wrap">
    <div class="section-head"><div class="title-col"><span class="eyebrow">Bewerbungsprozess</span><h2 class="h-section">In vier Schritten zu HEIM.</h2></div><p class="lead">Unkompliziert und persönlich. Ein Lebenslauf genügt für den Anfang.</p></div>
    <ol class="steps">
      <li><h3>Bewerben</h3><p>Online über das Formular der Stelle oder per E-Mail an ${C.jobsMail}. Ein Anschreiben ist nicht nötig.</p></li>
      <li><h3>Rückmeldung</h3><p>Sie erhalten eine Eingangsbestätigung. Die zuständige Führungskraft sieht sich Ihre Unterlagen persönlich an.</p></li>
      <li><h3>Kennenlernen</h3><p>Im Gespräch, gerne auch direkt auf der Baustelle oder bei uns im Büro in Göppingen oder Baindt.</p></li>
      <li><h3>Starten</h3><p>Nach der Zusage begleitet Sie Ihr Mentor durch die Einarbeitung und die ersten Projekte.</p></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div style="display:grid;gap:18px"><span class="eyebrow">Häufige Fragen</span><h2 class="h-section">Gut zu wissen.</h2></div>
    <div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><p class="faq-a">${a}</p></details>`).join("")}</div>
  </div>
</section>
<section class="section section--concrete" id="initiativ">
  <div class="wrap split">
    <div style="display:grid;gap:22px;align-content:start">
      <span class="eyebrow">Initiativbewerbung</span>
      <h2 class="h-section">Nicht die passende Stelle dabei?</h2>
      <p class="lead">Erzählen Sie uns, was Sie können und was Sie suchen. Wir melden uns, sobald sich eine passende Aufgabe ergibt.</p>
      <div class="contact-card"><span class="mono">Personal &amp; Recruiting</span><strong>${C.short}</strong><span>${C.jobsMail}</span><span>${C.phone}</span></div>
    </div>
    ${applicationForm("Initiativbewerbung")}
  </div>
</section>`,
  });
}

function applicationForm(position) {
  const id = position.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  return `<form class="form" data-form data-endpoint="" data-mail="${C.jobsMail}" enctype="multipart/form-data" novalidate>
    <input type="hidden" name="position" value="${esc(position)}">
    <div class="field"><label for="${id}-vn">Vorname</label><input id="${id}-vn" name="vorname" autocomplete="given-name" required></div>
    <div class="field"><label for="${id}-nn">Nachname</label><input id="${id}-nn" name="nachname" autocomplete="family-name" required></div>
    <div class="field"><label for="${id}-em">E-Mail</label><input id="${id}-em" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="${id}-tel">Telefon</label><input id="${id}-tel" name="telefon" type="tel" autocomplete="tel"></div>
    <div class="field"><label for="${id}-start">Frühester Eintritt</label><input id="${id}-start" name="eintritt" placeholder="z. B. 01.01.2027"></div>
    <div class="field"><label for="${id}-cv">Lebenslauf (PDF)</label><input id="${id}-cv" name="lebenslauf" type="file" accept=".pdf,.doc,.docx"></div>
    <div class="field full"><label for="${id}-msg">Ihre Nachricht (optional)</label><textarea id="${id}-msg" name="nachricht"></textarea></div>
    <label class="check full"><input id="${id}-ds" type="checkbox" name="datenschutz" required><span>Ich habe die <a href="datenschutz.html">Datenschutzhinweise</a> gelesen und bin mit der Verarbeitung meiner Daten zum Zweck der Bewerbung einverstanden.</span></label>
    <div class="full btn-row"><button class="btn" type="submit">Bewerbung senden ${I.arrow}</button></div>
    <p class="form-note full" data-form-note role="status" hidden></p>
  </form>`;
}

// Stellenseiten
jobs.forEach((j) => {
  const loc = j.city === "Baindt" ? C.south : C.hq;
  const more = jobs.filter((o) => o !== j && o.track === j.track).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: `<p>${j.role}</p><h3>Ihre Aufgaben</h3><ul>${j.tasks.map((t) => `<li>${t}</li>`).join("")}</ul><h3>Ihr Profil</h3><ul>${j.profile.map((t) => `<li>${t}</li>`).join("")}</ul><h3>Was Sie erwarten dürfen</h3><ul>${j.offer.map((t) => `<li>${t}</li>`).join("")}</ul>`,
    datePosted: today,
    employmentType: j.track === "nachwuchs" ? (j.type.startsWith("Praktikum") ? "INTERN" : "OTHER") : j.type.includes("Teilzeit") ? ["FULL_TIME", "PART_TIME"] : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: C.name, sameAs: C.baseUrl, logo: C.baseUrl + "assets/img/heim-logo.svg" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: loc.street, postalCode: loc.zip, addressLocality: loc.city, addressRegion: loc.region, addressCountry: "DE" } },
  };
  pages[jobUrl(j)] = page({
    file: jobUrl(j),
    title: j.title,
    section: "karriere",
    description: `${j.title} bei HEIM Infrastrukturbau in ${j.location}. ${j.role.split(". ")[0]}.`,
    ld: [ld],
    body: `${pageHero({
      trail: [["karriere.html", "Karriere"], ["karriere.html#stellen", "Stellen"], [null, j.title.replace(/ \(m\/w\/d\).*/, "")]],
      eyebrow: tracks[j.track].name,
      title: j.title,
      slim: true,
      extra: `<div class="job-hero-facts"><span>${I.pin}${j.location}</span><span>${I.clock}${j.type}</span><span>${I.cal}Start ${j.start}</span>${j.track !== "nachwuchs" ? `<span>${I.case}unbefristet</span>` : ""}</div>
      <div class="btn-row"><a class="btn" href="#bewerben">Jetzt bewerben ${I.arrow}</a><a class="btn btn--ghost" href="karriere.html#stellen">Alle Stellen</a></div>`,
    })}
<section class="section">
  <div class="wrap job-layout">
    <div class="job-main">
      <div class="job-block"><h2>Ihre Rolle</h2><p class="lead" style="color:var(--ink)">${j.role}</p></div>
      <div class="job-block"><h2>Ihre Aufgaben</h2>${checklist(j.tasks)}</div>
      <div class="job-block"><h2>Ihr Profil</h2>${checklist(j.profile)}</div>
      <div class="job-block"><h2>Was Sie erwarten dürfen</h2>${checklist(j.offer)}</div>
      <div class="job-block"><h2>Über HEIM</h2><p>HEIM Infrastrukturbau ist ein Familienunternehmen mit Wurzeln bis 1750 und über 110 Mitarbeitenden. Von Göppingen und Baindt aus bauen wir Straßen, Netze, Lärmschutzwände und Gebäude für öffentliche und private Auftraggeber.</p><a class="link-arrow" href="unternehmen.html">Mehr über uns ${I.arrow}</a></div>
    </div>
    <aside class="job-side">
      <div class="factsheet">
        <h3>Eckdaten</h3>
        <dl>
          <div><dt>Bereich</dt><dd>${tracks[j.track].name}</dd></div>
          <div><dt>Standort</dt><dd>${j.location}</dd></div>
          <div><dt>Arbeitszeit</dt><dd>${j.type}</dd></div>
          <div><dt>Eintritt</dt><dd>${j.start}</dd></div>
          <div><dt>Arbeitsort</dt><dd>${loc.street}, ${loc.zip} ${loc.city}</dd></div>
        </dl>
        <a class="btn" href="#bewerben">Jetzt bewerben ${I.arrow}</a>
      </div>
      <div class="contact-card"><span class="mono">Ihr Kontakt</span><strong>Personal &amp; Recruiting</strong><span>${C.jobsMail}</span><span>${C.phone}</span></div>
    </aside>
  </div>
</section>
<section class="section section--concrete" id="bewerben">
  <div class="wrap split">
    <div style="display:grid;gap:22px;align-content:start">
      <span class="eyebrow">Bewerbung</span>
      <h2 class="h-section">Bewerben Sie sich in drei Minuten.</h2>
      <p class="lead">Ein Lebenslauf genügt. Alternativ senden Sie Ihre Unterlagen mit dem Betreff „${esc(j.title)}“ an ${C.jobsMail}.</p>
    </div>
    ${applicationForm(j.title)}
  </div>
</section>
${more.length ? `<section class="section"><div class="wrap">
  <div class="section-head"><div class="title-col"><span class="eyebrow">Ähnliche Stellen</span><h2 class="h-section">Das könnte auch passen.</h2></div></div>
  <ul class="jobs">${more.map((o) => `<li class="job"><a href="${jobUrl(o)}"><span class="job-title"><span>${tracks[o.track].name}</span><strong>${o.title}</strong></span><span class="job-cell">${I.pin}${o.location}</span><span class="job-cell">${I.clock}${o.type}</span><span class="job-go" aria-hidden="true">${I.arrow}</span></a></li>`).join("")}</ul>
</div></section>` : ""}`,
  });
});

// Kontakt
pages["kontakt.html"] = page({
  file: "kontakt.html",
  title: "Kontakt",
  section: "kontakt",
  description: "Kontakt zur HEIM Infrastrukturbau GmbH: Zentrale Göppingen-Voralb, Niederlassung Süd in Baindt. Telefon 07161 50 30-10, info@heim-hus.de.",
  body: `${pageHero({ trail: [[null, "Kontakt"]], eyebrow: "Kontakt", title: "Sprechen wir<br>über Ihr Projekt.", lead: "Schildern Sie uns kurz Ihr Vorhaben. Die zuständige Bauleitung meldet sich persönlich bei Ihnen.", slim: true })}
<section class="section">
  <div class="wrap split">
    <div style="display:grid;gap:28px;align-content:start">
      <div class="contact-line"><span class="k">Telefon Zentrale</span><a href="tel:${C.phoneIntl}">${C.phone}</a></div>
      <div class="contact-line"><span class="k">E-Mail</span><span class="v">${C.mail}</span></div>
      <div class="contact-line"><span class="k">Bewerbungen</span><span class="v">${C.jobsMail}</span></div>
      <div class="locations" style="grid-template-columns:1fr 1fr">
        ${[C.hq, C.south].map((l) => `<div class="loc"><span class="mono">${l === C.hq ? "Hauptsitz" : "Oberschwaben"}</span><h3>${l.label}</h3><address>${C.name}<br>${l.street}<br>${l.zip} ${l.city}</address><a class="link-arrow" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(`${l.street}, ${l.zip} ${l.city}`)}" rel="noopener">Route planen ${I.arrow}</a></div>`).join("")}
      </div>
    </div>
    <form class="form" data-form data-endpoint="" data-mail="${C.mail}" novalidate>
      <div class="field full"><label for="k-anliegen">Ihr Anliegen</label><select id="k-anliegen" name="anliegen">${["Angebotsanfrage", ...services.map((s) => s.name), "Partnerschaft / Nachunternehmer", "Sonstiges"].map((o) => `<option>${o}</option>`).join("")}</select></div>
      <div class="field"><label for="k-name">Name</label><input id="k-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="k-firma">Firma / Kommune</label><input id="k-firma" name="firma" autocomplete="organization"></div>
      <div class="field"><label for="k-mail">E-Mail</label><input id="k-mail" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="k-tel">Telefon</label><input id="k-tel" name="telefon" type="tel" autocomplete="tel"></div>
      <div class="field full"><label for="k-ort">Bauort</label><input id="k-ort" name="bauort" placeholder="z. B. Göppingen"></div>
      <div class="field full"><label for="k-msg">Ihr Vorhaben</label><textarea id="k-msg" name="nachricht" required></textarea></div>
      <label class="check full"><input id="k-ds" type="checkbox" name="datenschutz" required><span>Ich habe die <a href="datenschutz.html">Datenschutzhinweise</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.</span></label>
      <div class="full btn-row"><button class="btn" type="submit">Anfrage senden ${I.arrow}</button></div>
      <p class="form-note full" data-form-note role="status" hidden></p>
    </form>
  </div>
</section>`,
});

// Impressum
pages["impressum.html"] = page({
  file: "impressum.html",
  title: "Impressum",
  description: "Impressum der HEIM Infrastrukturbau GmbH, Göppingen.",
  body: `${pageHero({ trail: [[null, "Impressum"]], title: "Impressum", slim: true })}
<section class="section"><div class="wrap"><div class="prose">
  <h2>Angaben gemäß § 5 DDG</h2>
  <p>${C.name}<br>${C.hq.street}<br>${C.hq.zip} ${C.hq.city} (Voralb)</p>
  <p><strong>${C.south.label}</strong><br>${C.south.street}<br>${C.south.zip} ${C.south.city}</p>
  <h2>Vertreten durch</h2>
  <p>Geschäftsführer: ${C.ceo.join(", ")}</p>
  <h2>Kontakt</h2>
  <p>Telefon: ${C.phone}<br>E-Mail: ${C.mail}</p>
  <h2>Registereintrag</h2>
  <p>Registergericht: ${C.register.replace(", ", "<br>Registernummer: ")}</p>
  <h2>Umsatzsteuer-ID</h2>
  <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: <span class="todo">DE … bitte ergänzen</span></p>
  <h2>Verantwortlich für den Inhalt</h2>
  <p>${C.ceo[0]}, Anschrift wie oben</p>
  <h2>Verbraucherstreitbeilegung</h2>
  <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
</div></div></section>`,
});

// Datenschutz
pages["datenschutz.html"] = page({
  file: "datenschutz.html",
  title: "Datenschutz",
  description: "Datenschutzhinweise der HEIM Infrastrukturbau GmbH.",
  body: `${pageHero({ trail: [[null, "Datenschutz"]], title: "Datenschutz", lead: "Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.", slim: true })}
<section class="section"><div class="wrap legal">
  <nav aria-label="Inhalt"><a href="#ds-1">1. Verantwortlicher</a><a href="#ds-2">2. Hosting und Server-Logs</a><a href="#ds-3">3. Kontaktanfragen</a><a href="#ds-4">4. Bewerbungen</a><a href="#ds-5">5. Schriften und externe Links</a><a href="#ds-6">6. Ihre Rechte</a></nav>
  <div class="prose">
    <p class="todo">Entwurf. Vor Veröffentlichung durch den Datenschutzbeauftragten bzw. die Rechtsberatung prüfen und mit der bisherigen Datenschutzerklärung abgleichen.</p>
    <h2 id="ds-1">1. Verantwortlicher</h2>
    <p>${C.name}, ${C.hq.street}, ${C.hq.zip} ${C.hq.city}. Telefon ${C.phone}, E-Mail ${C.mail}.</p>
    <h2 id="ds-2">2. Hosting und Server-Logs</h2>
    <p>Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene Seite und Browsertyp. Die Verarbeitung erfolgt zur Sicherstellung eines störungsfreien Betriebs auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. <span class="todo">Hosting-Anbieter und Speicherdauer ergänzen</span></p>
    <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Werkzeuge.</p>
    <h2 id="ds-3">3. Kontaktanfragen</h2>
    <p>Wenn Sie uns über das Kontaktformular oder per E-Mail schreiben, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b und f DSGVO). Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
    <h2 id="ds-4">4. Bewerbungen</h2>
    <p>Bewerbungsunterlagen verarbeiten wir zur Durchführung des Bewerbungsverfahrens (§ 26 BDSG, Art. 6 Abs. 1 lit. b DSGVO). Kommt kein Arbeitsverhältnis zustande, löschen wir Ihre Unterlagen spätestens sechs Monate nach Abschluss des Verfahrens, sofern Sie einer längeren Speicherung nicht zugestimmt haben.</p>
    <h2 id="ds-5">5. Schriften und externe Links</h2>
    <p>Alle Schriftarten werden lokal von unserem Server geladen. Es findet keine Verbindung zu Servern Dritter statt. Links zu sozialen Netzwerken sind einfache Verweise; Daten werden erst übertragen, wenn Sie den Link anklicken.</p>
    <h2 id="ds-6">6. Ihre Rechte</h2>
    <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Zudem können Sie sich bei einer Datenschutzaufsichtsbehörde beschweren, etwa beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit Baden-Württemberg.</p>
  </div>
</div></section>`,
});

// ---------- Write ----------
fs.mkdirSync(outDir, { recursive: true });
for (const [file, html] of Object.entries(pages)) fs.writeFileSync(path.join(outDir, file), html);

if (!PREVIEW) {
  const urls = Object.keys(pages).map((f) => `  <url><loc>${C.baseUrl}${f === "index.html" ? "" : f}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${C.baseUrl}sitemap.xml\n`);
}
if (outDir !== ROOT) fs.cpSync(path.join(ROOT, "assets"), path.join(outDir, "assets"), { recursive: true });

console.log(`${Object.keys(pages).length} Seiten geschrieben nach ${outDir}`);
