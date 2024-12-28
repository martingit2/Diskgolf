"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { getUserByEmail } from "@/data/user";
import { LoginSchema } from "@/schemas";

export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Innlogging mislyktes. Sjekk at e-post og passord er riktig formatert." };
  }

  const { email, password } = validatedFields.data;

  // Sjekk bruker i databasen
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.hashedPassword) {
    return { error: "E-post eller passord er feil!" };
  }

  // Valider passord
  const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);
  if (!isPasswordValid) {
    return { error: "E-post eller passord er feil!" };
  }

  if (!existingUser.emailVerified) {
    return { error: "E-posten er ikke bekreftet. Sjekk innboksen din for en bekreftelses-e-post." };
  }

  return {
    success: "Innlogging vellykket! Videresender...",
  };
};
