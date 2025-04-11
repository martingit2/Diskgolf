// Fil: app/api/tournaments/[id]/scores/route.ts
// Formål: API-endepunkt (POST) for å lagre de endelige resultatene (score per hull, total score, total OB) for en turnering.
//         Krever at brukeren er arrangør. Sletter først eventuelle eksisterende resultater for turneringen
//         og lagrer deretter de nye resultatene for hver spiller i en transaksjon.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();

interface ScorePayload {
    strokes: number[]; // Array med slag per hull
    totalScore: number; // Sum av strokes + obCount
    totalOb: number; // Sum av obCount
}

// Definerer at request body er et objekt der nøklene er playerId (string)
// og verdiene er ScorePayload-objekter
interface RequestBody {
    [playerId: string]: ScorePayload;
}

export async function POST(
    request: Request,
    // --- KORRIGERT TYPESIGNATUR HER ---
    { params }: { params: Promise<{ id: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id; // Bruk den awaited verdien

    // Hent session
    const session = await getServerSession(authOptions);

    // Sjekk innlogging
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }
    const userId = session.user.id; // Innlogget bruker

    // Valider at tournamentId finnes etter await
    if (!tournamentId) {
        return NextResponse.json(
            { error: "Mangler turnerings-ID." },
            { status: 400 }
        );
    }

    try {
        // Bruk tournamentId fra awaitedParams
        // Sjekk om turneringen finnes og om brukeren er arrangør
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: {
                organizerId: true,
                // Hent antall hull fra course-relasjonen
                course: {
                     select: { numHoles: true, baskets: {select : {id: true}} } // Bruk numHoles eller baskets for telling
                }
            }
        });

        if (!tournament) {
            return NextResponse.json({ error: "Turnering ikke funnet" }, { status: 404 });
        }

        // --- Autorisasjonssjekk ---
        if (tournament.organizerId !== userId) {
             console.warn(`User ${userId} attempted POST unauthorized on scores for tournament ${tournamentId} owned by ${tournament.organizerId}`);
            return NextResponse.json({ error: "Handling forbudt: Kun arrangør kan lagre score." }, { status: 403 });
        }

        // Få antall hull fra banen
        const numberOfHoles = tournament.course?.numHoles ?? tournament.course?.baskets?.length ?? 0;
        if (numberOfHoles === 0) {
            console.error(`Tournament ${tournamentId} course has 0 holes.`);
            return NextResponse.json({ error: "Turneringens bane mangler hullinformasjon." }, { status: 400 });
        }

        // Hent og parse request body
        const scoresData: RequestBody = await request.json();

        // Valider rot-nivået av input
        if (!scoresData || typeof scoresData !== "object" || Object.keys(scoresData).length === 0) {
            return NextResponse.json(
                { error: "Ugyldig dataformat eller tomme data for resultater." },
                { status: 400 }
            );
        }

        const transactionOperations = [];

        // 1. Slett alle eksisterende TournamentScore for denne turneringen
        //    Dette sikrer at vi alltid har kun det siste settet med resultater.
        transactionOperations.push(prisma.tournamentScore.deleteMany({
            where: { tournamentId }
        }));

        // 2. Valider og forbered 'create'-operasjoner for nye resultater
        for (const [playerId, playerData] of Object.entries(scoresData)) {
            // Grundig validering av hver spillers data
            if (!playerData ||
                typeof playerData !== 'object' || // Sjekk at playerData er et objekt
                !Array.isArray(playerData.strokes) ||
                typeof playerData.totalScore !== 'number' ||
                typeof playerData.totalOb !== 'number')
            {
                // Kast en feil som fanges av catch-blokken for å stoppe transaksjonen
                throw new Error(`Ugyldig score-objektformat for spiller ${playerId}`);
            }
            if (playerData.strokes.length !== numberOfHoles) {
                 throw new Error(`Feil antall hull-scores for spiller ${playerId}. Forventet ${numberOfHoles}, fikk ${playerData.strokes.length}`);
            }
            // Sjekk at alle slag er gyldige tall >= 1
            if (playerData.strokes.some(s => typeof s !== 'number' || !Number.isInteger(s) || s < 1)) {
                 throw new Error(`Ugyldig(e) slag funnet for spiller ${playerId}. Slag må være heltall større enn 0.`);
            }
             // Sjekk at totalScore og totalOb er gyldige tall >= 0
             if (!Number.isInteger(playerData.totalScore) || playerData.totalScore < 0 ||
                 !Number.isInteger(playerData.totalOb) || playerData.totalOb < 0) {
                 throw new Error(`Ugyldig totalScore (${playerData.totalScore}) eller totalOb (${playerData.totalOb}) for spiller ${playerId}. Må være positive heltall.`);
             }

            // Legg til create-operasjon i listen
            transactionOperations.push(prisma.tournamentScore.create({
                data: {
                    tournamentId: tournamentId, // Bruker ID fra params
                    playerId: playerId, // Bruker nøkkelen fra scoresData
                    totalScore: playerData.totalScore,
                    totalOb: playerData.totalOb,
                    strokes: playerData.strokes as Prisma.JsonArray, // Lagre som JSON array
                    isVerified: true // Resultater lagt inn av arrangør anses som verifiserte
                }
            }));
        }

        // Utfør sletting og oppretting i én transaksjon
        const result = await prisma.$transaction(transactionOperations);

        // Resultatet av $transaction er et array med resultatene for hver operasjon.
        // Første element er resultatet av deleteMany (et objekt med 'count').
        // Resten er de opprettede TournamentScore-objektene.
        const createdScores = result.slice(1); // Henter ut de opprettede scorene

        console.log(`Deleted old scores and created ${createdScores.length} new scores for tournament ${tournamentId}`);

        // Returner de nylig opprettede scorene
        return NextResponse.json(createdScores);

    } catch (error) {
        console.error(`Feil ved lagring av resultater for turnering ${tournamentId}:`, error);
        // Sjekk for spesifikke valideringsfeil kastet i løkken
        if (error instanceof Error && (error.message.includes("Ugyldig score-objektformat") || error.message.includes("Feil antall hull-scores") || error.message.includes("Ugyldig(e) slag") || error.message.includes("Ugyldig totalScore"))) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
         if (error instanceof SyntaxError) { // Fanger feil hvis request.json() feiler
            return NextResponse.json({ error: "Ugyldig JSON-format i forespørsel." }, { status: 400 });
        }
        // Generell serverfeil
        return NextResponse.json(
          { error: "En intern feil oppstod ved lagring av resultater." },
          { status: 500 }
        );
    } finally {
        // Koble fra etter operasjonen
        await prisma.$disconnect();
    }
}