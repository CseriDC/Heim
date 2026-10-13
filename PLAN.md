# Heim – Zeiterfassung & Baustellenmanagement (160 Mitarbeiter)

Clean-Room-Entwicklung: Anforderungen stammen aus öffentlichen Funktionsbeschreibungen
gängiger Bau-Zeiterfassungen, den Workflows des Betriebs und dem Arbeitszeitgesetz.
Keine Analyse, Dekompilierung oder Übernahme von Code/Assets fremder Software.

## Ziele
- Einfaches Onboarding (bekannte Schwäche am Markt: komplexe Ersteinrichtung)
- Robuste Offline-Synchronisation (bekannte Schwäche: Sync-Probleme)
- Schlanke Bedienung für Poliere und Bauleiter

## Architektur
- Client: React + TypeScript als PWA (iOS/Android/Web), IndexedDB-Offline-Queue
- Backend: Node.js (TypeScript), REST + idempotente Sync-Endpunkte
- DB: PostgreSQL; Audit-Log append-only
- Auth: E-Mail/PIN pro Mitarbeiter, Rollen (Mitarbeiter, Polier, Bauleiter, Büro, Admin)
- Hosting: EU-Region (offen: Anbieter)

## Phasen
1. MVP
   - Kommen/Gehen, Pausen, Projektauswahl, Tätigkeit
   - Offline-Queue mit Konfliktlösung (Client-Zeitstempel + Server-Reihenfolge)
   - Stundenzettel-Freigabe durch Bauleiter
   - Admin-Portal: Mitarbeiter, Projekte, Berichte
   - Export CSV/DATEV
2. Baustellendoku: Bautagebuch, Fotos, Formulare, Material-/Geräteerfassung, Urlaub/Abwesenheit
3. Disposition, Fristen, Gerätewartung
4. Optional: Lohn-Schnittstelle, Telematik

## Querschnitt
- DSGVO: GPS nur während der Arbeitszeit, Zweckbindung, Löschkonzept, Abstimmung mit Betriebsrat
- Arbeitszeitgesetz: Höchstarbeitszeit, Ruhepausen, Ruhezeiten, Revisionssicherheit
- Tests: Sync-Szenarien (Funkloch, Doppelbuchung), Rollenrechte

## Offene Fragen
- Hosting-Anbieter (EU)?
- Ziel-Lohnsystem für den Export?
- Welche Funktionen werden heute täglich genutzt?
- Betriebsrat vorhanden?
