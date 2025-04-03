/**
 * Filnavn: RootLayout.tsx
 * Beskrivelse: Hovedlayoutkomponenten for applikasjonen.
 * Utvikler: Martin Pettersen
 */

import type { Metadata } from "next";
import "./globals.css";
// Sørg for at stien til Header er riktig

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
      {/* SETTER MØRK BAKGRUNN OG LYS TEKST SOM STANDARD */}
      <body className="min-h-screen flex flex-col bg-[#000311] text-gray-100"> {/* Endret bg og text */}
          <ToasterProvider />
          <SessionWrapper session={session}>
            <Header />
            {/* Globale modaler */}
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal />
            {/* MAIN arver nå bakgrunn fra body, eller kan settes likt */}
            <main className="flex-grow bg-[#000311]"> {/* Endret bg */}
              {children}
            </main>
            <Footer />
          </SessionWrapper>
      </body>
    </html>
  );
}