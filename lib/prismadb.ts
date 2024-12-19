/* Vi følger best practices med å ha Prisma-klienten definert her */

import { PrismaClient } from "@prisma/client"; // Importerer Prisma-klienten fra pakken "@prisma/client".

/**
 * Prisma-klient:
 * - `PrismaClient` er en klasse som brukes til å kommunisere med databasen via Prisma.
 * - Dette lar oss kjøre spørringer mot databasen på en typesikker måte.
 */
const prisma = new PrismaClient();

/**
 * Global deklarasjon:
 * - I et utviklingsmiljø (f.eks. under `npm run dev`), oppretter Next.js flere instanser av moduler.
 * - Dette kan føre til at Prisma-klienten opprettes flere ganger, noe som kan føre til ytelsesproblemer.
 * - Vi bruker en global variabel (`globalThis.prisma`) for å sikre at bare én Prisma-klient blir opprettet.
 */
declare global {
  var prisma: PrismaClient | undefined; // Globale variabler må deklareres i TypeScript.
}

/**
 * Opprettelse av Prisma-klienten:
 * - Hvis `globalThis.prisma` allerede eksisterer, bruker vi den (for å gjenbruke en eksisterende klient).
 * - Hvis ikke, oppretter vi en ny instans av Prisma-klienten.
 */
const client = globalThis.prisma || new PrismaClient();

/**
 * Lagring av klienten globalt:
 * - I et utviklingsmiljø (`NODE_ENV !== "production"`), lagrer vi Prisma-klienten i `globalThis.prisma`.
 * - Dette sikrer at klienten ikke opprettes flere ganger, noe som kan føre til problemer som
 *   "too many connections" i databasen.
 */
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

/**
 * Eksporterer Prisma-klienten:
 * - Vi bruker `export default` for å gjøre det enkelt å importere Prisma-klienten i andre filer.
 */
export default client;
