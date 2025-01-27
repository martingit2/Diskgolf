// app/api/stats/route.ts
import { NextResponse } from "next/server";

// Simulert statistikkdata
const stats = {
  totalThrows: 150,
  averageScore: 45.7,
  bestRound: 38,
};

export async function GET() {
  try {
    // Her kan du hente ekte data fra database/API
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av statistikkene:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
