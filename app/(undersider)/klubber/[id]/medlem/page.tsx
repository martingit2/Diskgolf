// src/app/klubber/[id]/medlem/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient, Meeting, Prisma } from '@prisma/client';
import MeetingManagementSection from "@/components/klubber/MeetingManagementSection";
import { checkMembership } from "../../../../lib/clubUtils"; // Juster sti
// import { checkAdminAccess } from "../../../../lib/clubUtils";

const prisma = new PrismaClient();

async function checkAdminAccess(userId: string | undefined, clubId: string): Promise<boolean> {
    if (!userId || !clubId) return false;
    try {
        const clubAdmin = await prisma.club.findFirst({ where: { id: clubId, admins: { some: { id: userId } } }, select: { id: true } });
        if (clubAdmin) return true;
        const session = await auth();
        return session?.user?.role === 'ADMIN';
    } catch (error) { console.error(`[Adminsjekk - ${clubId}] Feil:`, error); return false; }
}

export default async function MedlemsomradePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: clubId } = await params;
    console.log(`Laster medlemsområde for klubb: ${clubId}`);
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) { redirect("/auth/login?callbackUrl=" + encodeURIComponent(`/klubber/${clubId}/medlem`)); }

    const isMember = await checkMembership(userId, clubId);
    if (!isMember) { return notFound(); }

    const isAdminForThisClub = await checkAdminAccess(userId, clubId);
    console.log(`[Medlemsområde - ${clubId}] Bruker ${userId} er admin: ${isAdminForThisClub}`);

    // ------ FJERNET TYPE ClubDataWithMeetings da vi henter alt ------
    // type ClubDataWithMeetings = Prisma.ClubGetPayload<{ ... }>;
    // ------------------------------------------------------------

    let clubData: Prisma.ClubGetPayload<{ include: { meetings: true } }> | null = null; // Bruker standard payload type
    let fetchError: Error | null = null;

    try {
        console.log(`[Medlemsområde - ${clubId}] Henter klubbdata og ALLE møtefelter...`);
        clubData = await prisma.club.findUnique({
            where: { id: clubId },
            // ------ FJERNET SELECT FRA MEETINGS ------
            include: {
                meetings: {
                    // Ingen 'select' her lenger, henter alle felter
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
            // -----------------------------------------
        });

        if (!clubData) { return notFound(); }
        console.log(`[Medlemsområde - ${clubId}] Fant klubb: ${clubData.name} med ${clubData.meetings.length} møter.`);
        if (clubData.meetings.length > 0) { console.log("[Medlemsområde] Første møte data:", clubData.meetings[0]); } // Bør nå inneholde alle felter

    } catch (error) {
        console.error(`❌ Kritisk feil under lasting av data for klubb ${clubId}:`, error);
        fetchError = error instanceof Error ? error : new Error("Ukjent feil ved datahenting");
    } finally {
         if (prisma) { await prisma.$disconnect(); }
    }

     if (fetchError) { return (<div>Feil ved lasting...</div>); }
     if (!clubData) { return notFound(); }

    // --- Rendering ---
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 md:py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl ..."> Medlemsområde: {clubData.name} </h1>
                {/* Sender nå komplette Meeting-objekter */}
                <MeetingManagementSection
                    clubId={clubId}
                    isAdmin={isAdminForThisClub}
                    initialMeetings={clubData.meetings} // Dette matcher nå prop-typen
                />
            </div>
        </div>
    );
}