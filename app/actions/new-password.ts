"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import client from "../lib/prismadb";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Token mangler!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Ugyldige felter!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Ugyldig token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token har utløpt!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "E-postadressen eksisterer ikke!" };
  }

  // Hasher det nye passordet
  const hashedPassword = await bcrypt.hash(password, 10);

  // Oppdaterer hashedPassword i databasen
  await client.user.update({
    where: { id: existingUser.id },
    data: { hashedPassword },
  });

  // Sletter brukt token
  await client.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Passordet er oppdatert!" };
};
