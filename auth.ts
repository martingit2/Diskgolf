/**
 * Filnavn: auth.ts
 * Beskrivelse: NextAuth-konfigurasjon.
 * Utvikler: Martin Pettersen
 */

import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import client from "@/app/lib/prismadb";
import authConfig from "@/auth.config"; // Importerer providers (Google, Github, Credentials)
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth/next";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(client), // Bruker Prisma for databaseinteraksjon
  session: { strategy: "jwt" },    // Bruker JWT for sesjonshåndtering
  ...authConfig,                    // Inkluderer providers fra auth.config.ts

  // FJERN ELLER KOMMENTER UT 'pages'-OBJEKTET
  /*
  pages: {
    signIn: "/auth/login", // Ikke nødvendig hvis vi kun bruker modal
    error: "/auth/error",    // Standard feilside kan brukes, eller håndteres i modal
    // signOut: "/auth/signout", // Kan beholdes hvis du har en egen utloggingsside
  },
  */

  events: {
    async linkAccount({ user }) {
      try {
        // Oppdater e-post som verifisert når en OAuth-konto kobles til
        await client.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      } catch (error) {
        console.error("[Auth Event] Feil under linking av konto:", error);
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("[Auth Callback] signIn starter for bruker:", user.id, "via", account?.provider);
      try {
        // Tillat alltid OAuth-innlogginger
        if (account?.provider !== "credentials") {
            console.log("[Auth Callback]signIn: OAuth tillatt.");
            return true;
        }

        // For Credentials-innlogging, hent brukeren
        const existingUser = await getUserById(user.id);
        if (!existingUser) {
            console.error("[Auth Callback] signIn: Fant ikke bruker:", user.id);
            return false; // Bør ikke skje hvis credentials funket, men sikkerhetssjekk
        }

        // === VIKTIG SJEKK ===
        // Avslå innlogging hvis e-post ikke er verifisert
        if (!existingUser.emailVerified) {
          console.warn("[Auth Callback] signIn: E-post IKKE verifisert for:", existingUser.email);
          // Vurder å sende ny verifiseringsmail her om ønskelig, men returner false
          // throw new Error("E-post ikke verifisert"); // Kan brukes for å gi spesifikk feilmelding
          return false; // Hindrer innlogging
        }
        console.log("[Auth Callback] signIn: E-post verifisert for:", existingUser.email);
        // =====================

        // Håndter 2FA (kommenter ut hvis ikke i bruk nå)
        /*
        if (existingUser.isTwoFactorEnable) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
          if (!twoFactorConfirmation) {
             console.warn("[Auth Callback] signIn: 2FA er på, men bekreftelse mangler for:", existingUser.email);
             return false; // Krever 2FA-kode
          }
          // Slett bekreftelsen etter vellykket validering for engangsbruk
          await client.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id },
          });
           console.log("[Auth Callback] signIn: 2FA bekreftet og slettet for:", existingUser.email);
        }
        */

        console.log("[Auth Callback] signIn: Alle sjekker OK for:", existingUser.email);
        return true; // Tillat innlogging
      } catch (error) {
        console.error("[Auth Callback] signIn: Uventet feil:", error);
        return false; // Avslå ved feil
      }
    },

    async session({ token, session }) {
       // Beriker session-objektet med data fra JWT token
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) || "USER";
        session.user.isTwoFactorEnable = token.isTwoFactorEnable as boolean;
        session.user.name = token.name || "Bruker";
        session.user.email = token.email || "";
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.image = typeof token.image === "string" && token.image.trim() !== "" ? token.image : null;
      }
       // console.log("🔍 Session returnerer:", session); // Kan redusere logging
      return session;
    },

    async jwt({ token, user, account }) { // 'user' og 'account' er tilgjengelig ved innlogging/oppdatering
      if (!token.sub) return token; // Ingen bruker-ID, returner token som den er

      // Hvis 'user'-objektet finnes (ved innlogging/link), oppdater token direkte
       if (user) {
           token.isOAuth = !!account; // Er det en OAuth-konto?
           token.name = user.name;
           token.email = user.email;
           token.role = (user as any).role || "USER"; // Cast til any for å få tak i role
           token.isTwoFactorEnable = (user as any).isTwoFactorEnable;
           token.image = user.image;
           console.log("[Auth Callback] JWT: Oppdatert token ved innlogging/linking for:", user.email);
       }
        // Hvis ikke ved innlogging, hent fersk brukerdata for å holde token oppdatert
       else if (!token.role || !token.name) { // Hent kun hvis data mangler eller ved behov
         try {
           const existingUser = await getUserById(token.sub);
           if (existingUser) {
               const existingAccount = await getAccountByUserId(existingUser.id);
               token.isOAuth = !!existingAccount;
               token.name = existingUser.name;
               token.email = existingUser.email;
               token.role = (existingUser.role as UserRole) || "USER";
               token.isTwoFactorEnable = existingUser.isTwoFactorEnable;
               token.image = typeof existingUser.image === 'string' && existingUser.image.trim() !== '' ? existingUser.image : null;
               console.log("[Auth Callback] JWT: Hentet fersk brukerdata for token for:", existingUser.email);
           } else {
                console.warn("[Auth Callback] JWT: Fant ikke bruker for eksisterende token.sub:", token.sub);
           }
         } catch (error) {
            console.error("[Auth Callback] JWT: Feil ved henting av fersk brukerdata:", error);
         }
       }

       // console.log("🔍 JWT returnerer token:", token); // Kan redusere logging
      return token;
    },
  },
};

export default NextAuth(authOptions);

// Funksjon for å hente sesjon på serveren (brukes i layouts/sider)
export const auth = async () => {
  try {
    const session = await getServerSession(authOptions);
    // console.log("🔍 Hentet server-session:", session ? session.user?.email : 'Ingen sesjon'); // Mindre verbose logging
    return session; // Returnerer session eller null
  } catch (error) {
    console.error("[Auth Function] Feil ved henting av server-sesjon:", error);
    return null;
  }
};