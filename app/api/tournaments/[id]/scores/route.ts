import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

interface ScoreData {
  strokes: number[];
  obCount?: number;
}

interface RequestBody {
  scores: Record<string, ScoreData>;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params; // Unwrap the Promise
    const { scores } = (await request.json()) as RequestBody;
    
    // Valider input
    if (!scores || typeof scores !== "object") {
      return NextResponse.json(
        { error: "Ugyldig dataformat for resultater" },
        { status: 400 }
      );
    }

    // Opprett alle score-poster i en transaksjon
    const result = await prisma.$transaction(async (tx) => {
      // Slett eksisterende resultater for denne turneringen
      await tx.tournamentScore.deleteMany({
        where: { tournamentId }
      });

      // Lagre nye resultater
      const createdScores = [];
      for (const [playerId, playerData] of Object.entries(scores)) {
        // Valider at data er riktig format
        if (!Array.isArray(playerData.strokes)) {
          throw new Error(`Ugyldig score-format for spiller ${playerId}`);
        }

        const totalScore = playerData.strokes.reduce((sum, stroke) => sum + stroke, 0);
        const totalOb = playerData.obCount ?? 0;
        
        const score = await tx.tournamentScore.create({
          data: {
            tournamentId,
            playerId,
            totalScore,
            totalOb,
            strokes: playerData.strokes as Prisma.JsonArray,
            isVerified: false
          }
        });
        createdScores.push(score);
      }

      return createdScores;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feil ved lagring av resultater:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke lagre resultater" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}