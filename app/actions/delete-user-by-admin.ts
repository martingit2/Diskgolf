// app/actions/delete-user-by-admin.ts
"use server";

// Importer PrismaClient OG Prisma (for feiltyper)
import { PrismaClient, UserRole, Prisma } from "@prisma/client";
import { currentRole, currentUser } from "../lib/auth";
import { revalidatePath } from "next/cache"; // For å oppdatere UI

const prisma = new PrismaClient();

interface DeleteUserResult {
    success?: string;
    error?: string;
}

/**
 * Sletter en spesifikk bruker basert på ID. Handlingen kan KUN utføres av en administrator.
 * Forhindrer administratorer fra å slette sin egen konto via denne funksjonen.
 * Håndterer fjerning av brukerrelaterte data før sletting.
 *
 * @param userIdToDelete - ID-en til brukeren som skal slettes.
 * @returns Promise<{ success?: string; error?: string }> En melding med status for slettingen.
 */
export const deleteUserByAdmin = async (userIdToDelete: string): Promise<DeleteUserResult> => {
    const adminRole = await currentRole();
    const adminUser = await currentUser();

    // 1. Autorisering
    if (adminRole !== UserRole.ADMIN || !adminUser) {
        return { error: "Uautorisert: Kun administratorer kan slette brukere." };
    }

    // 2. Input validering
    if (!userIdToDelete) {
        return { error: "Bruker-ID for sletting mangler." };
    }

    // 3. Selv-sletting sjekk
    if (adminUser.id === userIdToDelete) {
        return { error: "Du kan ikke slette din egen administratorkonto via denne funksjonen..." };
    }

    console.log(`[DELETE_USER_BY_ADMIN] Admin ${adminUser.id} forsøker å slette bruker ${userIdToDelete}`);

    try {
        // 4. Sjekk eksistens
        const userToDeleteExists = await prisma.user.findUnique({
            where: { id: userIdToDelete },
            select: { id: true }
        });

        if (!userToDeleteExists) {
            return { error: `Bruker med ID ${userIdToDelete} ble ikke funnet.` };
        }

        // 5. Slett relaterte data i transaksjon
        await prisma.$transaction(async (tx) => {
            console.log(`[DELETE_USER_BY_ADMIN] Starter sletting av relasjoner for bruker ${userIdToDelete}`);

            await tx.account.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.review.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.round.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.membership.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.twoFactorConfirmation.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.gameParticipation.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.gameScore.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.tournamentScore.deleteMany({ where: { playerId: userIdToDelete } }).catch(() => {});
            await tx.tournamentGameScore.deleteMany({ where: { playerId: userIdToDelete } }).catch(() => {});
            await tx.tournamentGameParticipation.deleteMany({ where: { playerId: userIdToDelete } }).catch(() => {});
            await tx.errorReport.deleteMany({ where: { userId: userIdToDelete } }).catch(() => {});
            await tx.newsArticle.deleteMany({ where: { authorId: userIdToDelete } }).catch((e) => { console.warn(`Kunne ikke slette NewsArticles for ${userIdToDelete}:`, (e as any).code)}); // Cast til any for å få code

            // TODO: Implementer korrekt håndtering for many-to-many relasjoner (participants, admins)

            // Slett turneringer organisert av brukeren (pga. Restrict)
            await tx.tournament.deleteMany({ where: { organizerId: userIdToDelete } }).catch((e) => { console.warn(`Kunne ikke slette Tournaments organisert av ${userIdToDelete} (pga. Restrict?):`, (e as any).code)}); // Cast til any for å få code


            console.log(`[DELETE_USER_BY_ADMIN] Sletting av relasjoner (delvis) fullført for ${userIdToDelete}. Sletter selve brukeren.`);

            // 6. Slett selve brukeren INNE i transaksjonen
            await tx.user.delete({
                where: { id: userIdToDelete },
            });
        });

        console.log(`[DELETE_USER_BY_ADMIN] Bruker ${userIdToDelete} ble slettet av admin ${adminUser.id}`);

        revalidatePath("/admin");

        return { success: "Brukeren ble slettet (merk: noen many-to-many relasjoner ble kanskje ikke fjernet)." };

    } catch (error) { // error er 'unknown' her
        console.error(`[DELETE_USER_BY_ADMIN_ERROR] Bruker: ${userIdToDelete}`, error);

        // --- Type sjekk for feil ---
        if (error instanceof Prisma.PrismaClientKnownRequestError) { // Bruk importert Prisma type
            // P2003: Foreign key constraint failed
            // P2014: The change you are trying to make would violate the required relation '...'
            if (error.code === 'P2003' || error.code === 'P2014') {
                console.error("Relasjonsfeil under sletting:", error.message); // Nå trygt å bruke .message
                return { error: "Kunne ikke slette brukeren på grunn av gjenværende datarelasjoner. Sjekk logger." };
            }
        } else if (error instanceof Error) {
            // Generell JavaScript-feil
            return { error: `En feil oppstod: ${error.message}` }; // Trygt å bruke .message
        }

        // Fallback for helt ukjente feil
        return { error: "En uventet feil oppstod under sletting av brukeren." };
    } finally {
        await prisma.$disconnect();
    }
};