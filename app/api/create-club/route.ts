import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// ✅ Lagrer en ny klubb
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Hent verdiene fra formData
    const name = formData.get("name") as string;
    const sted = formData.get("sted") as string;
    const description = formData.get("description") as string | null;
    const email = formData.get("email") as string | null;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string;
    const logo = formData.get("logoUrl") as File | null;

    // Vi antar at frontend har validert de obligatoriske feltene
    // Håndter tomme felter på serveren, men tillat tomme strenger for valgfrie felt
    if (!name || !sted || !address || !phone || !postalCode) {
      return NextResponse.json({ error: "Alle obligatoriske felter må fylles ut." }, { status: 400 });
    }

    // Sjekk om klubben allerede finnes
    const existingClub = await prisma.club.findUnique({
      where: { name: name },
    });

    if (existingClub) {
      return NextResponse.json({ error: "Klubben eksisterer allerede!" }, { status: 400 });
    }

    // Behandle bildeopplastning for logo
    let logoUrl: string | null = null;
    if (logo) {
      const filePath = path.join(process.cwd(), "public/uploads", logo.name);
      await writeFile(filePath, Buffer.from(await logo.arrayBuffer())); // Lagrer bildet på serveren
      logoUrl = `/uploads/${logo.name}`; // Lager en offentlig URL til bildet
    }

    // Opprett klubben i databasen
    const newClub = await prisma.club.create({
      data: {
        name,
        location: sted,
        description: description || "Ingen beskrivelse", // Standardbeskrivelse hvis ingen er gitt
        email: email || null,
        address,
        phone,
        postalCode,
        logoUrl, // Lagret logo URL (eller null hvis ingen logo)
      },
    });

    return NextResponse.json(newClub, { status: 201 });
  } catch (error) {
    console.error("Feil ved opprettelse av klubb:", error);
    return NextResponse.json({ error: "Feil ved opprettelse av klubb" }, { status: 500 });
  }
}
