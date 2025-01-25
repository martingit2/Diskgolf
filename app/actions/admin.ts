/** 
 * Filnavn: admin.ts
 * Beskrivelse: Serverfunksjon for å kontrollere om brukeren har administratorrettigheter.
 * Gir tilgang til spesifikke serverhandlinger basert på brukerens rolle.
 * Utvikler: Martin Pettersen
 */

"use server";

import { UserRole } from "@prisma/client";
import { currentRole } from "../lib/auth";

/**
 * Sjekker om den nåværende brukeren har administratorrettigheter.
 * Returnerer en suksessmelding hvis brukeren er administrator, 
 * ellers returneres en feilmelding.
 * 
 * @async
 * @function
 * @returns {Promise<{ success?: string; error?: string }>} En melding basert på brukerens tilgang.
 * @author Martin Pettersen
 */
export const admin = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Tilgang til serverhandling gitt!" };
  }

  return { error: "Ingen tilgang til denne serverhandlingen!" };
};
