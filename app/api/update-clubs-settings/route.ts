// Fil: app/api/clubs/update-settings/route.ts 
// Formål: API-endepunkt (POST) for å oppdatere klubbinnstillinger (navn, adresse, telefon, postnummer).
//         Inkluderer logikk for å håndtere opplasting av en logo-fil til serverens lokale filsystem (`public/uploads`).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs"; // For filhåndtering
import path from "path"; // For å håndtere filstier

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const clubId = formData.get("clubId") as string;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string;
    const logoFile = formData.get("logoUrl") as File | null;

    if (!clubId) {
      console.log("Klubb-ID mangler!");
      return NextResponse.json({ error: "Klubb-ID er påkrevd" }, { status: 400 });
    }

    let logoUrl: string | null = null;
    if (logoFile) {
      const filePath = path.join(process.cwd(), "public/uploads", logoFile.name);
      console.log(`Lagrer logo på: ${filePath}`);
      const fileStream = fs.createWriteStream(filePath);
      fileStream.write(Buffer.from(await logoFile.arrayBuffer()));
      fileStream.end();
      logoUrl = `/uploads/${logoFile.name}`; // Lag en URL for logoen
    }

    // Oppdater klubbens innstillinger i databasen
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        name,
        address,
        phone,
        postalCode,
        logoUrl, // Lagre logo-URL hvis logo er lastet opp
      },
    });

    console.log("Klubbinnstillinger oppdatert:", updatedClub);

    return NextResponse.json({ success: "Klubbinnstillinger oppdatert!", updatedSettings: updatedClub }, { status: 200 });
  } catch (error) {
    console.error("Feil ved oppdatering av klubb:", error);
    return NextResponse.json({ error: "Kunne ikke oppdatere klubbinnstillinger" }, { status: 500 });
  }
}
