/** 
 * Filnavn: password-reset-token.ts
 * Beskrivelse: Tjenestefunksjoner for håndtering av passordtilbakestilling. 
 * Henter tilbakestillingstoken basert på token eller e-post ved hjelp av Prisma ORM.
 * Utvikler: Martin Pettersen
 */


import client from "@/app/lib/prismadb";


export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await client.passwordResetToken.findUnique({
      where: { token }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await client.passwordResetToken.findFirst({
      where: { email }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};