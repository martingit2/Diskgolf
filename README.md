# DiskGolf.app - Fullstack Webapplikasjon (APP-2000)

## Prosjektoversikt

Dette er prosjektet til gruppe 11 i emnet **APP-2000 Programvareutvikling i Team** ved **Universitetet i Sørøst-Norge (USN)**, Campus Bø, studieåret **2024/2025**. Prosjektet går ut på å utvikle en omfattende **webapplikasjon for discgolf**, med fokus på funksjonalitet for både individuelle spillere og organiserte klubber. Løsningen er designet for å være responsiv og brukervennlig på tvers av enheter (desktop, mobil).

Applikasjonen er deployet og tilgjengelig på: [https://diskgolf.app](https://diskgolf.app). Vær oppmerksom på at siden er et resultat av et studentprosjekt og kan inneholde uferdige deler eller feil. Den reflekterer status ved prosjektinnlevering.

### Gruppemedlemmer
- **Maria Sofie Ulvheim** 
- **Martin Andreas Pettersen** 
- **Mina Vamnes Nyhagen** 
- **Said Hussain Khawajazada** 

---

# Teknologistakk

## Kjerneplattform
- [**Next.js 15**](https://nextjs.org/): Et React-rammeverk for fullstack-applikasjoner. Bruker **App Router** for routing, Server Components, Client Components, Server Actions og API Routes.
- [**React 19**](https://react.dev/): Bibliotek for å bygge brukergrensesnitt med en komponentbasert arkitektur.
- [**Node.js**](https://nodejs.org/): JavaScript runtime-miljø som Next.js kjører på server-siden.
- [**TypeScript**](https://www.typescriptlang.org/): For statisk typing, økt kodekvalitet og bedre utvikleropplevelse.

## Frontend
- [**Tailwind CSS**](https://tailwindcss.com/): Utility-first CSS-rammeverk for rask og moderne styling.
- [**shadcn/ui**](https://ui.shadcn.com/): Samling av vakkert designede, tilpassbare UI-komponenter bygget med Radix UI og Tailwind CSS. Inkluderer bl.a. `Card`, `Button`, `Dialog`, `Input`, `Select`, `Accordion`.
- [**Headless UI**](https://headlessui.dev/): Leverer utilgjengelige, ukontrollerte UI-komponenter som `Popover` og `Disclosure`, brukt i navigasjon.
- [**Lucide React**](https://lucide.dev/), [**Heroicons**](https://heroicons.com/) & [**React Icons**](https://react-icons.github.io/react-icons/): Ikonbiblioteker for UI-elementer.
- [**React Hook Form**](https://react-hook-form.com/) & [**Zod**](https://zod.dev/): For robust skjemahåndtering og datavalidering på klientsiden (og serversiden med Zod).
- [**Zustand**](https://github.com/pmndrs/zustand): Lettvektig bibliotek for global state management (f.eks. for modaler, favoritter, karuselldata).
- [**React Leaflet**](https://react-leaflet.js.org/) & [**Leaflet**](https://leafletjs.com/): For interaktive kartvisninger av baner og hull. Bruker også `leaflet.awesome-markers`.
- [**Swiper**](https://swiperjs.com/): For karuseller (fremhevede turneringer, baner, anmeldelser).
- [**Recharts**](https://recharts.org/): Bibliotek for å lage diagrammer og visualisere statistikk.
- [**i18next**](https://www.i18next.com/) & [**react-i18next**](https://react.i18next.com/): For internasjonalisering (flerspråklighet - norsk og engelsk).
- [**Axios**](https://axios-http.com/): Promise-basert HTTP-klient for API-kall fra klienten.
- [**Framer Motion**](https://www.framer.com/motion/): For animasjoner og overganger i UI.
- [**Tiptap**](https://tiptap.dev/): Headless rich-text editor for nyhetsartikler.
- [**Sonner**](https://sonner.emilkowal.ski/) & [**React Hot Toast**](https://react-hot-toast.com/): For å vise varslinger (toast-meldinger) til brukeren.

## Backend & Database
- [**Supabase**](https://supabase.io/): Tilbyr en hostet **PostgreSQL**-database som vår primære datakilde.
- [**Prisma**](https://www.prisma.io/): Next-generation ORM (Object-Relational Mapper) for TypeScript og Node.js. Brukes for all databaseinteraksjon, definisjon av datamodell (`schema.prisma`), og migreringer.
- [**NextAuth.js (v4)**](https://next-auth.js.org/): Komplett autentiseringsløsning for Next.js. Brukes for brukerregistrering, innlogging (Credentials, Google, GitHub OAuth), sesjonshåndtering (JWT), e-postverifisering, passordtilbakestilling og tofaktorautentisering (2FA). Integrert med Prisma via `@auth/prisma-adapter`.
- [**bcryptjs**](https://www.npmjs.com/package/bcryptjs): For sikker hashing av passord.
- [**Resend**](https://resend.com/): Tjeneste for å sende transaksjonelle e-poster (verifisering, passord-reset, 2FA-koder).
- [**Cloudinary**](https://cloudinary.com/): Skybasert tjeneste for lagring, optimalisering og levering av bilder (profil, nyheter, baner) og PDF-filer (møtereferater). Bruker `next-cloudinary` for frontend-integrasjon.
- [**Stripe**](https://stripe.com/): Betalingsplattform integrert for å håndtere betaling av klubbmedlemskap.

## Utviklingsverktøy & Annet
- [**ESLint**](https://eslint.org/): For statisk kodeanalyse og håndheving av kodestandarder (konfigurert, men satt til `ignoreDuringBuilds`).
- [**Tailwind CSS Animate**](https://tailwindcss-animate.com/): Animasjonsutilities for Tailwind.
- [**Class Variance Authority (cva)**](https://cva.style/docs), [**clsx**](https://github.com/lukeed/clsx) & [**tailwind-merge**](https://github.com/dcastil/tailwind-merge): Verktøy for å bygge gjenbrukbare UI-komponenter med variantbasert styling (brukes ofte av shadcn/ui).
- [**uuid**](https://www.npmjs.com/package/uuid): For generering av unike identifikatorer (f.eks. for tokens).
- [**date-fns**](https://date-fns.org/): For robust håndtering og formatering av datoer.
- [**isomorphic-dompurify**](https://github.com/cure53/DOMPurify#isomorphic-dompurify) & [**jsdom**](https://github.com/jsdom/jsdom): For sikker HTML-sanering (nyhetsinnhold) på server og for å generere utdrag.
- [**Jest**](https://jestjs.io/): Testrammeverk. Brukt for enhetstesting av utvalgte funksjoner.

## Deployment
- [**Heroku**](https://www.heroku.com/): Skyplattform (PaaS) brukt for hosting av Next.js-applikasjonen. PostgreSQL-databasen er hostet via Supabase.

---

## Arkitektur

DiskGolf.app benytter en moderne fullstack-arkitektur bygget på Next.js App Router. Dette innebærer en hybrid tilnærming til server-kommunikasjon, hvor vi utnytter både **Server Actions** og **API Ruter**.

-   **Server Actions (`"use server";`):**
    *   Disse funksjonene kjører kun på serveren og kalles direkte fra klient- eller Server Components, ofte for datamutasjoner (opprette, oppdatere, slette).
    *   Brukes for handlinger som å oppdatere brukerinnstillinger (`actions/settings.ts`), toggle favorittbaner (`actions/toggleFavorite.ts`), håndtere brukerregistrering og innlogging (`actions/register.ts`, `actions/login.ts`), og slette brukere/data (`actions/deleteUserByAdmin.ts`).
    *   Fordelen er enklere integrasjon med Reacts dataflyt (f.eks. `useTransition`) og ofte mindre boilerplate-kode enn tradisjonelle API-kall for mutasjoner.

-   **API Ruter (`app/api/.../route.ts`):**
    *   Tradisjonelle HTTP-endepunkter som håndterer spesifikke requests (GET, POST, PUT, DELETE, PATCH).
    *   Brukes for:
        *   Datahenting fra klienten (f.eks. `GET /api/courses` for å hente baneliste, `GET /api/tournaments/[id]` for turneringsdetaljer).
        *   Eksterne webhooks (f.eks. `POST /api/webhooks/stripe` for å motta oppdateringer fra Stripe).
        *   Filopplasting (f.eks. `POST /api/upload` for bilder til Cloudinary, `POST /api/clubs/[id]/meetings` for PDF-referater).
        *   Polling-endepunkter for "live"-oppdateringer (f.eks. i spill-lobby eller turnerings-leaderboard).
    *   Gir en standardisert RESTful tilnærming og er nødvendig for visse operasjoner som ikke passer like godt for Server Actions.

### Arkitektoniske Komponenter:

*   **Frontend (Client-Side):** Bygget med React-komponenter (mange `"use client"`), bruker hooks for state og interaktivitet. Henter data via API-kall (Axios/Fetch) eller kaller Server Actions.
*   **Backend (Server-Side):** Logikk i Next.js API Ruter og Server Actions. Bruker Prisma for databaseinteraksjon mot PostgreSQL (Supabase). Håndterer autentisering (NextAuth.js), autorisasjon, og integrasjoner med tredjepartstjenester.
*   **Database (PostgreSQL via Supabase):** Sentral datalagring for all applikasjonsdata (brukere, baner, klubber, scores, etc.), definert og administrert med Prisma.
*   **State Management (Zustand):** Brukes på klientsiden for global state (f.eks. modal-status, favorittlister, karuselldata) for å unngå prop drilling og sentralisere data som brukes på tvers av komponenter.
*   **Internasjonalisering (i18next):** Gjennomgående bruk for å støtte norsk og engelsk, med språkvalg basert på URL (`[lng]`) og `middleware.ts`.

### Eksempler på Bruk i Prosjektet:

-   **Server Actions Eksempel:**
    *   Når en bruker oppdaterer sine innstillinger i profilen (`app/(protected)/settings/page.tsx`), sendes skjemaet til `settings`-actionen (`app/actions/settings.ts`). Denne actionen validerer data (Zod), sjekker autentisering, hasher eventuelt nytt passord, og oppdaterer brukeren i databasen via Prisma.
-   **API Rute Eksempel:**
    *   Når `BaneoversiktPage.tsx` laster, sender den en `GET`-forespørsel til `/api/courses`. API-ruten `app/api/courses/route.ts` henter da alle baner fra databasen (via Prisma), beregner gjennomsnittlig rating og total distanse, og returnerer en liste med baner som JSON.

---

## Kom i Gang

### Krav
1.  Node.js (versjon >= 23.x anbefalt, se `package.json` for `engines`)
2.  npm (versjon >= 10.x anbefalt)
3.  En Supabase-konto med en PostgreSQL-database konfigurert.
4.  Nødvendige API-nøkler (Resend, Cloudinary, Stripe, Google/GitHub OAuth) satt som miljøvariabler (se `.env.example`).

### Installasjon
1.  Klon prosjektet fra GitHub:
    ```bash
    git clone https://github.com/App-2000-G11/APP2000_G11_25.git
    cd APP2000_G11_25
    ```
2.  Installer avhengigheter:
    ```bash
    npm install
    ```
3.  Sett opp databasen med Prisma:
    ```bash
    npx prisma migrate dev --name init 
    # Eller 'npx prisma db push' hvis du ikke bruker migreringer strengt
    ```
4.  Generer Prisma Client:
    ```bash
    npx prisma generate
    ```
5.  Kjør utviklingsserveren:
    ```bash
    npm run dev
    ```
    Applikasjonen vil være tilgjengelig på `http://localhost:3000`.

---

## Viktige Datoer

-   **06.09.2024**: Oppstart og gruppeetablering
-   **31.10.2024**: Innlevering av arbeidskrav 1
-   **30.11.2024**: Innlevering av arbeidskrav 2
-   **31.01.2025**: Innlevering av arbeidskrav 3
-   **25.04.2025**: Endelig innlevering av applikasjon og rapport

---

## Forenklet Mappestruktur (Next.js App Router)

```plaintext
APP2000_G11_25/
├── app/                             # Kildekode for Next.js App Router
│   ├── api/                         # API Ruter (backend)
│   ├── actions/                     # Server Actions (backend)
│   ├── lib/                         # Hjelpefunksjoner, konfig (Prisma, auth, i18n, etc.)
│   ├── components/                  # Gjenbrukbare UI-komponenter
│   │   ├── ui/                      # shadcn/ui komponenter
│   │   ├── auth/                    # Autentiseringsrelaterte komponenter
│   │   ├── spill/                   # Spill-relaterte komponenter
│   │   └── ...
│   ├── hooks/                       # Custom React Hooks
│   ├── stores/                      # Zustand global state stores
│   ├── types/                       # Globale TypeScript-typer
│   ├── [lng]/                       # Dynamisk rute for språk (i18n)
│   │   ├── (protected)/             # Ruter som krever innlogging (via middleware)
│   │   │   ├── settings/page.tsx
│   │   │   └── ...
│   │   ├── (undersider)/            # Offentlige undersider (med egen layout)
│   │   │   ├── baner/page.tsx
│   │   │   ├── turneringer/page.tsx
│   │   │   └── ...
│   │   ├── auth/                    # Autentiseringssider (login, register - fallback)
│   │   ├── layout.tsx               # Rot-layout for hvert språk
│   │   └── page.tsx                 # Forsiden for hvert språk
│   ├── globals.css                  # Globale CSS-stiler
│   └── layout.tsx                   # Hoved rot-layout (hvis ikke i [lng])
├── prisma/
│   ├── schema.prisma                # Definisjon av databasemodellen
│   └── migrations/                  # Database-migreringsfiler
├── public/
│   ├── locales/                     # i18n oversettelsesfiler (JSON)
│   └── images/                      # Statiske bilder (logo, placeholders)
├── data/                            # Data-aksess funksjoner (spesifikke Prisma-kall)
├── schemas/                         # Zod valideringsschemas
├── docs/                            # Dokumentasjon og ressurser (WBS, Figma etc.)
├── README.md                        # Denne filen
├── package.json                     # Prosjektavhengigheter og scripts
├── next.config.js                   # Next.js konfigurasjon
├── middleware.ts                    # Next.js middleware (auth, i18n redirects)
└── ...                              # Andre konfigurasjonsfiler (tsconfig, tailwind.config, etc.)

---

## Bildeattribusjoner

| Beskrivelse                 | Kilde / Fotograf                                      | URL / Merknad                                       |
|-----------------------------|-------------------------------------------------------|-----------------------------------------------------|
| Bilde "Nybegynnerkurs"      | AI-generert (DALL·E via ChatGPT av prosjektgruppen)    | -                                                   |
| Bilde "Lokalt turneringsmiljø"| AI-generert (DALL·E via ChatGPT av prosjektgruppen)    | -                                                   |
| Avatar: Sofie A.            | Random User Generator                                 | `https://randomuser.me/api/portraits/women/44.jpg`  |
| Avatar: Camilla E.          | Random User Generator                                 | `https://randomuser.me/api/portraits/women/62.jpg`  |
| Avatar: Elise M.            | Random User Generator                                 | `https://randomuser.me/api/portraits/women/18.jpg`  |
| Avatar: Thomas R.           | Random User Generator                                 | `https://randomuser.me/api/portraits/men/32.jpg`    |
| Avatar: Jonas H.            | Random User Generator                                 | `https://randomuser.me/api/portraits/men/56.jpg`    |
| Avatar: Markus W.           | Random User Generator                                 | `https://randomuser.me/api/portraits/men/73.jpg`    |

*(Andre bilder brukt på banekort, nyhetsartikler og i karuseller er også generert av prosjektgruppen ved hjelp av DALL·E via ChatGPT, med mindre annet er spesifisert på selve siden.)*