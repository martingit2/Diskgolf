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

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    console.error("Ingen bruker i databasen");
    return { error: "Uautorisert" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnable = undefined;
  }

  if (values.email && values.email !== user.email) {
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
      console.error("Passordene samsvarer ikke");
      return { error: "Feil passord!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updatedData = {
    ...values,
  };

  try {
    const updatedUser = await client.user.update({
      where: { id: dbUser.id },
      data: updatedData,
    });

    console.log("Bruker oppdatert i databasen:", updatedUser);

    // Oppdater session eller state hvis nødvendig
    // Dette er valgfritt og avhenger av din implementasjon
    // updateSession() hvis next-auth brukes

    return { success: "Innstillinger oppdatert!" };
  } catch (error) {
    console.error("Feil under oppdatering av bruker:", error);
    return { error: "Kunne ikke oppdatere brukeren. Prøv igjen senere." };
  }
};