"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken, generateTwoFactorToken } from "../lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "../lib/mail";
import client from "../lib/prismadb";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { LoginSchema } from "@/schemas";
import AuthErrorPage from "../auth/error/page";
import { signIn } from "next-auth/react";

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Innlogging mislyktes. Sjekk at e-post og passord er riktig formatert." };
  }

  const { email, password, code } = validatedFields.data;

  // Hent eksisterende bruker
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.hashedPassword) {
    return { error: "E-post eller passord er feil!" };
  }

  // Sjekk passord
  const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);
  if (!isPasswordValid) {
    return { error: "E-post eller passord er feil!" };
  }

  // E-postbekreftelse
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "En bekreftelses-e-post er sendt til deg." };
  }

  // Tofaktorautentisering
  if (existingUser.isTwoFactorEnable && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code || new Date() > new Date(twoFactorToken.expires)) {
        return { error: "Ugyldig eller utløpt kode!" };
      }

      await client.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingConfirmation) {
        await client.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
      }

      await client.twoFactorConfirmation.create({ data: { userId: existingUser.id } });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  // Standard innlogging
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthErrorPage) {
      return { error: "Feil e-post eller passord!" };
    }
    throw error;
  }

  return { success: "Innlogging vellykket!" };
};
