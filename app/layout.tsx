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
      <body className="min-h-screen flex flex-col">
        <ToasterProvider />
        <SessionWrapper session={session}>
          <Header />
          <LoginModal />
          <RegisterModal />
          <main className="flex-grow">{children}</main>
          <footer className="text-white p-4 text-center" style={{ backgroundColor: "var(--headerColor)" }}>
            © 2024 DiskGolf. Alle rettigheter forbeholdt.
          </footer>
        </SessionWrapper>
      </body>
    </html>
  );
}
