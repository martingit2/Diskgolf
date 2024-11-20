# Data-mappen

## Formål
Denne mappen er ment for å lagre datafiler og statiske ressurser som brukes i prosjektet. Eksempler på hva som kan lagres her inkluderer:

- Testdata for utvikling og debugging.
- Statisk innhold som JSON-filer, CSV-filer eller API-responsmockups.
- Mediafiler som bilder eller video relatert til backend-tjenester.
- Midlertidige filer brukt for dataanalyse eller testing.

---

## Organisering
For å holde mappen ryddig og oversiktlig, anbefales følgende struktur:

```plaintext
data/
├── input/               # Data som brukes som input i applikasjonen
├── output/              # Genererte data fra applikasjonen
├── static/              # Statisk innhold som ikke endres (f.eks. JSON, CSV)
└── README.md            # Dokumentasjon for data-mappen
