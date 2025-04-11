// Fil: app/api/tournaments/[id]/active-session/route.ts
// Formål: API-endepunkt (GET) for å finne den aktive (ikke fullførte) turneringsrunden (sesjonen) for en spesifikk turnering.
//         Prioriterer 'inProgress' over 'waiting' og den siste runden. Krever autentisering.
//         Returnerer ID og status for den aktive sesjonen, eller null hvis ingen er aktiv.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { PrismaClient, TournamentGameSession } from "@prisma/client"; // Importer TournamentGameSession for status
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Korrekt typesignatur
) {
    const awaitedParams = await params; // Løs promiset
    const tournamentId = awaitedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }

    if (!tournamentId) {
        return NextResponse.json({ error: "Mangler turnerings-ID." }, { status: 400 });
    }

    try {
        const activeSession = await prisma.tournamentGameSession.findFirst({
            where: {
                tournamentId: tournamentId,
                status: { not: 'completed' } // Finn 'waiting' eller 'inProgress'
            },
            orderBy: [
                // Prioriter 'inProgress' over 'waiting' hvis begge finnes for ulike runder
                { status: 'asc' },
                // Hvis status er lik, ta siste runde
                { roundNumber: 'desc' }
            ],
            // --- ENDRING: Velg også status ---
            select: { id: true, status: true } // Trenger ID og status
        });

        // --- ENDRING: Returner status også ---
        return NextResponse.json({
            sessionId: activeSession?.id ?? null,
            sessionStatus: activeSession?.status ?? null // Returner status også
        });

    } catch (error) {
        console.error(`Feil ved henting av aktiv turneringssesjon for turnering ${tournamentId}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved søk etter aktiv sesjon." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}