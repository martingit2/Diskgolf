/* import getServerSession from "next-auth";

import prisma from "@/app/lib/prismadb";
import { authOptions } from "../api/register/route";


export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    const email = session?.user?.email;
    if (!email || typeof email !== "string") {
      return null; // Ingen bruker logget inn eller feil format
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!currentUser) {
      return null;
    }

    return {
      ...currentUser,
      name: currentUser.name || "Gjest",
      email: currentUser.email || "Ingen e-post",
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
    };
  } catch (error) {
    console.error("Feil i getCurrentUser:", error);
    return null;
  }
} */ 
