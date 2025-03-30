import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface HoleStat {
  number: number;
  average: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Fetching results for room: ${id}`);

    // First get the room with game and participants
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        participants: true,
        course: {
          include: {
            holes: {
              orderBy: { number: 'asc' }
            },
            baskets: true // Include baskets to determine hole count
          }
        },
        game: {
          include: {
            scores: true,
            participants: true
          }
        }
      }
    });

    if (!room || !room.game) {
      console.error('Room or game not found');
      return NextResponse.json({ error: "Rom eller spill ikke funnet" }, { status: 404 });
    }

    // Get all scores for this game
    const scores = await prisma.gameScore.findMany({
      where: { 
        gameId: room.game.id 
      },
      orderBy: { holeNumber: 'asc' }
    });

    console.log('Found scores:', scores);

    // Determine total holes - use holes if they exist, otherwise use baskets count
    const totalHoles = room.course.holes?.length > 0 
      ? room.course.holes.length 
      : room.course.baskets?.length || 0;

    // Create holes array - either from existing holes or generate based on totalHoles
    const holes = room.course.holes?.length > 0
      ? room.course.holes
      : Array.from({ length: totalHoles }, (_, i) => ({
          number: i + 1,
          par: room.course.par || 3 // Default to par 3 if not specified
        }));

    console.log('Holes:', holes);

    // Process each participant's scores
    const players = room.participants.map((participant) => {
      // Find all scores for this participant
      const participantScores = scores.filter(score => 
        (score.userId && participant.userId && score.userId === participant.userId) || 
        (score.playerName === participant.playerName)
      );

      console.log(`Scores for ${participant.playerName}:`, participantScores);

      // Create hole results for each hole
      const holeResults = holes.map(hole => {
        const score = participantScores.find(s => s.holeNumber === hole.number);
        
        return {
          holeNumber: hole.number,
          par: hole.par,
          throws: score?.strokes || 0,
          ob: score?.obCount || 0,
          score: (score?.strokes || 0) + (score?.obCount || 0) - hole.par,
        };
      });

      // Calculate totals
      const totalThrows = holeResults.reduce((sum, h) => sum + h.throws, 0);
      const totalOb = holeResults.reduce((sum, h) => sum + h.ob, 0);
      const totalScore = holeResults.reduce((sum, h) => sum + h.score, 0);

      // Find best and worst holes (only if player has scores)
      const scoredHoles = holeResults.filter(h => h.throws > 0);
      const bestHole = scoredHoles.length > 0 
        ? [...scoredHoles].sort((a, b) => a.score - b.score)[0] 
        : undefined;
      const worstHole = scoredHoles.length > 0 
        ? [...scoredHoles].sort((a, b) => b.score - a.score)[0] 
        : undefined;

      return {
        playerId: participant.userId || participant.id,
        playerName: participant.playerName,
        scores: holeResults,
        totalThrows,
        totalOb,
        totalScore,
        bestHole,
        worstHole
      };
    });

    // Sort players by total score and assign ranks
    const sortedPlayers = [...players]
      .sort((a, b) => a.totalScore - b.totalScore)
      .map((player, i) => ({
        ...player,
        rank: i + 1,
      }));

    console.log('Sorted players:', sortedPlayers);

    // Calculate hole statistics (only for holes with scores)
    const holeStats: HoleStat[] = holes
      .map((hole) => {
        const scoresOnHole = sortedPlayers
          .flatMap(p => 
            p.scores
              .filter(s => s.holeNumber === hole.number && s.throws > 0)
              .map(s => s.score)
          );

        if (scoresOnHole.length === 0) return null;

        const average = scoresOnHole.reduce((sum, s) => sum + s, 0) / scoresOnHole.length;
        return { 
          number: hole.number, 
          average 
        };
      })
      .filter((stat): stat is HoleStat => stat !== null);

    // Find hardest and easiest holes (only if we have stats)
    const hardestHole = holeStats.length > 0 
      ? [...holeStats].sort((a, b) => b.average - a.average)[0] 
      : undefined;
    const easiestHole = holeStats.length > 0 
      ? [...holeStats].sort((a, b) => a.average - b.average)[0] 
      : undefined;

    const resultData = {
      courseName: room.course.name,
      date: room.createdAt.toISOString(),
      players: sortedPlayers,
      hardestHole: hardestHole?.average !== undefined && hardestHole.average > 0 
        ? hardestHole 
        : undefined,
      easiestHole: easiestHole?.average !== undefined && easiestHole.average < 0 
        ? easiestHole 
        : undefined,
    };

    console.log('Final result data:', resultData);

    return NextResponse.json(resultData);
  } catch (error) {
    console.error("Feil ved henting av resultater:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente resultater" },
      { status: 500 }
    );
  }
}