/** 
 * Filnavn: use-current-user.ts
 * Beskrivelse: Tilpasset hook for å hente informasjon om den påloggede brukeren fra NextAuth-sessionen.
 * Utvikler: Martin Pettersen
 */


import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};