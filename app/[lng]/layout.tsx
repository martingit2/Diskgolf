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
import { defaultNS, languages } from "../lib/i18n/settings";

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

  // Henter session (med feilhåndtering)
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Feil ved henting av session i RootLayout:", error);
    // Vurder robust feilhåndtering her
  }

  // Henter i18n-instans og ressurser for server-side rendering og klient-hydrering.
  // VIKTIG: serverUseTranslation MÅ være konfigurert til å laste fra filsystemet.
  let i18nData;
  try {
     i18nData = await serverUseTranslation(lng, defaultNS);
  } catch (i18nError) {
     console.error(`KRITISK FEIL ved initialisering av i18next for språk '${lng}':`, i18nError);
     // Uten i18n-data kan ikke siden rendre korrekt.
     // Returner en enkel feilside eller kast en feil som Next.js kan fange.
     return (
       <html lang="no"> {/* Fallback språk */}
         <body>
           <h1>Serverfeil</h1>
           <p>Kunne ikke laste nødvendige språkressurser. Prøv igjen senere.</p>
           {/* Logg mer detaljer på serveren */}
         </body>
       </html>
     );
  }
  const { i18n } = i18nData;


  return (
    // Setter språk og retning på HTML-elementet
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#000311] text-gray-100">
        {/* Provider for i18next på klientsiden */}
        {/* Sjekk at resources faktisk inneholder data etter at serverUseTranslation er fikset */}
        <TranslationsProvider
          locale={lng}
          namespaces={defaultNS}
          resources={i18n.services.resourceStore.data}
        >
          {/* Provider for react-hot-toast */}
          <ToasterProvider />
          {/* Wrapper for NextAuth session */}
          <SessionWrapper session={session}>
            {/* Global Header */}
            <Header />
            {/* Modaler (for login, registrering etc.) */}
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal />
            {/* Hovedinnholdet på siden */}
            <main className="flex-grow w-full py-8 sm:py-12">
              {children}
            </main>
            {/* Global Footer */}
            <Footer />
          </SessionWrapper>
        </TranslationsProvider>
      </body>
    </html>
  );
}