# Discgolf Webapplikasjon - APP-2000

## Prosjektoversikt

Dette er prosjektet til gruppe 11 i emnet **APP-2000** ved **Universitetet i Sørøst-Norge (USN)**, Campus Bø, studieåret **2024/2025**. Prosjektet går ut på å utvikle en **webapplikasjon for discgolf**, med både desktop- og mobilvennlig funksjonalitet.

Applikasjonen er under utvikling og er tilgjengelig på: [https://diskgolf.app](https://diskgolf.app). Vær oppmerksom på at siden ikke er komplett og kan inneholde feil. Denne oppdateres med nytt innhold hver gang vi oppdaterer main branch.

### Gruppemedlemmer
- **Maria Sofie Ulvheim**
- **Martin Andreas Pettersen**
- **Mina Vamnes Nyhagen**
- **Said Hussain Khawajazad**

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
- [**Vercel**](https://vercel.com): Hosting for både frontend og backend.


---

## **Arkitektur**
Vi bruker en **hybrid løsning** for applikasjonen:
- **Server Actions**: Brukes for intern logikk og håndtering av funksjoner som sletting av brukere, oppretting av vurderinger, osv. Dette gir rask og effektiv kommunikasjon mellom frontend og backend uten unødvendige nettverkskall.
- **API-ruter**: Brukes for å eksponere spesifikke data til eksterne klienter (f.eks. mobilapper eller tredjeparts tjenester). Disse håndteres gjennom RESTful API-ruter definert i `/pages/api`.

### **Eksempel**
- **Server Actions**:
  - Slett bruker: Kalles direkte fra frontend via `actions/delete.ts`.
  - Opprett vurdering: Kalles fra frontend uten nettverksforespørsel.
- **API-ruter**:
  - Hent baner: RESTful endepunkt `/api/courses` gir eksterne klienter tilgang til informasjon om discgolfbaner.

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
