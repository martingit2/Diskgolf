/** 
 * Filnavn: nextauth.ts
 * Beskrivelse: NextAuth-konfigurasjon for håndtering av autentisering i DiskGolf-applikasjonen.
 * Inneholder import av autentiseringskonfigurasjonen og initialiserer NextAuth.
 * Utvikler: Martin Pettersen
 */

import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export default NextAuth(authConfig);
