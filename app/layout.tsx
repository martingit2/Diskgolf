import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import { auth } from "@/auth";
import SessionWrapper from "./providers/SessionWrapper";
// import { ThemeProvider } from "@/components/ThemeProvider"; // Kommenter ut ThemeProvider per nå
import Footer from "@/components/Footer";

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
    session = await auth(); // Fetch the session
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        {/* Kommenterer ut themeprovider per nå, siden den av og til endrer buttons selv om darkmode ikke er på*/}
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
        <ToasterProvider />
        <SessionWrapper session={session}>
          <Header />
          <LoginModal />
          <RegisterModal />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SessionWrapper>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
