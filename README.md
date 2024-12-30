# Discgolf Webapplikasjon - APP-2000

## Prosjektoversikt

Dette er prosjektet til gruppe 11 i emnet **APP-2000** ved **Universitetet i Sørøst-Norge (USN)**, Campus Bø, studieåret **2024/2025**. Prosjektet går ut på å utvikle en **webapplikasjon for discgolf**, med både desktop- og mobilvennlig funksjonalitet.

Applikasjonen er under utvikling og er tilgjengelig på: [https://diskgolf.app](https://diskgolf.app). Vær oppmerksom på at siden ikke er komplett og kan inneholde feil. Denne oppdateres med nytt innhold hver gang vi oppdaterer main branch.

### Gruppemedlemmer
- **Maria Sofie Ulvheim**
- **Martin Andreas Pettersen**
- **Mina Vamnes Nyhagen**
- **Said Hussain Khawajazad**

## Beskrivelse

Applikasjonen vil tilby funksjonalitet som:
- **Søk etter discgolfbaner** med filtrering på sted, vanskelighetsgrad og anmeldelser.
- **Klubb- og banestyring** for discgolfklubber.
- **Poengkort** for spillere som registrerer sine resultater underveis.
- **Brukerkontoer** for å lagre resultater, statistikker og anmeldelser.

## Teknologi og verktøy

**Frontend:**
- [Next.js](https://nextjs.org/) med pages routing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://shadcn.dev/) for UI-komponenter
- [Heroicons](https://heroicons.com/) og [Headless UI](https://headlessui.dev/) for ikoner og tilgjengelige komponenter
- [Axios](https://axios-http.com/) for HTTP-forespørsler
- [Zustand](https://github.com/pmndrs/zustand) for tilstandshåndtering
- [React Hook Form](https://react-hook-form.com/) for skjemaer
- [React Hot Toast](https://react-hot-toast.com/) for varslinger
- [React Spinners (BeatLoader)](https://www.npmjs.com/package/react-spinners) for lasteindikatorer

**Backend:**
- [Supabase](https://supabase.com/) for postgressql databasehåndtering og autentisering
- [Prisma](https://www.prisma.io/) for ORM og databasemanipulasjon
- [NextAuth.js](https://next-auth.js.org/) for autentisering
- [bcrypt](https://www.npmjs.com/package/bcrypt) for passordkryptering
- [Zod](https://zod.dev/) for datavalidering
- [Resend](https://resend.com/) for e-posthåndtering

**Deploy:**
- [Vercel](https://vercel.com/) for hosting av frontend og backend.

---

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
