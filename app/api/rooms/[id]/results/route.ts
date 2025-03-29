// app/api/rooms/[id]/results/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Rom-ID mangler" }, { status: 400 });
    }
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            holes: { orderBy: { number: "asc" } },
            baskets: true,
            goal: true,
          },
        },
        game: {
          include: {
            scores: {
              orderBy: { holeNumber: "asc" },
              include: { user: { select: { name: true } } },
            },
            participants: true,
          },
        },
      },
    });

    if (!room || !room.game) {
      return NextResponse.json({ error: "Rom eller spill ikke funnet" }, { status: 404 });
    }
    // Etter at vi har sjekket at room.game ikke er null, opprett en lokal variabel:
    const game = room.game!;

    // Gruppering av score:
    const playedHoleNumbers = game.scores.map(s => s.holeNumber);
    const maxHoleNumber = playedHoleNumbers.length > 0 ? Math.max(...playedHoleNumbers) : 0;
    const holes =
      room.course.holes?.length
        ? room.course.holes.filter(h => h.number <= maxHoleNumber)
        : Array.from({ length: maxHoleNumber }, (_, i) => ({
            number: i + 1,
            par: room.course.par || 3,
          }));

    const players = game.participants.map((participant) => {
      const playerScores = holes.map((hole) => {
        const foundScore = game.scores.find(s => {
          if (participant.userId) {
            return s.holeNumber === hole.number && s.userId === participant.userId;
          } else {
            return (
              s.holeNumber === hole.number &&
              s.userId === null &&
              s.playerName === participant.playerName
            );
          }
        }) || { strokes: 0, obCount: 0 };

        return {
          holeNumber: hole.number,
          par: hole.par,
          throws: foundScore.strokes,
          ob: foundScore.obCount,
          score: foundScore.strokes + foundScore.obCount - hole.par,
        };
      });
      const totalScore = playerScores.reduce((acc, s) => acc + s.score, 0);
      const totalThrows = playerScores.reduce((acc, s) => acc + s.throws, 0);
      const totalOb = playerScores.reduce((acc, s) => acc + s.ob, 0);
      const sortedScores = [...playerScores].sort((a, b) => a.score - b.score);
      const bestHole = sortedScores[0];
      const worstHole = sortedScores[sortedScores.length - 1];

      return {
        playerId: participant.userId || participant.id,
        playerName: participant.playerName,
        scores: playerScores,
        totalScore,
        totalThrows,
        totalOb,
        bestHole: bestHole && bestHole.score < 0 ? bestHole : undefined,
        worstHole: worstHole && worstHole.score > 0 ? worstHole : undefined,
      };
    });

    const sortedPlayers = players
      .sort((a, b) => a.totalScore - b.totalScore)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    const holeStats = holes.map((hole) => {
      const holeScores = sortedPlayers
        .flatMap(p => p.scores.filter(s => s.holeNumber === hole.number))
        .map(s => s.score);
      const avg = holeScores.length > 0
        ? holeScores.reduce((sum, sc) => sum + sc, 0) / holeScores.length
        : 0;
      return { number: hole.number, average: avg };
    });

    const hardestHole = [...holeStats].sort((a, b) => b.average - a.average)[0];
    const easiestHole = [...holeStats].sort((a, b) => a.average - b.average)[0];

    return NextResponse.json({
      courseName: room.course.name,
      date: room.createdAt.toISOString(),
      players: sortedPlayers,
      hardestHole: hardestHole && hardestHole.average > 0 ? hardestHole : undefined,
      easiestHole: easiestHole && easiestHole.average < 0 ? easiestHole : undefined,
    });
  } catch (error) {
    console.error("Feil ved henting av resultater:", error);
    return NextResponse.json({ error: "Kunne ikke hente resultater" }, { status: 500 });
  }
}
