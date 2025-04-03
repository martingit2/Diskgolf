/**
 * Filnavn: RootLayout.tsx
 * Beskrivelse: Hovedlayoutkomponenten for applikasjonen. Håndterer globale komponenter som header, modaler, sesjonshåndtering og layoutstruktur.
 * Utvikler: Martin Pettersen
 */

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal"; // <-- 1. IMPORTER DEN NYE MODALEN
import { auth } from "@/auth";
import SessionWrapper from "./providers/SessionWrapper";
import Footer from "@/components/Footer";
import { User } from "@/app/types";

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

  const currentUser = session?.user as User | null ?? null;

  return (
    <html lang="no" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* ThemeProvider kommentert ut
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <ToasterProvider />
          <SessionWrapper session={session}>
            <Header currentUser={currentUser} />
            {/* Render alle modalene her slik at hooks kan styre dem */}
            <LoginModal />
            <RegisterModal />
            <ResetPasswordModal /> {/* <-- 2. LEGG TIL RENDERINGEN HER */}
            <main className="flex-grow bg-[#000311]">
              {children}
            </main>
            <Footer />
          </SessionWrapper>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}