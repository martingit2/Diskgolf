/**
 * Filnavn: HomePage.tsx (/app/page.tsx)
 * Beskrivelse: Hovedsiden for DiskGolf-applikasjonen. Viser kart, søk, karuseller og annen informasjon.
 * Utvikler: Martin Pettersen
 */

"use client"; // Denne komponenten trenger state og effekter, derfor use client

import { useState, useEffect, Fragment } from "react"; // Importer Fragment hvis du trenger det
import { motion, AnimatePresence } from "framer-motion"; // For animasjoner
import Script from "next/script"; // For å legge inn tredjeparts script (som Cookiebot)

// Importerer diverse komponenter som brukes på siden
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

// Importerer Zustand store for banedata
import useCoursesStore from "./stores/UseCoursesStore";

// Henter miljøvariabel for Cookiebot (kommentert ut siden den ikke er i bruk nå)
// const domainGroupId = process.env.NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID;

export default function HomePage() {
  // State for å veksle mellom JoinClub og QuickStartGame CTA
  const [showJoinClub, setShowJoinClub] = useState(true);
  // Henter banedata og funksjon for å hente fra Zustand store
  const { courses, fetchCourses } = useCoursesStore();

  // Effekt for å hente banedata når komponenten lastes (hvis ikke allerede hentet)
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // Kjør kun når fetchCourses endres (bør bare være én gang)

  // Effekt for å bytte CTA-komponent hvert 7. sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setShowJoinClub((prev) => !prev); // Veksler state
    }, 7000);

    // Renser opp intervallet når komponenten avmonteres
    return () => clearInterval(interval);
  }, []); // Kjør kun én gang ved montering

  return (
    // Bruker en div som ytre container for innholdet på siden.
    // Denne div-en får container-stiler (breddebegrensning, sentrering) og padding.
    <div className="container mx-auto px-4 py-6">

      {/* Cookiebot-script (kommentert ut) */}
      {/*
      {domainGroupId && (
        <Script
          id="cookiebot-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `... cookiebot code ...`
          }}
        />
      )}
      */}

      {/* Overskrift-seksjon */}
      {/* max-w-7xl og mx-auto er kanskje ikke nødvendig her lenger pga ytre container */}
      <section className="p-6 text-center md:text-left">
        <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text">
          Ta spillet ditt til neste nivå
        </h1>
        <h2 className="text-white py-5 text-lg sm:text-xl">
          <span className="font-semibold text-green-300">
            <RotatingText /> {/* Komponent for roterende tekst */}
          </span>{" "}
          og mye mer!
        </h2>
      </section>

      {/* Seksjon for kart og søkefelt */}
      {/* mx-auto er ikke nødvendig her pga ytre container */}
      <section className="mt-10 p-4 sm:p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg rounded-lg">
        <div className="text-center p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
            Utforsk <span className="text-green-600">DiskGolf-baner</span> på kartet
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Zoom inn på kartet for å finne baner i nærheten eller oppdag nye destinasjoner.
          </p>
        </div>

        {/* Kartkomponent */}
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-md overflow-hidden"> {/* Lagt til avrunding og overflow hidden */}
          <Map />
        </div>

        {/* Søkeskjema */}
        <div>
          <SearchForm />
        </div>
      </section>

      {/* Karusell for Turneringer */}
      <section className="mt-12 sm:mt-20"> {/* Økt margin */}
        <TournamentsCarousel />
      </section>

       {/* Karusell for Populære baner */}
      <section className="mt-12 sm:mt-20">
        <BaneCarousel />
      </section>

      {/* Karusell for Nyeste baner */}
      <section className="mt-12 sm:mt-20">
        <NyesteBanerCarousel />
      </section>

      {/* Karusell for Anmeldelser */}
      <section className="mt-12 sm:mt-20">
        <ReviewCarousel />
      </section>

      {/* CTA-seksjon med animasjon */}
      {/* mx-auto er ikke nødvendig her pga ytre container */}
      <section className="mt-12 sm:mt-20 relative w-full h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden"> {/* Justert høyde og lagt til overflow */}
        <AnimatePresence mode="wait">
          {showJoinClub ? (
            <motion.div
              key="joinClub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }} // Justert varighet
              className="absolute w-full px-4" // Lagt til litt padding
            >
              <JoinClub />
            </motion.div>
          ) : (
            <motion.div
              key="quickStartGame"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }} // Justert varighet
              className="absolute w-full px-4" // Lagt til litt padding
            >
              <QuickStartGame />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Seksjon for App-anmeldelser */}
      <section className="mt-12 sm:mt-20 pb-10"> {/* Lagt til padding bottom */}
        <AppReviews />
      </section>

    </div> // Avslutter den ytre div-en
  );
}