/** 
 * Filnavn: NavLinks.tsx
 * Beskrivelse: Definerer navigasjonslenker og call-to-action lenker som brukes i Header og MobileSidebar-komponentene.
 * Gjør koden mer oversiktlig og enklere å vedlikeholde ved å sentralisere lenkene på ett sted.
 * Utvikler: Martin Pettersen
 */



/* Denne må oppdateres for å fungere alt står nå bare i Header.tsx
 * Vi ønsker å bruke disse pga de er gjenbrukbare komponenter og gjør det mer oversiktlig å lese kode
 * om vi ser i Header.tsx er det veldig langt derfor bruker vi mindre komponenter for å gjøre ting lettere å forstå og utvikle
 * men disse er ikke oppdatert per nå, så de ligger her. Men dette må fikses.
 */



import { MagnifyingGlassCircleIcon, StarIcon, ExclamationTriangleIcon, SunIcon, EnvelopeIcon } from "@heroicons/react/20/solid";

export const navLinks = [
  { name: "Finn bane", description: "Søk etter tilgjengelige baner i nærheten.", href: "#", icon: MagnifyingGlassCircleIcon },
  { name: "Mest populære", description: "De mest populære banene.", href: "#", icon: StarIcon },
  { name: "Rapporter feil på bane", description: "Gi beskjed om ødelagte kurver, manglende skilt eller andre feil.", href: "#", icon: ExclamationTriangleIcon },
];

export const cta = [
  { name: "Vis vær", href: "/weather", icon: SunIcon },
  { name: "Kontakt oss", href: "/kontakt", icon: EnvelopeIcon },
];
