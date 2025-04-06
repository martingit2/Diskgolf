// src/app/actions/remove-membership.ts
"use server"; // Marker som Server Action

import { PrismaClient } from "@prisma/client";
import { currentUser } from "../lib/auth"; // Sjekk at stien til auth er korrekt

const prisma = new PrismaClient();

// Input type for actionen
interface RemoveMembershipInput {
    userIdToRemove: string; // ID til brukeren som skal fjernes
    clubId: string;         // ID til klubben det gjelder
}

// Returtype for actionen
interface RemoveMembershipResult {
    success?: string;
    error?: string;
}

/**
 * Server Action for å fjerne et medlemskap for en bruker i en klubb.
 * Krever at den innloggede brukeren er administrator for klubben.
 */
export async function removeMembership(
    input: RemoveMembershipInput
): Promise<RemoveMembershipResult> {
    const requestingUser = await currentUser(); // Hent bruker som utfører handlingen
    const requestingUserId = requestingUser?.id;
    const requestingUserRole = requestingUser?.role; // Hent rolle også

    // Sjekk om noen er logget inn
    if (!requestingUserId) {
        console.error("[RemoveMembership] Unauthorized: No user logged in.");
        return { error: "Uautorisert: Du må være logget inn." };
    }

    // Autorisering: Sjekk om brukeren som ber om fjerning er admin for klubben ELLER global admin
    try {
        const isAdminForClub = await prisma.club.findFirst({
            where: {
                id: input.clubId,
                admins: { some: { id: requestingUserId } }
            },
            select: { id: true } // Trenger bare å bekrefte at den finnes
        });

        const isGlobalAdmin = requestingUserRole === 'ADMIN';

        if (!isAdminForClub && !isGlobalAdmin) {
             console.warn(`[RemoveMembership] Forbidden: User ${requestingUserId} attempted removal for club ${input.clubId} without permission.`);
            return { error: "Ingen tilgang: Du har ikke rettigheter til å fjerne medlemmer fra denne klubben." };
        }
         console.log(`[RemoveMembership] User ${requestingUserId} authorized to remove members from club ${input.clubId}.`);

    } catch (authError) {
         console.error("[RemoveMembership] Error during authorization check:", authError);
         return { error: "Feil under autorisasjonssjekk." };
    }


    // --- Valgfritt: Ekstra forretningsregler ---
    // Hindre brukeren i å fjerne seg selv via dette grensesnittet?
    if (input.userIdToRemove === requestingUserId) {
         console.warn(`[RemoveMembership] User ${requestingUserId} attempted to remove themselves from club ${input.clubId}.`);
         return { error: "Du kan ikke fjerne deg selv herfra. Bruk 'Forlat klubb'-funksjonen." };
    }
    // TODO: Sjekk om brukeren som fjernes er den siste administratoren?
    // (Bør sannsynligvis ikke tillates uten videre)
    // ------------------------------------------


    try {
        console.log(`[RemoveMembership] Attempting to remove membership: User ${input.userIdToRemove}, Club ${input.clubId}`);
        // Utfør sletting av medlemskap
        const deleteResult = await prisma.membership.delete({
            where: {
                // Bruk den unike kombinasjonen av userId og clubId
                userId_clubId: {
                    userId: input.userIdToRemove,
                    clubId: input.clubId,
                },
            },
             select: { userId: true } // Velg et felt for å bekrefte sletting
        });

        console.log(`[RemoveMembership] Membership removed successfully for user ${deleteResult.userId}.`);
        return { success: "Medlem fjernet fra klubben." };

    } catch (error: any) {
        console.error("[RemoveMembership] Error removing membership:", error);
        // Håndter spesifikk feil hvis medlemskapet ikke ble funnet
        if (error.code === 'P2025') { // Prisma's kode for "Record to delete does not exist."
            console.warn(`[RemoveMembership] Membership not found for User ${input.userIdToRemove}, Club ${input.clubId}.`);
             return { error: "Medlemskapet ble ikke funnet eller er allerede fjernet." };
        }
        // Generell feilmelding
        return { error: "En feil oppstod under fjerning av medlemskapet." };
    } finally {
         // Koble fra databasen
         await prisma.$disconnect();
         console.log(`[RemoveMembership] Database connection disconnected.`);
    }
}