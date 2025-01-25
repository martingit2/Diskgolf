/** 
 * Filnavn: two-factor-confirmation.ts
 * Beskrivelse: Tjenestefunksjon for henting av tofaktorbekreftelse fra databasen.
 * Henter tofaktorautentiseringsstatus basert på bruker-ID ved hjelp av Prisma ORM.
 * Utvikler: Martin Pettersen
 */



import client from "@/app/lib/prismadb";


export const getTwoFactorConfirmationByUserId = async (
  userId: string
) => {
  try {
    const twoFactorConfirmation = await client.twoFactorConfirmation.findUnique({
      where: { userId }
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};