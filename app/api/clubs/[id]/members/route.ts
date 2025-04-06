// src/app/api/clubs/[clubId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Bruk din auth-metode

const prisma = new PrismaClient();
const MEMBERS_PER_PAGE = 10; // Antall medlemmer per side

export async function GET(
    request: NextRequest,
    // *** KORRIGERT TYPESIGNATUR FOR PARAMS ***
    { params }: { params: Promise<{ clubId: string }> }
    // ****************************************
) {
    // *** AWAIT PARAMS HER ***
    const awaitedParams = await params;
    const clubId = awaitedParams.clubId;
    // **********************

    const endpoint = `/api/clubs/${clubId}/members`; // Bruk clubId fra awaitedParams
    console.log(`[${endpoint}] Received GET request`);

    // Sjekk om clubId finnes etter await
    if (!clubId) {
        console.error(`[${endpoint}] Missing clubId after awaiting params.`);
        return NextResponse.json({ error: "Mangler klubb-ID" }, { status: 400 });
    }

    try {
        // --- Autentisering & Autorisering ---
        const session = await auth();
        const requestingUserId = session?.user?.id;
        const requestingUserRole = session?.user?.role;

        if (!requestingUserId) {
            return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 });
        }

        // Sjekk om brukeren er admin for DENNE klubben ELLER global admin
        const club = await prisma.club.findFirst({
            where: {
                id: clubId, // Bruk clubId fra awaitedParams
                OR: [ { admins: { some: { id: requestingUserId } } } ],
            },
            select: { id: true }
        });
        const isGlobalAdmin = requestingUserRole === 'ADMIN';

        if (!club && !isGlobalAdmin) {
            console.warn(`[${endpoint}] User ${requestingUserId} lacks permission for club ${clubId}.`);
            return NextResponse.json({ error: "Ingen tilgang til å se medlemmer for denne klubben" }, { status: 403 });
        }
        console.log(`[${endpoint}] User ${requestingUserId} authorized for club ${clubId}.`);
        // ---------------------------------------

        // --- Hent Paginering Params ---
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || String(MEMBERS_PER_PAGE), 10);
        const validPage = Math.max(1, page);
        const validLimit = Math.max(1, limit);
        const skip = (validPage - 1) * validLimit;
        // ----------------------------

        // --- Hent Medlemmer (paginert) ---
        const [memberships, totalCount] = await prisma.$transaction([
            prisma.membership.findMany({
                where: { clubId: clubId }, // Bruk clubId fra awaitedParams
                select: {
                    userId: true, status: true, isPrimary: true,
                    user: { select: { id: true, name: true, email: true, image: true } }
                },
                orderBy: { user: { name: 'asc' } },
                skip: skip, take: validLimit,
            }),
            prisma.membership.count({ where: { clubId: clubId } }) // Bruk clubId fra awaitedParams
        ]);
        // -----------------------------

        // --- Formater Data ---
        const membersData = memberships.map(m => ({
            userId: m.userId, clubId: clubId, // Bruk clubId fra awaitedParams
            name: m.user?.name ?? 'Ukjent Bruker', email: m.user?.email ?? 'Ukjent E-post',
            image: m.user?.image, status: m.status, isPrimary: m.isPrimary,
        }));
        // -------------------

        const totalPages = Math.ceil(totalCount / validLimit);

        return NextResponse.json({
            members: membersData, totalPages, currentPage: validPage, totalMembers: totalCount
        });

    } catch (error) {
        console.error(`[${endpoint}] Error fetching members:`, error);
        return NextResponse.json({ error: "Kunne ikke hente medlemmer" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}