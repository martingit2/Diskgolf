/** 
 * Filnavn: user.ts
 * Beskrivelse: Tjenestefunksjoner for henting av brukerdata fra databasen via Prisma.
 * Gir mulighet for å hente brukere basert på e-post eller ID.
 * Utvikler: Martin Pettersen
 */


import client from "@/app/lib/prismadb";


export const getUserByEmail = async (email: string) => {
    try {
        const user = await client.user.findUnique({
            where: { email } })
            return user;

    } catch { 
        return null;
    }

} 

export const getUserById = async (id: string) => {
    try {
        const user = await client.user.findUnique({
            where: { id } })
            return user;

    } catch { 
        return null;
    }

} 