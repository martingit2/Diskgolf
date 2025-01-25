/** 
 * Filnavn: login.ts
 * Beskrivelse: Serverfunksjon for å håndtere brukerinnlogging med støtte for passordvalidering, 
 * e-postverifisering og tofaktorautentisering (2FA).
 * - Validerer brukerens innloggingsdetaljer ved hjelp av Zod-skjema.
 * - Sjekker om e-post er bekreftet, sender verifikasjonsmail om nødvendig.
 * - Håndterer tofaktorautentisering (2FA) ved å generere og validere 2FA-koder.
 * - Bruker NextAuth for autentisering og håndtering av økter.
 * Utvikler: Martin Pettersen
 */


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
import { signIn } from "next-auth/react"; // Sørg for riktig import
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
): Promise<{ success?: string; error?: string; twoFactor?: boolean }> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.hashedPassword) {
    return { error: "Email does not exist!" };
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);
  if (!isPasswordValid) {
    return { error: "Invalid credentials!" };
  }

  // Check email verification
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Confirmation email sent!" };
  }

  // Handle Two-Factor Authentication (2FA)
  if (existingUser.isTwoFactorEnable && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Code expired!" };
      }

      // Delete 2FA token after successful validation
      await client.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      // Delete existing confirmation if it exists
      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingConfirmation) {
        await client.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      // Create new confirmation
      await client.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      // Generate and send new 2FA code
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
      );

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message || "Something went wrong!" };
    }
    return { error: "An unknown error occurred." };
  }

  return { success: "Login successful!" };
};
