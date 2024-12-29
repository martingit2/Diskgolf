import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import { auth } from "@/auth";
import SessionWrapper from "./providers/SessionWrapper";

export const metadata: Metadata = {
  title: "DiskGolf",
  description: "DiskGolf App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;

  try {
    session = await auth(); // Hent sesjonen
  } catch (error) {
    console.error("Feil ved henting av sesjon:", error);
  }

  return (
    <html lang="en">
      <body>
        <ToasterProvider />
        <SessionWrapper session={session}>
          <Header />
          <LoginModal />
          <RegisterModal />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
