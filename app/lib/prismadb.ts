/** 
 * Filnavn: prismadb.ts
 * Beskrivelse: Konfigurasjon og opprettelse av Prisma-klienten for databasekommunikasjon.
 * Håndterer optimalisering av databaseforbindelser for å unngå flere tilkoblinger i utviklingsmiljø.
 * Utvikler: Martin Pettersen
 */

import { PrismaClient } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-unused-vars */
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
/* eslint-enable @typescript-eslint/no-unused-vars */

/* eslint-disable no-var */
declare global {
  var prisma: PrismaClient | undefined;
}
/* eslint-enable no-var */

const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
