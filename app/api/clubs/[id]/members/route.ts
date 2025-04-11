// Fil: src/app/api/clubs/[id]/members/route.ts
// Formål: API-endepunkt (GET) for å hente en paginert liste over medlemmer for en spesifikk klubb.
//         Inkluderer autentisering og autorisasjon (kun klubb- eller global admin kan se medlemslisten).
//         Returnerer medlemsdata (navn, e-post, status etc.) og pagineringsinformasjon.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { auth } from "@/auth"; //

const prisma = new PrismaClient();
const MEMBERS_PER_PAGE = 10; // Antall medlemmer per side

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // --- INITIALISER clubId til null ---
    let clubId: string | null = null; // Viktig: Initialiser til null
    // ----------------------------------
    const baseEndpoint = `/api/clubs/[id]/members`; // Endpoint før vi har ID

    try {
        // --- VENT PÅ AT PARAMS BLIR LØST ---
        const resolvedParams = await params;
        clubId = resolvedParams.id; 
        // -----------------------------------
        const endpoint = `/api/clubs/${clubId}/members`; // Spesifikt endpoint for logging
        console.log(`[${endpoint}] Received GET request for resolved clubId: ${clubId}`);

        if (!clubId) { // Dobbeltsjekk etter await, selv om det er usannsynlig med riktig await
            console.error(`[${baseEndpoint}] Missing clubId after awaiting params.`);
            return NextResponse.json({ error: "Mangler klubb-ID" }, { status: 400 });
        }

        // --- Autentisering & Autorisering ---
        const session = await auth();
        const requestingUserId = session?.user?.id;
        const requestingUserRole = session?.user?.role;

        if (!requestingUserId) {
            console.warn(`[${endpoint}] Unauthorized access attempt: No user session.`);
            return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 });
        }
        console.log(`[${endpoint}] Requesting user: ${requestingUserId}, Role: ${requestingUserRole}`);

        // --- AUTORISASJONSSJEKK ---
        let hasAccess = false;
        if (requestingUserRole === UserRole.ADMIN) {
             hasAccess = true;
             console.log(`[${endpoint}] User ${requestingUserId} is ADMIN. Granting access.`);
        } else if (requestingUserRole === UserRole.CLUB_LEADER) {
             const clubAdmin = await prisma.club.findFirst({
                 where: {
                     id: clubId, 
                     admins: { some: { id: requestingUserId } }
                 },
                 select: { id: true }
             });
             if (clubAdmin) {
                 hasAccess = true;
                 console.log(`[${endpoint}] User ${requestingUserId} is CLUB_LEADER and admin for club ${clubId}. Granting access.`);
             }
        }

        if (!hasAccess) {
             console.warn(`[${endpoint}] User ${requestingUserId} (Role: ${requestingUserRole}) lacks permission for club ${clubId}.`);
             return NextResponse.json({ error: "Ingen tilgang til å se medlemmer for denne klubben" }, { status: 403 });
        }
        // ---------------------------------------


        // --- Hent Paginering Params ---
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || String(MEMBERS_PER_PAGE), 10);
        const validPage = Math.max(1, page);
        const validLimit = Math.max(1, limit);
        const skip = (validPage - 1) * validLimit;
        console.log(`[${endpoint}] Fetching members, page: ${validPage}, limit: ${validLimit}, skip: ${skip}`);
        // ----------------------------

        // --- Hent Medlemmer (paginert) ---
        const [memberships, totalCount] = await prisma.$transaction([
            prisma.membership.findMany({
                where: { clubId: clubId },
                select: {
                    userId: true, status: true, isPrimary: true, clubId: true,
                    user: { select: { id: true, name: true, email: true, image: true } }
                },
                orderBy: { user: { name: 'asc' } },
                skip: skip, take: validLimit,
            }),
            prisma.membership.count({ where: { clubId: clubId } })
        ]);
        console.log(`[${endpoint}] Found ${memberships.length} memberships on this page. Total members: ${totalCount}.`);
        // -----------------------------

        // --- Formater Data ---
        const membersData = memberships.map(m => ({
            userId: m.userId,
            clubId: m.clubId,
            name: m.user?.name ?? 'Ukjent Bruker',
            email: m.user?.email ?? 'Ukjent E-post',
            image: m.user?.image,
            status: m.status,
            isPrimary: m.isPrimary,
        }));
        // -------------------

        const totalPages = Math.ceil(totalCount / validLimit);

        console.log(`[${endpoint}] Returning ${membersData.length} members. Total pages: ${totalPages}`);
        return NextResponse.json({
            members: membersData, totalPages, currentPage: validPage, totalMembers: totalCount
        });

    } catch (error) {
        // --- Bruk nullish coalescing (??) for sikker logging ---
        const errorClubId = clubId ?? "[ID not resolved]"; // Bruk ID hvis den finnes, ellers placeholder
        console.error(`[${baseEndpoint}] Error fetching members for club ${errorClubId}:`, error);
        return NextResponse.json({ error: `Kunne ikke hente medlemmer for klubb ${errorClubId} på grunn av en intern feil` }, { status: 500 });
        // -------------------------------------------------------
    } finally {
        await prisma.$disconnect();
        // --- Bruk nullish coalescing (??) for sikker logging ---
        const finalClubId = clubId ?? "[ID not resolved]"; // Bruk ID hvis den finnes, ellers placeholder
        console.log(`[${baseEndpoint}] Database connection closed for request related to club ${finalClubId}.`);
        // -------------------------------------------------------
    }
}