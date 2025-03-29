import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

interface StatsData {
  name: string;
  totalThrows: number;
  bestRound: number;
  completedGames: number;
  obCount: number;
  pars: number;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = request.nextUrl.searchParams.get("userId");

  if (!session || !userId || session.user.id !== userId) {
    return NextResponse.json({ error: "Uautorisert" }, { status: 401 });
  }

  try {
    const scores = await prisma.gameScore.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            course: {
              include: {
                holes: { orderBy: { number: "asc" } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!scores.length) {
      return NextResponse.json([], { status: 200 });
    }

    const roundsMap: Record<string, {
      gameId: string;
      createdAt: Date;
      roundScores: number[];
      roundThrows: number;
      roundOB: number;
      totalPar: number;
      totalHoles: number;
    }> = {};

    for (const score of scores) {
      if (!score.game || !score.game.course) continue;
      const gameId = score.game.id;
      
      if (!roundsMap[gameId]) {
        roundsMap[gameId] = {
          gameId,
          createdAt: score.game.createdAt,
          roundScores: [],
          roundThrows: 0,
          roundOB: 0,
          totalPar: 0,
          totalHoles: 0,
        };
      }
      
      const courseHole = score.game.course.holes.find(h => h.number === score.holeNumber);
      if (courseHole) {
        roundsMap[gameId].totalPar += courseHole.par;
        roundsMap[gameId].totalHoles += 1;
      }
      
      roundsMap[gameId].roundThrows += score.strokes;
      roundsMap[gameId].roundOB += score.obCount;
    }

    const rounds = Object.values(roundsMap).map(round => ({
      gameId: round.gameId,
      createdAt: round.createdAt,
      totalThrows: round.roundThrows,
      totalOB: round.roundOB,
      avgPar: round.totalHoles > 0 ? round.totalPar / round.totalHoles : 0,
    }));

    const statsMap: Record<string, {
      totalThrows: number;
      obCount: number;
      rounds: number[];
      completedGames: number;
      totalAvgPar: number;
    }> = {};

    rounds.forEach(round => {
      const month = round.createdAt.toLocaleString("no-NO", { month: "short" });
      if (!statsMap[month]) {
        statsMap[month] = {
          totalThrows: 0,
          obCount: 0,
          rounds: [],
          completedGames: 0,
          totalAvgPar: 0,
        };
      }
      statsMap[month].totalThrows += round.totalThrows;
      statsMap[month].obCount += round.totalOB;
      statsMap[month].rounds.push(round.totalThrows);
      statsMap[month].completedGames += 1;
      statsMap[month].totalAvgPar += round.avgPar;
    });

    const statsData: StatsData[] = Object.entries(statsMap).map(([month, s]) => ({
      name: month,
      totalThrows: s.totalThrows,
      bestRound: s.rounds.length > 0 ? Math.min(...s.rounds) : 0,
      completedGames: s.completedGames,
      obCount: s.obCount,
      pars: s.completedGames > 0 ? s.totalAvgPar / s.completedGames : 0,
    }));

    return NextResponse.json(statsData, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av statistikkene:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}