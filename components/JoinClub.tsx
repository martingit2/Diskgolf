// Fil: /components/JoinClub.tsx
// Formål: Viser en fremhevet seksjon for å oppfordre brukere til å finne og bli med i klubber.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

"use client"; 

import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next'; 
import { Button } from "@/components/ui/button"; 
import { Users } from "lucide-react"; 
import { motion } from "framer-motion"; 

// --- JoinClub Komponent ---
// En enkel Call-to-Action (CTA) komponent for klubbseksjonen.
export default function JoinClub() {
  // Initialiserer router for programmatisk navigasjon.
  const router = useRouter();
  // Henter oversettelsesfunksjon (t) og i18n-instans for språkspesifikk ruting og tekst.
  const { t, i18n } = useTranslation('translation');
  // Henter gjeldende språk for å bygge korrekte URLer.
  const currentLang = i18n.language;

  // Definerer et objekt for å holde oversettelsesnøklene samlet.
  // Dette forbedrer lesbarheten og vedlikeholdbarheten av oversettelser i komponenten.
  const translationKeys = {
    title_part1: 'join_club.title_part1',
    title_highlight: 'join_club.title_highlight',
    title_part2: 'join_club.title_part2',
    description: 'join_club.description',
    cta_button: 'join_club.cta_button'
  };

  return (
    // Container med relativ posisjonering for å tillate absolutt posisjonering av barn-elementer.
    <div className="relative text-center rounded-lg overflow-hidden shadow-2xl">
      {/* Bakgrunnsgradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-inner"></div>

      {/* Innholdscontainer plassert over bakgrunnen med z-index. */}
      <div className="relative z-10 p-8 md:p-12 text-center">
        {/* Hovedtittel */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
          {/* Henter oversatte tekstdeler ved hjelp av t()-funksjonen */}
          {t(translationKeys.title_part1)}{' '}
          <span className="text-green-400">{t(translationKeys.title_highlight)}</span>
          {t(translationKeys.title_part2)}
        </h2>

        {/* Beskrivelse */}
        <p className="text-base md:text-lg mt-4 max-w-2xl mx-auto text-gray-300 drop-shadow-md">
          {t(translationKeys.description)}
        </p>

        {/* CTA Knapp med animert ikon */}
        <Button
          // Navigerer til klubboversiktssiden, prefikset med gjeldende språk.
          onClick={() => router.push(`/${currentLang}/klubber`)}
          // Klasser for styling og interaksjon (gradient, hover-effekt etc.).
          className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-8 md:py-4 md:px-10 rounded-full text-base md:text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto group"
        >
          {/* Ikon wrapper med pulserende animasjon for visuell oppmerksomhet. */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],      // Animerer skala opp og ned.
              opacity: [0.9, 1, 0.9] // Animerer gjennomsiktighet for "pusting".
            }}
            transition={{
              duration: 2,          // Varighet for én animasjonssyklus.
              repeat: Infinity,     // Gjentar animasjonen uendelig.
              ease: "easeInOut"     // Timing-funksjon for myk animasjon.
            }}
            whileHover={{
              scale: 1.2,           // Forsterker skala-effekten ved hover.
              transition: { duration: 0.3 } // Raskere overgang ved hover.
            }}
          >
            <Users className="w-5 h-5 md:w-6 md:h-6" /> {/* Bruker-ikon */}
          </motion.div>
          {/* Henter oversatt knappetekst */}
          {t(translationKeys.cta_button)}
        </Button>
      </div>

      {/* Dekorativ mørk gradient nederst for å forbedre lesbarheten av tekst over eventuelle bilder/bakgrunner under. */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black opacity-50 pointer-events-none"></div>
    </div>
  );
}