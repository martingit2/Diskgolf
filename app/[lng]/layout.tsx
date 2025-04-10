/**
 * Filnavn: layout.tsx (app/[lng]/layout.tsx)
 * Beskrivelse: Hovedlayout for applikasjonen. Definerer global HTML-struktur,
 *              inkluderer globale providers (Session, Toaster, i18n), Header og Footer.
 * Utvikler: Martin Pettersen
 */

import type { Metadata, Viewport } from "next";
import "../globals.css";
import { dir } from 'i18next';
import { serverUseTranslation } from '@/app/lib/i18n'; // Sørg for at denne er korrekt konfigurert for server-side fil-lasting
import TranslationsProvider from '../providers/TranslationsProvider';
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "../providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import { auth } from "@/auth";
import SessionWrapper from "../providers/SessionWrapper";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { defaultNS, languages, fallbackLng } from "../lib/i18n/settings"; // La til fallbackLng

// Metadata og Viewport

export const metadata: Metadata = { /* ...metadata... */ };
export const viewport: Viewport = { /* ...viewport... */ };

// Genererer statiske parametere for hver språkversjon
export async function generateStaticParams() {
  // Sikrer at kun gyldige språk blir brukt for generering
  return languages.filter(lng => lng !== 'cimode').map((lng) => ({ lng }));
}


// RootLayout komponent
export default async function RootLayout({
  children,
  params // Motta HELE params-objektet
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  // Hent ut språkkoden INNE i funksjonen - Dette er standard praksis
  const lng = params.lng;

  // Valider språkkode (valgfritt, men anbefalt)
  if (!languages.includes(lng)) {
     console.warn(`Ugyldig språkkode mottatt i RootLayout: ${lng}. Bruker fallback: ${fallbackLng}`);
     // Håndter dette mer robust ved behov
  }

  // Henter session (med feilhåndtering)
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Feil ved henting av session i RootLayout:", error);
  }

  // Henter i18n-instans og ressurser.
  let i18nData;
  try {
     i18nData = await serverUseTranslation(lng, defaultNS);
  } catch (i18nError) {
     console.error(`KRITISK FEIL ved initialisering av i18next for språk '${lng}':`, i18nError);
     return ( // Fallback HTML ved i18n feil
       <html lang="no">
         <head>
           <title>Serverfeil</title>
           {/* Legg til favicon link selv på feilsiden om ønskelig */}
           <link rel="icon" href="/public/favicon.ico" />
           <link rel="icon" href="/favicon.ico" />

         </head>
         <body><h1>Serverfeil</h1><p>Kunne ikke laste språkressurser.</p></body>
       </html>
     );
  }
  const { i18n } = i18nData;


  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      {/* --------------- START: Lagt til <head> --------------- */}
      <head>
        {/* Next.js setter inn metadata og andre head-elementer her */}
        {/* Legg til favicon-lenken manuelt siden den er i /public */}
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        {/* Du kan også legge til andre faste head-elementer her om nødvendig */}
      </head>
      {/* --------------- SLUTT: Lagt til <head> --------------- */}
      <body className="min-h-screen flex flex-col bg-[#000311] text-gray-100">
        <TranslationsProvider
          locale={lng}
          namespaces={defaultNS}
          resources={i18n.services.resourceStore.data}
        >
          <ToasterProvider />
          <SessionWrapper session={session}>
            <Header />
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal />
            <main className="flex-grow w-full py-8 sm:py-12">
              {children}
            </main>
            <Footer />
          </SessionWrapper>
        </TranslationsProvider>
      </body>
    </html>
  );
}