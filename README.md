# Discgolf Webapplikasjon - APP-2000

## Prosjektoversikt

Dette er prosjektet til gruppe 11 i emnet **APP-2000** ved **Universitetet i Sørøst-Norge (USN)**, Campus Bø, studieåret **2024/2025**. Prosjektet går ut på å utvikle en **webapplikasjon for discgolf**, med både desktop- og mobilvennlig funksjonalitet.

Applikasjonen er under utvikling og er tilgjengelig på: [https://diskgolf.app](https://diskgolf.app). Vær oppmerksom på at siden ikke er komplett og kan inneholde feil. Denne oppdateres med nytt innhold hver gang vi oppdaterer main branch.

### Gruppemedlemmer
- **Maria Sofie Ulvheim**
- **Martin Andreas Pettersen**
- **Mina Vamnes Nyhagen**
- **Said Hussain Khawajazada**

# Teknologistakk

## Frontend
- [**Next.js**](https://nextjs.org): Hybrid routing-struktur og server-side rendering.
- [**Tailwind CSS**](https://tailwindcss.com): For moderne, responsiv styling.
- [**shadcn/ui**](https://ui.shadcn.com): UI-komponentbibliotek for rask utvikling.
- [**Headless UI**](https://headlessui.dev): Tilgjengelige komponenter for modalvinduer, menyer, osv.
- [**Heroicons**](https://heroicons.com): Vektorikoner for bruk i design.
- [**Lucide React**](https://lucide.dev): Moderne ikoner for UI.
- [**React Hook Form**](https://react-hook-form.com): For håndtering av skjemaer.
- [**React Hot Toast**](https://react-hot-toast.com): For varslinger.
- [**Zustand**](https://github.com/pmndrs/zustand): For enklere tilstandshåndtering.
- [**React-Leaflet**](https://react-leaflet.js.org): Kartintegrasjon for interaktive kart.
- [**Swiper**](https://swiperjs.com): For karuseller og dynamiske bildeseksjoner.
- [**React Icons**](https://react-icons.github.io/react-icons): For tilgang til populære ikonpakker.
- [**Axios**](https://axios-http.com): For håndtering av HTTP-forespørsler.

## Backend
- [**Express**](https://expressjs.com): Brukes som backend-server for å håndtere spill og logikk, samt for WebSocket-tilkoblinger.
- [**WebSockets (ws)**](https://www.npmjs.com/package/ws): Brukes til sanntids kommunikasjon for spillet, inkludert poengoppdatering og turbytte.
- [**Supabase**](https://supabase.io): PostgreSQL database og autentisering.
- [**Prisma**](https://www.prisma.io): ORM (Object-Relational Mapper) for databasen.
- [**NextAuth.js**](https://next-auth.js.org): For brukerautentisering og håndtering av OAuth.
- [**Zod**](https://zod.dev): For streng datavalidering.
- [**bcrypt.js**](https://github.com/dcodeIO/bcrypt.js): For hashing og sikker håndtering av passord.
- [**Resend**](https://resend.com): For e-posthåndtering og utsendelse.

## Utviklingsverktøy
- [**ESLint**](https://eslint.org): For kodekvalitet og konsistens.
- [**TypeScript**](https://www.typescriptlang.org): For statisk typet JavaScript.
- [**Tailwind CSS Animate**](https://tailwindcss-animate.dev): For animasjoner i UI.
- [**PostCSS**](https://postcss.org): For CSS-transformasjoner.
- [**Webpack**](https://webpack.js.org): For pakkebygger og optimalisering.
- [**Sonner**](https://sonner.dev): For varslinger i frontend.
- [**Class Variance Authority**](https://cva.style): For dynamisk kombinasjon av CSS-klasser.

## Deploy
- [**Heroku**](https://heroku.com): Hosting for både frontend og backend.


---

## Arkitektur

Applikasjonen benytter en hybrid løsning med både Server Actions, API-ruter, og WebSockets:

- **Express** serverer statiske filer og håndterer WebSocket-tilkoblinger for sanntidsspillet.
- **WebSockets (ws)** brukes til sanntidskommunikasjon mellom serveren og spillerne, som gjør det mulig å oppdatere spillstatus, poeng og turer uten å laste siden på nytt.
- **Server Actions**: Brukes for å håndtere intern logikk uten å gjøre unødvendige nettverkskall, som å slette brukere eller opprette vurderinger.
- **API-ruter**: Gir eksterne applikasjoner tilgang til spesifik data, for eksempel gjennom RESTful API-ruter i `/pages/api`.

I tillegg til standard REST API, bruker vi **WebSockets** for sanntidskommunikasjon, som muliggjør live oppdateringer og sanntidsinteraksjon mellom frontend og backend. Dette er spesielt nyttig for funksjoner som live resultater, poengsummer og kartinteraksjon.

### Eksempler på bruk

- **Server Actions**:
  - **Slette bruker**: Kalles direkte fra frontend via `actions/delete.ts`.
  - **Opprett vurdering**: Kalles fra frontend uten nettverksforespørsel.
  
- **API-ruter**:
  - **Hent baner**: RESTful endepunkt `/api/courses` gir eksterne klienter tilgang til informasjon om discgolfbaner.

- **WebSockets**:
  - **Live poengoppdatering**: Bruker WebSockets for å sende og motta oppdateringer om poengsummer i sanntid, turbytte og andre hendelser i spillet.


---


## Kom i gang

### Krav
1. Node.js (versjon >= 16)
2. npm (versjon >= 7) eller yarn

### Installasjon
1. Klon prosjektet fra GitHub:
```
git clone https://github.com/App-2000-G11/APP2000_G11_25.git

cd APP2000_G11_25

```
3. Installer avhengigheter
```
npm install
```
3. Kjør prosjektet lokalt
```
npm run dev
```


## Viktige Datoer

- **06.09.2024**: Oppstart og gruppeetablering
- **31.10.2024**: Innlevering av arbeidskrav 1
- **30.11.2024**: Innlevering av arbeidskrav 2
- **31.01.2025**: Innlevering av arbeidskrav 3
- **25.04.2025**: Endelig innlevering av applikasjon og rapport

## Filstruktur
```plaintext
APP2000_G11_25/
├── docs/                            # Dokumentasjon og ressurser
│   ├── Project_WBS_Plan.docx        # Prosjektplan og WBS-diagram
│   └── Figma/                       # Figma-design og prototyper
├── app/                             # Kildekode
│   ├── (protected)                  # deler av Frontend-kode
│   └── actions/                     # deler av Backend-kode
|   └── Components/                  # Komponenter
├── data/                            # Data og statiske ressurser
├── README.md                        # Prosjektdokumentasjon
```

## Bildeattribusjoner

| Bilde  | Fotograf           | Kilde     |
|--------|-------------------|-----------|
| Štefan Štefančík | [Unsplash](https://unsplash.com/@cikstefan) | [Unsplash](https://unsplash.com/photos/smiling-woman-wearing-white-and-black-pinstriped-collared-top-QXevDflbl8A) |
| Ayo Ogunseinde  | [Unsplash](https://unsplash.com/@armedshutter) | [Unsplash](https://unsplash.com/photos/woman-looking-sideways-leaning-on-white-wall-6W4F62sN_yI) |
| Almos Bechtold  | [Unsplash](https://unsplash.com/@almosbech) | [Unsplash](https://unsplash.com/photos/shallow-focus-photo-of-woman-face-3402kvtHhOo) |
| Vince Fleming   | [Unsplash](https://unsplash.com/@vincefleming) | [Unsplash](https://unsplash.com/photos/person-wearing-blue-top-smiling-j3lf-Jn6deo) |
| Irene Strong    | [Unsplash](https://unsplash.com/@leirenestrong) | [Unsplash](https://unsplash.com/photos/mens-gray-crew-neck-shirt-v2aKnjMbP_k) |
| Albert Dera     | [Unsplash](https://unsplash.com/@albertdera) | [Unsplash](https://unsplash.com/photos/mans-grey-and-black-shirt-ILip77SbmOE) |
>
