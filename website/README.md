# heim-live.de – Relaunch 2026

Neue Website und neues Corporate Design der HEIM Infrastrukturbau GmbH. Statisches HTML ohne
Framework, ohne Cookies und ohne Drittanbieter: Schriften, Bilder und Video liegen auf dem eigenen Server.

## Marke

| Element | Festlegung |
| --- | --- |
| Bildmarke | Zwei Pfeiler unter einer 30°-Dachlinie, verbunden durch ein Band (Weiterentwicklung des bisherigen Zeichens) |
| Wortmarke | HEIM in Geist Bold, Deskriptor INFRASTRUKTURBAU in Geist SemiBold, auf Wortbreite gesperrt |
| HEIM-Türkis | `#00A383`, gemessen an Transportern, LKW und Baggern der Flotte (Farbton ca. 167°) |
| Türkis dunkel | `#00785F` für Text und Links auf Weiß (Kontrast ≥ 5:1) |
| Anthrazit | `#1B2422` Schrift und Bildmarke |
| Schrift | Geist (Text und Überschriften), Geist Mono (nur Maße, Daten, Jahreszahlen) |
| Bildsprache | Echte Projektfotos; Aufmacher mit „Dachkante“ (30°-Schnitt oben rechts) |
| Slogan | Mit Liebe ans Werk. |

Alle Logodateien liegen in `assets/brand/` (horizontal, vertikal, Kurzform, Bildmarke, Icon, Favicon;
jeweils farbig, weiß, einfarbig und negativ). Sie werden aus Vektorpfaden erzeugt:

```bash
node website/_src/logo.mjs   # benötigt die Dev-Abhängigkeiten geist und opentype.js (npm install)
```

Die Markenseite `marke.html` dokumentiert Logo, Farben, Schrift und Regeln und bietet die Dateien zum Download.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `_src/content.mjs` | **Alle Texte**: Firmendaten, Leistungen, 25 Projekte, Historie, Leitbild, 18 Stellen, FAQ |
| `_src/build.mjs` | Seitengenerator (Layout, Navigation, 59 Seiten, JSON-LD inkl. JobPosting, Sitemap) |
| `_src/logo.mjs` | Logo-Generator |
| `_src/media.json` | Bildverzeichnis (Pfade und Maße, erzeugt beim Bildimport) |
| `assets/css/site.css` | Gestaltung, Tokens am Dateianfang |
| `assets/js/site.js` | Menü, Video-Steuerung, Filter, Stellensuche, Bildergalerie, Formulare |
| `assets/img/` | Projektfotos (`p/`), Leistungsbilder (`s/`), Unternehmen (`c/`), freigestellte Fahrzeuge (`g/`), jeweils WebP + JPG/PNG |
| `assets/video/` | Baustellenfilm Ursenwang-Nord (1600 px und 960 px, ohne Ton) + Standbild |

Seiten neu erzeugen und lokal ansehen:

```bash
npm run build:website
npm run serve:website   # http://localhost:8000
```

Für den Upload den Ordner `website/` ohne `_src/` und `README.md` auf den Webspace kopieren.

## Pflege

- **Stelle neu oder besetzt:** Eintrag in `jobs` in `_src/content.mjs` anlegen oder löschen, neu bauen.
- **Projekt neu:** Fotos als `assets/img/p/<name>-1.jpg/.webp` usw. ablegen, in `_src/media.json` eintragen, Projekt in `projects` ergänzen.
- **Formulare:** Kontakt- und Bewerbungsformular senden an die URL in `data-endpoint` (in `_src/build.mjs`). Leer = Hinweis auf die E-Mail-Adresse.

## Vor dem Livegang prüfen

Texte und Zahlen stammen von der bisherigen Website (Stand Oktober 2026). Bitte bestätigen:

- [ ] **Bildrechte:** Projektfotos, Video und Porträts sind von heim-live.de übernommen. Fotografen-Credits (z. B. KFC: Tobias Fröhner Photography) und Freigaben prüfen, Personenfotos (Azubis, Familie, Teams) mit Einverständnis
- [ ] **Hausnummer Baindt:** Kontaktseite alt „Am Föhrenried 13“, Impressum alt „12“ (verwendet: 13)
- [ ] **Kennzahlen:** über 110 Mitarbeitende, fast 250 Jahre im Baugewerbe, über 10 Generationen
- [ ] **Geschäftsführung:** Andreas Oder steht im alten Impressum als Geschäftsführer, im Kontakt nicht
- [ ] **Stellen:** 18 Stellen von der alten Seite; Formulierungen der Angebote bei Ausbildung und Studium teils ergänzt
- [ ] **Bewerbungsadresse:** aktuell info@heim-hus.de, ggf. eigene Karriere-Adresse
- [ ] **Datenschutz:** Entwurf prüfen lassen, Hosting-Anbieter eintragen
- [ ] **Reusch-Projekt:** Angaben aus Presseberichten, noch ohne eigene Fotos
