/** 
 * Filnavn: reset.ts
 * Beskrivelse: Serverfunksjon for tilbakestilling av passord via e-post.
 * Validerer brukerens e-postadresse, genererer en tilbakestillingstoken, 
 * og sender en e-post med en lenke for å tilbakestille passordet.
 * Utvikler: Martin Pettersen
 */


"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "../lib/mail";
import { generatePasswordResetToken } from "../lib/tokens";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Ugyldig e-postadresse. Sjekk formatet og prøv igjen." };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "E-postadressen ble ikke funnet i systemet vårt." };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "En e-post for tilbakestilling av passord har blitt sendt!" };
};
