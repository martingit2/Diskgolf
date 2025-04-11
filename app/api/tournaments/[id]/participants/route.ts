// Fil: app/api/tournaments/[id]/participants/route.ts
// Formål: API-endepunkt (GET) for å hente listen over deltakere for en spesifikk turnering.
//         Krever autentisering. Returnerer en liste med deltakerens ID, navn og bilde, samt totalt antall deltakere.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



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

    // Hent session på serversiden for *dette* API-kallet
    const session = await getServerSession(authOptions);

    // --- Autentiseringssjekk ---
    // Selv om alle kan se en turnering, kan vi kreve innlogging for å se deltakerlisten
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves for å se deltakere." }, { status: 401 });
    }

    // Valider at tournamentId finnes etter await
    if (!tournamentId) {
        return NextResponse.json(
            { error: "Mangler turnerings-ID." },
            { status: 400 }
        );
    }

    try {
        // Bruk tournamentId fra awaitedParams
        // Hent deltakere for den gitte turneringen
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: {
                // Hent bare deltakerne
                participants: {
                    select: {
                        id: true,
                        name: true,
                        image: true // Hent profilbilde også
                    },
                    orderBy: {
                        name: 'asc' // Sorter alfabetisk på navn
                    }
                },
                // Hent også antall deltakere effektivt
                _count: {
                    select: { participants: true }
                }
            },
        });

        if (!tournament) {
            return NextResponse.json(
                { error: "Turnering ikke funnet." },
                { status: 404 }
            );
        }

        // Returner listen over deltakere og totalt antall
        return NextResponse.json({
            participants: tournament.participants,
            count: tournament._count.participants
        });

    } catch (error) {
        console.error(`Feil ved henting av deltakere for turnering ${tournamentId}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved henting av deltakere." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}