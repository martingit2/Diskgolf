// Fil: app/actions/delete-recent-test-data.ts
// Formål: Server action designet for administratorer for å slette nylig opprettet testdata fra databasen.
//         Sletter data fra flere modeller innenfor en angitt tidsramme (f.eks. siste 6 timer) ved hjelp av en database-transaksjon.
//         Inkluderer autorisasjonssjekk (kun ADMIN), revalidering av stier, og detaljert logging og feilhåndtering.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use server";

// Importer Prisma for feiltyper
import { PrismaClient, UserRole, Prisma } from "@prisma/client";
import { currentRole, currentUser } from "../lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

interface DeleteRecentDataResult {
    success?: string;
    error?: string;
    counts?: Record<string, number>;
}

export const deleteRecentTestData = async (hoursAgo: number = 6): Promise<DeleteRecentDataResult> => {
    const adminRole = await currentRole();
    const adminUser = await currentUser();

    if (adminRole !== UserRole.ADMIN || !adminUser) {
        return { error: "Uautorisert: Kun administratorer kan slette testdata." };
    }

    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const counts: Record<string, number> = {};

    console.log(`[DELETE_RECENT_DATA] Admin ${adminUser.id} starter sletting av data opprettet etter: ${cutoffTime.toISOString()}`);

    try {
        const transactionResults = await prisma.$transaction(async (tx) => {
            console.log("[DELETE_RECENT_DATA] Starter sletting i transaksjon...");

            // STEG 1: Slett dypeste avhengigheter først
            // Siden TournamentGameParticipation ikke har createdAt, sletter vi basert på når gameSession ble opprettet
            counts.tournamentGameScores = (await tx.tournamentGameScore.deleteMany({ where: { gameSession: { createdAt: { gte: cutoffTime } } } })).count;
            counts.tournamentGameParticipations = (await tx.tournamentGameParticipation.deleteMany({ where: { gameSession: { createdAt: { gte: cutoffTime } } } })).count; // Filtrer på relatert gameSession
            counts.gameScores = (await tx.gameScore.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.gameParticipations = (await tx.gameParticipation.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.completedGameScores = (await tx.completedGameScore.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.tournamentScores = (await tx.tournamentScore.deleteMany({ where: { submittedAt: { gte: cutoffTime } } })).count;
            counts.reviews = (await tx.review.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.rounds = (await tx.round.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.errorReports = (await tx.errorReport.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.meetings = (await tx.meeting.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.clubNews = (await tx.clubNews.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.memberships = (await tx.membership.deleteMany({ where: { user: { createdAt: { gte: cutoffTime } } } })).count; // Slett medlemskap for nylige brukere
            counts.accounts = (await tx.account.deleteMany({ where: { user: { createdAt: { gte: cutoffTime }, id: { not: adminUser.id } } } })).count;
            counts.twoFactorConfirmations = (await tx.twoFactorConfirmation.deleteMany({ where: { user: { createdAt: { gte: cutoffTime }, id: { not: adminUser.id } } } })).count;
            counts.holes = (await tx.hole.deleteMany({ where: { course: { createdAt: { gte: cutoffTime } } } })).count;
            counts.starts = (await tx.start.deleteMany({ where: { course: { createdAt: { gte: cutoffTime } } } })).count;
            counts.goals = (await tx.goal.deleteMany({ where: { course: { createdAt: { gte: cutoffTime } } } })).count;
            counts.baskets = (await tx.basket.deleteMany({ where: { course: { createdAt: { gte: cutoffTime } } } })).count;
            counts.obs = (await tx.oB.deleteMany({ where: { course: { createdAt: { gte: cutoffTime } } } })).count;

            // STEG 2: Slett mellomnivå-data
            counts.tournamentGameSessions = (await tx.tournamentGameSession.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.games = (await tx.game.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.rooms = (await tx.room.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.newsArticles = (await tx.newsArticle.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count; // Før User

            // **** ENDRET REKKEFØLGE ****
            // STEG 3: Slett Turneringer FØR Baner og Klubber
            counts.tournaments = (await tx.tournament.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;

            // STEG 4: Slett Baner FØR Klubber
            counts.courses = (await tx.course.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;

            // STEG 5: Slett Klubber
            counts.clubs = (await tx.club.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;

            // STEG 6: Slett Brukere til slutt (unntatt admin)
            counts.users = (await tx.user.deleteMany({
                where: {
                    createdAt: { gte: cutoffTime },
                    id: { not: adminUser.id }
                },
            })).count;

            // STEG 7: Slett andre uavhengige modeller
            counts.categories = (await tx.category.deleteMany({ where: { createdAt: { gte: cutoffTime } } })).count;
            counts.editablePageContents = (await tx.editablePageContent.deleteMany({ where: { updatedAt: { gte: cutoffTime } } })).count;

            console.log("[DELETE_RECENT_DATA] Sletting i transaksjon fullført (før commit).");
            return counts;
        });

        console.log(`[DELETE_RECENT_DATA] Transaksjon fullført og committet. Slettet:`, transactionResults);
        // Revalider relevante stier
        revalidatePath("/admin");
        revalidatePath("/baner"); // Siden baner kan ha blitt slettet
        // Legg til flere stier ved behov

        return {
            success: `Nylige testdata (siste ${hoursAgo} timer) er slettet.`,
            counts: transactionResults
        };

    } catch (error) { // error er 'unknown'
        console.error("[DELETE_RECENT_DATA_ERROR] Transaksjonen feilet:", error);

         // --- Type sjekk for feil ---
         if (error instanceof Prisma.PrismaClientKnownRequestError) { // Korrekt type sjekk
            console.error(`Prisma Error Code: ${error.code}`);
            console.error(`Prisma Error Meta:`, error.meta);
            console.error(`Prisma Error Message: ${error.message}`);
            if (error.code === 'P2003' || error.code === 'P2014') {
                 return { error: `Kunne ikke slette data på grunn av en databasebegrensning (foreign key). Sjekk logger for detaljer (Kode: ${error.code}).` };
            }
         } else if (error instanceof Error) {
            return { error: `En feil oppstod: ${error.message}` };
         }

        return { error: "En uventet feil oppstod under sletting av testdata. Transaksjonen ble rullet tilbake. Sjekk logger." };
    } finally {
        await prisma.$disconnect();
    }
};