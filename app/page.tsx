/**
 * Filnavn: HomePage.tsx (/app/page.tsx)
 * Beskrivelse: Hovedsiden for DiskGolf-applikasjonen. Viser hero på mørk bakgrunn,
 *              etterfulgt av resten av innholdet i en hvit container.
 * Utvikler: Martin Pettersen
 */

"use client"; // Denne komponenten trenger state og effekter

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script"; // For eventuell fremtidig bruk (Cookiebot etc.)

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

// Importerer Zustand store for banedata (hvis du bruker det)
// import useCoursesStore from "./stores/UseCoursesStore";

export default function HomePage() {
  // State for å veksle mellom JoinClub og QuickStartGame CTA
  const [showJoinClub, setShowJoinClub] = useState(true);

  // Eksempel på henting fra Zustand store (fjern eller behold etter behov)
  // const { courses, fetchCourses } = useCoursesStore();
  // useEffect(() => {
  //   fetchCourses();
  // }, [fetchCourses]);

  // Effekt for å bytte CTA-komponent hvert 7. sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setShowJoinClub((prev) => !prev); // Veksler state
    }, 7000);

    // Renser opp intervallet når komponenten avmonteres
    return () => clearInterval(interval);
  }, []); // Kjør kun én gang ved montering

  return (
    // Bruker Fragment siden vi har to toppnivå-seksjoner med ulik layout/bakgrunn
    <>
      {/* === DEL 1: HERO-SEKSJON === */}
      {/* 'container mx-auto px-4' sentrerer og gir luft på sidene */}
      {/* 'pt-6' gir topp-luft, 'pb-0' fjerner bunn-luft */}
      {/* 'text-center md:text-left' for justering */}
      {/* FJERNET mr-60 herfra */}
      <section className="container mx-auto px-4 pt-6 pb-0 text-center md:text-left">
        {/* ØKT venstremarg på md+ skjermer, f.eks. md:ml-32 */}
        {/* FJERNET mr-60 og overflødig md:text-left herfra */}
        <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text md:ml-32"> {/* ENDRET: md:ml-32 (eller høyere) */}
          Ta spillet ditt til neste nivå
        </h1>
        {/* 'pb-4 sm:pb-6' gir litt luft FØR den hvite boksen */}
        {/* ØKT venstremarg på md+ skjermer for å matche h1 */}
         {/* FJERNET mr-60 herfra */}
        <h2 className="text-white py-5 pb-4 sm:pb-6 text-lg sm:text-xl md:ml-32"> {/* ENDRET: md:ml-32 (eller høyere) */}
          <span className="font-semibold text-green-300">
            <RotatingText /> {/* Komponent for roterende tekst */}
          </span>{" "}
          og mye mer!
        </h2>
      </section>
      {/* === SLUTT PÅ DEL 1 === */}


      {/* === DEL 2: HVIT CONTAINER FOR RESTEN AV INNHOLDET === */}
      <div className="container mx-auto max-w-screen-xl bg-white text-gray-900 rounded-lg shadow-xl">

        {/* KART-SEKSJON */}
        <section className="p-4 sm:p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg rounded-lg">
          <div className="text-center p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
              Utforsk <span className="text-green-600">DiskGolf-baner</span> på kartet
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mt-2">
              Zoom inn på kartet for å finne baner i nærheten eller oppdag nye destinasjoner.
            </p>
          </div>
          <div className="relative w-full h-[400px] sm:h-[500px] rounded-md overflow-hidden">
            <Map />
          </div>
          <div>
            <SearchForm />
          </div>
        </section>

        {/* KARUSELLER */}
        <section className="mt-12 sm:mt-20">
          <TournamentsCarousel />
        </section>
        <section className="mt-12 sm:mt-20">
          <BaneCarousel />
        </section>
        <section className="mt-12 sm:mt-20">
          <NyesteBanerCarousel />
        </section>
        <section className="mt-12 sm:mt-20">
          <ReviewCarousel />
        </section>

        {/* CTA-SEKSJON */}
        <section className="mt-12 sm:mt-20 relative w-full h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {showJoinClub ? (
              <motion.div
                key="joinClub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute w-full px-4"
              >
                <JoinClub />
              </motion.div>
            ) : (
              <motion.div
                key="quickStartGame"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute w-full px-4"
              >
                <QuickStartGame />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* APP-ANMELDELSER */}
        <section className="mt-12 sm:mt-20 pb-10">
          <AppReviews />
        </section>

      </div> {/* Avslutter den hvite container-diven */}
    </> // Avslutter Fragment /
    
  );
}