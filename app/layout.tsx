/**
 * Filnavn: RootLayout.tsx
 * Beskrivelse: Hovedlayoutkomponenten for applikasjonen. Setter opp global struktur med mørk bakgrunn.
 * Utvikler: Martin Pettersen
 */

import type { Metadata } from "next";
import "./globals.css";

import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import { auth } from "@/auth";
import SessionWrapper from "./providers/SessionWrapper";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "DiskGolf App - Finn baner, spill og arranger turneringer",
  description: "Finn baner, spill diskgolf og arranger turneringer på ett sted med DiskGolf App",
  icons: {
    icon: "/lightgreen.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Error fetching session in RootLayout:", error);
  }

  return (
    <html lang="no" suppressHydrationWarning>
      {/* BODY: Mørk bakgrunn, standard lys tekst, flex-kolonne layout */}
      <body className="min-h-screen flex flex-col bg-[#000311] text-gray-100">
          <ToasterProvider />
          <SessionWrapper session={session}>
            <Header />

            {/* Globale modaler */}
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal />

            {/* MAIN: Tar opp resterende plass. Rendrer children direkte på mørk bakgrunn. */}
            {/* Legg til padding her for å skape luft RUNDT innholdet (både hero og hvit boks) */}
            <main className="flex-grow w-full py-8 sm:py-12">
              {children} {/* Sidens innhold (inkludert HomePage) havner her */}
            </main>

            <Footer />
          </SessionWrapper>
      </body>
    </html>
  );
}