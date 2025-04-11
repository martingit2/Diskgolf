// Fil: src/lib/clubUtils.ts
// Formål: Inneholder hjelpefunksjoner relatert til klubber, som f.eks. `checkMembership`
//         for å sjekke om en bruker er medlem av en spesifikk klubb.
// Utvikler: Martin Pettersen


import { PrismaClient } from "@prisma/client"; 


const prisma = new PrismaClient();


// Hjelpefunksjon for medlemskapssjekk
export async function checkMembership(userId: string | undefined, clubId: string): Promise<boolean> {
    if (!userId || !clubId) {
        console.log(`[checkMembership] Mangler userId (${userId}) eller clubId (${clubId}).`);
        return false;
    }
    try {
        // Bruk den LOKALE prisma-instansen
        const membership = await prisma.membership.findUnique({
            where: { userId_clubId: { userId: userId, clubId: clubId } },
            select: { userId: true }
        });
        const isMember = !!membership;
        console.log(`[checkMembership - ${clubId}] Bruker ${userId} er medlem: ${isMember}`);
        return isMember;
    } catch (error) {
        console.error(`[checkMembership - ${clubId}] Feil under sjekk for bruker ${userId}:`, error);
        return false;
    } finally {
        // Koble fra den lokale instansen etter bruk
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

