import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import client from "./app/lib/prismadb";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    async linkAccount({ user }) {
      await client.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      // Tillat OAuth-innlogging uten e-postverifisering
      if (account?.provider !== "credentials") return true;

      // Kontroller at user.id eksisterer og er en string
      if (!user.id || typeof user.id !== "string") {
        return false; // Avbryt innlogging hvis user.id er ugyldig
      }

      const existingUser = await getUserById(user.id);

      // Forhindre innlogging uten e-postverifisering
      if (!existingUser?.emailVerified) {
        return false; // Avbryt innlogging hvis e-post ikke er verifisert
      }

      // Håndter tofaktorautentisering
      if (existingUser.isTwoFactorEnable) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Slett tofaktorbekreftelsen for neste innlogging
        await client.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true; // Tillat innlogging
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnable = token.isTwoFactorEabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name ?? "Ukjent navn"; // Bruker en fallback for navn
        session.user.email = token.email ?? "Ukjent e-post"; // Bruker en fallback for e-post
        session.user.isOAuth = token.isOAuth as boolean;
      }
      

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnable;

      return token;
    },
  },
  adapter: PrismaAdapter(client),
  session: { strategy: "jwt" },
  ...authConfig,
});
