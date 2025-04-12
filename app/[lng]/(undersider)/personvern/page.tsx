// Fil: src/app/personvern/page.tsx
// Formål: Viser personvernerklæringen for Diskgolf.app, inkludert generell informasjon om cookie-bruk og rettigheter.
// Detaljert cookie-informasjon og samtykkeadministrasjon håndteres av Cookiebot-widgeten.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use client";

import { motion } from "framer-motion";
import { Shield, Info, Database, Cookie, UserCheck, Mail, FileText, Calendar, Users } from "lucide-react";
import Link from "next/link"; // Importer Link for intern navigasjon hvis det brukes andre steder

// Animasjonsvarianter for seksjoner
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export default function PrivacyPolicyPage() {
  // Husk å oppdatere denne datoen ved vesentlige endringer i personvernerklæringen.
  const lastUpdatedDate = "15. feb 2025";

  return (
    // Hovedcontainer for siden
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Innholdscontainer med maks bredde */}
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">

        {/* Seksjon 1: Overskrift og introduksjon */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
             <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Personvernerklæring
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Din tillit er viktig for oss i <span className="font-semibold text-green-600">Diskgolf.app</span>. Denne erklæringen forklarer hvordan vi samler inn, bruker og beskytter dine personopplysninger.
          </p>
          <p className="mt-2 text-sm text-gray-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-1.5" /> Sist oppdatert: {lastUpdatedDate}
          </p>
        </motion.section>

        {/* Seksjon 2: Generelt om behandlingen */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Animeres når 20% er synlig
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

        {/* Seksjon 3: Hvilken informasjon samler vi inn? */}
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
          {/* Gjennomgå og oppdater denne listen for å reflektere nøyaktig datainnsamling */}
          <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
            <li><span className="font-semibold">Kontoinformasjon:</span> Navn, e-post, brukernavn, hashet passord, evt. profilbilde-URL, hjemmebane-ID.</li>
            <li><span className="font-semibold">Bruksdata:</span> Scorekort, rundehistorikk, favorittbaner, rekorder, statistikk, sosiale interaksjoner (venner, turneringer).</li>
            <li><span className="font-semibold">Posisjonsdata (ved samtykke):</span> Omtrentlig/nøyaktig posisjon for funksjoner som "baner i nærheten".</li>
            <li><span className="font-semibold">Teknisk informasjon:</span> Enhetstype, OS, anonymisert IP, nettleser, app-versjon (for feilsøking/analyse).</li>
            <li><span className="font-semibold">Kommunikasjon:</span> Innhold fra supporthenvendelser (e-post, kontaktskjema).</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4 text-sm italic">
             Merk: Faktisk innsamling avhenger av funksjoner du bruker og tillatelser gitt.
          </p>
        </motion.section>

        {/* Seksjon 4: Hvordan bruker vi informasjonen? */}
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
                Den innsamlede informasjonen brukes til følgende formål:
            </p>
            {/* Sørg for at disse bruksområdene har et gyldig behandlingsgrunnlag (GDPR) */}
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li>Levere kjernetjenester (brukerprofil, scorekort, banesøk etc.).</li>
                <li>Tilpasse brukeropplevelsen (relevant innhold).</li>
                <li>Beregne og vise statistikk og progresjon.</li>
                <li>Kommunisere med deg (tjenestemeldinger, support, evt. nyhetsbrev ved samtykke).</li>
                <li>Analysere og forbedre tjenesten (anonymisert/aggregert data).</li>
                <li>Sikre tjenesten (overvåke misbruk, uautorisert tilgang).</li>
                <li>Oppfylle juridiske forpliktelser.</li>
            </ul>
        </motion.section>

        {/* Seksjon 5: Hvordan deler vi informasjonen? */}
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
             <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li><span className="font-semibold">Med ditt samtykke:</span> F.eks. ved kobling til tredjepartstjenester.</li>
                <li><span className="font-semibold">Tjenesteleverandører (Databehandlere):</span> Nødvendige tredjeparter for drift (hosting, analyse, support, e-post). Disse er kontraktuelt forpliktet til å beskytte dataene. Eksempler inkluderer:
                    <ul className="list-circle list-inside space-y-1 text-gray-600 pl-6 mt-1">
                        <li>Skylagring/Hosting: Heroku</li>
                        <li>Analyse: Google Analytics (anonymisert), Plausible Analytics</li>
                        <li>E-post: Resend</li>
                    </ul>
                </li>
                <li><span className="font-semibold">Juridiske årsaker:</span> Ved lovpålagte krav eller for å beskytte rettigheter.</li>
                <li><span className="font-semibold">Fellesskapsfunksjoner:</span> Brukernavn/score på ledertavler, venneaktivitet (om aktivert). Synlighet kan ofte justeres.</li>
                <li><span className="font-semibold">Anonymisert/Aggregert Data:</span> Ikke-identifiserbar data kan deles.</li>
            </ul>
        </motion.section>

        {/* Seksjon 6: Informasjonskapsler (Cookies) & Samtykke */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
            <Cookie className="w-6 h-6 mr-3 text-orange-500" /> Informasjonskapsler & Samtykke
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Vi bruker informasjonskapsler (cookies) og lignende teknologier for å få nettstedet til å fungere, huske dine preferanser, og samle inn analysedata basert på ditt samtykke.
          </p>
           <p className="text-gray-700 leading-relaxed">
             Dette inkluderer typisk følgende kategorier (avhengig av ditt samtykke):
           </p>
           <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4 mt-1">
               <li><span className="font-semibold">Nødvendige:</span> For grunnleggende funksjonalitet og sikkerhet (krever ikke samtykke).</li>
               <li><span className="font-semibold">Preferanser:</span> For å huske dine valg (f.eks. språk).</li>
               <li><span className="font-semibold">Statistikk:</span> For anonymisert analyse av nettstedbruk.</li>
               <li><span className="font-semibold">Markedsføring:</span> For å tilpasse innhold (brukes begrenset).</li>
           </ul>
           <p className="text-gray-700 leading-relaxed mt-4">
              En detaljert oversikt over alle informasjonskapsler, deres formål, og muligheten til å administrere dine samtykkevalg, finner du i cookie-innstillingene som er tilgjengelige via Cookiebot-widgeten/banneret på nettstedet.
           </p>
           <p className="text-gray-700 leading-relaxed mt-2 text-sm">
              Du kan også administrere informasjonskapsler via innstillingene i nettleseren din, men dette kan påvirke nettstedets funksjonalitet.
           </p>
        </motion.section>

        {/* Seksjon 7: Dine Rettigheter */}
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
            I henhold til personvernlovgivningen (som GDPR) har du flere rettigheter knyttet til dine personopplysninger:
          </p>
           <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                <li>Rett til <span className="font-semibold">innsyn</span> i dataene vi har om deg.</li>
                <li>Rett til <span className="font-semibold">retting</span> av uriktige data.</li>
                <li>Rett til <span className="font-semibold">sletting</span> ("retten til å bli glemt") under visse vilkår.</li>
                <li>Rett til <span className="font-semibold">begrensning</span> av behandlingen.</li>
                <li>Rett til å <span className="font-semibold">protestere</span> mot behandling basert på legitime interesser.</li>
                <li>Rett til <span className="font-semibold">dataportabilitet</span> (motta data i maskinlesbart format).</li>
                <li>Rett til å <span className="font-semibold">trekke tilbake samtykke</span> når som helst (via cookie-innstillingene eller ved å kontakte oss).</li>
            </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Noen innstillinger kan administreres via din brukerprofil. For andre henvendelser, kontakt oss. Du har også rett til å klage til <a href="https://www.datatilsynet.no/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Datatilsynet</a> hvis du mener vår behandling er ulovlig.
          </p>
        </motion.section>

        {/* Seksjon 8: Datasikkerhet og Oppbevaring */}
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
                Vi implementerer tekniske og organisatoriske sikkerhetstiltak (f.eks. kryptering, tilgangskontroll) for å beskytte dine data. Ingen systemer er 100% sikre.
             </p>
             <p className="text-gray-700 leading-relaxed">
                Vi oppbevarer personopplysninger kun så lenge det er nødvendig for formålene de ble samlet inn for, for å levere tjenesten, eller som påkrevd av lov. Data knyttet til inaktive kontoer kan slettes/anonymiseres etter en rimelig periode.
             </p>
         </motion.section>

        {/* Seksjon 9: Endringer i Denne Erklæringen */}
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
            Vi kan oppdatere denne personvernerklæringen ved endringer i teknologi, praksis eller lovverk. Gjeldende versjon vil alltid være tilgjengelig her, merket med "Sist oppdatert"-dato. Ved vesentlige endringer vil vi varsle deg på egnet måte.
          </p>
        </motion.section>

        {/* Seksjon 10: Kontaktinformasjon */}
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
            Har du spørsmål om personvern eller dine rettigheter? Kontakt oss på:
          </p>
          {/* Oppdater til en reell og overvåket e-postadresse for personvernhenvendelser */}
          <p className="mt-4 text-lg font-semibold text-green-700 hover:text-green-800">
            <a href="mailto:personvern@example.diskgolf.app">personvern@example.diskgolf.app</a>
          </p>
        </motion.section>

      </div>
    </div>
  );
}