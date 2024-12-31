"use server";

import prisma from "../lib/prismadb";
import { currentUser } from "../lib/auth";
import { signOut } from "next-auth/react";

export async function deleteUser() {
  try {
    // Hent den nåværende brukeren
    const user = await currentUser();
    if (!user) {
      throw new Error("Ingen bruker er logget inn.");
    }

    // Sjekk om brukeren fortsatt finnes i databasen
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser) {
      return { success: false, message: "Brukeren eksisterer ikke i databasen." };
    }

    // Slett relasjoner manuelt hvis det er nødvendig
    await prisma.account.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.review.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.round.deleteMany({ where: { userId: user.id } }).catch(() => {});

    // Slett brukeren fra databasen
    await prisma.user
      .delete({
        where: { id: user.id },
      })
      .catch((error) => {
        if (error.code !== "P2025") {
          throw error; // Kaster feilen hvis det ikke er "Record to delete does not exist"
        }
      });

    // Logg ut brukeren
    await signOut();

    return { success: true, message: "Brukeren er slettet og logget ut." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Feil ved sletting av bruker:", error.message);
      return { success: false, message: `Kunne ikke slette brukeren: ${error.message}` };
    }
    return { success: false, message: "Ukjent feil oppstod ved sletting av bruker." };
  }
}
