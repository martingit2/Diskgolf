import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 🔹 Opprett Supabase-klient
  const supabase = createRouteHandlerClient({ cookies });

  // 🔹 Sjekk brukerautentisering
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    console.error("❌ Ingen autentisert bruker:", error);
    return NextResponse.json({ error: "Bruker ikke autentisert" }, { status: 401 });
  }

  // 📌 Analyser forespørselsbody
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

  // ✅ Lagre anmeldelse i databasen (antar Supabase)
  const { error: insertError } = await supabase
    .from("reviews")
    .insert([{ course_id: courseId, rating, comment, user_id: user.id }]);

  if (insertError) {
    console.error("❌ Feil ved lagring av anmeldelse:", insertError);
    return NextResponse.json({ error: "Kunne ikke lagre anmeldelsen" }, { status: 500 });
  }

  return NextResponse.json({ message: "Anmeldelsen ble sendt inn!" }, { status: 201 });
}
