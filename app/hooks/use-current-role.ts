/** 
 * Filnavn: use-current-role.ts
 * Beskrivelse: Tilpasset hook for å hente brukerens rolle fra NextAuth-sessionen.
 * Utvikler: Martin Pettersen
 */



import { useSession } from "next-auth/react";

export const useCurrentRole = () => {
  const session = useSession();

  return session.data?.user?.role;
};