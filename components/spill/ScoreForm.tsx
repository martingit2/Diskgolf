// Fil: components/spill/ScoreForm.tsx
// Formål: Definerer en React-komponent ('use client') for scoreføring under et solo-spill.
//         Lar brukeren registrere kast og OB per hull, navigere mellom hull, og se en resultatoversikt.
//         Lagrer score for hvert hull til et API-endepunkt (/api/games/[gameId]/scores),
//         sporer fullføringsprosenten, og håndterer lagring og omdirigering når runden er fullført.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Hole {
  number: number;
  par: number;
  distance?: number;
}

interface Basket {
  id: string;
  latitude: number;
  longitude: number;
}

interface Course {
  id: string;
  name: string;
  holes: Hole[];
  baskets: Basket[];
  start: { latitude: number; longitude: number }[];
  goal?: { latitude: number; longitude: number };
  totalDistance: number;
}

interface ScoreFormProps {
  course: Course;
  gameId: string;
  user: {
    id: string;
    name: string;
  };
}

export default function ScoreForm({ course, gameId, user }: ScoreFormProps) {
  const router = useRouter();
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState(() =>
    course.holes.map((hole) => ({
      holeNumber: hole.number,
      par: hole.par,
      distance: hole.distance,
      throws: 1, // Start med 1 kast som minimum
      ob: 0,
      completed: false,
    }))
  );

  const [activeShot, setActiveShot] = useState<"tee" | "approach" | "putt">("tee");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Beregn total score
  const totalScore = scores.reduce(
    (total, score) => total + (score.throws + score.ob - score.par),
    0
  );

  // Håndter score endringer
  const handleScoreChange = (holeNumber: number, field: "throws" | "ob", value: number) => {
    setScores((prev) =>
      prev.map((score) =>
        score.holeNumber === holeNumber
          ? { ...score, [field]: Math.max(field === "throws" ? 1 : 0, value) }
          : score
      )
    );
  };

  // Lagre score for et enkelt hull
  const saveHoleScore = async (holeNumber: number) => {
    const score = scores.find(s => s.holeNumber === holeNumber);
    if (!score) return;

    try {
      const response = await fetch(`/api/games/${gameId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holeNumber,
          strokes: score.throws,
          obCount: score.ob,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke lagre score");
      }
    } catch (error) {
      console.error("Feil ved lagring av score:", error);
    }
  };

  // Marker hull som fullført og lagre
  const completeHole = async (holeNumber: number) => {
    // Oppdater state først
    setScores(prev =>
      prev.map(score =>
        score.holeNumber === holeNumber 
          ? { ...score, completed: true } 
          : score
      )
    );

    // Lagre scoren til API
    await saveHoleScore(holeNumber);

    // Gå til neste hull hvis det finnes
    if (currentHole < course.holes.length) {
      setCurrentHole(currentHole + 1);
      setActiveShot("tee");
    }
  };

  // Lagre alle resultater
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Dobbeltsjekk at alle scores er lagret
      await Promise.all(
        scores.map(score => 
          score.completed ? Promise.resolve() : saveHoleScore(score.holeNumber)
        )
      );

      router.push(`/spill/solo/${gameId}/resultater`);
    } catch (error) {
      console.error("Lagring feilet:", error);
      alert("Kunne ikke lagre resultater");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progressjon
  const completionPercentage =
    (scores.filter((s) => s.completed).length / course.holes.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Spiller: {user.name}</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full">
            Hull {currentHole} av {course.holes.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Shot type selector */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveShot("tee")}
          className={`px-4 py-2 rounded-full ${
            activeShot === "tee" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Tee
        </button>
        <button
          onClick={() => setActiveShot("approach")}
          className={`px-4 py-2 rounded-full ${
            activeShot === "approach" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Fairway
        </button>
        <button
          onClick={() => setActiveShot("putt")}
          className={`px-4 py-2 rounded-full ${
            activeShot === "putt" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Putt
        </button>
      </div>

      {/* Current hole */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hull {currentHole}</h2>
          <div className="flex gap-4">
            <span>Par: {scores[currentHole - 1]?.par || 3}</span>
            {scores[currentHole - 1]?.distance && (
              <span>{scores[currentHole - 1].distance}m</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Antall kast</label>
            <input
              type="number"
              min="1"
              value={scores[currentHole - 1]?.throws || 1}
              onChange={(e) =>
                handleScoreChange(
                  currentHole,
                  "throws",
                  parseInt(e.target.value) || 1
                )
              }
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block mb-2">OB (Out of Bounds)</label>
            <input
              type="number"
              min="0"
              value={scores[currentHole - 1]?.ob || 0}
              onChange={(e) =>
                handleScoreChange(
                  currentHole,
                  "ob",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        </div>

        <button
          onClick={() => completeHole(currentHole)}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded"
        >
          Fullfør hull
        </button>
      </div>

      {/* Score summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Resultatoversikt</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2 text-left">Hull</th>
                <th className="p-2 text-center">Par</th>
                <th className="p-2 text-center">Kast</th>
                <th className="p-2 text-center">OB</th>
                <th className="p-2 text-center">+/-</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => {
                const holeScore = score.throws + score.ob - score.par;
                return (
                  <tr key={score.holeNumber} className="border-b border-gray-700">
                    <td className="p-2">{score.holeNumber}</td>
                    <td className="p-2 text-center">{score.par}</td>
                    <td className="p-2 text-center">{score.throws}</td>
                    <td className="p-2 text-center">{score.ob}</td>
                    <td
                      className={`p-2 text-center ${
                        holeScore > 0 ? "text-red-400" : holeScore < 0 ? "text-green-400" : ""
                      }`}
                    >
                      {holeScore > 0 ? `+${holeScore}` : holeScore}
                    </td>
                    <td className="p-2 text-center">
                      {score.completed ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg">
            Totalt:{" "}
            <span
              className={`font-bold ${
                totalScore > 0 ? "text-red-400" : totalScore < 0 ? "text-green-400" : ""
              }`}
            >
              {totalScore > 0 ? `+${totalScore}` : totalScore}
            </span>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSubmitting || !scores.every((s) => s.completed)}
            className={`py-2 px-6 rounded ${
              isSubmitting
                ? "bg-gray-600"
                : scores.every((s) => s.completed)
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 cursor-not-allowed"
            } text-white`}
          >
            {isSubmitting ? "Lagrer..." : "Fullfør runde"}
          </button>
        </div>
      </div>
    </div>
  );
}