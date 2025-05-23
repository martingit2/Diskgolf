/**
 * Filnavn: settings.ts
 * Beskrivelse: Serverfunksjon for å håndtere oppdatering av brukerinnstillinger,
 * inkludert opplasting av profilbilde.
 * Utvikler: Martin Pettersen
 */

"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "../lib/auth";
import { generateVerificationToken } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/mail";
import client from "../lib/prismadb";

// ✅ Oppdater SettingsSchema til å inkludere image (valgfritt)
export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  console.log("Mottatte verdier fra frontend:", values);

  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  console.log("Autentisert bruker:", user);

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    console.error("Ingen bruker i databasen");
    return { error: "Uautorisert" };
  }

  console.log("Bruker i databasen:", dbUser);

  // Hvis brukeren logger inn via OAuth, ikke oppdater e-post/passord
  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
  }

  try {
    // Oppdater e-post
    if (values.email && values.email !== dbUser.email) {
      console.log("Oppdaterer e-post...");
      const existingUser = await getUserByEmail(values.email);

      if (existingUser && existingUser.id !== dbUser.id) {
        console.error("E-posten er allerede i bruk!");
        return { error: "E-posten er allerede i bruk!" };
      }

      const verificationToken = await generateVerificationToken(values.email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token);

      return { success: "Verifikasjons-e-post sendt!" };
    }

    // Oppdater passord
    if (values.password && values.newPassword) {
      console.log("Validerer passord...");

      if (!dbUser.hashedPassword) {
        console.error("Brukeren har ikke et lagret passord");
        return { error: "Brukeren har ikke et lagret passord" };
      }

      const passwordsMatch = await bcrypt.compare(
        values.password,
        dbUser.hashedPassword
      );

      if (!passwordsMatch) {
        console.error("Feil passord oppgitt!");
        return { error: "Feil passord!" };
      }

      console.log("Oppdaterer passord...");
      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      dbUser.hashedPassword = hashedPassword;
    }

    // Oppdater image: Hvis values.image er tom streng, sett det til null
    const updatedImage = values.image && values.image.trim() !== "" ? values.image : null;

    // Forbered oppdateringsdata
    const updatedData = {
      name: values.name || dbUser.name,
      email: values.email || dbUser.email,
      role: values.role || dbUser.role,
      hashedPassword: dbUser.hashedPassword,
      image: updatedImage, // Oppdater profilbilde til URL eller null
    };

    console.log("Oppdaterer bruker i databasen...");
    const updatedUser = await client.user.update({
      where: { id: dbUser.id },
      data: updatedData,
    });

    console.log("Bruker oppdatert i databasen:", updatedUser);

    return { success: "Innstillinger oppdatert!" };
  } catch (error) {
    console.error("Feil under oppdatering av bruker:", error);
    return { error: "Kunne ikke oppdatere brukeren. Prøv igjen senere." };
  }
};
