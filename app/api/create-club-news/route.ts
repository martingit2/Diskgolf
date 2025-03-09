import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs"; // For filhåndtering
import path from "path"; // For å håndtere filstier
import { currentRole } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData(); // Hent all data som en formData
    const clubId = formData.get("clubId") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null; // Hent bildet som er lastet opp

    // Sjekk om alle nødvendige felter er fylt ut
    if (!clubId || !title || !content) {
      console.error("Feil: Mangler data i request body!", { clubId, title, content });
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Autentisering og rollevalidering
    const role = await currentRole();
    if (role !== "ADMIN" && role !== "CLUB_LEADER") {
      return NextResponse.json({ error: "Ingen tilgang til denne serverhandlingen!" }, { status: 403 });
    }

    // Hent klubb fra databasen
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json({ error: "Klubben ble ikke funnet i databasen." }, { status: 404 });
    }

    // Håndtere bildeopplasting, lagre bildet lokalt
    let imageUrl: string | null = null;
    if (imageFile) {
      const filePath = path.join(process.cwd(), "public/uploads", imageFile.name); // Angi hvor bildet skal lagres
      const fileStream = fs.createWriteStream(filePath);
      fileStream.write(Buffer.from(await imageFile.arrayBuffer()));
      fileStream.end();
      imageUrl = `/uploads/${imageFile.name}`; // Lag en URL for bildet som skal lagres i databasen
    }

    // Opprett ny klubbnyhet i databasen med bilde-URL
    const newClubNews = await prisma.clubNews.create({
      data: {
        clubId,
        title,
        content,
        imageUrl, // Lagre bilde-URL dersom bilde er lastet opp
        createdAt: new Date(),
      },
    });

    console.log("Ny klubbnyhet opprettet:", newClubNews); // Logg suksess

    return NextResponse.json(newClubNews, { status: 201 });
  } catch (error) {
    console.error("Error creating club news:", error);
    return NextResponse.json({ error: "Failed to create club news" }, { status: 500 });
  }
}
