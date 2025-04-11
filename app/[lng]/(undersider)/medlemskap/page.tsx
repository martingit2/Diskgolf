// Fil: src/app/medlemskap/page.tsx
// Formål: Informasjonsside som forklarer medlemskapsfunksjonen i Diskgolf.app, fordelene ved klubbmedlemskap og hvordan man blir medlem via appen. Oppfordrer brukere til å utforske tilgjengelige klubber.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, // Community, Clubs
  CreditCard, // Payment, Fees
  Heart, // Passion, Support
  Medal, // Competition, Events
  Wrench, // Maintenance, Support
  Info, // Information
  Sparkles, // Benefits
  Search, // Finding clubs
  UserPlus, // Joining
  Map // Could represent local clubs/courses
} from "lucide-react";
import Link from "next/link";

// Shared animation variants
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

// Main component for the Membership Info page
export default function MembershipPage() {
  return (
    // Standard page container with gradient background
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Centered content wrapper */}
      <div className="max-w-7xl mx-auto space-y-20 sm:space-y-28">

        {/* Section 1: Hero Introduction */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
           {/* Decorative icon */}
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
             {/* Using CreditCard as it relates to the current primary function: payment */}
             <CreditCard className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Medlemskap via <span className="text-green-600">Diskgolf.app</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Bli enkelt medlem i din lokale discgolfklubb og betal kontingenten direkte gjennom appen. Støtt klubben din og få tilgang til medlemsfordeler!
          </p>
          {/* Optional: Add a relevant image here if desired */}
           {/*
           <div className="mt-10 max-w-4xl mx-auto">
             <Image
               src="/path/to/your/membership-related-image.jpg"
               alt="Glad discgolfspiller som er medlem av en klubb"
               width={1200}
               height={675}
               className="rounded-xl shadow-2xl object-cover w-full"
               priority
             />
           </div>
           */}
        </motion.section>

        {/* Section 2: What is this Membership Feature? */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          // Consistent content block styling
          className="max-w-4xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            <Info className="w-8 h-8 mr-3 text-blue-500" /> Hva Innebærer Medlemskap i Appen?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Medlemskapsfunksjonen i Diskgolf.app er designet for å gjøre det <span className="font-semibold">enklere for deg å bli og forbli medlem</span> i de discgolfklubbene du ønsker å støtte.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Per i dag fokuserer funksjonen på å <span className="font-semibold">håndtere betaling av årlig medlemskontingent</span>. Når du velger å bli medlem i en klubb via appen, kan du betale kontingenten sikkert og enkelt. Betalingen går <span className="font-semibold">direkte til den valgte klubben</span> for å støtte deres drift og aktiviteter.
          </p>
           <p className="text-sm text-gray-500 italic leading-relaxed mt-2">
               Merk: Diskgolf.app fasiliterer kun betalingen på vegne av klubben. Selve medlemskapet, fordeler og regler styres av den enkelte klubb.
           </p>
        </motion.section>

        {/* Section 3: Benefits of Club Membership */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-5xl mx-auto" // Slightly wider max-width for the card grid
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-500 inline-block" /> Hvorfor Bli Klubbmedlem?
          </h2>
          {/* Grid for benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit Card 1: Community */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-purple-100 rounded-full p-3 w-fit mb-3">
                    <Users className="w-7 h-7 text-purple-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Fellesskap</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Bli en del av et lokalt discgolfmiljø. Møt nye spillere, få venner og del lidenskapen.</p>
                </CardContent>
              </Card>
            </motion.div>
            {/* Benefit Card 2: Organized Play */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-yellow-100 rounded-full p-3 w-fit mb-3">
                    <Medal className="w-7 h-7 text-yellow-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Organisert Spill</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Delta i klubbens ukesgolfer, turneringer og andre arrangementer – ofte til redusert pris for medlemmer.</p>
                </CardContent>
              </Card>
            </motion.div>
             {/* Benefit Card 3: Support Local Course */}
            <motion.div variants={fadeInDelayed}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-3">
                    <Wrench className="w-7 h-7 text-green-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Støtt Banen</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 px-4">
                  <p className="text-gray-600 text-sm">Kontingenten bidrar direkte til vedlikehold og utvikling av lokale baner, utstyr og klubbdrift.</p>
                </CardContent>
              </Card>
            </motion.div>
             {/* Benefit Card 4: Involvement */}
             <motion.div variants={fadeInDelayed}>
               <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                 <CardHeader>
                   <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-3">
                     <Heart className="w-7 h-7 text-red-700" />
                   </div>
                   <CardTitle className="text-xl font-semibold text-gray-800">Engasjement</CardTitle>
                 </CardHeader>
                 <CardContent className="pb-6 px-4">
                   <p className="text-gray-600 text-sm">Få mulighet til å påvirke klubbens utvikling, delta på dugnader og bidra til veksten av sporten lokalt.</p>
                 </CardContent>
               </Card>
             </motion.div>
          </div>
           <p className="text-center text-gray-500 mt-8 text-sm italic">
              Spesifikke fordeler varierer fra klubb til klubb. Sjekk den enkelte klubbs informasjonsside for detaljer.
           </p>
        </motion.section>

        {/* Section 4: How to Become a Member via App */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-10">
             Slik Blir Du Medlem Gjennom Appen
          </h2>

          {/* Step 1: Find Club */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-green-700" />
             </div>
             <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">1. Finn Din Klubb</h3>
                <p className="text-gray-700 leading-relaxed">Naviger til <Link href="/klubber" className="text-green-600 hover:underline font-medium">'Klubber'</Link>-seksjonen i appen. Søk etter klubbnavn eller finn klubber i ditt område.</p>
             </div>
          </div>

           {/* Step 2: Join Club */}
           <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-blue-700" />
             </div>
             <div className="text-center sm:text-left">
               <h3 className="text-xl font-semibold text-gray-800 mb-1">2. Velg "Bli Medlem"</h3>
               <p className="text-gray-700 leading-relaxed">På klubbens profilside vil du (hvis klubben har aktivert funksjonen) finne en knapp for å starte medlemsprosessen.</p>
             </div>
          </div>

           {/* Step 3: Pay Dues */}
           <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <div className="flex-shrink-0 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-yellow-700" />
             </div>
             <div className="text-center sm:text-left">
               <h3 className="text-xl font-semibold text-gray-800 mb-1">3. Betal Kontingenten</h3>
               <p className="text-gray-700 leading-relaxed">Følg instruksjonene for å fullføre betalingen av medlemskontingenten via vår sikre betalingsløsning. Pengene går direkte til klubben.</p>
             </div>
          </div>
        </motion.section>

        {/* Section 5: Future Possibilities (Optional but nice touch) */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-700 tracking-tight mb-4">
            Hva med Fremtiden?
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Vi jobber med å utvide medlemskapsfunksjonen. I fremtiden kan dette inkludere muligheter for kjøp av klubb-merchandise, enklere påmelding til arrangementer for medlemmer og andre integrerte fordeler – alt samlet i appen.
          </p>
        </motion.section>

         {/* Section 6: Call to Action - Find Clubs */}
        <motion.section
          // Reusing the standard gradient CTA block style
          className="text-center bg-gradient-to-r  from-green-500 via-green-900  to-green-500  rounded-xl p-10 sm:p-16 shadow-xl mt-12" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Klar til å finne din lokale klubb?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Utforsk klubbene i ditt område, les mer om dem og se hvilke som tilbyr medlemskap direkte gjennom Diskgolf.app!
          </p>
          <div className="flex justify-center">
            <Link href="/klubber" passHref legacyBehavior>
              <a className="block w-full sm:w-auto">
                 <Button
                    size="lg"
                    variant="secondary" // White button on gradient background
                    className="w-full text-lg bg-white text-green-700 hover:bg-gray-100 shadow-md px-8 py-3 font-semibold"
                 >
                    <Map className="w-5 h-5 mr-2" /> Utforsk Klubber
                 </Button>
              </a>
            </Link>
          </div>
        </motion.section>

      </div>
    </div>
  );
}