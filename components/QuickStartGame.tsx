/**
 * Filnavn: QuickStartGame.tsx
 * Beskrivelse: Komponent for å starte et hurtigspill/testspill av DiskGolf.
 * Inneholder en CTA-knapp som sender brukeren til spillseksjonen.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet for debugging, oppdatering og kodekvalitet.
 */

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next'; // Hook for oversettelser.
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa"; // Ikon for spillknapp.

export default function QuickStartGame() {
  const router = useRouter();
  // Henter oversettelsesfunksjon og språkinfo.
  const { t, i18n } = useTranslation('translation');
  const currentLang = i18n.language;

  // Nøkler for oversettelser i denne komponenten.
  const translationKeys = {
    title_part1: 'quick_start_game.title_part1',
    title_highlight: 'quick_start_game.title_highlight',
    title_part2: 'quick_start_game.title_part2',
    description: 'quick_start_game.description',
    cta_button: 'quick_start_game.cta_button'
  };

  // Navigerer brukeren til spillseksjonen med korrekt språk.
  // Juster '/spill' til den faktiske ruten om nødvendig.
  const handleStartGame = () => {
    router.push(`/${currentLang}/spill`);
  };

  return (
    <div className="relative text-center rounded-lg overflow-hidden shadow-2xl">
      {/* Bakgrunnsgradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-inner"></div>

      {/* Innhold */}
      <div className="relative z-10 p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
          {t(translationKeys.title_part1)}{' '}
          <span className="text-green-400">{t(translationKeys.title_highlight)}</span>
          {t(translationKeys.title_part2)}
        </h2>
        <p className="text-base md:text-lg mt-4 max-w-2xl mx-auto text-gray-300 drop-shadow-md">
          {t(translationKeys.description)}
        </p>
        <Button
          onClick={handleStartGame}
          className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-8 md:py-4 md:px-10 rounded-full text-base md:text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <FaPlay className="animate-pulse" /> {/* Pulserende ikon for visuell effekt */}
          {t(translationKeys.cta_button)}
        </Button>
      </div>

      {/* Dekorativ gradient nederst */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black opacity-50 pointer-events-none"></div>
    </div>
  );
}