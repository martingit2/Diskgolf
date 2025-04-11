/** 
 * Filnavn: next-auth.d.ts
 * Beskrivelse: Utvidelse av NextAuth sin standard bruker- og sesjonstype for å inkludere tilleggsfelter som ID, rolle og tofaktorautentisering.
 * Gir en mer presis typesikkerhet i autentiseringssystemet ved å definere tilpassede brukerdata.
 * Utvikler: Martin Pettersen
 */


import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
  isTwoFactorEnable?: boolean; 
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
