/** 
 * Filnavn: route.ts
 * Beskrivelse: API-endepunkt for håndtering av anmeldelser for discgolf-baner.
 * Funksjonalitet:
 *   - POST: Oppretter en ny anmeldelse for en bane.
 *     - Krever autentisering via NextAuth.
 *     - Henter brukerens e-post og lagrer anmeldelsen med rating og kommentar.
 *   - GET: Henter alle anmeldelser for en spesifisert bane.
 *     - Filtrerer basert på course_id som sendes som query-parameter.
 *     - Returnerer en liste med anmeldelser i JSON-format.
 *   - Håndterer validering og feilmeldinger for manglende eller ugyldige data.
 * Utvikler: Said Hussain Khawajazada
 */


import { NextResponse } from "next/server";
import { currentUser } from "../../lib/auth";
import prisma from "../../lib/prismadb";

// ✅ Handle creating a new review
export async function POST(req: Request) {
  try {
    // ✅ Retrieve authenticated user from NextAuth
    const user = await currentUser();

    if (!user || !user.email) {
      console.error("❌ Bruker ikke autentisert:", user);
      return NextResponse.json({ error: "Bruker ikke autentisert" }, { status: 401 });
    }

    // 🔹 Retrieve the user from the database using their email
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      console.error("❌ Bruker ikke funnet i databasen:", user.email);
      return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
    }

    // ✅ Parse request body properly
    let body;
    try {
      body = await req.json();
      console.log("📌 Mottatt body:", body);
    } catch (err) {
      console.error("❌ Ugyldig JSON:", err);
      return NextResponse.json({ error: "Ugyldig JSON-body" }, { status: 400 });
    }

    const { courseId, rating, comment } = body;

    if (!courseId || !rating) {
      return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
    }

    // ✅ Save review in database using Prisma
    const newReview = await prisma.review.create({
      data: {
        courseId,
        rating,
        comment,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({ message: "Anmeldelsen ble sendt inn!", review: newReview }, { status: 201 });

  } catch (error) {
    console.error("❌ Kunne ikke lagre anmeldelsen:", error);
    return NextResponse.json({ error: "Kunne ikke lagre anmeldelsen" }, { status: 500 });
  }
}

// 🔹 Handle fetching a single review
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const courseId = url.searchParams.get("course_id"); // ✅ Get course_id from query params

    if (!courseId) {
      return NextResponse.json({ error: "Missing course_id" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { courseId }, // ✅ Fetch all reviews for the given courseId
    });

    return NextResponse.json(reviews); // ✅ Correct return value

  } catch (error) {
    console.error("❌ Feil ved henting av anmeldelser:", error);
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
