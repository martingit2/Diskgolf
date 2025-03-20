// app/api/auth/route.ts
import { currentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";
// Importer currentUser fra din auth-logikk

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Uautorisert" }, { status: 401 });
  }

  return NextResponse.json(user);
}