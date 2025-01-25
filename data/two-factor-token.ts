/** 
 * Filnavn: two-factor-token.ts
 * Beskrivelse: Tjenestefunksjoner for henting av tofaktorautentiseringstoken fra databasen.
 * Gir mulighet for å hente token enten via token-verdi eller e-post.
 * Utvikler: Martin Pettersen
 */



import client from "@/app/lib/prismadb";


export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await client.twoFactorToken.findUnique({
      where: { token }
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await client.twoFactorToken.findFirst({
      where: { email }
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};