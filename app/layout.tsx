import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
// import getCurrentUser from "./actions/getCurrentUser"; // Kommentar hvis du ikke vil bruke det nå

export const metadata: Metadata = {
  title: "DiscGolf",
  description: "DiscGolf App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const currentUser = await getCurrentUser(); // Kommentar for å deaktivere nå

  const session = await auth()

  return (
    <SessionProvider session={session}>
    <html lang="en">
      <body>
        {/* Header */}
        <ToasterProvider />
        <Header currentUser={null} /> {/* Sender null som prop midlertidig */}
        <LoginModal />
        <RegisterModal />
        {children}
      </body>
    </html>
    </SessionProvider>
  );
}
