"use server";

import { PrismaClient } from "@prisma/client";
import { currentUser } from "../lib/auth"; // For å få tak i den nåværende brukeren

const prisma = new PrismaClient();

export async function leaveClub({ userId, clubId }: { userId: string, clubId: string }) {
  const user = await currentUser();
  
  if (!user) {
    return { error: "Uautorisert" };
  }

  try {
    // Slett medlemskapet i klubben
    await prisma.membership.deleteMany({
      where: {
        userId,
        clubId,
      },
    });

    return { success: "Du har forlatt klubben!" };
  } catch (error) {
    console.error("Feil ved forlatelse av klubb:", error);
    return { error: "Kunne ikke forlate klubben" };
  }
}
