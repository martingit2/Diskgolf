// app/actions/get-users.ts
"use server";

import { PrismaClient, UserRole, User } from "@prisma/client";
import { currentRole, currentUser } from "../lib/auth"; // Antar du har currentUser også

const prisma = new PrismaClient();

// Definer hvilke felter vi vil returnere for en bruker i listen
type SafeUser = Omit<User, "hashedPassword" | "emailVerified" | "accounts" | "twoFactorConfirmation">;

interface GetUsersResult {
    success?: boolean;
    users?: SafeUser[];
    error?: string;
}

/**
 * Henter alle brukere fra databasen (kun for admin).
 * Returnerer en liste med brukerdata uten sensitive felter.
 */
export const getUsers = async (): Promise<GetUsersResult> => {
    const role = await currentRole();
    const user = await currentUser(); // Trengs for å ekskludere admin fra sletting senere

    if (role !== UserRole.ADMIN || !user) {
        return { error: "Uautorisert: Kun administratorer kan hente brukerlisten." };
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }, // Nyeste først
            // Velg felter for å unngå å sende sensitiv info
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isTwoFactorEnable: true,
                createdAt: true,
                updatedAt: true,
                favoriteCourses: true, // Ta med det du trenger å vise
                // IKKE inkluder hashedPassword, emailVerified etc.
            }
        });

        // Vi må caste til SafeUser siden select ikke automatisk gir den typen
        const safeUsers: SafeUser[] = users as SafeUser[];

        return { success: true, users: safeUsers };
    } catch (error) {
        console.error("[GET_USERS_ERROR]", error);
        return { error: "Kunne ikke hente brukere fra databasen." };
    } finally {
        await prisma.$disconnect();
    }
};