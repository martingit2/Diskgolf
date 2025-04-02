// src/app/guide/page.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Disc, // Represents discs
  Target, // Goal/Basket
  Footprints, // Movement/Walking the course
  Users, // Community/Etiquette
  MapPin, // Finding courses
  GraduationCap, // Learning/Guide
  AlertTriangle, // Safety/Warning
  Leaf, // Environment
  CheckCircle, // Rules/Correctness
  Info, // General Info
  Compass, // Explore/Discover
  Download, // App download
  MoveRight, // Could represent backhand/forehand conceptually
  Sparkles // Highlight/Tip
} from "lucide-react";
import Link from "next/link";

// Reusable animation variants for consistent feel across pages.
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

const fadeInDelayed = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: "easeInOut" },
  },
};

// Main component for the Discgolf Guide page.
export default function DiscgolfGuidePage() {
  return (
    // Standard page container with gradient background.
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Centered content wrapper. Using 7xl for the hero, 4xl for text-heavy sections. */}
      <div className="max-w-7xl mx-auto space-y-20 sm:space-y-28">

        {/* Section 1: Hero Introduction */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
           {/* Decorative icon */}
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
             <GraduationCap className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Nybegynnerguide til <span className="text-green-600">Discgolf</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Velkommen til en fantastisk sport! Her er det du trenger å vite for å komme i gang med discgolf.
          </p>
          {/* Engaging hero image */}
           <div className="mt-10 max-w-4xl mx-auto">
             <Image
               // DEV NOTE: Replace with a more suitable image showing someone learning or throwing casually.
               src="/arrangmentBilder/beginner-workshop.png"
               alt="Person som kaster en discgolf-disc på en bane"
               width={1200}
               height={675}
               className="rounded-xl shadow-2xl object-cover w-full"
               priority // Important for Largest Contentful Paint (LCP)
             />
           </div>
        </motion.section>

        {/* Section 2: What is Discgolf? */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            <Target className="w-8 h-8 mr-3 text-green-600" /> Hva er Discgolf?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Discgolf (også kalt frisbeegolf) spilles som tradisjonell golf, men i stedet for ball og køller, bruker spillerne en golfdisc (frisbee). Målet er enkelt: fullføre hvert "hull" på færrest mulig kast.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Man starter fra et utslagssted (tee) og kaster mot et mål – vanligvis en metallkurv med kjettinger, kalt en "discgolfkurv". Spilleren kaster neste kast fra der discen landet. Når discen lander i kurven, er hullet fullført. Den med færrest kast totalt vinner!
          </p>
        </motion.section>

        {/* Section 3: Essential Equipment */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
            Hva Trenger Du? (Ikke mye!)
          </h2>
          {/* Grid for equipment cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card: Putter */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-3">
                    <Disc className="w-7 h-7 text-blue-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Putter</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Designet for korte, nøyaktige kast mot kurven. Har en butt kant og flyr rett på lave hastigheter. Viktigst for scoring!</p>
                </CardContent>
              </Card>
            </motion.div>
            {/* Card: Midrange */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-yellow-100 rounded-full p-3 w-fit mb-3">
                    <Disc className="w-7 h-7 text-yellow-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Midrange</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Allsidig disc for kontrollerte kast på middels avstand. God balanse mellom distanse og nøyaktighet. Perfekt for innspill.</p>
                </CardContent>
              </Card>
            </motion.div>
             {/* Card: Driver */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-3">
                    <Disc className="w-7 h-7 text-red-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Driver</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Laget for maksimal distanse fra utslagsstedet. Har en skarpere kant og krever mer kraft/teknikk for å fly riktig. Kan være vanskelig for nybegynnere.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Beginner Tip */}
          <motion.div
            variants={fadeIn}
            className="mt-8 text-center p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto"
          >
             <h3 className="text-lg font-semibold text-green-800 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> Nybegynnertips!
             </h3>
             <p className="text-green-700 text-sm">
                 Start med bare én Putter og én Midrange! Det er lettere å lære god teknikk med disse. Du trenger ikke en rask Driver med en gang. Mange butikker selger "startsett" som er perfekte.
             </p>
          </motion.div>
        </motion.section>


        {/* Section 4: How to Play - The Basics */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center mb-8">
            <Footprints className="w-8 h-8 mr-3 text-purple-600" /> Slik Spiller Du - Steg for Steg
          </h2>

          {/* Step 1: Tee Off */}
          <div className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">1</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Start på Utslagsstedet (Tee)</h3>
              <p className="text-gray-700 leading-relaxed">Finn startpunktet for hullet, ofte markert med en plate eller et skilt. Kast din første disc herfra. Målet er å komme så nærme kurven som mulig, eller ideelt sett, rett i kurven (et "Ace"!).</p>
            </div>
          </div>

          {/* Step 2: Mark Your Lie */}
           <div className="flex items-start space-x-4">
             <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">2</div>
             <div>
               <h3 className="text-xl font-semibold text-gray-800 mb-1">Marker Landingspunktet ("Lie")</h3>
               <p className="text-gray-700 leading-relaxed">Gå til der discen din landet. Plasser en markør (en mindre disc eller bare snu discen du kastet) rett foran der discen ligger, mot kurven. Ditt neste kast må tas fra bak denne markøren.</p>
             </div>
          </div>

          {/* Step 3: Continue Throwing */}
           <div className="flex items-start space-x-4">
             <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">3</div>
             <div>
               <h3 className="text-xl font-semibold text-gray-800 mb-1">Kast Videre mot Kurven</h3>
               <p className="text-gray-700 leading-relaxed">Fortsett å kaste fra der forrige kast landet, helt til du når kurven. Spilleren som ligger lengst unna kurven kaster alltid først.</p>
             </div>
          </div>

           {/* Step 4: Putting */}
           <div className="flex items-start space-x-4">
             <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">4</div>
             <div>
               <h3 className="text-xl font-semibold text-gray-800 mb-1">"Putting" - Kast i Kurven</h3>
               <p className="text-gray-700 leading-relaxed">Når du er nær kurven (typisk innenfor 10 meter), bytter du gjerne til Putter-discen for et kontrollert kast. Hullet er fullført når discen ligger i kurvens kurvdel eller henger i kjettingene.</p>
             </div>
          </div>

           {/* Step 5: Count and Record */}
           <div className="flex items-start space-x-4">
              <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">5</div>
              <div>
                 <h3 className="text-xl font-semibold text-gray-800 mb-1">Tell Kastene og Noter Score</h3>
                 <p className="text-gray-700 leading-relaxed">Tell hvor mange kast du brukte på hullet. Skriv ned scoren (f.eks. i <span className="font-semibold text-green-600">Diskgolf.app</span>!). Gå deretter videre til neste hull.</p>
                 <p className="text-gray-700 leading-relaxed mt-1 text-sm"><i>Par er det forventede antall kast for en god spiller på hullet. Under par er bra!</i></p>
              </div>
           </div>
        </motion.section>

        {/* Section 5: Basic Throws (Brief Mention) */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto space-y-6"
        >
           <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-8">
             Grunnleggende Kasteteknikker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Backhand */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center"><MoveRight className="w-5 h-5 mr-2 text-blue-500" /> Backhand</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">Det vanligste kastet, ligner på et vanlig frisbeekast. Du holder discen på tvers av kroppen og svinger armen utover.</p>
              </div>
              {/* Forehand */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center"><MoveRight className="w-5 h-5 mr-2 text-red-500 transform scale-x-[-1]" /> Forehand ("Flick")</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">Kastes med en sidearmsbevegelse, ofte med to fingre under discen. Gir en annen kurve enn backhand.</p>
              </div>
          </div>
           <p className="text-center text-gray-600 mt-6 text-sm">
               Det finnes mange videoer på nett (f.eks. YouTube) som viser god kasteteknikk. Det lønner seg å se noen!
           </p>
        </motion.section>


        {/* Section 6: Course Etiquette */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
            Viktig Etikette på Banen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Safety Card */}
             <motion.div variants={fadeInDelayed} className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4 inline-flex items-center justify-center p-3 bg-red-100 rounded-full">
                   <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sikkerhet Først!</h3>
                <p className="text-gray-600 text-sm">Aldri kast hvis det er andre spillere, turgåere eller dyr i nærheten av landingsområdet. Rop "FORE!" høyt hvis discen din går i uventet retning mot noen.</p>
             </motion.div>
             {/* Order of Play Card */}
              <motion.div variants={fadeInDelayed} className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                 <div className="mb-4 inline-flex items-center justify-center p-3 bg-blue-100 rounded-full">
                    <Users className="w-7 h-7 text-blue-600" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Spillerekkefølge</h3>
                 <p className="text-gray-600 text-sm">Spilleren som ligger lengst fra kurven kaster alltid først. På neste hull starter den som hadde best score på forrige hull.</p>
              </motion.div>
             {/* Environment Card */}
              <motion.div variants={fadeInDelayed} className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                 <div className="mb-4 inline-flex items-center justify-center p-3 bg-green-100 rounded-full">
                    <Leaf className="w-7 h-7 text-green-600" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Ta Vare på Banen</h3>
                 <p className="text-gray-600 text-sm">Ikke brekk grener eller ødelegg naturen. Ta med deg søppel (også andres hvis du ser det). La banen være finere enn du fant den.</p>
              </motion.div>
          </div>
        </motion.section>

        {/* Section 7: Finding Courses */}
         <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center bg-gray-100 p-8 sm:p-10 rounded-xl border border-gray-200 shadow-sm"
        >
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 mr-3 text-red-500" /> Hvor Kan Du Spille?
             </h2>
             <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8">
                Det finnes tusenvis av discgolfbaner over hele verden, og mange er gratis å bruke! Den enkleste måten å finne baner nær deg på, er å bruke <span className="font-semibold text-green-600">Diskgolf.app</span>.
             </p>
             <Link href="/baner" passHref legacyBehavior>
                 <a>
                     <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 font-semibold px-8 py-3 text-lg">
                        <Compass className="w-5 h-5 mr-2" /> Utforsk Baner Nå
                    </Button>
                 </a>
             </Link>
         </motion.section>

        {/* Section 8: Next Steps & Encouragement */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">
            Veien Videre
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Den beste måten å bli bedre på er å øve! Ta med deg discene ut, spill runder, og ha det gøy. Ikke vær redd for å spørre mer erfarne spillere om tips – de fleste i discgolf-miljøet er veldig hyggelige og hjelpsomme.
          </p>
           <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mt-4">
              Vurder å bli med i en lokal klubb eller delta i ukesgolfer eller nybegynnerturneringer for å møte andre spillere og lære mer. Lykke til!
           </p>
        </motion.section>

         {/* Section 9: Final Call to Action (Reused from Om Oss) */}
        <motion.section
         className="text-center bg-gradient-to-r  from-green-500 via-green-900  to-green-500  rounded-xl p-10 sm:p-16 shadow-xl mt-12" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Klar til å starte din discgolf-reise?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Last ned <span className="font-semibold">Diskgolf.app</span> for å finne baner, logge score og bli en del av fellesskapet!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             {/* DEV NOTE: Update href to actual download link/app store */}
            <Link href="#" passHref legacyBehavior>
              <a className="block w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full text-lg bg-white text-green-700 hover:bg-gray-100 shadow-md px-8 py-3 font-semibold">
                  <Download className="w-5 h-5 mr-2" /> Last ned Appen
                </Button>
              </a>
            </Link>
            <Link href="/baner" passHref legacyBehavior>
              <a className="block w-full sm:w-auto">
                 <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-lg bg-transparent border-white text-white hover:bg-white/10 shadow-md px-8 py-3 font-semibold"
                 >
                    <Compass className="w-5 h-5 mr-2" /> Utforsk Baner
                 </Button>
              </a>
            </Link>
          </div>
        </motion.section>

      </div>
    </div>
  );
}