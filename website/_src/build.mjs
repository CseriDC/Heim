// Statischer Seitengenerator für heim-live.de
//   node _src/build.mjs              → schreibt alle Seiten nach website/
//   node _src/build.mjs --out <dir>  → schreibt eine vollständige Kopie (inkl. assets) nach <dir>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as K from "./content.mjs";

const { company: C, services, south, projects, trades, tracks, jobs } = K;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outDir = args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : ROOT;
const media = JSON.parse(fs.readFileSync(path.join(ROOT, "_src/media.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const svcBy = Object.fromEntries(services.map((s) => [s.key, s]));
const projBy = Object.fromEntries(projects.map((p) => [p.slug, p]));
const svcUrl = (s) => `${s.slug}.html`;
const projUrl = (p) => `projekt-${p.slug}.html`;
const jobUrl = (j) => `stelle-${j.slug}.html`;
const pTitle = (p) => (p.place && !p.title.includes(p.place) ? `${p.title} · ${p.place}` : p.title);

// Responsive picture element from the media manifest
function pic(key, i = 0, { alt = "", eager = false, sizes = "100vw" } = {}) {
  const m = media[key] && media[key][i];
  if (!m) return "";
  const fallback = m.alpha ? `${m.src}.png` : `${m.src}.jpg`;
  const webp = m.sm ? `${m.src}-sm.webp ${m.sm}w, ${m.src}.webp ${m.w}w` : `${m.src}.webp`;
  const jpg = m.sm && !m.alpha ? ` srcset="${m.src}-sm.jpg ${m.sm}w, ${m.src}.jpg ${m.w}w"` : "";
  return `<picture><source type="image/webp" srcset="${webp}" sizes="${sizes}"><img src="${fallback}"${jpg} alt="${esc(alt)}" width="${m.w}" height="${m.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}"></picture>`;
}

// ---------- Icons ----------
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  case: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V4h6v3M3 12h18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  pause: '<svg data-icon-pause viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/></svg>',
  play: '<svg data-icon-play viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" hidden><path d="M4 2v12l10-6z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.35h-4v-4.74c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.24-1.82 2.5v4.83h-4v-11Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.96v2.24H7.9v3h2.6V21h3Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
};
const go = `<span class="go" aria-hidden="true">${I.arrow}</span>`;
const check = (items) => `<ul class="check">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const scope = (items) => `<ul class="scope">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

// ---------- Layout ----------
const nav = [["leistungen.html", "Leistungen", "leistungen"], ["projekte.html", "Projekte", "projekte"], ["unternehmen.html", "Unternehmen", "unternehmen"], ["karriere.html", "Karriere", "karriere"], ["kontakt.html", "Kontakt", "kontakt"]];

function header(section) {
  const items = nav.map(([href, label, key]) => {
    const cur = key === section ? ' aria-current="page"' : "";
    if (key !== "leistungen") return `<li><a class="nav-link" href="${href}"${cur}>${label}</a></li>`;
    return `<li class="has-mega"><a class="nav-link" href="${href}"${cur}>${label}${I.chev}</a>
      <div class="mega">${services.map((s) => `<a href="${svcUrl(s)}">${pic(s.media, 0, { sizes: "64px" })}<span><strong>${s.name}</strong><span>${s.nav}</span></span></a>`).join("")}
        <a href="niederlassung-sued.html">${pic(south.media, 0, { sizes: "64px" })}<span><strong>Niederlassung Süd</strong><span>Schlüsselfertig- und Ausbau in Oberschwaben</span></span></a>
        <a class="mega-all" href="leistungen.html"><strong>Alle Leistungen im Überblick</strong><span>Sechs Geschäftsbereiche, ein Partner.</span></a>
      </div></li>`;
  }).join("");
  return `<a class="skip-link" href="#main">Zum Inhalt springen</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="index.html"><img src="assets/brand/heim-logo-horizontal.svg" alt="HEIM Infrastrukturbau, zur Startseite" width="259" height="40"></a>
    <nav class="main-nav" aria-label="Hauptnavigation"><ul>${items}</ul></nav>
    <div class="header-cta"><a class="header-tel" href="tel:${C.phoneIntl}">${C.phone}</a><a class="btn" href="kontakt.html">Projekt anfragen</a></div>
    <button class="burger" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobile-nav" data-burger><span></span><span></span><span></span></button>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile Navigation" hidden>
  <ul>${nav.map(([href, label, key]) => `<li><a href="${href}">${label}</a>${key === "leistungen" ? `<div class="sub">${services.map((s) => `<a href="${svcUrl(s)}">${s.name}</a>`).join("")}<a href="niederlassung-sued.html">Niederlassung Süd</a></div>` : ""}</li>`).join("")}</ul>
  <div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a></div>
  <p>${C.phone} · ${C.mail}</p>
</nav>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="assets/brand/heim-logo-horizontal.svg" alt="HEIM Infrastrukturbau" width="200" height="31" loading="lazy">
        <p class="footer-slogan">${C.slogan}</p>
        <p>Familienunternehmen in über zehn Generationen. Tief-, Straßen- und Netzbau, Schlüsselfertigbau, Hochbau, Lärmschutz und Markierung.</p>
        <div class="socials">
          <a href="${C.social.linkedin}" aria-label="HEIM auf LinkedIn" rel="noopener">${I.linkedin}</a>
          <a href="${C.social.instagram}" aria-label="HEIM auf Instagram" rel="noopener">${I.instagram}</a>
          <a href="${C.social.facebook}" aria-label="HEIM auf Facebook" rel="noopener">${I.facebook}</a>
          <a href="${C.social.youtube}" aria-label="HEIM auf YouTube" rel="noopener">${I.youtube}</a>
        </div>
      </div>
      <div class="footer-col"><h4>Leistungen</h4><ul>${services.map((s) => `<li><a href="${svcUrl(s)}">${s.name}</a></li>`).join("")}<li><a href="niederlassung-sued.html">Niederlassung Süd</a></li></ul></div>
      <div class="footer-col"><h4>Unternehmen</h4><ul>
        <li><a href="unternehmen.html">Über HEIM</a></li><li><a href="unternehmen.html#historie">Historie</a></li><li><a href="unternehmen.html#leitbild">Leitbild</a></li>
        <li><a href="unternehmen.html#hus">HUS Umwelttechnik + Service</a></li><li><a href="projekte.html">Projekte</a></li><li><a href="marke.html">Marke &amp; Presse</a></li></ul></div>
      <div class="footer-col"><h4>Karriere</h4><ul><li><a href="karriere.html#stellen">Offene Stellen</a></li>${Object.entries(tracks).map(([k, t]) => `<li><a href="karriere.html#${k}">${t.name}</a></li>`).join("")}</ul></div>
      <div class="footer-col"><h4>Kontakt</h4><address>${C.name}<br>${C.hq.street}<br>${C.hq.zip} ${C.hq.city}<br><br>${C.phone}<br>${C.mail}</address></div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>${new Date().getFullYear()}</span> ${C.name}</span>
      <ul><li><a href="impressum.html">Impressum</a></li><li><a href="datenschutz.html">Datenschutz</a></li><li><a href="${C.whistleblower}" rel="noopener">Hinweisgebersystem</a></li></ul>
    </div>
  </div>
</footer>`;
}

const orgLd = {
  "@context": "https://schema.org", "@type": "GeneralContractor", name: C.name, url: C.baseUrl, slogan: C.slogan,
  logo: C.baseUrl + "assets/brand/heim-logo-horizontal.svg", image: C.baseUrl + "assets/brand/heim-og.jpg", telephone: C.phoneIntl, email: C.mail,
  address: { "@type": "PostalAddress", streetAddress: C.hq.street, postalCode: C.hq.zip, addressLocality: C.hq.city, addressRegion: C.hq.region, addressCountry: "DE" },
  department: [{ "@type": "GeneralContractor", name: `${C.name}, ${C.south.label}`, address: { "@type": "PostalAddress", streetAddress: C.south.street, postalCode: C.south.zip, addressLocality: C.south.city, addressCountry: "DE" } }],
  sameAs: Object.values(C.social),
};

function page({ file, title, description, section = "", body, ld = [], image = "assets/brand/heim-og.jpg" }) {
  const full = title ? `${title} | HEIM Infrastrukturbau` : "HEIM Infrastrukturbau | Bauunternehmen in Göppingen";
  const canonical = C.baseUrl + (file === "index.html" ? "" : file);
  if (description.length > 158) description = description.slice(0, 155).replace(/\s+\S*$/, "").replace(/[,.:;–-]+$/, "") + " …";
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HEIM Infrastrukturbau">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${C.baseUrl}${image}">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${file === "index.html" ? '<link rel="preload" href="assets/video/heim-baustelle-poster.jpg" as="image" fetchpriority="high">\n' : ""}<link rel="stylesheet" href="assets/css/site.css">
${[orgLd, ...ld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>
<body>
${header(section)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/site.js" defer></script>
</body>
</html>
`;
}

const crumbs = (list) => `<ol class="crumbs" aria-label="Brotkrumen"><li><a href="index.html">Start</a></li>${list.map(([h, l]) => (h ? `<li><a href="${h}">${l}</a></li>` : `<li aria-current="page">${l}</li>`)).join("")}</ol>`;

function phero({ trail, title, lead = "", side = "", mediaKey = null, mediaIdx = 0, alt = "" }) {
  return `<section class="phero">
  <div class="wrap">
    ${crumbs(trail)}
    <div class="phero-grid">
      <h1 class="h-1 rise">${title}</h1>
      <div class="phero-side rise-2">${lead ? `<p class="lead">${lead}</p>` : ""}${side}</div>
    </div>
  </div>
  ${mediaKey ? `<div class="media roof phero-media">${pic(mediaKey, mediaIdx, { alt, eager: true })}</div>` : ""}
</section>`;
}

const cta = (title = "Sprechen wir über Ihr Projekt.", text = "Ob Ausschreibung, Generalunternehmerauftrag oder erste Idee: Wir melden uns persönlich bei Ihnen.") => `<section class="cta">
  <div class="wrap">
    <div><h2 class="h-2">${title}</h2><p>${text}</p></div>
    <div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a><a class="btn btn--line" href="tel:${C.phoneIntl}">${C.phone}</a></div>
  </div>
</section>`;

const pcard = (p) => `<a class="pcard" href="${projUrl(p)}" data-cat="${p.service}">
  <div class="media">${pic(p.media, 0, { alt: pTitle(p), sizes: "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" })}</div>
  <div class="stack" style="gap:8px"><div class="pmeta"><span class="cat">${svcBy[p.service].name}</span>${p.place ? `<span>${p.place}</span>` : ""}${p.status ? `<span>${p.status}</span>` : ""}</div><h3>${p.title}</h3></div>
</a>`;

const tile = (p, cls) => `<a class="tile ${cls}" href="${projUrl(p)}">${pic(p.media, 0, { alt: pTitle(p), sizes: "(max-width: 900px) 100vw, 60vw" })}<div class="tile-text"><small>${svcBy[p.service].name}${p.place ? " · " + p.place : ""}</small><h3>${p.title}</h3></div></a>`;

const svcRow = (s) => `<li class="svc-row"><a href="${svcUrl(s)}"><h3>${s.name}</h3><p>${s.short}</p><div class="svc-thumb">${pic(s.media, 0, { alt: s.name, sizes: "200px" })}</div>${go}</a></li>`;

function lightbox() {
  return `<dialog class="lightbox" data-lightbox aria-label="Bildansicht"><div class="lightbox-inner"><img alt=""><button class="lb-btn lb-close" type="button" data-lb-close aria-label="Schließen">${I.close}</button><button class="lb-btn lb-prev" type="button" data-lb-prev aria-label="Vorheriges Bild">${I.arrow}</button><button class="lb-btn lb-next" type="button" data-lb-next aria-label="Nächstes Bild">${I.arrow}</button><span class="lb-count" data-lb-count></span></div></dialog>`;
}
const gallery = (key, from, altBase) => { const list = media[key].slice(from); return `<div class="gallery">${list.map((m, n) => `<button type="button" class="${list.length % 2 && n === 0 ? "g-12" : "g-6"}" data-shot="${m.src}.jpg">${pic(key, n + from, { alt: `${altBase}, Bild ${n + from + 1}`, sizes: "(max-width: 700px) 100vw, 50vw" })}</button>`).join("")}</div>`; };

const pages = {};

// ---------- Startseite ----------
{
  const jobsBy = (k) => jobs.filter((j) => j.track === k).length;
  pages["index.html"] = page({
    file: "index.html", title: "",
    description: "HEIM Infrastrukturbau aus Göppingen: Tief-, Straßen- und Netzbau, Schlüsselfertigbau, Hochbau & Sanierung, Lärmschutz und Markierung. Familienunternehmen in über zehn Generationen. Mit Liebe ans Werk.",
    body: `
<section class="hero">
  <div class="wrap hero-top">
    <h1 class="h-hero rise">Wir bauen Infrastruktur. <span class="green">Seit Generationen.</span></h1>
    <div class="hero-side rise-2">
      <p class="lead">Straßen, Netze, Lärmschutz und Gebäude aus einer Hand. Von Göppingen und Baindt aus für Kommunen, Versorger, Handel und Gewerbe.</p>
      <div class="btn-row"><a class="btn" href="leistungen.html">Leistungen ansehen ${I.arrow}</a><a class="btn btn--line" href="projekte.html">Projekte</a></div>
      <ul class="trust" aria-label="Qualitätsnachweise"><li>RAL-Gütezeichen 962/2</li><li>Betoninstandsetzung nach SIVV</li><li>Fachbetrieb nach § 19 WHG</li><li>Mitglied der WIN-Charta</li></ul>
    </div>
  </div>
  <div class="hero-film">
    <div class="media roof">
      <video data-film muted loop playsinline preload="metadata" poster="assets/video/heim-baustelle-poster.jpg" aria-label="Baustellenfilm: Erdarbeiten mit HEIM-Bagger und Walze">
        <source src="assets/video/heim-baustelle-960.mp4" type="video/mp4" media="(max-width: 900px)">
        <source src="assets/video/heim-baustelle.mp4" type="video/mp4">
      </video>
      <div class="film-bar"><p><b>Erschließung Ursenwang-Nord</b>Erdbau und Verdichtung mit eigener Gerätefamilie</p><button class="film-toggle" type="button" data-film-toggle aria-label="Film anhalten">${I.pause}${I.play}</button></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap intro">
    <p class="statement">HEIM ist ein Familienunternehmen aus Göppingen. Seit über <b>zehn Generationen</b> betreiben die Familien Heim Bauunternehmen. Heute mit mehr als <b>110 HEIMWERKERN</b>, eigenem Maschinenpark und zwei Standorten.</p>
    <ul class="ledger">
      <li><span>Im Baugewerbe seit</span><b>fast 250 Jahren</b></li>
      <li><span>Geschäftsbereiche</span><b>6</b></li>
      <li><span>Lärmschutz bundesweit</span><b>über 40 Jahre</b></li>
      <li><span>Standorte</span><b>Göppingen · Baindt</b></li>
      <li><span>Zertifiziert</span><b>RAL-GZ 962/2 · SIVV</b></li>
    </ul>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Sechs Geschäftsbereiche. Ein Partner.</h2><p class="lead">Wir verbinden Tiefbau, Netzbau, Hochbau und Lärmschutz zu Leistungen, die ineinandergreifen. Mit eigenen Kolonnen und einem festen Ansprechpartner über die gesamte Bauzeit.</p></div>
    <ul class="svc-index" data-stagger>${services.map(svcRow).join("")}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Projekte, die bleiben.</h2><p class="lead">Vom historischen Stadtplatz bis zur Lärmschutzwand an der A8: ${projects.length} Referenzen aus allen Geschäftsbereichen.</p></div>
    <div class="bento" data-stagger>
      ${tile(projBy["schlossplatz-goeppingen"], "tile--a")}
      ${tile(projBy["laermschutz-a8-muehlhausen"], "tile--b")}
      ${tile(projBy["kfc-goeppingen"], "tile--c")}
      ${tile(projBy["seniorenwohnheim-kisslegg"], "tile--d")}
    </div>
    <div class="btn-row" style="margin-top:40px"><a class="btn btn--line" href="projekte.html">Alle ${projects.length} Projekte ${I.arrow}</a></div>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap heritage">
    <div class="media roof">${pic("c/familie", 0, { alt: "Familie Heim vor dem Firmensitz", sizes: "(max-width: 900px) 100vw, 50vw" })}</div>
    <div class="heritage-text">
      <p class="slogan">Mit Liebe <em>ans Werk.</em></p>
      <p class="lead">Unser Leitbild ist die DNA von HEIM. Es steht für Leidenschaft und Begeisterung als wichtigsten Baustoff, für Wertschätzung im Team und für Verlässlichkeit gegenüber jedem Kunden.</p>
      <p class="muted">Seit Karl Heim 1927 seine Lehre im elterlichen Betrieb begann, ist das Unternehmen in Familienhand. Heute führen Jan-Philip Heim, Tobias Jachmann und Andreas Oder die Geschäfte.</p>
      <a class="link" href="unternehmen.html">Unternehmen und Historie ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap fleet">
    <div class="fleet-img">${pic("g/flotte", 0, { alt: "Die HEIM-Flotte: Transporter und LKW in HEIM-Türkis", sizes: "(max-width: 900px) 100vw, 60vw" })}</div>
    <div class="stack">
      <h2 class="h-2">Die HEIM-Gerätefamilie.</h2>
      <p class="muted">Unsere Maschinen gehören zur Familie. Wir pflegen sie und kennen sie beim Namen. Darum sind sie einsatzbereit, wenn Ihre Baustelle startet.</p>
      <ul class="fleet-list">${K.fleet.slice(0, 5).map(([n, t, d]) => `<li><b>${n}</b><span>${t}</span><i>${d}</i></li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="section section--mist">
  <div class="wrap career">
    <div class="media roof">${pic("c/azubis", 0, { alt: "HEIM-Fahrzeuge vor dem Firmensitz", sizes: "(max-width: 900px) 100vw, 45vw" })}</div>
    <div class="stack">
      <h2 class="h-1">Werden Sie HEIMWERKER.</h2>
      <p class="lead">Bauen ist vieles, nur nicht langweilig. Wir suchen Menschen, die anpacken, Verantwortung übernehmen und mit uns die Projekte von morgen bauen.</p>
      <ul class="tracks">${Object.entries(tracks).map(([k, t]) => `<li><a href="karriere.html#${k}"><b>${t.name}<span>${t.text}</span></b><span class="count">${jobsBy(k)} ${jobsBy(k) === 1 ? "Stelle" : "Stellen"}</span>${go}</a></li>`).join("")}</ul>
      <div class="btn-row"><a class="btn" href="karriere.html">Alle ${jobs.length} Stellen ${I.arrow}</a></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Zwei Standorte. Kurze Wege.</h2><p class="lead">Die Zentrale in Göppingen-Voralb ist für die Region Stuttgart, das Filstal und die Alb da. Die Niederlassung Süd in Baindt für Oberschwaben, das Allgäu und den Bodensee.</p></div>
    <div class="locs">
      <div class="loc"><div class="media">${pic("c/geraetefamilie", 0, { alt: "HEIM-Gerätefamilie im Einsatz", sizes: "(max-width: 760px) 100vw, 50vw" })}</div><h3>${C.hq.label}</h3><address>${C.name}<br>${C.hq.street}, ${C.hq.zip} ${C.hq.city}</address></div>
      <div class="loc"><div class="media">${pic(south.media, 1, { alt: "Büro der Niederlassung Süd in Baindt", sizes: "(max-width: 760px) 100vw, 50vw" })}</div><h3>${C.south.label}</h3><address>${C.name}<br>${C.south.street}, ${C.south.zip} ${C.south.city}</address></div>
    </div>
    <div class="contact-strip">
      <h2 class="h-2">Ihr Projekt. Unser Angebot.</h2>
      <div class="stack"><div class="kv-row"><div class="kv"><small>Telefon</small><a href="tel:${C.phoneIntl}">${C.phone}</a></div><div class="kv"><small>E-Mail</small><span>${C.mail}</span></div></div><div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a></div></div>
    </div>
  </div>
</section>`,
  });
}

// ---------- Leistungen ----------
pages["leistungen.html"] = page({
  file: "leistungen.html", title: "Leistungen", section: "leistungen",
  description: "Die Geschäftsbereiche der HEIM Infrastrukturbau: Tief- & Straßenbau, Netzbau, Schlüsselfertigbau & GU-Bau, Hochbau & Sanierung, Lärmschutz und Markierungsarbeiten.",
  body: `${phero({ trail: [[null, "Leistungen"]], title: "Infrastruktur aus einer Hand.", lead: "Sechs Geschäftsbereiche, eigene Kolonnen, eigene Geräte und eigene Planung. Dazu die Niederlassung Süd und unser Partnerunternehmen HUS Umwelttechnik + Service.", mediaKey: "c/geraetefamilie", alt: "Die HEIM-Gerätefamilie" })}
<section class="section">
  <div class="wrap">
    <ul class="svc-index" data-stagger>${services.map(svcRow).join("")}
      <li class="svc-row"><a href="niederlassung-sued.html"><h3>Niederlassung Süd</h3><p>Schlüsselfertigbau, Rohbau und Ausbaugewerke für Oberschwaben, das Allgäu und den Bodensee.</p><div class="svc-thumb">${pic(south.media, 0, { alt: "Team der Niederlassung Süd", sizes: "200px" })}</div>${go}</a></li>
      <li class="svc-row"><a href="unternehmen.html#hus"><h3>Baudienstleistungen</h3><p>Sanierung, Service, Winterdienst, Prüfungen und Logistik über HUS Umwelttechnik + Service.</p><div class="svc-thumb">${pic("s/baudienstleistungen", 0, { alt: "Baudienstleistungen", sizes: "200px" })}</div>${go}</a></li>
    </ul>
  </div>
</section>
<section class="section section--mist">
  <div class="wrap split">
    <div class="stack"><h2 class="h-2">Alle Gewerke unter einem Dach.</h2><p class="muted">Ob als Einzelgewerk oder als Total- und Generalunternehmer: Diese Leistungen erbringen wir selbst oder steuern sie für Sie.</p></div>
    <ul class="tags">${Object.values(trades).map((t) => `<li>${t}</li>`).join("")}</ul>
  </div>
</section>
${cta()}`,
});

// ---------- Leistungsseiten ----------
function servicePage(s) {
  const rel = s.projects.map((k) => projBy[k]).filter(Boolean);
  const body = `${phero({ trail: [["leistungen.html", "Leistungen"], [null, s.name]], title: s.title, lead: s.lead, side: `<div class="btn-row"><a class="btn" href="kontakt.html">Projekt anfragen ${I.arrow}</a></div>`, mediaKey: s.media, alt: s.name })}
<section class="section">
  <div class="wrap split--wide split">
    <div class="stack" style="gap:48px">
      <div class="stack" style="gap:16px"><p class="green" style="font-weight:550">${s.name}</p><div class="prose">${s.intro.map((p) => `<p>${p}</p>`).join("")}</div></div>
      ${s.groups ? s.groups.map(([g, items]) => `<div class="stack" style="gap:16px"><h2 class="h-3">${g}</h2>${scope(items)}</div>`).join("") : `<div class="stack" style="gap:16px"><h2 class="h-3">Unser Leistungsbild</h2>${scope(s.scope)}</div>`}
    </div>
    <aside class="stack">
      <div class="panel"><h3>${s.panel.title}</h3>${check(s.panel.items)}</div>
      <div class="panel" style="background:var(--paper);border:1px solid var(--line)"><h3>Ihr Kontakt</h3><div class="kv"><small>Telefon</small><a href="tel:${C.phoneIntl}" style="font-size:1.4rem">${C.phone}</a></div><div class="kv"><small>E-Mail</small><span style="font-size:1.1rem">${C.mail}</span></div></div>
    </aside>
  </div>
</section>
${s.materials ? `<section class="section section--mist"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Ausführung in Beton, Aluminium, Glas oder Holz.</h2><p class="lead">Einseitig oder beidseitig absorbierend, hochabsorbierend oder reflektierend. Material- und Farbkombinationen nach Ihren Vorgaben.</p></div>${gallery(s.media, 1, "Lärmschutzwand von HEIM")}</div></section>${lightbox()}` : ""}
${s.key === "markierung" ? `<section class="section section--mist"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Aus unserer Arbeit</h2></div>${gallery(s.media, 1, "Markierungsarbeiten von HEIM")}</div></section>${lightbox()}` : ""}
${rel.length ? `<section class="section${s.materials ? "" : " section--mist"}"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Referenzen aus diesem Bereich</h2><a class="link" href="projekte.html#${s.key}" style="justify-self:end">Alle Projekte ${I.arrow}</a></div><div class="pgrid" data-stagger>${rel.map(pcard).join("")}</div></div></section>` : ""}
<section class="section section--tight"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Weitere Geschäftsbereiche</h2></div><ul class="svc-index" data-stagger>${services.filter((o) => o !== s).map(svcRow).join("")}</ul></div></section>
${cta()}`;
  return page({ file: svcUrl(s), title: s.name, section: "leistungen", description: `${s.name} von HEIM Infrastrukturbau: ${s.short}`, body, image: `${media[s.media][0].src}.jpg` });
}
services.forEach((s) => { pages[svcUrl(s)] = servicePage(s); });

pages["niederlassung-sued.html"] = page({
  file: "niederlassung-sued.html", title: "Niederlassung Süd Ravensburg-Baindt", section: "leistungen",
  description: south.lead, image: `${media[south.media][0].src}.jpg`,
  body: `${phero({ trail: [["leistungen.html", "Leistungen"], [null, "Niederlassung Süd"]], title: south.title, lead: south.lead, side: `<div class="btn-row"><a class="btn" href="kontakt.html">Kontakt aufnehmen ${I.arrow}</a></div>`, mediaKey: south.media, alt: "Das Team der Niederlassung Süd" })}
<section class="section"><div class="wrap split--wide split">
  <div class="stack" style="gap:16px"><h2 class="h-2">Unsere Leistungen aus einer Hand</h2>${scope(south.scope)}</div>
  <aside class="panel"><h3>Niederlassung Süd</h3><address style="font-style:normal">${C.name}<br>${C.south.street}<br>${C.south.zip} ${C.south.city}</address><div class="kv"><small>Telefon</small><a href="tel:${C.phoneIntl}" style="font-size:1.4rem">${C.phone}</a></div><p class="muted" style="font-size:var(--fs-s)">Seit 2021 vor Ort, seit 2022 im eigenen Büro in Baindt.</p></aside>
</div></section>
<section class="section section--mist"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Projekte der Niederlassung Süd</h2></div><div class="pgrid" data-stagger>${south.projects.map((k) => pcard(projBy[k])).join("")}</div></div></section>
${cta()}`,
});

// ---------- Projekte ----------
pages["projekte.html"] = page({
  file: "projekte.html", title: "Projekte", section: "projekte",
  description: "Referenzprojekte der HEIM Infrastrukturbau: Schlossplatz Göppingen, Lärmschutzwände an A8 und A81, Glasfaser Harthausen, schlüsselfertige Restaurants, Märkte und Wohnbauten.",
  body: `${phero({ trail: [[null, "Projekte"]], title: "Unsere Projekte können sich sehen lassen.", lead: `${projects.length} Referenzen aus Tief- und Straßenbau, Netzbau, Schlüsselfertigbau, Hochbau und Lärmschutz.` })}
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="chips" role="group" aria-label="Projekte nach Geschäftsbereich filtern" data-filter-group="#plist" data-empty="#pempty">
      <button class="chip" type="button" data-filter="alle" aria-pressed="true">Alle<span class="c">${projects.length}</span></button>
      ${services.filter((s) => projects.some((p) => p.service === s.key)).map((s) => `<button class="chip" type="button" data-filter="${s.key}" aria-pressed="false">${s.name}<span class="c">${projects.filter((p) => p.service === s.key).length}</span></button>`).join("")}
    </div>
    <div class="pgrid" id="plist" data-stagger>${projects.map(pcard).join("")}</div>
    <p class="empty" id="pempty" hidden>Keine Projekte in dieser Auswahl.</p>
  </div>
</section>
${cta("Ihr Projekt als nächste Referenz.", "Wir beraten Sie zu Bauweise, Ablauf und Terminen, gerne schon in der Planungsphase.")}`,
});

projects.forEach((p, idx) => {
  const s = svcBy[p.service];
  const prev = projects[(idx - 1 + projects.length) % projects.length], next = projects[(idx + 1) % projects.length];
  const hasGallery = !p.noGallery && media[p.media].length > 1;
  pages[projUrl(p)] = page({
    file: projUrl(p), title: pTitle(p), section: "projekte", image: `${media[p.media][0].src}.jpg`,
    description: `${pTitle(p)}: ${p.special}`,
    body: `${phero({ trail: [["projekte.html", "Projekte"], [null, p.title]], title: p.place && !p.title.includes(p.place) ? `${p.title}<br><span class="green">${p.place}</span>` : p.title, lead: `${s.name}${p.year ? ", " + p.year : ""}.`, side: `<ul class="tags">${p.trades.map((t) => `<li>${trades[t]}</li>`).join("")}${p.status ? `<li style="background:var(--green-tint)">${p.status}</li>` : ""}</ul>`, mediaKey: p.media, alt: pTitle(p) })}
<section class="section">
  <div class="wrap split--wide split">
    <div class="stack" style="gap:40px">
      <dl class="facts-row">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="stack" style="gap:16px"><h2 class="h-3">Projektbeschreibung</h2>${check(p.bullets)}</div>
    </div>
    <aside class="stack"><div class="callout"><small>Besonderheit</small><p>${p.special}</p></div><a class="link" href="${svcUrl(s)}">Mehr zu ${s.name} ${I.arrow}</a></aside>
  </div>
</section>
${hasGallery ? `<section class="section section--mist"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Projektgalerie</h2></div>${gallery(p.media, 1, pTitle(p))}</div></section>${lightbox()}` : ""}
<section class="section section--tight"><div class="wrap"><nav class="pager" aria-label="Weitere Projekte"><a href="${projUrl(prev)}"><small>Vorheriges Projekt</small><b>${pTitle(prev)}</b></a><a href="${projUrl(next)}"><small>Nächstes Projekt</small><b>${pTitle(next)}</b></a></nav></div></section>
${cta()}`,
  });
});

// ---------- Unternehmen ----------
pages["unternehmen.html"] = page({
  file: "unternehmen.html", title: "Unternehmen", section: "unternehmen", image: `${media["c/familie"][0].src}.jpg`,
  description: "HEIM Infrastrukturbau: Wir machen Infrastrukturbau seit Generationen. Für Generationen. Historie, Leitbild „Mit Liebe ans Werk“, Geschäftsführung, Zertifizierungen und Engagement.",
  body: `<section class="phero">
  <div class="wrap">
    ${crumbs([[null, "Unternehmen"]])}
    <div class="phero-grid">
      <h1 class="h-1 rise">Wir machen Infrastrukturbau seit Generationen. <span class="green">Für Generationen.</span></h1>
      <div class="phero-side rise-2"><p class="slogan" style="font-size:clamp(2rem,1.2rem + 2.6vw,3.4rem)">Mit Liebe <em>ans Werk.</em></p><p class="lead">Wie ein roter Faden zieht sich die Bindung an das Baugewerbe durch fast 250 Jahre Familiengeschichte bis in die Gegenwart.</p></div>
    </div>
  </div>
  <div class="media roof phero-media">${pic("c/familie", 0, { alt: "Familie Heim vor dem Firmensitz in Göppingen", eager: true })}</div>
</section>
<nav class="subnav" aria-label="Auf dieser Seite"><div class="wrap"><ul>
  <li><a href="#historie">Historie</a></li><li><a href="#leitbild">Leitbild</a></li><li><a href="#leitsaetze">12 Leitsätze</a></li><li><a href="#fuehrung">Geschäftsführung</a></li><li><a href="#hus">HUS Umwelttechnik</a></li><li><a href="#zertifikate">Zertifizierungen</a></li><li><a href="#verantwortung">Verantwortung</a></li>
</ul></div></nav>
<section class="section">
  <div class="wrap intro">
    <p class="statement">Als Familienunternehmen planen und bauen wir Bauwerke für die Anforderungen von morgen. Dabei vertrauen wir auf unseren wichtigsten Baustoff: <b>Leidenschaft und Begeisterung.</b></p>
    <ul class="ledger"><li><span>Familienunternehmen</span><b>über 10 Generationen</b></li><li><span>Meisterbetrieb seit</span><b>1936</b></li><li><span>Firmensitz Voralb seit</span><b>2005</b></li><li><span>Niederlassung Süd seit</span><b>2021</b></li><li><span>Mitarbeitende</span><b>über 110</b></li></ul>
  </div>
</section>
<section class="section section--mist" id="historie">
  <div class="wrap split split--rev">
    <div class="stack"><h2 class="h-1">Historie</h2><p class="muted">Die wichtigsten Stationen seit Anfang des 20. Jahrhunderts.</p></div>
    <ol class="timeline" data-stagger>${K.timeline.map(([y, t]) => `<li><span class="yr">${y}</span><p>${t}</p></li>`).join("")}</ol>
  </div>
</section>
<section class="section" id="leitbild">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="slogan">Mit Liebe <em>ans Werk.</em></h2><p class="lead">Beim HEIM fühlt sich jeder wahrgenommen, ernst genommen und wertgeschätzt. Unser Leitbild gibt uns Orientierung für unser Handeln und Urteilen. Es stützt sich auf die Liebe …</p></div>
    <ul class="pillars" data-stagger>${K.love.map(([a, b]) => `<li><b>… ${a}</b><span>${b}</span></li>`).join("")}</ul>
  </div>
</section>
<section class="section section--mist" id="leitsaetze">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Unsere 12 Leitsätze.</h2><p class="lead">Nur wenn diese Werte sichtbar und verlässlich gelebt werden, ist unser Unternehmen zukunftsfähig. Sie mit Leben zu füllen, ist uns Anspruch und Antrieb zugleich.</p></div>
    <ol class="maxims" data-stagger>${K.maxims.map((m) => `<li><p>${m}</p></li>`).join("")}</ol>
  </div>
</section>
<section class="section" id="fuehrung">
  <div class="wrap split">
    <div class="stack"><h2 class="h-1">Persönlich geführt.</h2><p class="lead">Bei HEIM sprechen Sie mit den Menschen, die entscheiden.</p></div>
    <div class="people" style="grid-template-columns:1fr 1fr;align-self:start">
      <div class="person"><b>Dietmar Heim</b><span>Inhaber</span></div>
      <div class="person"><b>Jan-Philip Heim</b><span>Geschäftsführer, Dipl.-Ing. (FH), MBA</span></div>
      <div class="person"><b>Tobias Jachmann</b><span>Geschäftsführer, Dipl.-Ing. (FH)</span></div>
      <div class="person"><b>Andreas Oder</b><span>Geschäftsführer</span></div>
    </div>
  </div>
</section>
<section class="section section--mist" id="hus">
  <div class="wrap split">
    <div class="stack"><p class="hus">HUS <small>Umwelttechnik + Service</small></p><h2 class="h-2">Baudienstleistungen aus der HEIM-Familie.</h2><p class="muted">Seit 1982 ergänzt die HUS Umwelttechnik + Service GmbH unser Leistungsspektrum. Mit passendem Personal und Maschinenpark ist sie zur Stelle, wenn Sie Unterstützung brauchen.</p></div>
    <ul class="list-plain">${K.husServices.map((x) => `<li>${x}</li>`).join("")}</ul>
  </div>
</section>
<section class="section" id="zertifikate">
  <div class="wrap split">
    <div class="stack"><h2 class="h-1">Zertifizierungen und Mitgliedschaften.</h2><p class="muted">Geprüfte Qualität in Betoninstandsetzung, Kabelleitungstiefbau und Gewässerschutz.</p></div>
    <ul class="list-plain">${K.certificates.map((x) => `<li>${x}</li>`).join("")}</ul>
  </div>
</section>
<section class="section section--mist" id="verantwortung">
  <div class="wrap cols-3">
    <div class="stack"><h2 class="h-3">Nachhaltig wirtschaften</h2><p class="muted">Seit Anfang 2023 sind wir aktives Mitglied der KLIMA WIN und bekennen uns mit weiteren Unternehmen aus Baden-Württemberg zu ökonomischer, ökologischer und sozialer Verantwortung. Wir berichten regelmäßig über unsere Anstrengungen, Treibhausgasemissionen zu senken.</p></div>
    <div class="stack"><h2 class="h-3">Sport in der Region</h2><p class="muted">Wir unterstützen Spitzen- und Amateursport in der Region:</p><ul class="list-plain">${K.sponsoring.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    <div class="stack"><h2 class="h-3">Die Gerätefamilie</h2><p class="muted">Unsere Arbeitsmaschinen gehören zur Familie. Wir hegen und pflegen sie, damit sie volle Power für Ihre Projekte haben.</p><ul class="fleet-list">${K.fleet.map(([n, t, d]) => `<li><b>${n}</b><span>${t}</span><i>${d}</i></li>`).join("")}</ul></div>
  </div>
</section>
${cta("Lernen Sie uns kennen.", "Als Auftraggeber, Partner oder zukünftiger HEIMWERKER: Wir freuen uns auf das Gespräch.")}`,
});

// ---------- Karriere ----------
const jobRow = (j) => `<li data-cat="${j.track}"><a class="jcard" href="${jobUrl(j)}"><span><small>${tracks[j.track].name}</small><strong>${j.title}</strong></span><span class="jcell">${I.pin}${j.location}</span><span class="jcell">${I.clock}${j.type}</span>${go}</a></li>`;

function applicationForm(position, id) {
  return `<form class="form" data-form data-endpoint="" data-mail="${C.jobsMail}" enctype="multipart/form-data" novalidate>
    <input type="hidden" name="position" value="${esc(position)}">
    <div class="field"><label for="${id}-vn">Vorname</label><input id="${id}-vn" name="vorname" autocomplete="given-name" required></div>
    <div class="field"><label for="${id}-nn">Nachname</label><input id="${id}-nn" name="nachname" autocomplete="family-name" required></div>
    <div class="field"><label for="${id}-em">E-Mail</label><input id="${id}-em" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="${id}-tel">Telefon</label><input id="${id}-tel" name="telefon" type="tel" autocomplete="tel"></div>
    <div class="field"><label for="${id}-start">Frühester Eintritt</label><input id="${id}-start" name="eintritt" placeholder="z. B. 01.02.2027"></div>
    <div class="field"><label for="${id}-cv">Lebenslauf (PDF)</label><input id="${id}-cv" name="lebenslauf" type="file" accept=".pdf,.doc,.docx"></div>
    <div class="field full"><label for="${id}-msg">Nachricht (optional)</label><textarea id="${id}-msg" name="nachricht"></textarea></div>
    <label class="consent full"><input id="${id}-ds" type="checkbox" name="datenschutz" required><span>Ich habe die <a href="datenschutz.html">Datenschutzhinweise</a> gelesen und bin mit der Verarbeitung meiner Daten zum Zweck der Bewerbung einverstanden.</span></label>
    <div class="full btn-row"><button class="btn" type="submit">Bewerbung senden ${I.arrow}</button></div>
    <p class="note full" data-form-note role="status" hidden></p>
  </form>`;
}

pages["karriere.html"] = page({
  file: "karriere.html", title: "Karriere", section: "karriere", image: `${media["c/team-sued"][0].src}.jpg`,
  description: `Karriere bei HEIM Infrastrukturbau: ${jobs.length} offene Stellen in Baustelle & Gewerbe, Technik & Bauleitung, Finanzen, Einkauf & Verwaltung sowie Ausbildung & Studium.`,
  body: `${phero({ trail: [[null, "Karriere"]], title: "Werden Sie HEIMWERKER.", lead: "Bauen ist vieles, nur nicht langweilig. Jedes Projekt bringt neue Herausforderungen, und wir suchen ständig Menschen, die sie mit uns angehen.", side: `<div class="btn-row"><a class="btn" href="#stellen">${jobs.length} offene Stellen ${I.arrow}</a><a class="btn btn--line" href="#initiativ">Initiativ bewerben</a></div>`, mediaKey: "c/team-sued", alt: "HEIMWERKER der Niederlassung Süd" })}
<section class="section" id="stellen">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Offene Stellen</h2><p class="lead">In Göppingen und in unserer Niederlassung Süd in Baindt. Ein Lebenslauf genügt für den Anfang.</p></div>
    <div class="jobtools">
      <div class="chips" role="group" aria-label="Stellen nach Bereich filtern" data-filter-group="#jlist" data-search="#job-q" data-empty="#jempty">
        <button class="chip" type="button" data-filter="alle" aria-pressed="true">Alle<span class="c">${jobs.length}</span></button>
        ${Object.entries(tracks).map(([k, t]) => `<button class="chip" type="button" data-filter="${k}" id="${k}" aria-pressed="false">${t.name}<span class="c">${jobs.filter((j) => j.track === k).length}</span></button>`).join("")}
      </div>
      <label class="search"><span class="sr-only">Stellen durchsuchen</span>${I.search}<input id="job-q" type="search" placeholder="Stelle oder Ort suchen" autocomplete="off"></label>
    </div>
    <ul class="jobs" id="jlist">${jobs.map(jobRow).join("")}</ul>
    <p class="empty" id="jempty" hidden>Keine passende Stelle gefunden. Bewerben Sie sich gerne initiativ.</p>
  </div>
</section>
<section class="section section--mist">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Das WIR gewinnt.</h2><p class="lead">Nur mit Wertschätzung ist Begeisterung möglich. Das bieten wir allen HEIMWERKERN.</p></div>
    <div class="benefits" data-stagger>${K.benefitGroups.map(([g, items]) => `<div><h3>${g}</h3><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">Auf ein Wort.</h2><p class="lead">Unsere Auszubildenden über ihren Alltag bei HEIM.</p></div>
    <div class="voices">${K.voices.map((v) => `<figure class="voice">${pic(v.media, 0, { alt: v.name, sizes: "120px" })}<div><blockquote>„${v.quote}“</blockquote><cite><b>${v.name}</b><br>${v.role}</cite></div></figure>`).join("")}</div>
  </div>
</section>
<section class="section section--mist">
  <div class="wrap">
    <div class="head" data-reveal><h2 class="h-1">In vier Schritten zu HEIM.</h2><p class="lead">Unkompliziert und persönlich.</p></div>
    <ol class="steps" data-stagger>
      <li><h3>Bewerben</h3><p>Über das Formular der Stelle oder per E-Mail an ${C.jobsMail}. Ein Anschreiben ist nicht nötig.</p></li>
      <li><h3>Rückmeldung</h3><p>Sie erhalten eine Eingangsbestätigung. Die zuständige Führungskraft sieht sich Ihre Unterlagen persönlich an.</p></li>
      <li><h3>Kennenlernen</h3><p>Im Gespräch in Göppingen oder Baindt, gerne auch direkt auf der Baustelle.</p></li>
      <li><h3>Starten</h3><p>Ihr Mentor begleitet Sie durch die Einarbeitung und die ersten Projekte.</p></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap split"><div class="stack"><h2 class="h-1">Gut zu wissen.</h2></div><div class="faq">${K.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div>
</section>
<section class="section section--mist" id="initiativ">
  <div class="wrap split">
    <div class="stack"><h2 class="h-1">Nicht die passende Stelle dabei?</h2><p class="lead">Erzählen Sie uns, was Sie können und was Sie suchen. Wir melden uns, sobald sich eine passende Aufgabe ergibt.</p></div>
    ${applicationForm("Initiativbewerbung", "ini")}
  </div>
</section>`,
});

jobs.forEach((j) => {
  const loc = j.location.startsWith("Baindt") ? C.south : C.hq;
  const more = jobs.filter((o) => o !== j && o.track === j.track).slice(0, 3);
  const ld = {
    "@context": "https://schema.org", "@type": "JobPosting", title: j.title, datePosted: today,
    description: `<p>${j.role}</p><h3>Aufgaben</h3><ul>${j.tasks.map((t) => `<li>${t}</li>`).join("")}</ul><h3>Profil</h3><ul>${j.profile.map((t) => `<li>${t}</li>`).join("")}</ul><h3>Angebot</h3><ul>${j.offer.map((t) => `<li>${t}</li>`).join("")}</ul>`,
    employmentType: j.track === "nachwuchs" ? (j.type.startsWith("Praktikum") ? "INTERN" : "OTHER") : j.type.includes("Teilzeit") ? ["FULL_TIME", "PART_TIME"] : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: C.name, sameAs: C.baseUrl, logo: C.baseUrl + "assets/brand/heim-logo-horizontal.svg" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: loc.street, postalCode: loc.zip, addressLocality: loc.city, addressRegion: loc.region, addressCountry: "DE" } },
  };
  const du = j.track === "nachwuchs" && !j.slug.startsWith("praktikum");
  pages[jobUrl(j)] = page({
    file: jobUrl(j), title: j.title, section: "karriere", ld: [ld],
    description: `${j.title} bei HEIM Infrastrukturbau in ${j.location}. ${j.role.split(". ")[0]}.`,
    body: `<section class="phero"><div class="wrap">
  ${crumbs([["karriere.html", "Karriere"], ["karriere.html#stellen", "Stellen"], [null, j.title.replace(/ \(m\/w\/d\).*/, "")]])}
  <div class="phero-grid">
    <div class="stack" style="gap:14px"><p class="green" style="font-weight:550">${tracks[j.track].name}</p><h1 class="h-1 rise">${j.title}</h1></div>
    <div class="phero-side rise-2"><ul class="jfacts"><li>${I.pin}${j.location}</li><li>${I.clock}${j.type}</li>${j.track !== "nachwuchs" ? `<li>${I.case}Festanstellung</li>` : ""}</ul><div class="btn-row"><a class="btn" href="#bewerben">Jetzt bewerben ${I.arrow}</a><a class="btn btn--line" href="karriere.html#stellen">Alle Stellen</a></div></div>
  </div>
</div></section>
<section class="section" style="padding-top:clamp(24px,3vw,48px)">
  <div class="wrap jlayout">
    <div class="jmain">
      <div class="jblock"><h2>${du ? "Deine Rolle" : "Ihre Rolle"}</h2><p class="lead" style="color:var(--ink)">${j.role}</p></div>
      <div class="jblock"><h2>${du ? (j.slug.startsWith("duales") ? "Daran wirst du wachsen" : "Das lernst du bei uns") : "Ihre Aufgaben"}</h2>${check(j.tasks)}</div>
      ${j.topics ? `<div class="jblock"><h2>Mögliche Themen</h2>${check(j.topics)}</div>` : ""}
      <div class="jblock"><h2>${du ? "Das bringst du mit" : "Ihr Profil"}</h2>${check(j.profile)}</div>
      <div class="jblock"><h2>${du ? "Darauf kannst du dich freuen" : "Was Sie erwarten dürfen"}</h2>${check(j.offer)}</div>
      <div class="jblock"><h2>Was HEIM allen HEIMWERKERN bietet</h2><ul class="tags">${K.benefitGroups.flatMap(([, i]) => i).map((x) => `<li>${x}</li>`).join("")}</ul></div>
      <div class="jblock"><h2>Über HEIM</h2><p>Als mittelständisches Familienunternehmen in der Region Stuttgart bieten wir vielseitige Aufgaben in allen Bereichen des Bauens. Wir stehen für Verlässlichkeit, Qualität und Innovation, geprägt von unserem Leitbild: Mit Liebe ans Werk.</p><a class="link" href="unternehmen.html">Mehr über uns ${I.arrow}</a></div>
    </div>
    <aside class="jside">
      <div class="sheet"><h3>Eckdaten</h3><dl>
        <div><dt>Bereich</dt><dd>${tracks[j.track].name}</dd></div>
        <div><dt>Arbeitsort</dt><dd>${loc.street}, ${loc.zip} ${loc.city}</dd></div>
        <div><dt>Arbeitszeit</dt><dd>${j.type}</dd></div>
        <div><dt>Kontakt</dt><dd>${C.phone}<br>${C.jobsMail}</dd></div>
      </dl><a class="btn" href="#bewerben">Jetzt bewerben ${I.arrow}</a></div>
    </aside>
  </div>
</section>
<section class="section section--mist" id="bewerben">
  <div class="wrap split">
    <div class="stack"><h2 class="h-1">${du ? "Bewirb dich jetzt." : "Bewerben Sie sich jetzt."}</h2><p class="lead">${du ? "Ein Lebenslauf genügt. Alternativ schickst du deine Unterlagen" : "Ein Lebenslauf genügt. Alternativ senden Sie Ihre Unterlagen"} mit dem Betreff „${esc(j.title)}“ an ${C.jobsMail}.</p></div>
    ${applicationForm(j.title, "bw")}
  </div>
</section>
${more.length ? `<section class="section"><div class="wrap"><div class="head" data-reveal><h2 class="h-2">Ähnliche Stellen</h2></div><ul class="jobs">${more.map(jobRow).join("")}</ul></div></section>` : ""}`,
  });
});

// ---------- Kontakt ----------
pages["kontakt.html"] = page({
  file: "kontakt.html", title: "Kontakt", section: "kontakt",
  description: `Kontakt zur HEIM Infrastrukturbau: Zentrale Göppingen-Voralb und Niederlassung Süd in Baindt. Telefon ${C.phone}, ${C.mail}.`,
  body: `${phero({ trail: [[null, "Kontakt"]], title: "HEIMWERKER freuen sich auf Sie.", lead: "Schildern Sie uns kurz Ihr Vorhaben. Die zuständige Bauleitung meldet sich persönlich bei Ihnen." })}
<section class="section" style="padding-top:0">
  <div class="wrap split">
    <div class="stack" style="gap:36px">
      <div class="kv-row"><div class="kv"><small>Telefon</small><a href="tel:${C.phoneIntl}">${C.phone}</a></div><div class="kv"><small>E-Mail</small><span>${C.mail}</span></div></div>
      <div class="locs">${[[C.hq, "c/geraetefamilie", 0], [C.south, south.media, 1]].map(([l, m, i]) => `<div class="loc"><div class="media">${pic(m, i, { alt: l.label, sizes: "(max-width: 760px) 100vw, 25vw" })}</div><h3 style="font-size:1.3rem">${l.label}</h3><address>${C.name}<br>${l.street}<br>${l.zip} ${l.city}</address><a class="link" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(`${l.street}, ${l.zip} ${l.city}`)}" rel="noopener">Route planen ${I.arrow}</a></div>`).join("")}</div>
    </div>
    <form class="form" data-form data-endpoint="" data-mail="${C.mail}" novalidate>
      <div class="field full"><label for="k-anliegen">Ihr Anliegen</label><select id="k-anliegen" name="anliegen">${["Projektanfrage", ...services.map((s) => s.name), "Niederlassung Süd", "Baudienstleistungen (HUS)", "Partnerschaft / Nachunternehmer", "Sonstiges"].map((o) => `<option>${o}</option>`).join("")}</select></div>
      <div class="field"><label for="k-name">Name</label><input id="k-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="k-firma">Firma oder Kommune</label><input id="k-firma" name="firma" autocomplete="organization"></div>
      <div class="field"><label for="k-mail">E-Mail</label><input id="k-mail" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="k-tel">Telefon</label><input id="k-tel" name="telefon" type="tel" autocomplete="tel"></div>
      <div class="field full"><label for="k-ort">Bauort</label><input id="k-ort" name="bauort" placeholder="z. B. Göppingen"></div>
      <div class="field full"><label for="k-msg">Ihr Vorhaben</label><textarea id="k-msg" name="nachricht" required></textarea></div>
      <label class="consent full"><input id="k-ds" type="checkbox" name="datenschutz" required><span>Ich habe die <a href="datenschutz.html">Datenschutzhinweise</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.</span></label>
      <div class="full btn-row"><button class="btn" type="submit">Anfrage senden ${I.arrow}</button></div>
      <p class="note full" data-form-note role="status" hidden></p>
    </form>
  </div>
</section>`,
});

// ---------- Rechtliches ----------
pages["impressum.html"] = page({
  file: "impressum.html", title: "Impressum", description: "Impressum der HEIM Infrastrukturbau GmbH und der HUS Umwelttechnik + Service GmbH.",
  body: `${phero({ trail: [[null, "Impressum"]], title: "Impressum" })}
<section class="section" style="padding-top:0"><div class="wrap cols-3">
  <div class="prose"><h2>${C.name}</h2><p>${C.hq.street}<br>${C.hq.zip} ${C.hq.city} (${C.hq.district})</p><p><b>${C.south.label}</b><br>${C.south.street}<br>${C.south.zip} ${C.south.city}</p><p>Telefon ${C.phone}<br>E-Mail ${C.mail}</p></div>
  <div class="prose"><h2>Firmendaten</h2><p>Geschäftsführer: ${C.ceo.join("; ")}</p><p>Registergericht: ${C.register.court}, ${C.register.hrb}<br>USt-IdNr.: ${C.register.vat}<br>Sitz in ${C.register.seat}</p><p>Freistellungsbescheinigung gemäß § 48 EStG und gemäß § 13b Abs. 2 Nr. 4 UStG liegt vor.</p><p>Verantwortlich für den Inhalt: die Geschäftsführer Jan-Philip Heim und Tobias Jachmann, Anschrift wie oben.</p></div>
  <div class="prose"><h2>${C.hus.name}</h2><p>${C.hq.street}<br>${C.hq.zip} ${C.hq.city} (${C.hq.district})</p><p>Geschäftsführer: ${C.ceo.join("; ")}</p><p>Registergericht: ${C.register.court}, ${C.hus.hrb}<br>USt-IdNr.: ${C.hus.vat}<br>Sitz in ${C.register.seat}</p><h2>Hinweisgebersystem</h2><p><a href="${C.whistleblower}" rel="noopener">${C.whistleblower.replace("https://", "").replace(/\/$/, "")}</a></p><h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p></div>
</div></section>`,
});

pages["datenschutz.html"] = page({
  file: "datenschutz.html", title: "Datenschutz", description: "Datenschutzhinweise der HEIM Infrastrukturbau GmbH.",
  body: `${phero({ trail: [[null, "Datenschutz"]], title: "Datenschutz", lead: "Informationen zur Verarbeitung personenbezogener Daten auf dieser Website." })}
<section class="section" style="padding-top:0"><div class="wrap"><div class="prose">
  <p class="todo">Entwurf: vor Veröffentlichung durch Datenschutzbeauftragte bzw. Rechtsberatung prüfen und mit der bestehenden Erklärung abgleichen.</p>
  <h2>1. Verantwortlicher</h2><p>${C.name}, ${C.hq.street}, ${C.hq.zip} ${C.hq.city}. Telefon ${C.phone}, E-Mail ${C.mail}.</p>
  <h2>2. Hosting und Server-Logs</h2><p>Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und Browsertyp, um einen sicheren und störungsfreien Betrieb zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). <span class="todo">Hosting-Anbieter und Speicherdauer ergänzen</span></p>
  <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Werkzeuge. Schriften und Videos werden ausschließlich von unserem eigenen Server geladen.</p>
  <h2>3. Kontaktanfragen</h2><p>Wenn Sie uns über das Formular oder per E-Mail schreiben, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b und f DSGVO). Die Daten werden gelöscht, sobald sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
  <h2>4. Bewerbungen</h2><p>Bewerbungsunterlagen verarbeiten wir zur Durchführung des Bewerbungsverfahrens (§ 26 BDSG, Art. 6 Abs. 1 lit. b DSGVO). Kommt kein Arbeitsverhältnis zustande, löschen wir die Unterlagen spätestens sechs Monate nach Abschluss des Verfahrens, sofern Sie einer längeren Speicherung nicht zugestimmt haben.</p>
  <h2>5. Externe Links</h2><p>Links zu LinkedIn, Instagram, Facebook, YouTube und OpenStreetMap sind einfache Verweise. Daten werden erst übertragen, wenn Sie einen Link anklicken.</p>
  <h2>6. Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Zudem können Sie sich beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit Baden-Württemberg beschweren.</p>
</div></div></section>`,
});

// ---------- Marke ----------
const brandFiles = [
  ["heim-logo-horizontal.svg", "Horizontal", "Standard für Website, Briefbogen, Fahrzeuge und Bauschilder.", ""],
  ["heim-logo-vertikal.svg", "Vertikal", "Für hohe Formate, Aufsteller, Bauzaunbanner und Social Media.", ""],
  ["heim-logo-kurz.svg", "Kurzform", "Wenn wenig Platz ist und der Absender klar ist, etwa auf Helmen.", ""],
  ["heim-logo-horizontal-weiss.svg", "Weiß auf Anthrazit", "Für dunkle Flächen und ruhige, dunkle Fotos.", "stage--ink"],
  ["heim-logo-horizontal-negativ.svg", "Negativ auf Türkis", "Für Flächen in HEIM-Türkis, etwa Fahrzeugbeschriftung.", "stage--green"],
  ["heim-logo-horizontal-schwarz.svg", "Einfarbig", "Für Stempel, Gravur und einfarbigen Druck.", "stage--mist"],
  ["heim-bildmarke.svg", "Bildmarke", "Zwei Pfeiler unter der 30°-Dachlinie, verbunden durch das Band.", ""],
  ["heim-icon.svg", "App-Icon", "Für Favicon, App und Profilbilder.", "stage--mist"],
  ["heim-logo-vertikal-weiss.svg", "Vertikal weiß", "Für dunkle Hochformate.", "stage--ink"],
];
pages["marke.html"] = page({
  file: "marke.html", title: "Marke & Presse",
  description: "Das Corporate Design der HEIM Infrastrukturbau: Logo, Farben, Schrift und Bildsprache zum Download.",
  body: `${phero({ trail: [[null, "Marke & Presse"]], title: "Die Marke HEIM.", lead: "Logo, Farben, Schrift und Bildsprache für alle, die mit und über HEIM kommunizieren. Alle Logodateien als Vektorgrafik zum Download." })}
<section class="section" style="padding-top:0"><div class="wrap">
  <div class="anatomy">
    <svg viewBox="0 0 760 300" role="img" aria-label="Aufbau der Bildmarke: zwei Pfeiler, 30-Grad-Dachlinie und das türkise Band">
      <g transform="translate(70 40) scale(1.7)"><path fill="#1b2422" d="M0 57.74L44 32.33V128H0ZM56 25.4L100 0V128H56Z"/><path fill="#00a383" d="M30 90.41L100 50V74L30 114.41Z"/></g>
      <path d="M30 145.9 L280 1.6" stroke="#00785f" stroke-width="1" stroke-dasharray="4 4" fill="none"/>
      <text x="300" y="60" font-family="Geist, sans-serif" font-size="15" font-weight="600" fill="#1b2422">Dachlinie 30°</text><text x="300" y="80" font-family="Geist, sans-serif" font-size="13" fill="#5b6865">Beide Pfeiler teilen eine Dachneigung. Sie steht für das Heim, das wir bauen.</text>
      <text x="300" y="130" font-family="Geist, sans-serif" font-size="15" font-weight="600" fill="#1b2422">Zwei Pfeiler</text><text x="300" y="150" font-family="Geist, sans-serif" font-size="13" fill="#5b6865">Das H aus HEIM, gleich breit, mit einer Fuge von 12 % der Markenbreite.</text>
      <text x="300" y="200" font-family="Geist, sans-serif" font-size="15" font-weight="600" fill="#00785f">Das Band in HEIM-Türkis</text><text x="300" y="220" font-family="Geist, sans-serif" font-size="13" fill="#5b6865">Verbindet die Pfeiler parallel zur Dachlinie. Die Farbe stammt von unserer Flotte.</text>
    </svg>
  </div>
</div></section>
<section class="section section--mist"><div class="wrap">
  <div class="head" data-reveal><h2 class="h-1">Logo</h2><p class="lead">Bildmarke und Wortmarke in Geist. Um das Logo bleibt mindestens die Breite eines Pfeilers frei. Mindestgröße horizontal: 28 mm im Druck, 120 px am Bildschirm.</p></div>
  <div class="logo-grid">${brandFiles.map(([f, n, t, st]) => `<div class="logo-tile"><div class="stage ${st}" style="${st ? "" : "background:#fff"}"><img src="assets/brand/${f}" alt="${n}" loading="lazy"></div><p><b>${n}</b><br>${t}</p><a href="assets/brand/${f}" download>SVG herunterladen</a></div>`).join("")}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="head" data-reveal><h2 class="h-1">Farben</h2><p class="lead">Weiß trägt die Marke. HEIM-Türkis stammt von unseren Fahrzeugen und Maschinen und markiert, was zählt. Anthrazit ist die Farbe der Schrift.</p></div>
  <div class="swatches">
    ${[["HEIM-Türkis", "#00a383", "RGB 0 163 131<br>Marke, Flächen, große Schrift"], ["Türkis dunkel", "#00785f", "RGB 0 120 95<br>Buttons, Text und Links"], ["Anthrazit", "#1b2422", "RGB 27 36 34<br>Schrift, Bildmarke"], ["Nebel", "#f2f5f4", "RGB 242 245 244<br>Flächen, Hintergründe"], ["Weiß", "#ffffff", "RGB 255 255 255<br>Grundfläche"]].map(([n, h, t]) => `<div class="swatch"><i style="background:${h}"></i><b>${n}</b><span>${h.toUpperCase()}<br>${t}</span></div>`).join("")}
  </div>
</div></section>
<section class="section section--mist"><div class="wrap split">
  <div class="stack"><h2 class="h-1">Schrift</h2><p class="lead">Geist ist unsere Hausschrift: klar, technisch präzise und gut lesbar. Geist Mono setzen wir nur für Maße, Daten und Jahreszahlen ein.</p></div>
  <div class="specimen">
    <div><small>Geist 600 · Display</small><span style="font-size:2.6rem;font-weight:600;letter-spacing:-0.045em;line-height:1">Mit Liebe ans Werk.</span></div>
    <div><small>Geist 600 · Überschrift</small><span style="font-size:1.6rem;font-weight:600;letter-spacing:-0.03em">Wir bauen Infrastruktur.</span></div>
    <div><small>Geist 400 · Text</small><span>Straßen, Netze, Lärmschutz und Gebäude aus einer Hand.</span></div>
    <div><small>Geist Mono · Daten</small><span class="num">2,50–3,50 m · 179 Stützen · 8.000 m³</span></div>
  </div>
</div></section>
<section class="section"><div class="wrap split">
  <div class="stack"><h2 class="h-1">Bildsprache</h2><p class="lead">Echte Baustellen, echte HEIMWERKER, echte Maschinen. Fotos zeigen Ergebnisse in klarem Tageslicht. Große Aufmacherbilder tragen oben rechts die Dachkante: einen Schnitt im 30°-Winkel der Bildmarke.</p></div>
  <div class="media roof" style="aspect-ratio:16/10">${pic("p/kfc-goeppingen", 0, { alt: "Beispiel Bildsprache mit Dachkante", sizes: "50vw" })}</div>
</div></section>
<section class="section section--mist"><div class="wrap"><div class="dodont">
  <div><h3>So setzen wir die Marke ein</h3>${check(["Logo auf Weiß oder ruhigen Flächen", "Türkis sparsam, für Marke und Handlungsaufforderungen", "Eigene Fotos statt Stockbilder", "Kurze, konkrete Sätze, Sie-Ansprache, in der Ausbildung per Du"])}</div>
  <div class="dont"><h3>Das vermeiden wir</h3>${check(["Logo verzerren, drehen oder umfärben", "Das alte rote Band neben dem neuen Logo verwenden", "Türkis als großflächige Hintergrundfarbe für Text", "Effekte wie Schatten, Konturen oder Verläufe am Logo"])}</div>
</div></div></section>
${cta("Presseanfragen", "Für Bildmaterial, Projektinformationen und Interviews erreichen Sie uns direkt.")}`,
});

// ---------- Write ----------
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".html")) fs.rmSync(path.join(outDir, f));
for (const [file, html] of Object.entries(pages)) fs.writeFileSync(path.join(outDir, file), html);
const urls = Object.keys(pages).map((f) => `  <url><loc>${C.baseUrl}${f === "index.html" ? "" : f}</loc><lastmod>${today}</lastmod></url>`).join("\n");
fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${C.baseUrl}sitemap.xml\n`);
if (outDir !== ROOT) fs.cpSync(path.join(ROOT, "assets"), path.join(outDir, "assets"), { recursive: true });
console.log(`${Object.keys(pages).length} Seiten geschrieben nach ${outDir}`);
