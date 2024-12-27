"use server";

import * as z from "zod";
import bcrypt from "bcrypt";

import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "../lib/auth";
import { generateVerificationToken } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/mail";
import client from "../lib/prismadb";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  console.log("Mottatte verdier fra frontend:", values);

  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  console.log("Bruker:", user);

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Uautorisert" };
  }

  // Sjekk om verdiene er gyldige
  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== dbUser.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "E-posten er allerede i bruk!" };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: "Verifikasjons-e-post sendt!" };
  }

  if (values.password && values.newPassword && dbUser.hashedPassword) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.hashedPassword
    );

    if (!passwordsMatch) {
      return { error: "Feil passord!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  // Håndter tofaktor-autentisering og bytt til riktig felt
  const updatedData = {
    ...values,
    isTwoFactorEnable: values.isTwoFactorEnabled, // Kartlegger til riktig felt
  };
  delete updatedData.isTwoFactorEnabled; // Fjern det ikke-eksisterende feltet

  // Oppdater bruker i databasen
  const updatedUser = await client.user.update({
    where: { id: dbUser.id },
    data: updatedData,
  });

  if (!updatedUser) {
    return { error: "Kunne ikke oppdatere brukeren!" };
  }

  return { success: "Innstillinger oppdatert!" };
};
