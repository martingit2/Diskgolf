"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

interface Hole {
  number: number;
  par: number;
  distance?: number;
}

interface Course {
  id: string;
  name: string;
  par: number;
  holes?: Hole[];
  baskets?: { id: string }[];
  goal?: { id: string };
}

interface Participant {
  id: string;
  userId: string | null;
  playerName: string;
}

interface MultiplayerScoreFormProps {
  room: {
    id: string;
    course: Course;
    ownerId: string;
    ownerName: string;
    gameId?: string;
    participants?: Participant[];
  };
  onGameComplete: () => void;
  currentUserId?: string;
  currentPlayerName: string;
}

interface Score {
  holeNumber: number;
  par: number;
  distance?: number;
  throws: number;
  ob: number;
  completed: boolean;
}

function getOrGenerateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_' + uuidv4(); // Fallback for server-side
  
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + uuidv4();
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
}

export default function MultiplayerScoreForm({ 
  room, 
  onGameComplete, 
  currentUserId,
  currentPlayerName
}: MultiplayerScoreFormProps) {
  const router = useRouter();
  const course = room.course;

  // Beregn totalt antall hull (korrigert linje)
  const totalHoles = course.holes?.length || 
    (course.baskets?.length || 0) + (course.goal && !course.baskets?.some(b => b.id === course.goal?.id) ? 1 : 0);
  
  // Initialiser hull
  const initialHoles: Hole[] = course.holes?.length ? 
    course.holes : 
    Array.from({ length: totalHoles }, (_, i) => ({
      number: i + 1,
      par: course.par || 3,
      distance: 0
    }));
  
  const [currentHole, setCurrentHole] = useState<number>(1);
  const [scores, setScores] = useState<Score[]>(() =>
    initialHoles.map((hole) => ({
      holeNumber: hole.number,
      par: hole.par,
      distance: hole.distance,
      throws: 1,
      ob: 0,
      completed: false,
    }))
  );
  const [activeShot, setActiveShot] = useState<"tee" | "approach" | "putt">("tee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalScore = scores.reduce((total, score) => total + (score.throws + score.ob - score.par), 0);

  const handleScoreChange = (holeNumber: number, field: "throws" | "ob", value: number) => {
    console.log("Oppdaterer score for hull", holeNumber, field, value);
    setScores(prev =>
      prev.map(score =>
        score.holeNumber === holeNumber
          ? { ...score, [field]: Math.max(field === "throws" ? 1 : 0, value) }
          : score
      )
    );
  };

  const saveHoleScore = async (holeNumber: number) => {
    const score = scores.find(s => s.holeNumber === holeNumber);
    if (!score) return;
  
    try {
      const effectiveUserId = currentUserId ?? getOrGenerateGuestId();
      
      const response = await fetch(`/api/rooms/${room.id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holeNumber,
          strokes: score.throws,
          obCount: score.ob,
          userId: effectiveUserId,
          playerName: currentPlayerName
        }),
      });
  
      if (!response.ok) throw new Error("Kunne ikke lagre score");
    } catch (error) {
      console.error("Feil ved lagring av score:", error);
      throw error;
    }
  };

  const completeHole = async (holeNumber: number) => {
    console.log('Completing hole:', holeNumber);
    setIsSubmitting(true);
    setError(null);
    
    try {
      await saveHoleScore(holeNumber);
      
      setScores(prev => prev.map(s => 
        s.holeNumber === holeNumber ? { ...s, completed: true } : s
      ));

      if (holeNumber < totalHoles) {
        setCurrentHole(holeNumber + 1);
        setActiveShot("tee");
      } else {
        console.log('All holes completed, marking game as complete');
        await markGameAsComplete();
        onGameComplete();
      }
    } catch (error) {
      console.error("Feil ved fullføring av hull:", error);
      setError(error instanceof Error ? error.message : "En ukjent feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markGameAsComplete = async () => {
    try {
      console.log('Marking game as complete for room:', room.id);
      const response = await fetch(`/api/rooms/${room.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await response.json();
      console.log('Complete game response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Kunne ikke markere spill som fullført");
      }
    } catch (error) {
      console.error("Feil ved fullføring av spill:", error);
      throw error;
    }
  };

  const completionPercentage = (scores.filter(s => s.completed).length / totalHoles) * 100;

  console.log('Current component state:', {
    currentHole,
    scores,
    totalScore,
    completionPercentage,
    currentUserId,
    currentPlayerName,
    roomParticipants: room.participants
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header med bane- og spillerinfo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Spiller: {currentPlayerName || room.ownerName}</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full">
            Hull {currentHole} av {totalHoles}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Feilmelding */}
      {error && (
        <div className="mb-4 p-4 bg-red-600 rounded-lg">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm underline"
          >
            Lukk
          </button>
        </div>
      )}
      
      {/* Valg for skottype */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveShot("tee")} 
          className={`px-4 py-2 rounded-full ${activeShot === "tee" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Tee
        </button>
        <button 
          onClick={() => setActiveShot("approach")} 
          className={`px-4 py-2 rounded-full ${activeShot === "approach" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Fairway
        </button>
        <button 
          onClick={() => setActiveShot("putt")} 
          className={`px-4 py-2 rounded-full ${activeShot === "putt" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Putt
        </button>
      </div>
      
      {/* Skjema for aktuelt hull */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hull {currentHole}</h2>
          <div className="flex gap-4">
            <span>Par: {scores[currentHole - 1]?.par || 3}</span>
            {scores[currentHole - 1]?.distance && <span>{scores[currentHole - 1].distance}m</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Antall kast</label>
            <input
              type="number"
              min="1"
              value={scores[currentHole - 1]?.throws}
              onChange={e => handleScoreChange(currentHole, "throws", parseInt(e.target.value) || 1)}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block mb-2">OB (Out of Bounds)</label>
            <input
              type="number"
              min="0"
              value={scores[currentHole - 1]?.ob || 0}
              onChange={e => handleScoreChange(currentHole, "ob", parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <button
          onClick={() => completeHole(currentHole)}
          className={`mt-4 w-full py-2 px-4 rounded ${
            isSubmitting 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Lagrer..."
          ) : currentHole === totalHoles ? (
            "Fullfør runde"
          ) : (
            "Fullfør hull"
          )}
        </button>
      </div>
      
      {/* Resultatoversikt */}
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
              {scores.map(score => {
                const holeScore = score.throws + score.ob - score.par;
                return (
                  <tr key={score.holeNumber} className="border-b border-gray-700">
                    <td className="p-2">{score.holeNumber}</td>
                    <td className="p-2 text-center">{score.par}</td>
                    <td className="p-2 text-center">{score.throws}</td>
                    <td className="p-2 text-center">{score.ob}</td>
                    <td className={`p-2 text-center ${
                      holeScore > 0 ? "text-red-400" : 
                      holeScore < 0 ? "text-green-400" : ""
                    }`}>
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
      </div>
    </div>
  );
}