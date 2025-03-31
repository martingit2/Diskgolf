// app/api/tournaments/[id]/route.ts
import { PrismaClient, TournamentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();

// GET - Henter detaljer for én turnering (krever ikke innlogging)
export async function GET(
    request: Request,
    // --- KORRIGERT TYPESIGNATUR HER ---
    { params }: { params: Promise<{ id: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const id = awaitedParams.id; // Bruk den awaited verdien

    // Valider at id finnes etter await
    if (!id) {
        return NextResponse.json(
            { error: "Mangler turnerings-ID." },
            { status: 400 }
        );
    }

    try {
        // Bruk id fra awaitedParams
        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                course: { select: { id: true, name: true, location: true, image: true, par: true, numHoles: true, baskets: {select: {id: true}} } }, // Inkluder par/numHoles
                organizer: { select: { id: true, name: true } },
                club: { select: { id: true, name: true } },
                participants: { select: { id: true, name: true } }, // Vurder å hente image her også?
                _count: { select: { participants: true } },
            },
        });

        if (!tournament) {
            return NextResponse.json(
                { error: "Turnering ikke funnet" },
                { status: 404 }
            );
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error(`Feil ved henting av turnering ${id}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved henting av turnering." },
            { status: 500 }
        );
    } finally {
        // Koble fra etter operasjonen
        await prisma.$disconnect();
    }
}

// PUT - Oppdaterer en turnering (krever innlogging og arrangørrettigheter)
export async function PUT(
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
    const userId = session.user.id;

    // Valider at tournamentId finnes etter await
    if (!tournamentId) {
        return NextResponse.json(
            { error: "Mangler turnerings-ID." },
            { status: 400 }
        );
    }

    try {
        // Finn turneringen for å sjekke eierskap
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { organizerId: true }
        });

        if (!tournament) {
            return NextResponse.json({ error: "Turnering ikke funnet" }, { status: 404 });
        }

        // --- Autorisasjonssjekk ---
        if (tournament.organizerId !== userId) {
            console.warn(`User ${userId} attempted to PUT unauthorized on tournament ${tournamentId} owned by ${tournament.organizerId}`);
            return NextResponse.json({ error: "Handling forbudt: Kun arrangør kan redigere turneringen." }, { status: 403 });
        }

        // Fortsett med oppdatering hvis autorisert
        const body = await request.json();

        // Valider påkrevde felter
        if (!body.name || !body.startDate || !body.courseId || !body.location || !body.status) {
            return NextResponse.json(
                { error: "Mangler obligatoriske felter for oppdatering (navn, startdato, bane, sted, status)." },
                { status: 400 }
            );
        }
        if (!Object.values(TournamentStatus).includes(body.status as TournamentStatus)) {
            return NextResponse.json({ error: "Ugyldig statusverdi." }, { status: 400 });
        }
        // Valider datoer (enkel sjekk)
        try {
             new Date(body.startDate);
             if (body.endDate) new Date(body.endDate);
        } catch (e) {
             return NextResponse.json({ error: "Ugyldig datoformat for start- eller sluttdato." }, { status: 400 });
        }
        if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
            return NextResponse.json({ error: "Sluttdato kan ikke være før startdato." }, { status: 400 });
        }


        // Oppdater turneringen
        const updatedTournament = await prisma.tournament.update({
            where: { id: tournamentId },
            data: {
                name: body.name,
                description: body.description || null, // Tillat null/tom streng
                location: body.location,
                startDate: new Date(body.startDate), // Konverter til Date
                endDate: body.endDate ? new Date(body.endDate) : null, // Konverter til Date eller null
                status: body.status as TournamentStatus,
                maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants, 10) : null, // Sørg for base 10
                courseId: body.courseId,
                clubId: body.clubId || null, // Tillat null
                image: body.image || null, // Tillat null
                // Ikke oppdater organizerId her!
            },
            include: { // Inkluder nødvendige relasjoner i responsen for å oppdatere UI
                course: { select: { id: true, name: true, location: true, image: true, par: true, numHoles: true, baskets: {select: {id: true}} } },
                organizer: { select: { id: true, name: true } },
                club: { select: { id: true, name: true } },
                participants: { select: { id: true, name: true } }, // Trengs dette i responsen? Vurder å fjerne for mindre payload.
                _count: { select: { participants: true } },
            },
        });

        return NextResponse.json(updatedTournament);
    } catch (error) {
        console.error(`Feil ved oppdatering av turnering ${tournamentId}:`, error);
        // Sjekk for spesifikke feil, f.eks. Prisma P2002 (unique constraint) hvis navn endres til eksisterende?
        // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { ... }
        return NextResponse.json(
            { error: "En intern feil oppstod ved oppdatering av turnering." },
            { status: 500 }
        );
    } finally {
        // Koble fra etter operasjonen
        await prisma.$disconnect();
    }
}