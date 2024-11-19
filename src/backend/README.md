# Backend for APP2000_G11_25

## Beskrivelse
Denne mappen inneholder backend-koden for prosjektet **APP2000_G11_25**. Backenden håndterer serverlogikk, databaseintegrasjon og API-er som brukes av frontend-applikasjonen.

## Teknologistakk
- **Rammeverk:** TBD
- **Database:** TBD
- **Autentisering:** TBD
- **Pakkehåndtering:** npm / yarn.

## Mappestruktur
```plaintext
src/
│
├── models/          # Datamodeller (f.eks. bruker, bane, turnering).
├── routes/          # API-endepunkter (f.eks. banesøk, turneringsdata).
├── controllers/     # Logikk for API-endepunkter.
├── middleware/      # Middleware-funksjoner (f.eks. autentisering, validering).
├── config/          # Konfigurasjonsfiler (f.eks. database, miljøvariabler).
└── server.js        # Hovedfil som starter backend-serveren.
