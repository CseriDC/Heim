# heim-live.de – Relaunch

Neue Unternehmenswebsite der HEIM Infrastrukturbau GmbH. Statisches HTML ohne Framework,
ohne Cookies, ohne Tracking und ohne externe Server (Schriften sind lokal eingebunden, DSGVO-freundlich).

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `_src/content.mjs` | **Alle Texte**: Firmendaten, Leistungen, Projekte, Historie, Benefits, Stellen, FAQ |
| `_src/build.mjs` | Seitengenerator (Layout, Navigation, Seiten, JSON-LD, Sitemap) |
| `_src/drawings.mjs` | Technische Schemazeichnungen (SVG) als Bildersatz |
| `assets/css/site.css` | Gestaltung (Farben und Schriften als Tokens am Dateianfang) |
| `assets/js/site.js` | Menü, Filter, Stellensuche, Formulare |
| `assets/img/` | Logo als Vektor (`heim-logo.svg`, `heim-logo-white.svg`, `heim-mark.svg`, `heim-wordmark.svg`) |
| `*.html` | Generierte Seiten (nicht von Hand bearbeiten) |

Seiten neu erzeugen:

```bash
cd website
node _src/build.mjs
```

Lokal ansehen: `python3 -m http.server 8000` im Ordner `website/`, dann http://localhost:8000.
Für den Upload den Ordner `website/` ohne `_src/` und `README.md` auf den Webspace kopieren.

## Stellenanzeigen pflegen

Jede Stelle ist ein Eintrag in `jobs` in `_src/content.mjs` (Titel, Bereich, Standort, Rolle, Aufgaben,
Profil, Angebot). Nach `node _src/build.mjs` entstehen automatisch Detailseite, Listeneintrag,
Zähler und strukturierte Daten für Google for Jobs (`JobPosting`). Stelle besetzt: Eintrag löschen, neu bauen.

Bereiche statt „Kaufleute“:
- Baustelle & Gewerbe
- Technik & Bauleitung
- Finanzen, Einkauf & Verwaltung
- Ausbildung & Studium

## Fotos einsetzen

Die Seite funktioniert ohne Fotos (Schemazeichnungen). Sobald Projektfotos vorliegen, einfach als JPG ablegen;
der Generator verwendet sie automatisch statt der Zeichnung:

- `assets/img/projekte/<projekt-slug>.jpg`, z. B. `laermschutz-a8-muehlhausen.jpg`, `schlossplatz-goeppingen.jpg`
- `assets/img/leistungen/<leistungs-slug>.jpg`, z. B. `strassen-und-tiefbau.jpg`, `verkehrslaermschutz.jpg`

Empfehlung: 2400 px Breite, Querformat 3:2, max. 400 KB (WebP/JPG, Qualität ~75).

## Formulare

Kontakt- und Bewerbungsformular senden an die URL im Attribut `data-endpoint` (in `_src/build.mjs`,
Funktion `applicationForm` und Kontaktseite). Ist es leer, wird auf die E-Mail-Adresse verwiesen.
Geeignet sind z. B. ein PHP-Mailer auf dem eigenen Webspace oder ein EU-gehosteter Formulardienst.

## Vor dem Livegang prüfen

Die Inhalte stammen aus der bisherigen Website, öffentlichen Stellenanzeigen und Presseberichten.
Bitte fachlich bestätigen:

- [ ] **Hausnummer Baindt**: Kontaktseite alt „Am Föhrenried 13“, Impressum alt „Am Föhrenried 12“ (aktuell: 13)
- [ ] **Kennzahlen**: 110+ Mitarbeitende (Stand 2023: 112), 40+ Jahre Lärmschutz, Wurzeln 1750, 10+ Generationen
- [ ] **Historie**: Jahreszahlen 1927, 1959, 1995, 2014, 2021 (Niederlassung Süd), 2023 (WIN-Charta)
- [ ] **Inhaber/Geschäftsführung**: Dietmar Heim (Inhaber), Jan-Philip Heim und Tobias Jachmann (Geschäftsführer)
- [ ] **HUS Umwelttechnik + Service**: Bezeichnung und Beziehung (Partner-/Schwesterunternehmen), ggf. Link
- [ ] **Projektdaten**: Zahlen der Referenzen (A8, Kiefersfelden, Bad Urach) und Freigabe der Auftraggebernamen
- [ ] **Stellen**: Welche der 16 Stellen sind aktuell offen? Benefits (Akademie, bAV, Dienstrad, Fitness, Prämien) bestätigen
- [ ] **Impressum**: USt-ID ergänzen, Verantwortlicher nach § 18 MStV
- [ ] **Datenschutz**: Entwurf durch Datenschutzbeauftragten prüfen lassen, Hosting-Anbieter eintragen
- [ ] **Domain**: `baseUrl` in `_src/content.mjs` (Canonical, Sitemap, strukturierte Daten)
