"use server";

import { PrismaClient } from "@prisma/client";
import fs from "fs"; // For filhåndtering
import path from "path"; // For filstier
import { currentUser } from "../lib/auth";

const prisma = new PrismaClient();

export async function updateClubSettings({
  clubId,
  name,
  address,
  phone,
  postalCode,
  logoFile,
}: {
  clubId: string;
  name: string;
  address: string;
  phone: string;
  postalCode: string;
  logoFile: File | null;
}) {
  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  // Sjekk at brukeren har riktige rettigheter (ADMIN eller CLUB_LEADER)
  if (user.role !== "ADMIN" && user.role !== "CLUB_LEADER") {
    console.error("Ugyldig rolle, tilgang nektet");
    return { error: "Du har ikke tilgang til klubbinnstillinger" };
  }

  // Forbered logoUrl hvis logo er lastet opp
  let logoUrl: string | null = null;
  if (logoFile) {
    const filePath = path.join(process.cwd(), "public/uploads", logoFile.name);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(Buffer.from(await logoFile.arrayBuffer()));
    fileStream.end();
    logoUrl = `/uploads/${logoFile.name}`; // Lag en URL for logoen
  }

  try {
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
    return { success: "Klubbinnstillinger oppdatert!" };
  } catch (error) {
    console.error("Feil under oppdatering av klubbinnstillinger:", error);
    return { error: "Kunne ikke oppdatere klubbinnstillinger. Prøv igjen senere." };
  }
}
