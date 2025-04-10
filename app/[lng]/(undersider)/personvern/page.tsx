// src/app/personvern/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Info, Database, Cookie, UserCheck, Mail, FileText, Calendar, Users } from "lucide-react";
import Link from "next/link";

// Shared animation variants for consistent page transitions
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Main component definition for the Privacy Policy page.
export default function PrivacyPolicyPage() {
  // NOTE: Remember to update this date whenever the policy changes significantly.
  const lastUpdatedDate = "15. feb 2025";

  return (
    // Page container with vertical gradient background and padding
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Centered content container, max-width optimized for readability */}
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">

        {/* Section 1: Page Header and Introduction */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Decorative icon wrapper */}
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
             <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Personvernerklæring
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Din tillit er viktig for oss i <span className="font-semibold text-green-600">Diskgolf.app</span>. Denne erklæringen forklarer hvordan vi samler inn, bruker og beskytter dine personopplysninger.
          </p>
          {/* Display the last updated date */}
          <p className="mt-2 text-sm text-gray-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-1.5" /> Sist oppdatert: {lastUpdatedDate}
          </p>
        </motion.section>

        {/* Section 2: General Information about Data Processing */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          // Trigger animation when 20% of the element is in view, only once
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Info className="w-6 h-6 mr-3 text-blue-500" /> Generelt om Behandlingen
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Diskgolf.app ("vi", "oss", "vår") er behandlingsansvarlig for personopplysningene som samles inn gjennom vår applikasjon og nettside. Denne personvernerklæringen beskriver hvilke opplysninger vi samler inn, hvorfor vi samler dem inn, hvordan de brukes, og hvilke rettigheter du har knyttet til dine data.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ved å ta i bruk Diskgolf.app, aksepterer du vilkårene beskrevet i denne erklæringen.
          </p>
        </motion.section>

        {/* Section 3: Details on Collected Information */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Database className="w-6 h-6 mr-3 text-green-600" /> Hvilken Informasjon Samler Vi Inn?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Vi samler inn informasjon for å kunne tilby og forbedre tjenestene våre. Dette inkluderer typisk:
          </p>
          {/* --- DUMMY DATA START ---
              NOTE FOR DEVS: This is example data. Review and update this list
              to accurately reflect *exactly* what data our application collects.
              Consult legal advice if unsure about categorization or necessity.
          --- DUMMY DATA START --- */}
          <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
            <li><span className="font-semibold">Kontoinformasjon:</span> Ditt navn, e-postadresse, valgt brukernavn, et hashet/kryptert passord, og eventuelt profilbilde-URL og ID for din valgte hjemmebane.</li>
            <li><span className="font-semibold">Bruksdata:</span> Scorekortdata (hullscorer, totalscore, bane-ID, dato), loggede runder, baner du har spilt eller lagret som favoritt, personlige rekorder, statistikk (f.eks. puttprosent, fairway treff - hvis implementert), interaksjoner som venneforespørsler eller deltakelse i turneringer.</li>
            <li><span className="font-semibold">Posisjonsdata:</span> Kun hvis du aktivt gir tillatelse i appen: omtrentlig eller nøyaktig posisjon for å vise baner i nærheten, eller for å bekrefte posisjon ved innsjekk på en bane (valgfritt).</li>
            <li><span className="font-semibold">Teknisk informasjon:</span> Enhetstype (mobil/desktop), operativsystem (iOS/Android/Windows), IP-adresse (kan anonymiseres), generell nettlesertype (Chrome/Safari), app-versjonsnummer. Brukes primært for feilsøking og analyse av teknisk ytelse.</li>
            <li><span className="font-semibold">Kommunikasjon:</span> Innholdet i henvendelser sendt til vår support (f.eks. via e-post eller kontaktskjema), inkludert din e-postadresse og navnet du oppgir.</li>
          </ul>
           {/* --- DUMMY DATA END --- */}
          <p className="text-gray-700 leading-relaxed mt-4 text-sm italic">
             Husk: Den faktiske innsamlingen avhenger av funksjonene du bruker og tillatelsene du gir.
          </p>
        </motion.section>

        {/* Section 4: How Collected Information is Used */}
         <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                <FileText className="w-6 h-6 mr-3 text-purple-600" /> Hvordan Bruker Vi Informasjonen?
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Vi bruker den innsamlede informasjonen til følgende formål:
            </p>
            {/* --- DUMMY DATA START ---
                NOTE FOR DEVS: This list outlines intended uses. Ensure these align
                with actual practices and legal basis (e.g., necessity for contract,
                legitimate interest, consent). Be specific and transparent.
            --- DUMMY DATA START --- */}
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li>Levere kjernetjenester: Muliggjøre opprettelse av brukerprofil, lagring og visning av scorekort, søk etter baner, og deltakelse i fellesskapsfunksjoner.</li>
                <li>Tilpasse opplevelsen: Vise relevant innhold, som nærliggende baner (hvis posisjon er delt) eller venners aktivitet.</li>
                <li>Statistikk og Progresjon: Beregne og vise din spillestatistikk og historiske utvikling.</li>
                <li>Kommunikasjon: Sende nødvendige tjenestemeldinger (f.eks. passord-reset), og eventuelt nyhetsbrev eller informasjon om nye funksjoner (krever ofte eget samtykke/opt-out). Svare på supporthenvendelser.</li>
                <li>Analyse og Forbedring: Bruke anonymisert eller aggregert data for å forstå bruksmønstre, identifisere populære funksjoner, feilsøke og forbedre appens ytelse og brukervennlighet.</li>
                <li>Sikkerhet: Overvåke for og forhindre misbruk, spam eller uautorisert tilgang.</li>
                <li>Juridiske Forpliktelser: Oppfylle krav i henhold til gjeldende lovverk.</li>
            </ul>
            {/* --- DUMMY DATA END --- */}
        </motion.section>

        {/* Section 5: Information Sharing Practices */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                <Users className="w-6 h-6 mr-3 text-yellow-600" /> Hvordan Deler Vi Informasjonen?
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Vi selger aldri dine personopplysninger. Deling skjer kun i begrensede tilfeller:
            </p>
            {/* --- DUMMY DATA START ---
                NOTE FOR DEVS: Be explicit about *what* is shared, *with whom* (categories
                are often sufficient), and *why*. Ensure Data Processing Agreements (DPAs)
                are in place with all third-party processors handling personal data.
            --- DUMMY DATA START --- */}
             <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li><span className="font-semibold">Med ditt samtykke:</span> F.eks. hvis du velger å koble kontoen din til en tredjepartstjeneste.</li>
                <li><span className="font-semibold">Tjenesteleverandører (Databehandlere):</span> Vi bruker tredjeparter for nødvendige tjenester som:
                    <ul className="list-circle list-inside space-y-1 text-gray-600 pl-6 mt-1">
                        <li>Skylagring og hosting (f.eks. AWS, Google Cloud, Vercel)</li>
                        <li>Analyse (f.eks. Google Analytics - med anonymisering/IP-maskering aktivert, Plausible Analytics)</li>
                        <li>Kundestøtteplattformer (f.eks. Zendesk, Intercom)</li>
                        <li>E-postutsending (for systemmeldinger, f.eks. SendGrid, Mailgun)</li>
                    </ul>
                    Disse har kun tilgang til dataen de trenger for å utføre sine oppgaver for oss, og er kontraktuelt forpliktet til å beskytte den.
                </li>
                <li><span className="font-semibold">Juridiske årsaker:</span> Om nødvendig for å etterkomme lover, reguleringer, stevninger eller myndighetskrav.</li>
                <li><span className="font-semibold">Beskyttelse av Rettigheter:</span> For å håndheve våre vilkår, beskytte vår eller andres sikkerhet, rettigheter eller eiendom.</li>
                 <li><span className="font-semibold">Fellesskapsfunksjoner:</span> Ditt brukernavn og score kan vises på offentlige ledertavler for baner eller turneringer du deltar i. Venners aktivitet kan vises i en feed hvis du kobler deg til venner. Du kan ofte styre synligheten i profilinnstillingene.</li>
                 <li><span className="font-semibold">Anonymisert/Aggregert Data:</span> Vi kan dele data som ikke kan identifisere deg (f.eks. generell bruksstatistikk for sporten) med partnere eller offentligheten.</li>
            </ul>
             {/* --- DUMMY DATA END --- */}
        </motion.section>

        {/* Section 6: Cookie Policy Summary */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Cookie className="w-6 h-6 mr-3 text-orange-500" /> Informasjonskapsler (Cookies)
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Vi bruker informasjonskapsler (små tekstfiler lagret på din enhet) og lignende teknologier (som Local Storage) for å få nettstedet og appen til å fungere korrekt, huske dine preferanser (f.eks. innlogging), og samle inn grunnleggende analysedata.
          </p>
          {/* --- DUMMY DATA START ---
              NOTE FOR DEVS: This is a basic summary. If cookie usage is extensive
              (especially for tracking/advertising), a separate, detailed Cookie Policy
              linked from here, possibly with a consent management tool, is recommended.
          --- DUMMY DATA START --- */}
           {/* KORRIGERT SEKSJON STARTER HER */}
           <p className="text-gray-700 leading-relaxed">
             Dette inkluderer:
           </p>
           <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4 mt-1">
               <li><span className="font-semibold">Nødvendige cookies:</span> For grunnleggende funksjonalitet som innlogging og sikkerhet.</li>
               <li><span className="font-semibold">Preferanse-cookies:</span> For å huske valg du gjør (f.eks. språk, visningsinnstillinger).</li>
               <li><span className="font-semibold">Analyse-cookies:</span> For å samle inn anonymisert statistikk om hvordan tjenesten brukes (f.eks. hvilke sider som besøkes mest). Vi bruker ikke cookies for målrettet reklame.</li>
           </ul>
           <p className="text-gray-700 leading-relaxed mt-4"> {/* Lagt til mt-4 for litt avstand */}
              Du kan vanligvis administrere cookies via nettleserinnstillingene dine.
           </p>
           {/* KORRIGERT SEKSJON SLUTTER HER */}
            {/* --- DUMMY DATA END --- */}
        </motion.section>

        {/* Section 7: User Rights under GDPR/Privacy Laws */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <UserCheck className="w-6 h-6 mr-3 text-teal-600" /> Dine Rettigheter
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Avhengig av din lokasjon (spesielt innenfor EØS/GDPR), har du rettigheter knyttet til dine personopplysninger. Dette inkluderer vanligvis retten til:
          </p>
           <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                <li><span className="font-semibold">Innsyn:</span> Få en kopi av dataene vi har om deg.</li>
                <li><span className="font-semibold">Retting:</span> Korrigere uriktige data.</li>
                <li><span className="font-semibold">Sletting:</span> Be om at dataene dine slettes ("retten til å bli glemt") under visse betingelser.</li>
                <li><span className="font-semibold">Begrensning:</span> Be om at behandlingen av dataene dine begrenses.</li>
                <li><span className="font-semibold">Protest:</span> Protestere mot behandling basert på våre legitime interesser.</li>
                <li><span className="font-semibold">Dataportabilitet:</span> Motta dataene dine i et strukturert, maskinlesbart format.</li>
            </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Du kan ofte administrere noe av dette selv via profilinnstillingene i appen. For andre henvendelser, kontakt oss via informasjonen nedenfor. Du har også rett til å klage til relevant datatilsynsmyndighet (i Norge er dette Datatilsynet) hvis du mener vår behandling er ulovlig.
          </p>
        </motion.section>

        {/* Section 8: Data Security and Retention */}
         <motion.section
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, amount: 0.2 }}
             variants={fadeIn}
             className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
         >
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-600" /> Datasikkerhet og Oppbevaring
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Vi implementerer tekniske og organisatoriske sikkerhetstiltak for å beskytte dine data, inkludert kryptering der det er hensiktsmessig (f.eks. passord, data under overføring via HTTPS), tilgangskontroll, og regelmessige sikkerhetsvurderinger. Ingen system er dog 100% sikkert.
             </p>
             <p className="text-gray-700 leading-relaxed">
                Vi oppbevarer personopplysninger kun så lenge det er nødvendig for formålene beskrevet her, for å levere tjenesten til deg, eller som påkrevd av lov (f.eks. regnskapslovgivning). Data knyttet til inaktive kontoer kan slettes eller anonymiseres etter en viss periode. Scorekort og rundedata beholdes vanligvis så lenge kontoen din er aktiv.
             </p>
         </motion.section>

        {/* Section 9: Policy Updates */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
           <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Info className="w-6 h-6 mr-3 text-gray-500" /> Endringer i Denne Erklæringen
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Teknologi og lovverk endres. Vi kan derfor oppdatere denne personvernerklæringen. Den gjeldende versjonen vil alltid være tilgjengelig her (og i appen), merket med "Sist oppdatert"-datoen øverst. Ved vesentlige endringer (f.eks. endret bruk av data, nye delingspraksiser) vil vi varsle deg direkte i appen eller via e-post.
          </p>
        </motion.section>

        {/* Section 10: Contact Information */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="text-center bg-gray-100 p-6 sm:p-8 rounded-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4 flex items-center justify-center">
            <Mail className="w-6 h-6 mr-3 text-green-600" /> Kontakt Oss
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-xl mx-auto">
            Har du spørsmål om personvern, dine rettigheter, eller hvordan vi behandler data? Ta kontakt med oss:
          </p>
          {/* Placeholder contact email for privacy inquiries. Ensure this is updated to a monitored address. */}
          <p className="mt-4 text-lg font-semibold text-green-700 hover:text-green-800">
            <a href="mailto:personvern@example.diskgolf.app">personvern@example.diskgolf.app</a>
            {/* Consider changing example.diskgolf.app to your actual domain */}
          </p>
           {/* Optional: Link to a general contact page if preferred */}
           {/*
           <Link href="/kontakt-oss" passHref legacyBehavior>
                <a className="mt-4 inline-block text-base font-medium text-green-700 hover:text-green-800 underline">
                    Eller bruk vårt kontaktskjema
                </a>
           </Link>
           */}
        </motion.section>

      </div>
    </div>
  );
}