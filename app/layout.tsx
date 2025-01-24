import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RegisterModal from "@/components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "@/components/modals/LoginModal";
import { auth } from "@/auth";
import SessionWrapper from "./providers/SessionWrapper";
import { ThemeProvider } from "@/components/ThemeProvider"; // Import updated ThemeProvider
import Footer from "@/components/Footer";

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
    session = await auth(); // Fetch the session
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToasterProvider />
          <SessionWrapper session={session}>
            <Header />
            <LoginModal />
            <RegisterModal />
            <main className="flex-grow">{children}</main>
            <Footer />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
