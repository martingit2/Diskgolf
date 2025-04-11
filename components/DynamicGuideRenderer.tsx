// Fil: src/app/guide/_components/DynamicGuideRenderer.tsx
// Formål: Definerer en React-komponent ('use client') som dynamisk render ulike typer innholdsseksjoner basert på en JSON-databasert struktur ('DynamicContent').
//         Støtter ulike seksjonstyper (Hero, Text, CardGrid, Steps, Etiquette, CTA, etc.), bruker Framer Motion for animasjoner,
//         Next.js Image for bilder, Lucide-ikoner (dynamisk rendret), og Shadcn UI-komponenter (Card, Button).
//         Inkluderer bruk av 'dangerouslySetInnerHTML' for å rendre HTML fra databasen (med forbehold om at innholdet er renset på forhånd).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideProps, icons } from "lucide-react"; // Importer alle ikoner for dynamisk bruk
import Link from "next/link";
import React from "react";

// --- Typer for JSON-innhold (fra forrige svar) ---
// (Inkluder alle interface-definisjonene her: ContentSection, HeroSection, TextSection, CardData, etc.)
interface ContentSection { type: string; /* ... */ }
interface HeroSection extends ContentSection { type: "hero"; icon?: string; title: string; text: string; imageUrl?: string; imageAlt?: string; }
interface TextSection extends ContentSection { type: "section"; icon?: string; title: string; paragraphs: string[]; }
interface CardData { icon?: string; title: string; text: string; color?: string; }
interface TipData { icon?: string; title: string; text: string; }
interface CardGridSection extends ContentSection { type: "cardGrid"; title: string; cards: CardData[]; tip?: TipData; }
interface StepData { title: string; text: string; }
interface StepsSection extends ContentSection { type: "steps"; icon?: string; title: string; steps: StepData[]; }
interface EtiquetteItem { icon?: string; title: string; text: string; color?: string; }
interface EtiquetteSection extends ContentSection { type: "etiquette"; title: string; items: EtiquetteItem[]; }
interface ButtonData { text: string; href: string; variant: "default" | "secondary" | "outline" | "ghost" | "link"; icon?: string; }
interface CallToActionSection extends ContentSection { type: "cta"; title: string; text: string; buttons: ButtonData[]; gradient?: boolean; }
// ... (legg til flere typer etter behov) ...
type DynamicContent = ContentSection[];


// --- Animasjonsvarianter ---
const fadeIn = { /* ... (som før) ... */ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },};
const fadeInDelayed = { /* ... (som før) ... */ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeInOut" } },};

// --- Ikon-Hjelper ---
const LucideIcon = ({ name, ...props }: { name?: string } & LucideProps) => {
  if (!name || !(name in icons)) return null;
  const IconComponent = icons[name as keyof typeof icons];
  return <IconComponent {...props} />;
};

// --- Hoved Renderer Komponent ---
interface DynamicGuideRendererProps {
  content: DynamicContent | any; // Bruk 'any' for nå, men prøv å type den strengere
}

export function DynamicGuideRenderer({ content }: DynamicGuideRendererProps) {
  // --- Sikkerhetsadvarsel for dangerouslySetInnerHTML ---
  console.warn("DynamicGuideRenderer bruker dangerouslySetInnerHTML. Sørg for at HTML-innhold er renset FØR det lagres i databasen for å forhindre XSS!");

  if (!Array.isArray(content)) {
    console.error("DynamicGuideRenderer: Mottok ugyldig innholdsformat. Forventet et array, fikk:", content);
    return <p className="text-red-600 text-center my-10">Feil: Kunne ikke behandle guideinnholdet.</p>;
  }

  // Hjelpefunksjon for rendering av HTML (med XSS-advarsel)
  const renderHTML = (htmlString: string | undefined | null) => {
    // Ideelt sett bør rensing (sanitizing) skje FØR lagring i databasen.
    // Legg KUN inn rensing her som et ekstra lag hvis absolutt nødvendig,
    // da det kan påvirke ytelsen.
    // import DOMPurify from 'isomorphic-dompurify'; // Må installeres
    // const clean = DOMPurify.sanitize(htmlString || '');
    // return { __html: clean };
    return { __html: htmlString || '' }; // Bruker rå HTML - STOL PÅ AT DEN ER RENSET FØR LAGRING
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {content.map((sectionData, index) => {
        // Sikrer at vi har et objekt med en 'type'
        if (typeof sectionData !== 'object' || sectionData === null || !sectionData.type) {
          console.warn(`DynamicGuideRenderer: Hopper over ugyldig seksjon ved indeks ${index}:`, sectionData);
          return null;
        }

        // Bruker type assertion etter å ha sjekket 'type'
        const sectionType = sectionData.type;

        try { // Legg til try/catch rundt hver seksjon for robusthet
          switch (sectionType) {
            case 'hero': {
              const hero = sectionData as HeroSection;
              return (
                <motion.section key={`${sectionType}-${index}`} className="text-center" initial="hidden" animate="visible" variants={fadeIn}>
                  {hero.icon && <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4"> <LucideIcon name={hero.icon} className="w-8 h-8 text-green-700" /> </div>}
                  {hero.title && <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4" dangerouslySetInnerHTML={renderHTML(hero.title)} />}
                  {hero.text && <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto" dangerouslySetInnerHTML={renderHTML(hero.text)} />}
                  {hero.imageUrl && (
                    <div className="mt-10 max-w-4xl mx-auto">
                      <Image src={hero.imageUrl} alt={hero.imageAlt || 'Guide bilde'} width={1200} height={675} className="rounded-xl shadow-2xl object-cover w-full" priority={index === 0} />
                    </div>
                  )}
                </motion.section>
              );
            }

            case 'section': {
              const txtSection = sectionData as TextSection;
              return (
                <motion.section key={`${sectionType}-${index}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn} className="max-w-4xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
                  {txtSection.title && <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
                    {txtSection.icon && <LucideIcon name={txtSection.icon} className="w-8 h-8 mr-3 text-green-600" />}
                    <span dangerouslySetInnerHTML={renderHTML(txtSection.title)} />
                  </h2>}
                  {Array.isArray(txtSection.paragraphs) && txtSection.paragraphs.map((p, pIndex) => (
                    p && <p key={pIndex} className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={renderHTML(p)} />
                  ))}
                </motion.section>
              );
            }

            case 'cardGrid': {
              const grid = sectionData as CardGridSection;
              const getCardColorClasses = (color?: string) => { /* ... (som før) ... */ switch(color){case'blue':return{bg:'bg-blue-100',text:'text-blue-700'};case'yellow':return{bg:'bg-yellow-100',text:'text-yellow-700'};case'red':return{bg:'bg-red-100',text:'text-red-700'};default:return{bg:'bg-gray-100',text:'text-gray-700'};}};
              return (
                 <motion.section key={`${sectionType}-${index}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn} className="max-w-4xl mx-auto">
                    {grid.title && <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12" dangerouslySetInnerHTML={renderHTML(grid.title)} />}
                    {Array.isArray(grid.cards) && <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {grid.cards.map((card, cardIndex) => {
                          if (!card || typeof card !== 'object') return null; // Hopp over ugyldige kort
                          const colors = getCardColorClasses(card.color);
                          return (
                             <motion.div key={cardIndex} variants={fadeInDelayed}>
                                <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl overflow-hidden">
                                   <CardHeader>
                                      {card.icon && <div className={`mx-auto ${colors.bg} rounded-full p-3 w-fit mb-3`}> <LucideIcon name={card.icon} className={`w-7 h-7 ${colors.text}`} /> </div>}
                                      {card.title && <CardTitle className="text-xl font-semibold text-gray-800" dangerouslySetInnerHTML={renderHTML(card.title)} />}
                                   </CardHeader>
                                   {card.text && <CardContent className="pb-6 px-4"> <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={renderHTML(card.text)} /> </CardContent>}
                                </Card>
                             </motion.div>
                          );
                       })}
                    </div>}
                    {grid.tip && typeof grid.tip === 'object' && (
                      <motion.div variants={fadeIn} className="mt-8 text-center p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
                        {grid.tip.title && <h3 className="text-lg font-semibold text-green-800 flex items-center justify-center mb-2">
                          {grid.tip.icon && <LucideIcon name={grid.tip.icon} className="w-5 h-5 mr-2 text-yellow-500" />}
                           <span dangerouslySetInnerHTML={renderHTML(grid.tip.title)} />
                        </h3>}
                        {grid.tip.text && <p className="text-green-700 text-sm" dangerouslySetInnerHTML={renderHTML(grid.tip.text)} />}
                      </motion.div>
                    )}
                 </motion.section>
              );
           }

            case 'steps': {
              const stepsSection = sectionData as StepsSection;
              return (
                <motion.section key={`${sectionType}-${index}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn} className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
                  {stepsSection.title && <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center mb-8">
                    {stepsSection.icon && <LucideIcon name={stepsSection.icon} className="w-8 h-8 mr-3 text-purple-600" />}
                    <span dangerouslySetInnerHTML={renderHTML(stepsSection.title)} />
                  </h2>}
                  {Array.isArray(stepsSection.steps) && stepsSection.steps.map((step, stepIndex) => {
                     if (!step || typeof step !== 'object') return null;
                     return (
                      <div key={stepIndex} className="flex items-start space-x-4">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">{stepIndex + 1}</div>
                        <div>
                          {step.title && <h3 className="text-xl font-semibold text-gray-800 mb-1" dangerouslySetInnerHTML={renderHTML(step.title)} />}
                          {step.text && <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={renderHTML(step.text)} />}
                        </div>
                      </div>
                     );
                  })}
                </motion.section>
              );
            }

            case 'etiquette': {
               const etiquetteSection = sectionData as EtiquetteSection;
               const getEtiquetteColorClasses = (color?: string) => { /* ... (som før) ... */ switch(color){case'red':return{bg:'bg-red-100',text:'text-red-600'};case'blue':return{bg:'bg-blue-100',text:'text-blue-600'};case'green':return{bg:'bg-green-100',text:'text-green-600'};default:return{bg:'bg-gray-100',text:'text-gray-600'};}};
               return (
                 <motion.section key={`${sectionType}-${index}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn} className="max-w-4xl mx-auto">
                   {etiquetteSection.title && <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12" dangerouslySetInnerHTML={renderHTML(etiquetteSection.title)} />}
                   {Array.isArray(etiquetteSection.items) && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {etiquetteSection.items.map((item, itemIndex) => {
                       if (!item || typeof item !== 'object') return null;
                       const colors = getEtiquetteColorClasses(item.color);
                       return (
                         <motion.div key={itemIndex} variants={fadeInDelayed} className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                           {item.icon && <div className={`mb-4 inline-flex items-center justify-center p-3 ${colors.bg} rounded-full`}> <LucideIcon name={item.icon} className={`w-7 h-7 ${colors.text}`} /> </div>}
                           {item.title && <h3 className="text-lg font-semibold text-gray-800 mb-2" dangerouslySetInnerHTML={renderHTML(item.title)} />}
                           {item.text && <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={renderHTML(item.text)} />}
                         </motion.div>
                       );
                     })}
                   </div>}
                 </motion.section>
               );
            }

             case 'cta': {
                const cta = sectionData as CallToActionSection;
                const bgClass = cta.gradient ? "bg-gradient-to-r from-green-500 via-green-900 to-green-500" : "bg-gray-100";
                const textClass = cta.gradient ? "text-white" : "text-gray-900";
                const subTextClass = cta.gradient ? "text-green-100" : "text-gray-700";

                return (
                    <motion.section
                        key={`${sectionType}-${index}`}
                        className={`text-center rounded-xl p-10 sm:p-16 shadow-xl mt-12 ${bgClass}`}
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn}
                    >
                        {cta.title && <h2 className={`text-3xl sm:text-4xl font-bold ${textClass} tracking-tight mb-6`} dangerouslySetInnerHTML={renderHTML(cta.title)} />}
                        {cta.text && <p className={`text-lg ${subTextClass} mb-8 max-w-2xl mx-auto`} dangerouslySetInnerHTML={renderHTML(cta.text)} />}
                        {Array.isArray(cta.buttons) && <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            {cta.buttons.map((button, btnIndex) => {
                               if (!button || typeof button !== 'object') return null;
                               return (
                                <Link key={btnIndex} href={button.href || '#'} passHref legacyBehavior>
                                    <a className="block w-full sm:w-auto">
                                        <Button size="lg" variant={button.variant} className={`w-full text-lg shadow-md px-8 py-3 font-semibold ${ button.variant === 'secondary' && cta.gradient ? 'bg-white text-green-700 hover:bg-gray-100' : button.variant === 'outline' && cta.gradient ? 'bg-transparent border-white text-white hover:bg-white/10' : '' }`}>
                                            {button.icon && <LucideIcon name={button.icon} className="w-5 h-5 mr-2" />}
                                            {button.text}
                                        </Button>
                                    </a>
                                </Link>
                               );
                           })}
                        </div>}
                    </motion.section>
                );
            }


            // --- Legg til flere 'case' for andre seksjonstyper ---

            default:
              console.warn(`DynamicGuideRenderer: Ukjent seksjonstype "${sectionType}" ved indeks ${index}.`);
              return <div key={`${sectionType}-${index}`} className="my-4 p-4 border border-dashed border-red-300 bg-red-50 text-red-700">Ukjent innholdsseksjon: {sectionType}</div>; // Vis en markør for ukjent type
          }
        } catch (renderError) {
             console.error(`DynamicGuideRenderer: Feil under rendering av seksjon type "${sectionType}" ved indeks ${index}:`, renderError);
              return <div key={`error-${index}`} className="my-4 p-4 border border-dashed border-red-300 bg-red-50 text-red-700">Feil ved lasting av denne seksjonen.</div>; // Feilmelding for denne seksjonen
        }
      })}
    </div>
  );
}