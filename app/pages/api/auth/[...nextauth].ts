/* 
Denne filen setter opp autentisering i Next.js-applikasjonen ved å bruke NextAuth.
Den er basert på Next.js 13 og bruker Prisma som databaseadapter. 
Jeg vet ikke om denne er utdatert siden vi bruker next.js 15 vi bare teste å se.
*/

// Importerer nødvendige avhengigheter
import bcrypt from "bcrypt"; // For å kryptere og verifisere passord
import NextAuth, { AuthOptions } from "next-auth"; // NextAuth for autentisering
import CredentialsProvider from "next-auth/providers/credentials"; // Egendefinert autentisering med e-post og passord
import GithubProvider from "next-auth/providers/github"; // Github OAuth
import GoogleProvider from "next-auth/providers/google"; // Google OAuth
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Prisma-adapter for å bruke Prisma med NextAuth
import prisma from "@/lib/prismadb"; // Importerer Prisma-klienten

// Konfigurasjon for NextAuth
export const authOptions: AuthOptions = {
  // Angir Prisma som adapter
  adapter: PrismaAdapter(prisma),

  // Definerer autentiseringsleverandører
  providers: [
    // Github OAuth-leverandør
    GithubProvider({
      clientId: process.env.GITHUB_ID as string, // Henter client ID fra .env
      clientSecret: process.env.GITHUB_SECRET as string, // Henter client secret fra .env
    }),
    
    // Google OAuth-leverandør
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // Henter client ID fra .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Henter client secret fra .env
    }),

    // Egendefinert autentisering med e-post og passord
    CredentialsProvider({
      name: "credentials", // Navn som vises i innloggingsskjemaet
      credentials: {
        email: { label: "E-post", type: "text" }, // Input-felt for e-post
        password: { label: "Passord", type: "password" }, // Input-felt for passord
      },
      async authorize(credentials) {
        // Validerer at e-post og passord er oppgitt
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ugyldige innloggingsdetaljer");
        }

        // Finner bruker i databasen basert på e-post
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Sjekker om brukeren eksisterer og om passord er lagret
        if (!user || !user?.hashedPassword) {
          throw new Error("Ugyldige innloggingsdetaljer");
        }

        // Verifiserer at passordet er korrekt
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Ugyldige innloggingsdetaljer");
        }

        // Returnerer brukeren hvis autentisering lykkes
        return user;
      },
    }),
  ],

  // Definerer spesifikke sider for NextAuth
  pages: {
    signIn: "/", // Bruker startsiden som innloggingsside
  },

  // Debugging i utviklingsmodus
  debug: process.env.NODE_ENV === "development",

  // Konfigurerer sesjonsstrategi
  session: {
    strategy: "jwt", // Bruker JSON Web Token for sesjonshåndtering
  },

  // Secret som brukes for å signere tokens
  secret: process.env.NEXTAUTH_SECRET,
};

// Eksporterer NextAuth-konfigurasjonen
export default NextAuth(authOptions);
