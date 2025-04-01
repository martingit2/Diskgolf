/**
 * pages/api/auth/[...nextauth].ts
 * Filnavn: [...nextauth].ts (navnet er viktig for Next.js)
 * Beskrivelse: NextAuth API rutehandler. Bruker den komplette authOptions-konfigurasjonen fra rotens auth.ts.
 * Utvikler: Martin Pettersen
 */

import NextAuth from "next-auth";

import { authOptions } from "@/auth"; 

export default NextAuth(authOptions);