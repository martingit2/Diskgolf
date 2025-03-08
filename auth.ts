/**
 * Filnavn: auth.ts
 * Beskrivelse: NextAuth-konfigurasjon for autentisering i DiskGolf-applikasjonen. 
 * Håndterer innlogging via OAuth og credentials, samt tofaktorautentisering.
 * Utvikler: Martin Pettersen
 */

import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import client from "@/app/lib/prismadb";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth/next";

export const authOptions: AuthOptions = {
  ...authConfig,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  events: {
    async linkAccount({ user }) {
      try {
        await client.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      } catch (error) {
        console.error("Feil under linking av konto:", error);
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Tillat OAuth uten e-postverifisering
        if (account?.provider !== "credentials") return true;

        const existingUser = await getUserById(user.id);

        // Avslå innlogging uten e-postverifisering
        if (!existingUser?.emailVerified) {
          console.error("E-posten er ikke verifisert for bruker:", user.id);
          return false;
        }

        // Håndter tofaktorautentisering
        if (existingUser.isTwoFactorEnable) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
            existingUser.id
          );

          if (!twoFactorConfirmation) {
            console.error(
              "Tofaktorautentisering mangler bekreftelse for bruker:",
              user.id
            );
            return false;
          }

          // Slett bekreftelsen etter vellykket validering
          await client.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id },
          });
        }

        return true;
      } catch (error) {
        console.error("Feil i signIn callback:", error);
        return false;
      }
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole || "USER"; // 🎯 Fallback til "USER" hvis `role` er undefined
        session.user.isTwoFactorEnable = token.isTwoFactorEnable as boolean;
        session.user.name = token.name || "Ukjent navn";
        session.user.email = token.email || "Ukjent e-post";
        session.user.isOAuth = token.isOAuth as boolean;

        console.log("🔍 Session returnerer:", session); // Debugging
      }
      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      try {
        const existingUser = await getUserById(token.sub);

        if (!existingUser) {
          console.error("Fant ikke bruker for token.sub:", token.sub);
          return token;
        }

        const existingAccount = await getAccountByUserId(existingUser.id);

        token.isOAuth = !!existingAccount;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.role = existingUser.role as UserRole || "USER"; // 🎯 Sørger for at `role` alltid er satt
        token.isTwoFactorEnable = existingUser.isTwoFactorEnable;

        console.log("🔍 JWT returnerer token:", token); // Debugging
        return token;
      } catch (error) {
        console.error("Feil i JWT callback:", error);
        return token;
      }
    },
  },
  adapter: PrismaAdapter(client),
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);

export const auth = async () => {
  try {
    const session = await getServerSession(authOptions);
    console.log("🔍 Server-session:", session); // Debugging
    return session || null;
  } catch (error) {
    console.error("Feil ved henting av server-sesjon:", error);
    return null;
  }
};
