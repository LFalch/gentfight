# gentfight

Eksamensprojekt til DigiTek

Brawler styret med mobiltelefoner.

## Hvordan virker det?

For at kunne køre projektet, skal du installere node-modulerne som det kræver.
Dette kan gøres ved at køre `npm install --save` i repoet.

Når modulerne er installeret, kan man starte node-serveren med `node app.js`.
Herfra kan du gå ind på spillet på `http://localhost:3000`.

Telefon-controllerne skal så joine med `http://{ip}:3000/phone`, hvor `{ip}` er serverens IP (eller addresse, hvis en sådan findes).
Denne del kommer til at stå i spillet på et tidspunkt.

### Struktur

Node-serveren kommunikerer med hovedspillet og telefonerne vha. websockets.
Telefonerne sender data om, hvordan de bevæges til serveren, som den så prøver at tolke til moves.
Hovedspillet modtager så hvilke moves, spillerne har udført fra node-serveren, og viser dette.