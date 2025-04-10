// Fil: components/LanguageSwitcher.tsx
// Formål: Komponent for å la brukeren bytte applikasjonsspråk.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

'use client'; // Komponenten krever klientinteraktivitet (klikk, routing).

// Importerer nødvendige hooks og komponenter.
import { useTranslation } from 'react-i18next'; // Henter i18n instans
import { useParams, usePathname, useRouter } from 'next/navigation'; // For routing og språkinfo.
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // UI-komponent for knappen.
import { languages } from '@/app/lib/i18n/settings'; // Liste over støttede språk.

const flagMap: { [key: string]: { src: string; alt: string } } = {
  no: { src: '/images/Norway-Flag.png', alt: 'Norsk flagg' },
  en: { src: '/images/British-Flag.webp', alt: 'Britisk flagg' },
};

/**
 * LanguageSwitcher-komponenten viser et flagg for å bytte til det andre tilgjengelige språket.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation(); // Henter i18n-instansen.
  const params = useParams(); // Henter URL-parametere (inkl. [lng]).
  const pathname = usePathname(); // Henter gjeldende URL-sti.
  const router = useRouter(); // Next.js router for navigering.

  // Sikrer at nødvendige parametere finnes før rendering.
  if (!params || !pathname || typeof params.lng !== 'string') {
    return null; // Returnerer ingenting hvis språkinformasjon mangler.
  }
  // Henter gjeldende språk fra URL.
  const currentLang = params.lng;

  /**
   * Håndterer klikk på språkbytte-knappen.
   * Kalkulerer ny URL og navigerer brukeren.
   * @param newLang Språkkoden ('no' eller 'en') det skal byttes til.
   */
  const handleChangeLanguage = (newLang: string) => {
    // Gjør ingenting hvis bruker klikker på det språket som allerede er aktivt.
    if (currentLang === newLang) return;

    // Fjerner gjeldende språkprefiks fra stien for å bygge den nye URLen korrekt.
    const pathnameWithoutLocale = pathname.startsWith(`/${currentLang}/`)
        ? pathname.substring(`/${currentLang}`.length)
        : (pathname === `/${currentLang}` ? '/' : pathname); // Håndterer rot-URL.

    // Konstruerer den fullstendige nye URLen med det nye språket.
    const newUrl = `/${newLang}${pathnameWithoutLocale || '/'}`; // Sørger for '/' på rot.

    // Navigerer til den nye URLen for å laste siden med det valgte språket.
    router.push(newUrl);

   
  };

  // Finner det *andre* språket som ikke er det gjeldende.
  const otherLang = languages.find(lang => lang !== currentLang);

  // Returnerer ingenting hvis det ikke finnes et annet språk eller flaggdata mangler.
  if (!otherLang || !flagMap[otherLang]) return null;

  // Henter informasjon (bilde-sti, alt-tekst) for det andre språkets flagg.
  const otherFlagInfo = flagMap[otherLang];

  const ariaLabelText = `Bytt til ${otherLang === 'en' ? 'Engelsk' : 'Norsk'}`;

  // Renderer knappen med flagg-bildet.
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleChangeLanguage(otherLang)} // Kaller funksjonen ved klikk.
        aria-label={ariaLabelText} // Tilgjengelighetstekst for skjermlesere.
        className="p-1 rounded-full hover:bg-white/10" // Styling.
      >
        <Image
          src={otherFlagInfo.src} // Sti til flagg-bildet.
          alt={otherFlagInfo.alt} // Alt-tekst for bildet (bør oversettes).
          width={24}
          height={24}
          className="rounded-full" // Styling for bildet.
        />
      </Button>
    </div>
  );
}