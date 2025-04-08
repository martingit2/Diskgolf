// src/app/api/clubs/[id]/meetings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Bruk alias for auth
import cloudinary from "../../../../lib/cloudinary"; // Juster sti om nødvendig
import type { UploadApiResponse } from 'cloudinary';
import { revalidatePath } from "next/cache";

// Instansier Prisma Client lokalt
const prisma = new PrismaClient();

// Zod schema
const meetingSchema = z.object({
    title: z.string().min(3, { message: "Tittel må ha minst 3 tegn." }),
    description: z.string().optional(),
    // Forventer File i denne konteksten
    pdfFile: z.instanceof(File, { message: "PDF-fil er påkrevd." })
        .refine((file) => file.size > 0, "PDF-fil kan ikke være tom.")
        .refine((file) => file.size <= 5 * 1024 * 1024, `Filstørrelsen må være under 5MB.`)
        .refine((file) => file.type === "application/pdf", "Filen må være en PDF."),
});

// Definer typen for Zod-skjemaet
type MeetingInput = z.infer<typeof meetingSchema>;

// Hjelpefunksjon for public_id
function sanitizeFilenameForPublicId(filename: string): string {
    const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
    return nameWithoutExtension.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

export async function POST(
    request: NextRequest,
    // ------ Korrekt type for params (med Promise) ------
    { params }: { params: Promise<{ id: string }> }
    // --------------------------------------------------
) {
    // ------ Await params for å hente ID ------
    const { id: clubId } = await params;
    // -----------------------------------------
    const endpoint = `/api/clubs/${clubId}/meetings`;
    console.log(`[${endpoint}] Mottatt POST-forespørsel`);

    let cloudinaryPublicId: string | null = null;
    let newMeetingId: string | null = null;

    try {
        // 1. Autentisering
        const session = await auth();
        if (!session?.user?.id) { return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 }); }
        const userId = session.user.id;
        const userRole = session.user.role;
        console.log(`[${endpoint}] Bruker ${userId} autentisert.`);

        // 2. Autorisering
        const clubAdminCheck = await prisma.club.findFirst({ where: { id: clubId, OR: [ { admins: { some: { id: userId } } } ] }, select: { id: true } });
        const isGlobalAdmin = userRole === 'ADMIN';
        if (!clubAdminCheck && !isGlobalAdmin) { return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 }); }
        console.log(`[${endpoint}] Bruker ${userId} autorisert.`);

        // 3. Hent og Valider FormData
        let validatedData: MeetingInput;
        let pdfFile: File;
        try {
            const formData = await request.formData();
            const rawData = { title: formData.get("title"), description: formData.get("description"), pdfFile: formData.get("pdfFile") };
            const validationResult = meetingSchema.safeParse(rawData);
            if (!validationResult.success) { return NextResponse.json({ error: "Valideringsfeil", details: validationResult.error.flatten().fieldErrors }, { status: 400 }); }
            validatedData = validationResult.data;
            pdfFile = validationResult.data.pdfFile;
            console.log(`[${endpoint}] FormData validert: Tittel='${validatedData.title}', Fil='${pdfFile.name}'`);
        } catch (error) { return NextResponse.json({ error: "Kunne ikke behandle data" }, { status: 400 }); }

        // 4. Cloudinary Upload
        try {
            const cloudinaryFolder = `discgolf/clubs/${clubId}/meetings`;
            const publicIdBase = sanitizeFilenameForPublicId(pdfFile.name);
            const uniquePublicId = `${publicIdBase}_${Date.now()}`;
            const buffer = await pdfFile.arrayBuffer();
            const result: UploadApiResponse = await cloudinary.uploader.upload(
                 `data:${pdfFile.type};base64,${Buffer.from(buffer).toString('base64')}`,
                { folder: cloudinaryFolder, upload_preset: "discgolf_uploads", public_id: uniquePublicId, resource_type: "raw" }
            );
            if (!result?.public_id) { throw new Error("Cloudinary-opplasting returnerte ikke en public_id"); }
            cloudinaryPublicId = result.public_id;
            console.log(`[${endpoint}] PDF lastet opp. Public ID: ${cloudinaryPublicId}`);
        } catch (uploadError: any) { throw new Error(`Filopplasting feilet: ${uploadError.message || 'Ukjent Cloudinary-feil'}`); }

        // 5. Lagre møteinfo i databasen
        const newMeeting = await prisma.meeting.create({
            data: { clubId: clubId, title: validatedData.title, description: validatedData.description || "", cloudinaryPublicId: cloudinaryPublicId },
        });
        newMeetingId = newMeeting.id;
        console.log(`[${endpoint}] Møte opprettet i databasen med ID: ${newMeetingId}`);

        // 6. Revalider stien
        const pathToRevalidate = `/klubber/${clubId}/medlem`;
        revalidatePath(pathToRevalidate);
        console.log(`[${endpoint}] Revaliderte sti: ${pathToRevalidate}`);

        // 7. Returner suksess
        console.log(`[${endpoint}] Sender suksessrespons (201 Created).`);
        return NextResponse.json(newMeeting, { status: 201 });

    } catch (error: any) {
        console.error(`[${endpoint}] En feil oppstod under behandling:`, error);
        return NextResponse.json({ error: error.message || "En uventet feil oppstod på serveren." }, { status: 500 });
    } finally {
        if (prisma) {
            console.log(`[${endpoint}] Ferdigbehandlet forespørsel (Møte ID: ${newMeetingId ?? 'ikke opprettet'}). Kobler fra Prisma...`);
            await prisma.$disconnect();
            console.log(`[${endpoint}] Prisma disconnected.`);
         }
    }
}