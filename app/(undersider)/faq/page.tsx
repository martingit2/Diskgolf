// src/app/faq/page.tsx
"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, Search, PlayCircle, BarChart, Users, Bug, Shield, Star } from "lucide-react"; // Relevant icons for FAQ topics
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Consistent animation variants used across the site.
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Data structure for FAQ items. id is used for the Accordion key/value.
// DEV NOTE: Keep questions concise and answers clear. Link to relevant sections/pages if needed.
const faqData = [
  {
    id: "faq-general-1",
    question: "Hva er Diskgolf.app?",
    answer: "Diskgolf.app er en mobilapplikasjon og nettside designet for å forbedre discgolf-opplevelsen din. Du kan finne baner, registrere scorekort, følge med på statistikken din, delta i turneringer og koble deg med andre spillere.",
    icon: HelpCircle,
  },
  {
    id: "faq-courses-1",
    question: "Hvordan finner jeg discgolfbaner i appen?",
    answer: "Gå til 'Baner'-seksjonen i appen. Du kan søke etter banenavn, by eller se baner i nærheten av din nåværende posisjon (hvis du har gitt posisjonstilgang). Hver bane har detaljert informasjon som layout, par, anmeldelser og veibeskrivelser.",
    icon: Search,
  },
    {
    id: "faq-courses-2",
    question: "Banedataene virker feil (par, lengde, layout). Hva gjør jeg?",
    answer: ( // Using JSX here for better formatting control with links
        <>
            <p className="mb-2">Vi jobber kontinuerlig med å holde banedata oppdatert, men feil kan forekomme da baner endres. </p>
            <p className="mb-2">Du kan vanligvis foreslå endringer direkte på banesiden i appen (se etter en 'Rapporter feil' eller 'Foreslå endring'-knapp). Alternativt kan du <Link href="/kontakt-oss" className="text-green-600 hover:underline">kontakte oss</Link> med detaljene, så ser vi på det så snart som mulig.</p>
        </>
    ),
    icon: Bug,
  },
  {
    id: "faq-scoring-1",
    question: "Hvordan registrerer jeg en runde?",
    answer: "Velg banen du vil spille, trykk 'Start spill', velg alenespill eller opprett rom for å spille med eventuelle medspillere. Deretter fører du score hull for hull. Appen beregner totalscore og statistikk automatisk. Husk å lagre runden når du er ferdig.",
    icon: PlayCircle,
  },
   {
    id: "faq-scoring-2",
    question: "Kan jeg redigere et scorekort etter at runden er lagret?",
    answer: "Ja, du kan vanligvis redigere scoren på en lagret runde i en begrenset periode etter at den ble fullført. Gå til dine 'Runder' eller 'Aktivitet'-logg, finn runden og se etter en redigeringsmulighet.",
    icon: PlayCircle,
  },
  {
    id: "faq-stats-1",
    question: "Hvilken statistikk sporer appen?",
    answer: "Appen sporer grunnleggende statistikk som gjennomsnittsscore per bane, personlige rekorder, antall kast, pars, ob osv. basert på dine registrerte runder. Mer avansert statistikk kan bli lagt til i fremtidige oppdateringer.",
    icon: BarChart,
  },
  {
    id: "faq-social-1",
    question: "Hvordan spiller jeg med venner?",
    answer: "I baneseksjonen kan du søke etter baner eller opprette et eget spillrom. Når rommet er opprettet, kan andre spillere se det og bli med. Du har også mulighet til å sette et passord på rommet for å begrense tilgangen. Spillet starter når alle deltakere har trykket på 'klar'-knappen.",
    icon: Users,
  },
   {
    id: "faq-cost-1",
    question: "Er Diskgolf.app gratis å bruke?",
    answer: "Kjernefunksjonaliteten i Diskgolf.app, som å finne baner og registrere runder, er gratis. Vi kan i fremtiden tilby valgfrie premium-funksjoner eller abonnementer for avansert statistikk, reklamefri opplevelse eller andre fordeler.",
    icon: Star, // Star can represent premium/cost
  },
  {
    id: "faq-privacy-1",
    question: "Hvordan håndterer dere personvernet mitt?",
    answer: ( // Example using JSX and Link component within the answer
        <p>
            Vi tar personvern på alvor. All informasjon om hvordan vi samler inn, bruker og beskytter dataene dine finner du i vår detaljerte <Link href="/personvern" className="text-green-600 hover:underline">Personvernerklæring</Link>.
        </p>
    ),
    icon: Shield, // Shield for privacy/security
  },

];

// Main component definition for the FAQ page.
export default function FaqPage() {
  return (
    // Standard page container with gradient background and padding.
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Centered content wrapper, using max-w-4xl which works well for FAQs too. */}
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">

        {/* Section 1: Page Header */}
        <motion.section
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Decorative icon for the FAQ page. */}
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
             <HelpCircle className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Ofte Stilte Spørsmål (FAQ)
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Finner du ikke svaret du leter etter? Ikke nøl med å ta kontakt med oss.
          </p>
        </motion.section>

        {/* Section 2: FAQ Accordion List */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Trigger when slightly visible
          variants={fadeIn}
        >
          {/* Subheading for the FAQ list */}
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-10 sm:mb-12">
             Svar på dine spørsmål
          </h2>
          {/* Accordion component to display Q&A interactively.
              type="single" allows only one item open at a time.
              collapsible allows closing the open item.
              Added space-y-4 for spacing between accordion items. */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((item) => (
              // Each FAQ item is wrapped in AccordionItem.
              // Added styling for background, border, rounded corners, and shadow.
              <AccordionItem
                 key={item.id}
                 value={item.id}
                 className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                 {/* The clickable part that shows the question. */}
                 <AccordionTrigger className="flex items-center w-full text-left font-semibold text-lg text-gray-800 px-6 py-4 hover:bg-gray-50/80 transition-colors data-[state=open]:bg-gray-50/80">
                    {/* Optional: Include the icon within the trigger */}
                    {item.icon && <item.icon className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />}
                    <span className="flex-grow">{item.question}</span>
                    {/* Default chevron is handled by shadcn component */}
                 </AccordionTrigger>
                 {/* The content (answer) that expands/collapses. */}
                 <AccordionContent className="px-6 pb-5 pt-1 text-gray-600 leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    {/* Render the answer directly. Supports JSX for links/paragraphs. */}
                   {item.answer}
                 </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* Section 3: "Still Have Questions?" Call to Action */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Trigger when more visible
          variants={fadeIn}
          // Using a slightly different background for visual separation.
          className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-8 sm:p-10 rounded-xl border border-gray-100 shadow-sm"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-4">
            Fikk du ikke svar?
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto mb-6">
            Vårt supportteam er klare til å hjelpe deg. Send oss en melding via kontaktskjemaet, så svarer vi så fort vi kan.
          </p>
          {/* Button linking directly to the contact page. */}
          <Link href="/kontakt-oss" passHref legacyBehavior>
             <a> {/* Use anchor tag for legacyBehavior */}
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg">
                    <Mail className="w-5 h-5 mr-2" /> Kontakt Oss
                </Button>
             </a>
          </Link>
        </motion.section>

      </div>
    </div>
  );
}