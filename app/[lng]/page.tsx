// Fil: app/[lng]/page.tsx (eller tilsvarende sti)
// Formål: Hovedsiden/Landingssiden for DiskGolf-applikasjonen.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

// Importer komponenter
import AppReviews from "@/components/AppReviews";
import JoinClub from "@/components/JoinClub";
import Map from "@/components/Map";
import NyesteBanerCarousel from "@/components/NewestCarosuel";
import BaneCarousel from "@/components/popular-carousel";
import QuickStartGame from "@/components/QuickStartGame";
import ReviewCarousel from "@/components/ReviewCarousel";
import SearchForm from "@/components/SearchForm";
import RotatingText from "@/components/text-rotator";
import TournamentsCarousel from "@/components/TournamentCarousel";

/**
 * Hovedkomponenten for forsiden.
 */
export default function HomePage() {
  const { t } = useTranslation('translation');
  const [showJoinClub, setShowJoinClub] = useState(true);

  // Effekt for å bytte CTA-komponent med intervall.
  useEffect(() => {
    const interval = setInterval(() => {
      setShowJoinClub((prev) => !prev);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero-seksjon */}
      <section className="container mx-auto px-4 pt-6 pb-0 text-center md:text-left">
        {/* Hovedtittel med gradient og padding nederst for å unngå klipping */}
        <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text md:ml-32 pb-2"> {/* Lagt til padding bottom */}
          {t('home.title')}
        </h1>
        {/* Undertittel med roterende tekst */}
        <h2 className="text-white py-5 pb-4 sm:pb-6 text-lg sm:text-xl md:ml-32">
          <span className="font-semibold text-green-300">
            <RotatingText />
          </span>{" "}
          {t('home.subtitle_suffix')}
        </h2>
      </section>

      {/* Hovedinnhold-container */}
      <div className="container mx-auto max-w-screen-xl bg-white text-gray-900 rounded-lg shadow-xl">

        {/* Kart-seksjon */}
        <section className="p-4 sm:p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg rounded-lg">
          <div className="text-center p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
              {t('home.map_section_title.part1')} <span className="text-green-600">{t('home.map_section_title.part2')}</span> {t('home.map_section_title.part3')}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mt-2">
              {t('home.map_section_description')}
            </p>
          </div>
          <div className="relative w-full h-[400px] sm:h-[500px] rounded-md overflow-hidden">
            <Map />
          </div>
          <div>
            <SearchForm />
          </div>
        </section>

        {/* Karuseller */}
        <section className="mt-12 sm:mt-20"><TournamentsCarousel /></section>
        <section className="mt-12 sm:mt-20"><BaneCarousel /></section>
        <section className="mt-12 sm:mt-20"><NyesteBanerCarousel /></section>
        <section className="mt-12 sm:mt-20"><ReviewCarousel /></section>

        {/* CTA-seksjon */}
        <section className="mt-12 sm:mt-20 relative w-full h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {showJoinClub ? (
              <motion.div key="joinClub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="absolute w-full px-4">
                <JoinClub />
              </motion.div>
            ) : (
              <motion.div key="quickStartGame" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="absolute w-full px-4">
                <QuickStartGame />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* App-anmeldelser */}
        <section className="mt-12 sm:mt-20 pb-10">
          <AppReviews />
        </section>

      </div> {/* Slutt på hovedinnhold-container */}
    </>
  );
}