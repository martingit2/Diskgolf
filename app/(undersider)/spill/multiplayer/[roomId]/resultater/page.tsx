"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TrophyIcon,
  ArrowLeftIcon,
  ShareIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

interface HoleResult {
  holeNumber: number;
  par: number;
  throws: number;
  ob: number;
  score: number;
}

interface PlayerResult {
  playerId: string;
  playerName: string;
  scores: HoleResult[];
  totalScore: number;
  totalThrows: number;
  totalOb: number;
  bestHole?: HoleResult;
  worstHole?: HoleResult;
  rank: number;
}

export default function MultiplayerResultsPage() {
  const [results, setResults] = useState<{
    courseName: string;
    date: string;
    players: PlayerResult[];
    hardestHole?: { number: number, average: number };
    easiestHole?: { number: number, average: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;

  useEffect(() => {
    if (!roomId) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/results`);
        if (!res.ok) throw new Error("Kunne ikke hente resultater");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Kunne ikke laste resultater"}</p>
        <button
          onClick={() => router.push("/spill")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Tilbake til spill
        </button>
      </div>
    );
  }

  const winner = results.players.find(p => p.rank === 1);
  const holes = results.players[0]?.scores || [];

  const shareResults = async () => {
    if (!results) return;
    
    const shareData = {
      title: `Diskgolf Resultater - ${results.courseName}`,
      text: `Jeg spilte ${results.courseName} i multiplayer og ${winner ? `${winner.playerName} vant!` : 'det ble en spennende kamp!'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert('Resultater kopiert til utklippstavlen!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/spill")}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Tilbake
          </button>
          <h1 className="text-2xl font-bold">Multiplayer Resultater</h1>
          <button 
            onClick={shareResults}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Del
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">{results.courseName}</h2>
          <p className="text-gray-400">
            Spilt {new Date(results.date).toLocaleDateString("no-NO")}
          </p>
        </div>

        {winner && (
          <div className="mb-8 bg-yellow-900/30 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrophyIcon className="h-10 w-10 text-yellow-400 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">Vinneren er {winner.playerName}!</h3>
                  <p className="text-gray-300">
                    Totalt: {winner.totalScore > 0 ? `+${winner.totalScore}` : winner.totalScore}
                    {winner.totalThrows && ` (${winner.totalThrows} kast, ${winner.totalOb} OB)`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {winner.bestHole && (
                  <p className="text-sm">
                    Beste hull: {winner.bestHole.holeNumber} ({winner.bestHole.score})
                  </p>
                )}
                {winner.worstHole && (
                  <p className="text-sm">
                    Verste hull: {winner.worstHole.holeNumber} (+{winner.worstHole.score})
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {(results.hardestHole || results.easiestHole) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {results.hardestHole && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center">
                  <FireIcon className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-semibold">Vanskeligste hull</h3>
                </div>
                <p className="mt-2">Hull {results.hardestHole.number}</p>
                <p className="text-gray-400 text-sm">
                  Gjennomsnitt: {results.hardestHole.average.toFixed(1)} over par
                </p>
              </div>
            )}
            {results.easiestHole && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-semibold">Enkleste hull</h3>
                </div>
                <p className="mt-2">Hull {results.easiestHole.number}</p>
                <p className="text-gray-400 text-sm">
                  Gjennomsnitt: {results.easiestHole.average.toFixed(1)} under par
                </p>
              </div>
            )}
          </div>
        )}

        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" /> 
            Resultatoversikt
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg overflow-hidden text-sm">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-4 text-left">Plass</th>
                  <th className="p-4 text-left">Spiller</th>
                  {holes.map((hole) => (
                    <th key={hole.holeNumber} className="p-2 text-center">
                      {hole.holeNumber}
                    </th>
                  ))}
                  <th className="p-4 text-center">Totalt</th>
                  <th className="p-4 text-center">Kast</th>
                  <th className="p-4 text-center">OB</th>
                </tr>
              </thead>
              <tbody>
                {results.players.map((player) => (
                  <tr
                    key={player.playerId}
                    className={`border-b border-gray-700 ${
                      player.rank === 1
                        ? "bg-yellow-900/30"
                        : player.rank === 2
                        ? "bg-gray-700/30"
                        : player.rank === 3
                        ? "bg-orange-900/30"
                        : ""
                    }`}
                  >
                    <td className="p-4 font-bold text-center">{player.rank}</td>
                    <td className="p-4 font-medium">{player.playerName}</td>
                    {player.scores.map((hole) => (
                      <td
                        key={`${player.playerId}-${hole.holeNumber}`}
                        className={`p-2 text-center ${
                          player.bestHole?.holeNumber === hole.holeNumber
                            ? "text-green-400 font-bold"
                            : player.worstHole?.holeNumber === hole.holeNumber
                            ? "text-red-400 font-bold"
                            : ""
                        }`}
                        title={`Par ${hole.par}, ${hole.throws + hole.ob} kast (${hole.ob} OB)`}
                      >
                        {hole.throws + hole.ob}
                      </td>
                    ))}
                    <td className="p-4 text-center font-bold">
                      {player.totalScore > 0 ? `+${player.totalScore}` : player.totalScore}
                    </td>
                    <td className="p-4 text-center">{player.totalThrows}</td>
                    <td className="p-4 text-center">{player.totalOb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/spill")}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg"
          >
            <TrophyIcon className="h-5 w-5 mr-2" />
            Spill en ny runde
          </button>
        </div>
      </main>
    </div>
  );
}