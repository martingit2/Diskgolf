"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, TrophyIcon, ChartBarIcon, ShareIcon } from "@heroicons/react/24/solid";

interface HoleScore {
  holeNumber: number;
  par: number;
  throws: number;
  ob: number;
  score: number;
}

interface GameResult {
  id: string;
  courseName: string;
  playerName: string;
  totalScore: number;
  totalPar: number;
  totalThrows: number;
  totalOb: number;
  holes: HoleScore[];
  date: string;
  bestHole?: HoleScore;
  worstHole?: HoleScore;
}

interface ApiHoleScore {
  holeNumber: number;
  par: number;
  throws: number;
  ob: number;
}

interface ApiResponse {
  courseName: string;
  playerName: string;
  scores: ApiHoleScore[];
}

export default function ResultPage({ params }: { params: Promise<{ gameId: string }> }) {
  const router = useRouter();
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  // Riktig bruk av use(params) i Next.js 15+
  const { gameId } = use(params);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}/results`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Kunne ikke laste resultater");
        }
        
        const data: ApiResponse = await res.json();
        
        if (!data.scores || !Array.isArray(data.scores)) {
          throw new Error("Ugyldig dataformat for resultater");
        }

        const scoresWithTotals: HoleScore[] = data.scores.map((hole: ApiHoleScore) => ({
          holeNumber: hole.holeNumber,
          par: hole.par,
          throws: hole.throws,
          ob: hole.ob,
          score: hole.throws + hole.ob - hole.par
        }));

        const totalScore = scoresWithTotals.reduce((sum, hole) => sum + hole.score, 0);
        const totalPar = scoresWithTotals.reduce((sum, hole) => sum + hole.par, 0);
        const totalThrows = scoresWithTotals.reduce((sum, hole) => sum + hole.throws, 0);
        const totalOb = scoresWithTotals.reduce((sum, hole) => sum + hole.ob, 0);
        
        const sortedByScore = [...scoresWithTotals].sort((a, b) => a.score - b.score);
        const bestHole = sortedByScore[0];
        const worstHole = sortedByScore[sortedByScore.length - 1];
        
        setResult({
          id: gameId,
          courseName: data.courseName,
          playerName: data.playerName,
          totalScore,
          totalPar,
          totalThrows,
          totalOb,
          holes: scoresWithTotals,
          date: new Date().toLocaleDateString('no-NO'),
          bestHole: bestHole.score < 0 ? bestHole : undefined,
          worstHole: worstHole.score > 0 ? worstHole : undefined
        });
      } catch (err) {
        console.error("Feil ved henting av resultater:", err);
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [gameId]); // Bruk gameId her istedenfor params.gameId

  const shareResults = async () => {
    if (!result) return;
    
    setIsSharing(true);
    try {
      const shareData = {
        title: `Diskgolf Resultater - ${result.courseName}`,
        text: `Jeg spilte ${result.courseName} og endte på ${result.totalScore > 0 ? '+' : ''}${result.totalScore}`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        alert('Resultater kopiert til utklippstavlen!');
      }
    } catch (err) {
      console.error('Deling feilet:', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Laster resultater...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-center mb-6 max-w-md">
          {error || "Kunne ikke laste resultater"}
        </p>
        <button
          onClick={() => router.push("/spill")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
        >
          Tilbake til spill
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/spill" className="flex items-center text-blue-400 hover:text-blue-300">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Tilbake
          </Link>
          <button 
            onClick={shareResults}
            disabled={isSharing}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            {isSharing ? 'Deler...' : 'Del'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-center mb-2">{result.courseName}</h1>
          <p className="text-gray-400 text-center mb-8">Spilt av {result.playerName} • {result.date}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-lg shadow-md text-center ${
              result.totalScore > 0 ? 'bg-red-900/50' : 
              result.totalScore < 0 ? 'bg-green-900/50' : 'bg-gray-800'
            }`}>
              <h3 className="text-lg font-semibold mb-2">Totalt</h3>
              <p className="text-4xl font-bold">
                {result.totalScore > 0 ? '+' : ''}{result.totalScore}
              </p>
              <p className="text-gray-300 mt-2">
                {result.totalThrows} kast ({result.totalOb} OB)
              </p>
            </div>
            
            {result.bestHole && (
              <div className="bg-green-900/50 p-6 rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold mb-2">Beste hull</h3>
                <p className="text-4xl font-bold">Hull {result.bestHole.holeNumber}</p>
                <p className="text-gray-300 mt-2">
                  {result.bestHole.score} (Par {result.bestHole.par})
                </p>
              </div>
            )}
            
            {result.worstHole && (
              <div className="bg-red-900/50 p-6 rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold mb-2">Verste hull</h3>
                <p className="text-4xl font-bold">Hull {result.worstHole.holeNumber}</p>
                <p className="text-gray-300 mt-2">
                  +{result.worstHole.score} (Par {result.worstHole.par})
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
            Detaljert resultat
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-4 text-left">Hull</th>
                  <th className="p-4 text-center">Par</th>
                  <th className="p-4 text-center">Kast</th>
                  <th className="p-4 text-center">OB</th>
                  <th className="p-4 text-center">+/-</th>
                </tr>
              </thead>
              <tbody>
                {result.holes.map((hole, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">{hole.holeNumber}</td>
                    <td className="p-4 text-center">{hole.par}</td>
                    <td className="p-4 text-center">{hole.throws}</td>
                    <td className="p-4 text-center">{hole.ob}</td>
                    <td className={`p-4 text-center font-semibold ${
                      hole.score > 0 ? 'text-red-400' : 
                      hole.score < 0 ? 'text-green-400' : ''
                    }`}>
                      {hole.score > 0 ? `+${hole.score}` : hole.score}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-700 font-semibold">
                  <td className="p-4">Totalt</td>
                  <td className="p-4 text-center">{result.totalPar}</td>
                  <td className="p-4 text-center">{result.totalThrows}</td>
                  <td className="p-4 text-center">{result.totalOb}</td>
                  <td className={`p-4 text-center ${
                    result.totalScore > 0 ? 'text-red-400' : 
                    result.totalScore < 0 ? 'text-green-400' : ''
                  }`}>
                    {result.totalScore > 0 ? `+${result.totalScore}` : result.totalScore}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mt-12 text-center">
          <Link 
            href="/spill"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg transition-colors"
          >
            <TrophyIcon className="h-5 w-5 mr-2" />
            Spill en ny runde
          </Link>
        </section>
      </main>
    </div>
  );
}