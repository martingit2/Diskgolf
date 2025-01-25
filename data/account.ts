/** 
 * Filnavn: account.ts
 * Beskrivelse: Henter konto-informasjon fra databasen basert på en bruker-ID ved hjelp av Prisma.
 * Funksjonen håndterer eventuelle feil og returnerer enten kontoobjektet eller null.
 * Utvikler: Martin Pettersen
 */


import client from "@/app/lib/prismadb";


export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await client.account.findFirst({
      where: { userId }
    });

    return account;
  } catch {
    return null;
  }
};