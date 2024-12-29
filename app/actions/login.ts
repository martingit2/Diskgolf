"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { LoginSchema } from "@/schemas";
import client from "../lib/prismadb";
import { generateTwoFactorToken, generateVerificationToken } from "../lib/tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "../lib/mail";

export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<{ success?: string; error?: string; twoFactor?: boolean }> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Innlogging mislyktes. Sjekk at e-post og passord er riktig formatert." };
  }

  const { email, password, code } = validatedFields.data;

  // Hent bruker fra databasen
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.hashedPassword) {
    return { error: "E-post eller passord er feil!" };
  }

  // Valider passord
  const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);
  if (!isPasswordValid) {
    return { error: "E-post eller passord er feil!" };
  }

  // Sjekk om e-posten er bekreftet
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "En bekreftelses-e-post er sendt til deg." };
  }

  // Håndter tofaktorautentisering
  if (existingUser.isTwoFactorEnable) {
    if (code) {
      // Valider 2FA-token
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Ugyldig kode!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Ugyldig kode!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Koden har utløpt. Generer en ny." };
      }

      // Slett token etter validering
      await client.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      // Slett eksisterende bekreftelse, hvis det finnes
      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingConfirmation) {
        await client.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      // Opprett ny bekreftelse
      await client.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      // Generer og send ny 2FA-kode
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  // Returner suksessmelding for innlogging
  return { success: "Innlogging vellykket!" };
};
