DoG RaceHub v2.5 – Auth-/Cloud-Stabilisierung

# DoG RaceHub v2.0 – zentrale Cloud-Datenbank

Die bestehende Oberfläche, Navigation und Datenlogik bleiben erhalten. v2.0 ersetzt nur die lokale Bearbeitungsfreigabe durch ein zentrales Supabase-Backend.

## Einmalige Einrichtung
1. In Supabase ein neues Projekt anlegen.
2. `schema.sql` einmal im SQL Editor ausführen.
3. In dieser vorbereiteten Version sind Project URL und Publishable Key bereits in `config.js` eingetragen. **Nicht** den `service_role`/Secret Key verwenden.
4. `config.js`, `app.js`, `index.html` und `sw.js` in GitHub hochladen/committen.
5. RaceHub öffnen. Beim ersten Mal `Bearbeiten` → `Konto anlegen`. Dieses erste Konto wird als alleiniger Admin festgelegt.
6. Alle anderen Besucher können nur ansehen. Auch ein anderes Supabase-Konto erhält keine Bearbeitungsrechte.

## Wichtig
- Die zentrale Datenbank ist die gemeinsame Quelle für Handy und PC.
- Änderungen des Admins werden per Realtime an geöffnete Geräte verteilt.
- Ein lokaler Browser-Cache bleibt als Sicherheitsnetz erhalten.
- Vor dem ersten produktiven Einsatz empfiehlt sich ein Export/Backup der aktuellen Daten.
