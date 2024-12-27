"use server";

import { getUserByEmail } from "@/data/user";
import client from "../lib/prismadb";
import { getVerificationTokenByToken } from "@/data/verification-token";

// Funksjon for å håndtere ny e-postverifisering basert på en token
export const newVerification = async (token: string) => {
  // Sjekk om token eksisterer i databasen
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token eksisterer ikke!" };
  }

  // Sjekk om token har utløpt
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token har utløpt!" };
  }

  // Hent bruker basert på e-post i token
  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "E-posten eksisterer ikke!" };
  }

  // Oppdater brukeren til å vise at e-posten er verifisert
  await client.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(), // Sett e-posten som verifisert
      email: existingToken.email, // Oppdater e-post dersom nødvendig
    }
  });

  // Slett token etter vellykket verifisering
  await client.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "E-post verifisert!" };
};
