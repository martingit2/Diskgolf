"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
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

  // Sjekk og fjern ugyldige felter for OAuth-brukere
  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  // Håndter e-postoppdatering
  if (values.email && values.email !== dbUser.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "E-posten er allerede i bruk!" };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: "Verifikasjons-e-post sendt!" };
  }

  // Håndter passordoppdatering
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

  // Kartlegg felter for databasen
  const updatedData = {
    ...values,
    isTwoFactorEnable: values.isTwoFactorEnabled, // Mapper felt
  };
  delete updatedData.isTwoFactorEnabled; // Fjern det som ikke finnes i databasen

  // Oppdater bruker i databasen
  try {
    const updatedUser = await client.user.update({
      where: { id: dbUser.id },
      data: updatedData,
    });

    console.log("Bruker oppdatert i databasen:", updatedUser);
  } catch (error) {
    console.error("Feil under oppdatering av bruker:", error);
    return { error: "Kunne ikke oppdatere brukeren. Prøv igjen senere." };
  }

  return { success: "Innstillinger oppdatert!" };
};
