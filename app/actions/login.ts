"use server";

import * as z from "zod";
import bcrypt from "bcrypt";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "../lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "../lib/mail";
import client from "../lib/prismadb";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { LoginSchema } from "@/schemas";

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Innlogging mislyktes. Sjekk at e-post og passord er riktig formatert.",
    };
  }

  const { email, password, code } = validatedFields.data;

  // Hent eksisterende bruker
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.hashedPassword) {
    console.error("E-post eller passord er feil.");
    return { error: "E-post eller passord er feil!" };
  }

  // Sjekk passordet først
  const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);

  if (!isPasswordValid) {
    console.error("Ugyldig passord for bruker:", email);
    return { error: "E-post eller passord er feil!" };
  }

  // Sjekk om e-posten er verifisert etter passordvalidering
  if (!existingUser.emailVerified) {
    console.log("E-posten er ikke verifisert:", email);
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "En bekreftelses-e-post er sendt til deg." };
  }

  // Sjekker om e-post er blokkert (eksempel på spesifikk blokkering)
  if (email === "blocked@domain.com") {
    console.error("Blokkert bruker forsøkte å logge inn:", email);
    return {
      error: "Denne brukeren er blokkert. Kontakt support for hjelp.",
    };
  }

  // Tofaktorautentisering
  if (existingUser.isTwoFactorEnable && existingUser.email) {
    if (code) {
      console.log("Mottatt 2FA-kode fra frontend:", code);
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        console.error("Fant ikke 2FA-token i databasen for bruker:", email);
        return { error: "Ugyldig kode!" };
      }

      if (twoFactorToken.token !== code) {
        console.error("2FA-token matcher ikke:", {
          expected: twoFactorToken.token,
          received: code,
        });
        return { error: "Ugyldig kode!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        console.error("2FA-token har utløpt for bruker:", email);
        return { error: "Koden har utløpt!" };
      }

      await client.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await client.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await client.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      console.log("Genererer ny 2FA-kode for bruker:", email);
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  // Standard innlogging
  try {
    console.log("Logger inn bruker:", email);
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Feil e-post eller passord!" };
        default:
          return { error: "Noe gikk galt!" };
      }
    }
    throw error;
  }

  return { success: "Innlogging vellykket!" };
};
