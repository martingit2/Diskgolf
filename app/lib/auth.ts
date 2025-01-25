/** 
 * Filnavn: auth.ts
 * Beskrivelse: Hjelpefunksjoner for å hente informasjon om innlogget bruker og brukerrolle 
 * via autentiseringssystemet. Brukes til tilgangskontroll og personalisering av brukeropplevelsen.
 * Utvikler: Martin Pettersen
 */


import { auth } from "@/auth";


export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};