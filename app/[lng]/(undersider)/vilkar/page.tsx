// src/app/vilkar/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  FileText, // General document icon
  Gavel, // Legal / Law icon
  User, // User account icon
  CheckCircle, // Acceptable use icon
  MessageSquare, // User content icon
  Copyright, // Intellectual property icon
  AlertTriangle, // Disclaimer / Warning icon
  ShieldAlert, // Liability icon
  XCircle, // Termination icon
  RefreshCw, // Changes icon
  Mail, // Contact icon
  Calendar, // Date icon
  Info, // General info / Acceptance
  Ban // Prohibited Actions
} from "lucide-react";
import Link from "next/link"; // For potential internal links (e.g., to Privacy Policy)

// Shared animation variant for sections loading into view.
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Defines the structure and content for the Terms of Use page.
export default function TermsOfUsePage() {
  // DEV NOTE: Ensure this date reflects the last significant revision of the terms.
  const lastUpdatedDate = "15. feb 2025";

  return (
    // Main container applying the standard page gradient and vertical padding.
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Content wrapper, centered with max-width for optimal text line length. */}
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">

        {/* Section 1: Page Header */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Icon decoration matching other legal/info pages. */}
          <div className="inline-flex items-center justify-center p-3 bg-gray-200 rounded-full mb-4">
             <FileText className="w-8 h-8 text-gray-700" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Vilkår for Bruk
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Vennligst les disse vilkårene nøye før du bruker <span className="font-semibold text-green-600">Diskgolf.app</span>.
          </p>
          {/* Displays the last revision date prominently. */}
          <p className="mt-2 text-sm text-gray-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-1.5" /> Sist oppdatert: {lastUpdatedDate}
          </p>
        </motion.section>

        {/* Section 2: Introduction and Acceptance of Terms */}
        {/* DEV NOTE: Each content section uses motion for staggered fade-in on scroll */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger animation once 20% is visible
          variants={fadeIn}
          // Consistent styling for content blocks: white bg, padding, rounded corners, subtle shadow/border.
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Info className="w-6 h-6 mr-3 text-blue-500" /> 1. Aksept av Vilkårene
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: This text requires legal review. It outlines the binding nature of the terms.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Disse Vilkårene for Bruk ("Vilkårene") utgjør en juridisk bindende avtale mellom deg ("Bruker", "du", "din") og Diskgolf.app ("vi", "oss", "vår") angående din tilgang til og bruk av Diskgolf.app-mobilapplikasjonen, nettstedet (diskgolf.app) og eventuelle tilknyttede tjenester (samlet kalt "Tjenesten").
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ved å laste ned, installere, få tilgang til eller bruke Tjenesten, bekrefter du at du har lest, forstått og godtar å være bundet av disse Vilkårene og vår <Link href="/personvern" className="text-green-600 hover:underline">Personvernerklæring</Link>. Hvis du ikke godtar disse Vilkårene, må du ikke bruke Tjenesten.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 3: User Accounts */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <User className="w-6 h-6 mr-3 text-green-600" /> 2. Brukerkontoer
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Review account requirements, age limits, and user responsibilities.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            For å bruke visse funksjoner i Tjenesten, må du kanskje opprette en brukerkonto. Du samtykker i å:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
            <li>Oppgi nøyaktig, oppdatert og fullstendig informasjon under registreringsprosessen.</li>
            <li>Opprettholde og oppdatere kontoinformasjonen din for å holde den nøyaktig.</li>
            <li>Holde passordet ditt konfidensielt og ikke dele det med tredjeparter.</li>
            <li>Ta fullt ansvar for all aktivitet som skjer under din konto.</li>
            <li>Varsle oss umiddelbart ved mistanke om uautorisert bruk av kontoen din.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Du må være minst 13 år gammel (eller aldersgrensen for samtykke i ditt land) for å opprette en konto og bruke Tjenesten.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 4: Acceptable Use Policy */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-teal-500" /> 3. Tillatt Bruk og Forbudt Atferd
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Define acceptable use clearly. This list is indicative and needs tailoring.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Du samtykker i å bruke Tjenesten kun til lovlige formål og i samsvar med disse Vilkårene. Du samtykker i å ikke:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
            <li>Bruke Tjenesten på noen måte som bryter gjeldende lover eller forskrifter.</li>
            <li>Laste opp, legge ut eller overføre innhold som er ulovlig, skadelig, truende, ærekrenkende, obskønt, krenkende, hatefullt eller på annen måte støtende.</li>
            <li>Utgi deg for å være en annen person eller enhet.</li>
            <li>Skaffe deg uautorisert tilgang til Tjenesten, andre brukerkontoer, eller datasystemer tilknyttet Tjenesten.</li>
            <li>Forstyrre eller avbryte driften av Tjenesten eller serverne/nettverkene som er koblet til den.</li>
            <li>Bruke roboter, edderkopper eller andre automatiserte midler for å få tilgang til Tjenesten for noe formål uten vår uttrykkelige skriftlige tillatelse.</li>
            <li>Prøve å dekompilere, reversere eller på annen måte forsøke å utlede kildekoden til Tjenesten.</li>
            <li>Bruke Tjenesten til kommersielle formål uten vår uttrykkelige skriftlige tillatelse (f.eks. videresalg av data, reklame).</li>
          </ul>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
             <h3 className="text-lg font-semibold text-red-800 flex items-center mb-2"><Ban className="w-5 h-5 mr-2 text-red-600"/> Spesielt Forbudt</h3>
             <p className="text-red-700 text-sm">All form for trakassering av andre brukere, innsending av falske scorekort eller banedata med vilje, eller forsøk på å manipulere rangeringer eller statistikk er strengt forbudt og kan føre til umiddelbar utestengelse.</p>
          </div>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

         {/* Section 5: User-Generated Content */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-indigo-500" /> 4. Brukergenerert Innhold
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Clarify ownership and licenses for UGC (scores, comments, reviews, photos etc.).
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Tjenesten kan tillate deg å sende inn, laste opp, publisere eller på annen måte gjøre tilgjengelig innhold, slik som scorekortdata, baneanmeldelser, kommentarer, bilder og annen informasjon ("Brukerinnhold").
          </p>
           <p className="text-gray-700 leading-relaxed">
            Du beholder eierskapet til ditt Brukerinnhold. Ved å sende inn Brukerinnhold, gir du oss imidlertid en verdensomspennende, ikke-eksklusiv, royalty-fri, evigvarende, ugjenkallelig, underlisensierbar og overførbar lisens til å bruke, reprodusere, distribuere, modifisere, tilpasse, lage avledede verk av, offentlig vise og fremføre slikt Brukerinnhold i forbindelse med drift og levering av Tjenesten og til våre forretningsformål (f.eks. for å vise score på ledertavler, forbedre banedata, anonymisert analyse).
          </p>
          <p className="text-gray-700 leading-relaxed">
            Du er alene ansvarlig for ditt Brukerinnhold og konsekvensene av å legge det ut. Du garanterer at du har alle nødvendige rettigheter til å gi oss lisensen nevnt ovenfor, og at ditt Brukerinnhold ikke krenker tredjeparts rettigheter (inkludert opphavsrett, varemerkerett, personvernrettigheter).
          </p>
           <p className="text-gray-700 leading-relaxed">
            Vi forhåndsskjermer ikke nødvendigvis Brukerinnhold, men forbeholder oss retten til å fjerne eller endre Brukerinnhold etter eget skjønn, uten varsel, dersom det bryter disse Vilkårene eller er på annen måte ansett som upassende.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

         {/* Section 6: Intellectual Property Rights */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Copyright className="w-6 h-6 mr-3 text-purple-600" /> 5. Immaterielle Rettigheter
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Assert ownership of the app, branding, etc. Distinguish from user content.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Tjenesten og dens originale innhold (unntatt Brukerinnhold), funksjoner og funksjonalitet er og vil forbli den eksklusive eiendommen til Diskgolf.app og dets lisensgivere. Tjenesten er beskyttet av opphavsrett, varemerkerett og andre lover i både Norge og utlandet.
          </p>
           <p className="text-gray-700 leading-relaxed">
            Våre varemerker og vår visuelle profil kan ikke brukes i forbindelse med noe produkt eller tjeneste uten vårt skriftlige forhåndssamtykke. Du gis en begrenset, ikke-eksklusiv, ikke-overførbar lisens til å bruke Tjenesten i samsvar med disse Vilkårene, kun for dine personlige, ikke-kommersielle formål.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

         {/* Section 7: Disclaimers of Warranties */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-yellow-500" /> 6. Ansvarsfraskrivelser
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Standard "as is" disclaimer. Crucial for managing expectations and liability. Needs legal validation.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            TJENESTEN LEVERES "SOM DEN ER" OG "SOM TILGJENGELIG", UTEN NOEN FORM FOR GARANTIER, VERKEN UTTRYKTE ELLER UNDERFORSTÅTTE.
          </p>
          <p className="text-gray-700 leading-relaxed">
            UTEN Å BEGRENSE DET FOREGÅENDE, FRASKRIVER VI OSS UTTRYKKELIG ALLE GARANTIER, INKLUDERT, MEN IKKE BEGRENSET TIL, GARANTIER FOR SALGBARHET, EGNETHET FOR ET BESTEMT FORMÅL, IKKE-KRENKELSE, OG GARANTIER SOM FØLGE AV HANDELSPRAKSIS ELLER BRUKSSEDVANE.
          </p>
           <p className="text-gray-700 leading-relaxed">
            Vi garanterer ikke at Tjenesten vil oppfylle dine krav, være tilgjengelig uavbrutt, sikker eller feilfri. Vi garanterer ikke for nøyaktigheten, påliteligheten, fullstendigheten eller aktualiteten til noe innhold (inkludert banedata, scoreberegninger eller brukerinnhold) som er tilgjengelig gjennom Tjenesten. Du bruker Tjenesten og stoler på dens innhold på egen risiko.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 8: Limitation of Liability */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-red-600" /> 7. Ansvarsbegrensning
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Standard limitation of liability clause. Subject to local law variations. Must be reviewed by legal counsel.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            I DEN GRAD LOVEN TILLATER DET, SKAL DISKGOLF.APP, DETS TILKNYTTEDE SELSKAPER, LEDERE, ANSATTE, AGENTER, LEVERANDØRER ELLER LISENSGIVERE UNDER INGEN OMSTENDIGHETER VÆRE ANSVARLIGE FOR NOEN INDIREKTE, TILFELDIGE, SPESIELLE, FØLGESKADER ELLER STRAFFESKADER, ELLER NOE TAP AV FORTJENESTE ELLER INNTEKTER, ENTEN PÅFØRT DIREKTE ELLER INDIREKTE, ELLER NOE TAP AV DATA, BRUK, GOODWILL ELLER ANDRE IMMATERIELLE TAP, SOM FØLGE AV:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4 text-sm">
              <li>Din tilgang til eller bruk av eller manglende evne til å få tilgang til eller bruke Tjenesten;</li>
              <li>Enhver oppførsel eller innhold fra en tredjepart på Tjenesten;</li>
              <li>Ethvert innhold hentet fra Tjenesten; eller</li>
              <li>Uautorisert tilgang, bruk eller endring av dine overføringer eller innhold.</li>
          </ul>
           <p className="text-gray-700 leading-relaxed mt-2">
            Vårt samlede ansvar overfor deg for alle krav knyttet til Tjenesten skal under ingen omstendigheter overstige det beløpet du eventuelt har betalt til oss for bruk av Tjenesten i de siste tolv (12) månedene, eller hundre norske kroner (100 NOK), avhengig av hvilket beløp som er størst.
           </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

         {/* Section 9: Termination */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <XCircle className="w-6 h-6 mr-3 text-orange-600" /> 8. Opphør
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Outline conditions under which access can be terminated.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Vi kan avslutte eller suspendere din tilgang til Tjenesten umiddelbart, uten forvarsel eller ansvar, uansett årsak, inkludert, men ikke begrenset til, hvis du bryter disse Vilkårene.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ved opphør opphører din rett til å bruke Tjenesten umiddelbart. Hvis du ønsker å avslutte kontoen din, kan du ganske enkelt slutte å bruke Tjenesten eller bruke eventuelle funksjoner for kontosletting vi tilbyr.
          </p>
           <p className="text-gray-700 leading-relaxed">
            Alle bestemmelser i Vilkårene som etter sin art skal overleve opphør, skal overleve opphør, inkludert, uten begrensning, eierskapsbestemmelser, garantifraskrivelser, skadesløsholdelse og ansvarsbegrensninger.
           </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 10: Changes to Terms */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <RefreshCw className="w-6 h-6 mr-3 text-cyan-600" /> 9. Endringer i Vilkårene
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Explain how terms updates will be communicated.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Vi forbeholder oss retten til, etter eget skjønn, å endre eller erstatte disse Vilkårene når som helst. Hvis en revisjon er vesentlig, vil vi forsøke å gi minst 30 dagers varsel før de nye vilkårene trer i kraft (f.eks. via varsel i appen eller e-post til registrerte brukere). Hva som utgjør en vesentlig endring vil bli bestemt etter vårt eget skjønn.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ved å fortsette å få tilgang til eller bruke Tjenesten etter at disse revisjonene trer i kraft, godtar du å være bundet av de reviderte vilkårene. Hvis du ikke godtar de nye vilkårene, må du slutte å bruke Tjenesten. Sjekk disse Vilkårene jevnlig for oppdateringer.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 11: Governing Law */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Gavel className="w-6 h-6 mr-3 text-gray-600" /> 10. Lovvalg og Tvisteløsning
          </h2>
          {/* --- LEGAL PLACEHOLDER START ---
              DEV TEAM: Specify governing law (likely Norwegian law) and dispute resolution mechanism. Legal advice crucial here.
          --- LEGAL PLACEHOLDER START --- */}
          <p className="text-gray-700 leading-relaxed">
            Disse Vilkårene skal styres og tolkes i samsvar med lovene i Norge, uten hensyn til dets lovkonfliktbestemmelser.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Eventuelle tvister som oppstår fra eller i forbindelse med disse Vilkårene eller din bruk av Tjenesten, skal søkes løst i minnelighet gjennom forhandlinger. Hvis en minnelig løsning ikke oppnås innen rimelig tid, skal tvisten bringes inn for de ordinære domstolene i Norge, med [Byens Tingrett] som avtalt verneting, med mindre annet følger av ufravikelig lovgivning.
          </p>
          {/* --- LEGAL PLACEHOLDER END --- */}
        </motion.section>

        {/* Section 12: Contact Information */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          // Style matches the contact section on the Privacy Policy page.
          className="text-center bg-gray-100 p-6 sm:p-8 rounded-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4 flex items-center justify-center">
            <Mail className="w-6 h-6 mr-3 text-green-600" /> 11. Kontaktinformasjon
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-xl mx-auto">
            Hvis du har spørsmål om disse Vilkårene for Bruk, vennligst kontakt oss:
          </p>
          {/* DEV NOTE: Update this placeholder email address. */}
          <p className="mt-4 text-lg font-semibold text-green-700 hover:text-green-800">
            <a href="mailto:vilkar@example.diskgolf.app">vilkar@example.diskgolf.app</a>
            {/* Change example.diskgolf.app */}
          </p>
           {/* Optional: Link to general contact page */}
           {/*
           <Link href="/kontakt-oss" passHref legacyBehavior>
                <a className="mt-4 inline-block text-base font-medium text-green-700 hover:text-green-800 underline">
                    Gå til vår kontaktside
                </a>
           </Link>
           */}
        </motion.section>

      </div>
    </div>
  );
}