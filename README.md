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
- **Next.js**: Hybrid routing-struktur og server-side rendering.
- **Tailwind CSS**: For moderne, responsiv styling.
- **shadcn/ui**: UI-komponentbibliotek for rask utvikling.
- **Headless UI**: Tilgjengelige komponenter for modalvinduer, menyer, osv.
- **Heroicons**: Vektorikoner for bruk i design.
- **Lucide React**: Moderne ikoner for UI.
- **React Hook Form**: For håndtering av skjemaer.
- **React Hot Toast**: For varslinger.
- **Zustand**: For enklere tilstandshåndtering.
- **React-Leaflet**: Kartintegrasjon for interaktive kart.
- **Swiper**: For karuseller og dynamiske bildeseksjoner.
- **React Icons**: For tilgang til populære ikonpakker.
- **Axios**: For håndtering av HTTP-forespørsler.

## Backend
- **Supabase**: PostgreSQL database og autentisering.
- **Prisma**: ORM (Object-Relational Mapper) for databasen.
- **NextAuth.js**: For brukerautentisering og håndtering av OAuth.
- **Zod**: For streng datavalidering.
- **bcrypt.js**: For hashing og sikker håndtering av passord.
- **Resend**: For e-posthåndtering og utsendelse.

## Utviklingsverktøy
- **ESLint**: For kodekvalitet og konsistens.
- **TypeScript**: For statisk typet JavaScript.
- **Tailwind CSS Animate**: For animasjoner i UI.
- **PostCSS**: For CSS-transformasjoner.
- **Webpack**: For pakkebygger og optimalisering.
- **Sonner**: For varslinger i frontend.
- **Class Variance Authority**: For dynamisk kombinasjon av CSS-klasser.

## Deploy
- **Vercel**: Hosting for både frontend og backend.

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
