// src/app/om-oss/page.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Target, Zap, Heart, Compass, Medal, Search, PlayCircle, Star, Download } from "lucide-react"; // Added Download icon
import Link from "next/link";

// --- Animasjonsvarianter ---
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
// --- Slutt Animasjonsvarianter ---

// --- Data ---
// Definerer teammedlemmer - Oppdatert med bilder fra avatarMap
const teamMembers = [
  {
    name: "Sofie Andersen", // Justert navn for å passe avatar
    role: "Gründer & Daglig Leder",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg", // Fra avatarMap
    bio: "Lidenskapelig discgolf-spiller som startet Diskgolf.app for å samle sporten digitalt.",
  },
  {
    name: "Thomas Ruud", // Justert navn for å passe avatar
    role: "Teknisk Leder (CTO)",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg", // Fra avatarMap
    bio: "Sørger for at appen er rask, pålitelig og alltid i forkant teknologisk.",
  },
  // Legg til flere teammedlemmer her ved behov.
];

// Definerer kjerneverdier for selskapet/appen.
const coreValues = [
  {
    icon: Heart,
    title: "Lidenskap",
    description: "Drevet av kjærlighet for discgolf og ønsket om å forbedre spilleropplevelsen.",
  },
  {
    icon: Users,
    title: "Fellesskap",
    description: "Bygger et inkluderende og engasjerende miljø for alle spillere.",
  },
  {
    icon: Zap,
    title: "Innovasjon",
    description: "Kontinuerlig forbedring av appen med nye funksjoner og teknologi.",
  },
  {
    icon: Medal,
    title: "Kvalitet",
    description: "Dedikert til å levere en pålitelig, nøyaktig og høykvalitets applikasjon.",
  },
];
// --- Slutt Data ---

// Hovedkomponenten for "Om Oss"-siden.
export default function AboutPage() {

  return (
    // Hovedcontainer
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Sentrert innhold */}
      <div className="max-w-7xl mx-auto space-y-20 sm:space-y-28">

        {/* Seksjon 1: Hero / Introduksjon */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Om <span className="text-green-600">Diskgolf.app</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Vi brenner for discgolf og er dedikert til å skape den beste digitale opplevelsen for spillere over hele Norge – og verden.
          </p>
           {/* Hero bilde */}
           <div className="mt-10 max-w-4xl mx-auto">
             <Image
               src="/arrangmentBilder/local-tournament.png" // Bruker local-tournament bildet.
               alt="Gruppe med discgolfspillere på en turnering"
               width={1200}
               height={675}
               className="rounded-xl shadow-2xl object-cover w-full"
               priority // Viktig for LCP
             />
           </div>
        </motion.section>

        {/* Seksjon 2: Vår Misjon & Visjon */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          {/* Tekstdel */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
              <Target className="w-8 h-8 mr-3 text-green-600" /> Vårt Oppdrag
            </h2>
            <p className="text-lg text-gray-600">
              Å forenkle og berike discgolf-opplevelsen for alle. Vi vil gjøre det enkelt å finne baner, registrere runder, følge progresjon, konkurrere med venner og bli en del av et større discgolf-fellesskap på <span className="font-semibold">diskgolf.app</span>.
            </p>
            <h3 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center pt-4">
              <Zap className="w-7 h-7 mr-3 text-blue-500" /> Vår Visjon
            </h3>
            <p className="text-lg text-gray-600">
              Å være den foretrukne plattformen for discgolf-spillere globalt, kjent for brukervennlighet, nøyaktighet og et levende fellesskap.
            </p>
          </div>
          {/* Bildedel */}
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/arrangmentBilder/beginner-workshop.png"
              alt="Deltakere på et discgolf nybegynnerkurs"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </motion.section>

        {/* Seksjon 3: Kjernefunksjoner Highlight */}
         <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
        >
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
                Hva Gjør <span className="text-green-600">Diskgolf.app</span> Spesiell?
            </h2>
            {/* Grid for funksjonskort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature Kort: Finn Baner */}
                <motion.div variants={fadeInDelayed}>
                    <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                        <CardHeader>
                            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-3">
                                <Search className="w-7 h-7 text-green-700" />
                            </div>
                            <CardTitle className="text-xl font-semibold text-gray-800">Finn Baner</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 px-4">
                            <p className="text-gray-600 text-sm">Oppdag tusenvis av baner, se detaljer, anmeldelser og veibeskrivelser.</p>
                        </CardContent>
                    </Card>
                </motion.div>
                 {/* Feature Kort: Spill Runder */}
                <motion.div variants={fadeInDelayed}>
                    <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                        <CardHeader>
                            <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-3">
                                <PlayCircle className="w-7 h-7 text-blue-700" />
                            </div>
                            <CardTitle className="text-xl font-semibold text-gray-800">Spill Runder</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 px-4">
                            <p className="text-gray-600 text-sm">Enkelt scorekort, statistikk i sanntid og muligheten til å spille med venner.</p>
                        </CardContent>
                    </Card>
                 </motion.div>
                 {/* Feature Kort: Følg Progresjon */}
                 <motion.div variants={fadeInDelayed}>
                     <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                        <CardHeader>
                            <div className="mx-auto bg-purple-100 rounded-full p-3 w-fit mb-3">
                                <Medal className="w-7 h-7 text-purple-700" />
                            </div>
                            <CardTitle className="text-xl font-semibold text-gray-800">Følg Progresjon</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 px-4">
                            <p className="text-gray-600 text-sm">Analyser dine runder, se personlige rekorder og følg din utvikling over tid.</p>
                        </CardContent>
                    </Card>
                </motion.div>
                 {/* Feature Kort: Utforsk Fellesskapet */}
                 <motion.div variants={fadeInDelayed}>
                     <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                        <CardHeader>
                            <div className="mx-auto bg-yellow-100 rounded-full p-3 w-fit mb-3">
                                <Users className="w-7 h-7 text-yellow-700" />
                            </div>
                            <CardTitle className="text-xl font-semibold text-gray-800">Utforsk Fellesskapet</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 px-4">
                            <p className="text-gray-600 text-sm">Delta i turneringer, se venners aktivitet og del dine prestasjoner.</p>
                        </CardContent>
                    </Card>
                 </motion.div>
            </div>
         </motion.section>

        {/* Seksjon 4: Møt Teamet */}
        {teamMembers.length > 0 && ( // Vises kun hvis teamMembers ikke er tom
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
              Teamet Bak Appen
            </h2>
            {/* Grid for teammedlemmer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center max-w-2xl mx-auto"> {/* Justert grid-cols og max-w for færre medlemmer */}
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeInDelayed}
                  className="w-full max-w-sm"
                >
                  <Card className="text-center shadow-lg rounded-xl overflow-hidden border border-gray-100 h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col items-center flex-grow">
                      <Avatar className="w-24 h-24 mb-4 ring-2 ring-offset-2 ring-green-500">
                        <AvatarImage src={member.imageUrl} alt={member.name} />
                        <AvatarFallback className="text-2xl bg-gray-200 text-gray-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-green-700 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm flex-grow">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Seksjon 5: Våre Verdier */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
            Våre Verdier
          </h2>
          {/* Grid for verdier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <motion.div key={index} variants={fadeInDelayed}>
                <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-4 inline-flex items-center justify-center p-3 bg-gray-100 rounded-full">
                     <value.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Seksjon 6: Hva brukerne sier (Placeholder) */}
        {/* TODO: Implementer og importer AppReviews komponenten og fjern denne placeholderen */}
        <motion.section
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, amount: 0.1 }}
             variants={fadeIn}
         >
             <div className="text-center p-10 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">Hva Sier Brukerne Våre?</h2>
                 <p className="text-gray-500">Brukeranmeldelser kommer snart her...</p>
                 <div className="flex justify-center gap-2 mt-4">
                    {/* Eksempel på stjernerating */}
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-gray-300" />
                 </div>
             </div>
             {/* <AppReviews /> */} {/* <--- Kommenter inn denne når AppReviews komponenten er klar */}
         </motion.section>

{/* Seksjon 7: Ny Call to Action (CTA) */}
<motion.section
          className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-10 sm:p-16 shadow-xl mt-12" // Lagt til mt-12 for ekstra avstand
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Klar til å ta discgolf-spillet ditt til neste nivå?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Last ned <span className="font-semibold">Diskgolf.app</span> i dag, utforsk baner, loggfør rundene dine og bli med i fellesskapet!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             {/* TODO: Oppdater href til faktisk nedlastingslenke eller App Store/Google Play */}
            <Link href="#" passHref legacyBehavior>
              <a className="block w-full sm:w-auto"> {/* Added w-full sm:w-auto here too for consistency */}
                <Button size="lg" variant="secondary" className="w-full text-lg bg-white text-green-700 hover:bg-gray-100 shadow-md px-8 py-3 font-semibold">
                  <Download className="w-5 h-5 mr-2" /> Last ned Appen
                </Button>
              </a>
            </Link>
            {/* Lenke til banesiden */}
            <Link href="/baner" passHref legacyBehavior>
              <a className="block w-full sm:w-auto"> {/* Added w-full sm:w-auto here too for consistency */}
                 <Button
                    size="lg"
                    variant="outline" // Behøves fortsatt for grunnleggende styling som border-width etc.
                    className="w-full text-lg bg-transparent border-white text-white hover:bg-white/10 shadow-md px-8 py-3 font-semibold" // *** ENDRING: La til bg-transparent ***
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