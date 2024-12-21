import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import getCurrentUser from "./actions/getCurrentUser";

export const metadata: Metadata = {
  title: "DiscGolf",
  description: "DiscGolf App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser(); // Henter innlogget bruker

  return (
    <html lang="en">
      <body>
        {/* Header */}
        <ToasterProvider />
        <Header currentUser={currentUser} /> {/* Sender currentUser som prop */}
        <LoginModal />
        <RegisterModal />
        {children}
      </body>
    </html>
  );
}
