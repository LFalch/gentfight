# Telefonboks

Eksamensprojekt til DigiTek

Brawler styret med mobiltelefoner.

## Hvordan virker det?

Serveren kører på Node.js, og det skal derfor være installeret.
Projektet kræver også nogle node-moduler, som skal hentes og installeres i projektet.
Dette kan gøres ved at køre `npm install --save` i repoet eller køre `setup.bat`.

Når modulerne er installeret, kan man starte node-serveren med `node app.js`.
Herfra kan du gå ind på spillet på `https://localhost:3000`.

Telefon-controllerne skal så joine med `https://{ip}:3000/phone`, hvor `{ip}` er serverens IP (eller addresse, hvis en sådan findes).
Dette også inde på skærmen samt en QR-kode, der kan skannes for at gøre tilslutning nemt.

### Struktur

Node-serveren kommunikerer med hovedspillet og telefonerne vha. websockets.
Telefonerne sender data om, hvordan de bevæges til serveren, som den så prøver at tolke til moves.
Hovedspillet modtager så hvilke moves, spillerne har udført fra node-serveren, og viser dette.