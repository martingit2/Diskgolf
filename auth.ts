/**
 * Filnavn: auth.ts
 * Beskrivelse: NextAuth-konfigurasjon.
 * Utvikler: Martin Pettersen
 */

import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import client from "@/app/lib/prismadb";
import authConfig from "@/auth.config"; // Importerer providers
import { getUserById } from "@/data/user"; // Datafunksjon
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"; // Datafunksjon
import { getAccountByUserId } from "@/data/account"; // Datafunksjon
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth/next";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(client),
  session: { strategy: "jwt" },
  ...authConfig,                   // Bruk providers fra auth.config

  pages: {
    signIn: "/auth/login", // Kan brukes som fallback eller hvis modal feiler
    error: "/auth/error",    // Side for å vise autentiseringsfeil
    // signOut: "/auth/signout", // Valgfri
  },

  events: {
    // Oppdater e-post til verifisert ved OAuth-kobling
    async linkAccount({ user }) {
      try {
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
    // Kjøres ved forsøk på innlogging
    async signIn({ user, account }) {
      console.log("[Auth Callback] signIn starter for:", user.id, "via", account?.provider);
      try {
        // Tillat alltid OAuth (Google, Github etc.)
        if (account?.provider !== "credentials") {
          console.log("[Auth Callback] signIn: OAuth tillatt.");
          return true;
        }

        // For Credentials (epost/passord)
        const existingUser = await getUserById(user.id);
        if (!existingUser) {
            console.error("[Auth Callback] signIn: Fant ikke bruker (credentials):", user.id);
            return false; // Sikkerhetssjekk
        }

        // --- VIKTIG: Sjekk for e-postverifisering (fra din nåværende kode) ---
        if (!existingUser.emailVerified) {
          console.warn("[Auth Callback] signIn: E-post IKKE verifisert for:", existingUser.email);
          // Du kan evt. legge inn logikk for å sende ny verifiseringsmail her
          return false; // Hindre innlogging
        }
        console.log("[Auth Callback] signIn: E-post verifisert for:", existingUser.email);
        // --------------------------------------------------------------------

        // Håndter 2FA hvis det er aktivert (fra GitHub-kode)
        if (existingUser.isTwoFactorEnable) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
          if (!twoFactorConfirmation) {
            console.warn("[Auth Callback] signIn: 2FA er på, men bekreftelse mangler for:", existingUser.email);
            return false; // Krever 2FA-kode
          }
          // Slett bekreftelsen etter bruk
          await client.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id },
          });
          console.log("[Auth Callback] signIn: 2FA bekreftet og slettet for:", existingUser.email);
        }

        console.log("[Auth Callback] signIn: Alle sjekker OK for:", existingUser.email);
        return true; // Tillat innlogging

      } catch (error) {
        console.error("[Auth Callback] signIn: Uventet feil:", error);
        return false;
      }
    },

    // Kjøres for å lage/oppdatere session-objektet som klienten får
    async session({ token, session }) {
      // console.log(" [Auth Callback] session - Mottar token:", token); // DEBUG
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) || UserRole.USER; // Fallback
        session.user.isTwoFactorEnable = token.isTwoFactorEnable as boolean;
        session.user.name = token.name || "Bruker"; // Fallback
        session.user.email = token.email || "";
        session.user.isOAuth = token.isOAuth as boolean;
        // Sikrer at image er string eller null
        session.user.image = typeof token.image === "string" && token.image.trim() !== "" ? token.image : null;
      }
      // console.log(" [Auth Callback] session - Returnerer session:", session); // DEBUG
      return session;
    },

    // Kjøres for å lage/oppdatere JWT-tokenet
    async jwt({ token, user, account, profile, trigger }) { // lagt til trigger og profile for potensielt bruk
       // console.log(" [Auth Callback] jwt - Start. Trigger:", trigger, "Har user:", !!user, "Har account:", !!account); // DEBUG
       // console.log(" [Auth Callback] jwt - Initiell token:", token); // DEBUG

      // Ved innlogging/sign-up (user-objektet er tilgjengelig)
      if (account && user) {
        console.log(" [Auth Callback] jwt - Innlogging/signup for:", user.email);
        token.sub = user.id; // Sett subject (bruker-ID)
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.isOAuth = true; // Siden 'account' finnes
        // Hent rolle og 2FA fra DB ved første innlogging også
        const dbUser = await getUserById(user.id);
        token.role = dbUser?.role || UserRole.USER;
        token.isTwoFactorEnable = dbUser?.isTwoFactorEnable || false;
        console.log(" [Auth Callback] jwt - Token oppdatert ved innlogging:", token);
        return token;
      }


       // Hvis tokenet har utløpt eller trenger oppdatering (user er ikke med her vanligvis)
       if (token.sub) {
          // Alltid hent fersk data for å sikre at tokenet er oppdatert
          // console.log(" [Auth Callback] jwt - Henter fersk data for token.sub:", token.sub); // DEBUG
          try {
            const existingUser = await getUserById(token.sub);
            if (existingUser) {
                const existingAccount = await getAccountByUserId(existingUser.id); // Sjekk om det finnes linket OAuth

                // Oppdater token med fersk data
                token.name = existingUser.name;
                token.email = existingUser.email;
                token.role = (existingUser.role as UserRole) || UserRole.USER;
                token.isTwoFactorEnable = existingUser.isTwoFactorEnable;
                token.image = typeof existingUser.image === 'string' && existingUser.image.trim() !== '' ? existingUser.image : null;
                token.isOAuth = !!existingAccount; // Sett basert på om OAuth finnes
                 // console.log(" [Auth Callback] jwt - Fersk data hentet. Oppdatert token:", token); // DEBUG

            } else {
                 console.warn("[Auth Callback] JWT: Fant ikke bruker for eksisterende token.sub:", token.sub);
                 // Hva skal skje her? Returnere token som den er, eller nullstille?
                 // Returnerer som den er foreløpig for å unngå utlogging ved feil.
                 return token;
            }
          } catch (error) {
             console.error("[Auth Callback] JWT: Feil ved henting av fersk brukerdata:", error);
             // Returnerer token som den er for å unngå utlogging ved feil.
             return token;
          }
       } else {
            // console.log(" [Auth Callback] jwt - Ingen token.sub funnet."); // DEBUG
       }

      return token; // Returner det (potensielt oppdaterte) tokenet
    },
  },
};

export default NextAuth(authOptions);

// Funksjon for å hente sesjon på serveren
export const auth = async () => {
  try {
    const session = await getServerSession(authOptions);
    // console.log("🔍 Hentet server-session:", session ? session.user?.email : 'Ingen sesjon');
    return session;
  } catch (error) {
    console.error("[Auth Function] Feil ved henting av server-sesjon:", error);
    return null;
  }
};