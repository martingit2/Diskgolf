// app/api/tournaments/[id]/active-session/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    // --- KORRIGERT TYPESIGNATUR HER ---
    { params }: { params: Promise<{ id: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id; // Bruk den awaited verdien

    const session = await getServerSession(authOptions);
    // Krever innlogging for å finne sesjonen? Bør være ok, da brukeren må være logget inn for å se turneringssiden.
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }

    // Valider at tournamentId finnes etter await
    if (!tournamentId) {
        return NextResponse.json({ error: "Mangler turnerings-ID." }, { status: 400 });
    }

    try {
        // Bruk tournamentId fra awaitedParams
        // Finn den siste aktive (ikke completed) sesjonen for denne turneringen
        const activeSession = await prisma.tournamentGameSession.findFirst({
            where: {
                tournamentId: tournamentId,
                status: { not: 'completed' } // Finn 'waiting' eller 'inProgress'
            },
            orderBy: {
                // Sorter etter status ('inProgress' før 'waiting'), deretter runde
                status: 'asc', // Prioriter 'inProgress'
                roundNumber: 'desc' // Ta siste runde hvis flere har samme status
            },
            select: { id: true } // Trenger bare IDen
        });

        // Returner IDen til den funnede sesjonen, eller null hvis ingen aktiv sesjon ble funnet
        return NextResponse.json({ sessionId: activeSession?.id ?? null });

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