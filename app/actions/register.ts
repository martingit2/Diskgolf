"use server";

import bcrypt from "bcrypt";
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import client from "@/app/lib/prismadb";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Registrering mislyktes. Sjekk at e-post, passord og navn er riktig formatert.",
    };
  }

  const { email, password, name } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "E-postadressen er allerede i bruk." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await client.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
  );

  return {
    success: "En bekreftelses-e-post har blitt sendt.",
  };
};
