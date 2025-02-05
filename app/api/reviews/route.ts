import { NextResponse } from "next/server";
import { currentUser } from "../../lib/auth";
import prisma from "../../lib/prismadb";

export async function POST(req: Request) {
  // Retrieve authenticated user from NextAuth
  const user = await currentUser();

  if (!user || !user.email) {
    console.error("❌ User not authenticated:", user);
    return NextResponse.json({ error: "Bruker ikke autentisert" }, { status: 401 });
  }

  // 🔹 Retrieve the user from the database using their email
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }, // Look up user by email
  });

  if (!dbUser) {
    console.error("❌ User not found in database:", user.email);
    return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
  }

  // 📌 Parse request body properly
  let body;
  try {
    body = await req.json();
    console.log("📌 Received body:", body);
  } catch (err) {
    console.error("❌ Invalid JSON:", err);
    return NextResponse.json({ error: "Ugyldig JSON-body" }, { status: 400 });
  }

  const { courseId, rating, comment } = body;

  if (!courseId || !rating) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  // Save review in database using Prisma
  try {
    await prisma.review.create({
        data: {
          courseId, 
          rating,
          comment,
          userId: dbUser.id, 
        },
      });
      

    return NextResponse.json({ message: "Anmeldelsen ble sendt inn!" }, { status: 201 });
  } catch (error) {
    console.error("❌ Kunne ikke lagre anmeldelsen:", error);
    return NextResponse.json({ error: "Kunne ikke lagre anmeldelsen" }, { status: 500 });
  }
}
