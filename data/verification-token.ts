/** 
 * Filnavn: verification-token.ts
 * Beskrivelse: Tjenestefunksjoner for henting av e-postverifikasjonstokens fra databasen via Prisma.
 * Gir mulighet for å hente tokens basert på tokenverdi eller e-postadresse.
 * Utvikler: Martin Pettersen
 */



import client from "@/app/lib/prismadb";


export const getVerificationTokenByToken = async (
  token: string
) => {
  try {
    const verificationToken = await client.verificationToken.findUnique({
      where: { token }
    });

    return verificationToken;
  } catch {
    return null;
  }
}

export const getVerificationTokenByEmail = async (
  email: string
) => {
  try {
    const verificationToken = await client.verificationToken.findFirst({
      where: { email }
    });

    return verificationToken;
  } catch {
    return null;
  }
}