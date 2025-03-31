"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

import React from "react";
import useCoursesStore from "./stores/UseCoursesStore";

// Henter miljøvariabel for Cookiebot
// const domainGroupId = process.env.NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID;

export default function HomePage() {
  const [showJoinClub, setShowJoinClub] = useState(true);
  const { courses, fetchCourses } = useCoursesStore(); // Henter kursdata og metoden for å hente dem

  useEffect(() => {
    // Kaller fetchCourses for å hente kursdata hvis de ikke allerede er cachet
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowJoinClub((prev) => !prev);
    }, 7000); // Bytter hver 7. sekund

    return () => clearInterval(interval);
  }, []);

  return (
    <React.Fragment>
      {/* Cookiebot-scriptet er kommentert ut, siden trialen har utløpt */}
      {/* Husk å fornye trialen før innlevering av prosjekt */}
      {/* 
      {domainGroupId && (
        <Script
          id="cookiebot-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var s = document.createElement("script");
                s.src = "https://consent.cookiebot.com/uc.js?cbid=${domainGroupId}&blockingmode=auto";
                s.async = true;
                document.body.appendChild(s);
              })();
            `,
          }}
        />
      )}
      */}

      <main className="bg-[var(--headerColor)]">
        {/* Overskrift-seksjon */}
        <section className="max-w-7xl mx-auto p-6">
          <h1 className="font-bold text-5xl bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text">
            Ta spillet ditt til neste nivå
          </h1>
          <h2 className="text-white py-5 text-xl">
            <span className="font-semibold text-green-300">
              <RotatingText />
            </span>{" "}
            og mye mer!
          </h2>
        </section>

        {/* Søkefeltene og kart */}
        <section className="mx-auto max-w-7xl mt-10 p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg rounded-lg">
          <div className="text-center p-8">
            <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
              Utforsk <span className="text-green-600">DiskGolf-baner</span> på kartet
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Zoom inn på kartet for å finne baner i nærheten eller oppdag nye destinasjoner.
            </p>
          </div>

          <div className="relative w-full h-[500px]">
            <Map />
          </div>

          {/* Søke-seksjon */}
          <div className="mt-4">
            <SearchForm />
          </div>

          <div className="mt-20">
            <TournamentsCarousel />
          </div>

          <div className="mt-20">
            <BaneCarousel />
          </div>
          <div className="mt-20">
            <NyesteBanerCarousel />
          </div>
          

          {/* Kommentert ut turneringsseksjon */}
          {/* <div className="mt-4"> */}
          {/* <TournamentsCarousel /> */}
          {/* </div> */}

          <div className="mt-4">
            <ReviewCarousel />
          </div>

          {/* CTA-seksjon med animasjon mellom JoinClub og QuickStartGame */}
          <div className="mt-20 relative w-full max-w-3xl mx-auto h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showJoinClub ? (
                <motion.div
                  key="joinClub"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className="absolute w-full"
                >
                  <JoinClub />
                </motion.div>
              ) : (
                <motion.div
                  key="quickStartGame"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className="absolute w-full"
                >
                  <QuickStartGame />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10">
            <AppReviews />
          </div>
        </section>
      </main>
    </React.Fragment>
  );
}
