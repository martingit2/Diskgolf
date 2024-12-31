/* Vi følger best practices med å ha Prisma-klienten definert her */

import { PrismaClient } from "@prisma/client"; // Importerer Prisma-klienten fra pakken "@prisma/client".

/**
 * Prisma-klient:
 * - `PrismaClient` er en klasse som brukes til å kommunisere med databasen via Prisma.
 * - Dette lar oss kjøre spørringer mot databasen på en typesikker måte.
 */


/**
 * Oppretter en ny instans av Prisma-klienten eller gjenbruker en eksisterende.
 * Dette sikrer at vi unngår flere tilkoblinger til databasen i utviklingsmodus.
 *
 * Prisma-klienten (`prisma`) opprettes her, men brukes ikke direkte i koden.
 * Vi beholder den likevel for å følge best practices og sikre en enkel debugging-opplevelse.
 * Derfor deaktiverer vi regelen `@typescript-eslint/no-unused-vars` midlertidig.
 */


/* eslint-disable @typescript-eslint/no-unused-vars */
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

/* eslint-enable @typescript-eslint/no-unused-vars */


/**
 * Global deklarasjon:
 * - I et utviklingsmiljø (f.eks. under `npm run dev`), oppretter Next.js flere instanser av moduler.
 * - Dette kan føre til at Prisma-klienten opprettes flere ganger, noe som kan føre til ytelsesproblemer.
 * - Vi bruker en global variabel (`globalThis.prisma`) for å sikre at bare én Prisma-klient blir opprettet.
 */


/**
 * Vi må bruke `var` i globale deklarasjoner for at variabelen skal bli tilgjengelig på `globalThis`.
 * TypeScript og ESLint anbefaler vanligvis å bruke `let` eller `const`,
 * men disse fungerer ikke når vi definerer globale variabler som brukes på `globalThis`.
 * Derfor deaktiverer vi ESLint-regelen `no-var` kun for denne delen.
 */

/* eslint-disable no-var */
declare global {
    var prisma: PrismaClient | undefined;
  }
  /* eslint-enable no-var */


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
