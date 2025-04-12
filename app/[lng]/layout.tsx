 /**
 * Filnavn: layout.tsx (app/[lng]/layout.tsx)
 * Beskrivelse: Hovedlayout for applikasjonen. Definerer global HTML-struktur,
 *              inkluderer globale providers (Session, Toaster, i18n), Header og Footer, samt Cookiebot samtykke-script (kun banner).
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */ 


import type { Metadata, Viewport } from "next";
import "../globals.css";
import { dir } from 'i18next';
import { serverUseTranslation } from '@/app/lib/i18n';
import TranslationsProvider from '../providers/TranslationsProvider';
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "../providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import { auth } from "@/auth";
import SessionWrapper from "../providers/SessionWrapper";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { defaultNS, languages, fallbackLng } from "../lib/i18n/settings";
import Script from 'next/script';

// Metadata og Viewport konfigurasjon
export const metadata: Metadata = {
  title: 'Diskgolf.app',
  description: 'Din følgesvenn for diskgolf.',
  metadataBase: new URL('https://diskgolf.app'), // Sørg for at dette er din produksjons-URL
  alternates: {
    canonical: '/',
    languages: languages.reduce((acc, lang) => {
      if (lang !== 'cimode') { // Ekskluderer i18next sitt debug-språk
        acc[lang] = `/${lang}`;
      }
      return acc;
    }, {} as Record<string, string>),
  },
};

export const viewport: Viewport = {
  themeColor: '#000311',
  width: 'device-width',
  initialScale: 1,
};

// Genererer statiske parametere for språk-ruting
export async function generateStaticParams() {
  return languages.filter(lng => lng !== 'cimode').map((lng) => ({ lng }));
}

// Hovedlayout-komponent
export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  // Bestemmer og validerer språket basert på URL-parameter
  const lng = languages.includes(params.lng) ? params.lng : fallbackLng;

  if (!languages.includes(params.lng)) {
     // Logger en advarsel i server-konsollen ved ugyldig språk i URL
     console.warn(`Ugyldig språkkode mottatt i URL: ${params.lng}. Bruker fallback: ${fallbackLng}`);
  }

  // Henter autentiserings-session
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Feil ved henting av session i RootLayout:", error);
  }

  // Henter i18n-ressurser for det aktuelle språket
  let i18nData;
  try {
    i18nData = await serverUseTranslation(lng, defaultNS);
  } catch (i18nError) {
     console.error(`KRITISK FEIL ved initialisering av i18next for språk '${lng}':`, i18nError);
     // Viser en enkel HTML-feilside hvis språkdata ikke kan lastes
     return (
       <html lang="no"> {/* Bruker et hardkodet språk for feilmeldingen */}
         <head><title>Serverfeil</title><link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" /></head>
         <body><h1>Serverfeil</h1><p>Kunne ikke laste språkressurser.</p></body>
       </html>
     );
  }
  const { i18n } = i18nData;

  return (
    // Definerer rot-HTML-elementet med språk og tekstretning
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <head>
        {/* Laster Cookiebot UC-script for samtykkehåndtering */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="ce0d879f-f7b7-470f-bc93-e91680e61ed6" // Ditt Cookiebot ID
          data-blockingmode="auto" // Aktiverer automatisk blokkering
          strategy="beforeInteractive" // Laster før siden blir interaktiv (viktig for blokkering)
          type="text/javascript"
          suppressHydrationWarning={true} // Forhindrer hydreringsfeil pga. DOM-manipulasjon fra scriptet
        />
        {/* Setter Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        {/* Andre nødvendige <head> elementer */}
      </head>
      {/* Setter globale klasser for body, inkludert layout og standard fonter/farger */}
      <body className="min-h-screen flex flex-col bg-[#000311] text-gray-100 font-sans">
        {/* Omslutter applikasjonen med nødvendige providers */}
        <TranslationsProvider
          locale={lng}
          namespaces={defaultNS}
          resources={i18n.services.resourceStore.data}
        >
          <ToasterProvider /> {/* For visning av toast-meldinger */}
          <SessionWrapper session={session}> {/* Håndterer session-data */}
            <Header /> {/* Global header */}
            {/* Modaler for innlogging, registrering og passord-reset */}
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal />
            {/* Hovedinnholdet på siden rendres her */}
            <main className="flex-grow w-full py-8 sm:py-12">
              {children}
            </main>
            <Footer /> {/* Global footer */}
          </SessionWrapper>
        </TranslationsProvider>
      </body>
    </html>
  );
}