// src/app/api/meetings/[meetingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Use alias import for auth
import cloudinary from "../../../../lib/cloudinary"; // Adjust path if necessary
import { checkMembership } from "../../../../lib/clubUtils"; // Adjust path if necessary
import { revalidatePath } from "next/cache";

// Local Prisma instance for this route
const prisma = new PrismaClient();

// --- Helper function to check admin access (needed for DELETE) ---
async function checkAdminAccessForClub(userId: string | undefined, clubId: string): Promise<boolean> {
    if (!userId || !clubId) return false;
    try {
        const clubAdmin = await prisma.club.findFirst({
            where: { id: clubId, admins: { some: { id: userId } } },
            select: { id: true }
        });
        if (clubAdmin) return true;
        const session = await auth();
        return session?.user?.role === 'ADMIN';
    } catch (error) {
        console.error(`Error checking admin access for club ${clubId}:`, error);
        return false;
    }
}

// --- Helper function to fetch file from Cloudinary (for GET) ---
async function fetchCloudinaryFile(publicId: string): Promise<ArrayBuffer> {
    const url = cloudinary.url(publicId, { resource_type: 'raw' });
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch file from Cloudinary (${response.status}): ${errorText}`);
        throw new Error(`Could not fetch file from storage (${response.status})`);
    }
    return response.arrayBuffer();
}

// --- GET Handler (Download Meeting PDF) ---
export async function GET(
    request: NextRequest,
    // --- CORRECTED: Use Promise for params type ---
    { params }: { params: Promise<{ meetingId: string }> }
    // -------------------------------------------
) {
    // --- CORRECTED: Await params to get meetingId ---
    const { meetingId } = await params;
    // ---------------------------------------------
    const endpoint = `/api/meetings/${meetingId}/download (GET)`;

    let meetingClubId: string | null = null;

    try {
        // 1. Authenticate user
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 2. Fetch meeting data
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            select: { clubId: true, cloudinaryPublicId: true, title: true }
        });
        if (!meeting || !meeting.cloudinaryPublicId) {
            return NextResponse.json({ error: "Document or file ID not found" }, { status: 404 });
        }
        meetingClubId = meeting.clubId;

        // 3. Authorize user (check club membership)
        const isMember = await checkMembership(userId, meeting.clubId);
        if (!isMember) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // 4. Fetch the actual file from Cloudinary
        const fileBuffer = await fetchCloudinaryFile(meeting.cloudinaryPublicId);

        // 5. Prepare and return the file response
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        const downloadFilename = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'meeting_document'}.pdf`;
        headers.set('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        return new NextResponse(fileBuffer, { status: 200, headers });

    } catch (error: any) {
        console.error(`[${endpoint}] Error during download:`, error);
        return NextResponse.json({ error: error.message || "Could not process download request." }, { status: 500 });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

// --- DELETE Handler (Delete Meeting Document) ---
export async function DELETE(
    request: NextRequest,
    // --- CORRECTED: Use Promise for params type ---
    { params }: { params: Promise<{ meetingId: string }> }
    // -------------------------------------------
) {
    // --- CORRECTED: Await params to get meetingId ---
    const { meetingId } = await params;
    // ---------------------------------------------
    const endpoint = `/api/meetings/${meetingId} (DELETE)`;

    let meetingInfo: { clubId: string, cloudinaryPublicId: string | null } | null = null;

    try {
        // 1. Authenticate user
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 2. Fetch meeting data
        meetingInfo = await prisma.meeting.findUnique({
            where: { id: meetingId },
            select: { clubId: true, cloudinaryPublicId: true }
        });
        if (!meetingInfo) {
            return NextResponse.json({ error: "Meeting document not found" }, { status: 404 });
        }

        // 3. Authorize user (check admin access)
        const isAdmin = await checkAdminAccessForClub(userId, meetingInfo.clubId);
        if (!isAdmin) {
            return NextResponse.json({ error: "Access denied to delete this document" }, { status: 403 });
        }

        // 4. Delete meeting record from the database
        await prisma.meeting.delete({ where: { id: meetingId } });

        // 5. Delete the file from Cloudinary
        if (meetingInfo.cloudinaryPublicId) {
            try {
                const deletionResult = await cloudinary.uploader.destroy(meetingInfo.cloudinaryPublicId, {
                    resource_type: "raw"
                });
                if (deletionResult.result !== 'ok' && deletionResult.result !== 'not found') {
                    console.warn(`Cloudinary deletion did not return 'ok':`, deletionResult.result);
                }
            } catch (cloudinaryError) {
                console.error(`Error deleting from Cloudinary:`, cloudinaryError);
            }
        }

        // 6. Revalidate the members area path
        const pathToRevalidate = `/klubber/${meetingInfo.clubId}/medlem`;
        revalidatePath(pathToRevalidate);

        // 7. Return successful response
        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error: any) {
        console.error(`[${endpoint}] Error during deletion:`, error);
        return NextResponse.json({ error: error.message || "Could not process delete request." }, { status: 500 });
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}