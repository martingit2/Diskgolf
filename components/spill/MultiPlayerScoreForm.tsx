"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

interface Hole {
  number: number;
  par: number;
}

interface Course {
  id: string;
  name: string;
  holes?: Hole[];
}

interface Participant {
  id: string;
  userId: string | null;
  playerName: string;
  isReady: boolean;
}

interface MultiplayerScoreFormProps {
  room: {
    id: string;
    course: Course;
    gameId?: string;
    participants?: Participant[];
    status?: string;
  };
  onGameComplete: () => void;
  currentUserId?: string;
  currentPlayerName: string;
}

interface PlayerScore {
  holeNumber: number;
  par: number;
  throws: number;
  ob: number;
  completed: boolean;
}

interface AllScores {
  [playerId: string]: {
    playerName: string;
    scores: PlayerScore[];
    allHolesCompleted: boolean;
  };
}

function getOrGenerateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_' + uuidv4();
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
  const currentPlayerId = currentUserId || getOrGenerateGuestId();

  const totalHoles = course.holes?.length || 0;
  const initialHoles: Hole[] = course.holes?.length ? 
    course.holes : 
    Array.from({ length: totalHoles }, (_, i) => ({
      number: i + 1,
      par: 3
    }));

  const [currentHole, setCurrentHole] = useState<number>(1);
  const [allScores, setAllScores] = useState<AllScores>({});
  const [activeShot, setActiveShot] = useState<"tee" | "approach" | "putt">("tee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateScores = (scores: any) => {
    const initialScores: AllScores = {};
    
    room.participants?.forEach(participant => {
      const playerId = participant.userId || `guest_${participant.id}`;
      const playerScores = initialHoles.map(hole => {
        const savedScore = scores.find((s: any) => 
          (s.userId === participant.userId || s.playerName === participant.playerName) &&
          s.holeNumber === hole.number
        );
        
        return {
          holeNumber: hole.number,
          par: hole.par,
          throws: savedScore?.strokes || 1,
          ob: savedScore?.obCount || 0,
          completed: !!savedScore
        };
      });

      initialScores[playerId] = {
        playerName: participant.playerName,
        scores: playerScores,
        allHolesCompleted: playerScores.every(score => score.completed)
      };
    });

    setAllScores(initialScores);

    // Sjekk om alle er ferdige
    const allPlayers = Object.values(initialScores);
    const allDone = allPlayers.length > 0 && 
                   allPlayers.every(player => player.allHolesCompleted);

    if (allDone) {
      console.log('All players have completed the game (from updateScores)');
      markGameAsComplete().then(() => {
        onGameComplete();
      });
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch(`/api/rooms/${room.id}/scores`);
      if (!res.ok) throw new Error("Kunne ikke hente scores");
      
      const scores = await res.json();
      console.log('Fetched scores:', scores);
      updateScores(scores);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  useEffect(() => {
    fetchScores();
    
    const interval = setInterval(fetchScores, 15000); // Poll hvert 15. sekund
    return () => clearInterval(interval);
  }, [room.id]);

  const currentPlayerScores = allScores[currentPlayerId]?.scores || [];
  const currentScore = currentPlayerScores.find(s => s.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: initialHoles[currentHole - 1]?.par || 3,
    throws: 1,
    ob: 0,
    completed: false
  };

  const handleScoreChange = (holeNumber: number, field: "throws" | "ob", value: number) => {
    const newValue = Math.max(field === "throws" ? 1 : 0, value);
    
    setAllScores(prev => ({
      ...prev,
      [currentPlayerId]: {
        ...prev[currentPlayerId],
        scores: prev[currentPlayerId].scores.map(score =>
          score.holeNumber === holeNumber
            ? { ...score, [field]: newValue }
            : score
        )
      }
    }));
  };

  const saveHoleScore = async (holeNumber: number) => {
    const score = allScores[currentPlayerId]?.scores.find(s => s.holeNumber === holeNumber);
    if (!score) return;
  
    try {
      const response = await fetch(`/api/rooms/${room.id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holeNumber,
          strokes: score.throws,
          obCount: score.ob,
          userId: currentUserId,
          playerName: currentPlayerName
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke lagre score");
      }
    } catch (error) {
      console.error("Feil ved lagring av score:", error);
      throw error;
    }
  };

  const markGameAsComplete = async () => {
    try {
      const response = await fetch(`/api/rooms/${room.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke markere spill som fullført");
      }
    } catch (error) {
      console.error("Feil ved fullføring av spill:", error);
      throw error;
    }
  };

  const completeHole = async (holeNumber: number) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await saveHoleScore(holeNumber);
      
      setAllScores(prev => {
        const updatedScores = {
          ...prev,
          [currentPlayerId]: {
            ...prev[currentPlayerId],
            scores: prev[currentPlayerId].scores.map(s => 
              s.holeNumber === holeNumber ? { ...s, completed: true } : s
            ),
            allHolesCompleted: holeNumber === totalHoles
          }
        };

        const allPlayers = Object.values(updatedScores);
        const allDone = allPlayers.length > 0 && 
                       allPlayers.every(player => player.allHolesCompleted);

        if (allDone) {
          console.log('All players have completed the game');
          setTimeout(() => {
            markGameAsComplete().then(() => {
              onGameComplete();
            });
          }, 0);
        } else if (holeNumber === totalHoles) {
          setError('Venter på at alle spillere skal fullføre banen');
        }

        return updatedScores;
      });

      if (holeNumber < totalHoles) {
        setCurrentHole(holeNumber + 1);
        setActiveShot("tee");
      }
    } catch (error) {
      console.error("Feil ved fullføring av hull:", error);
      setError(error instanceof Error ? error.message : "En ukjent feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = (currentPlayerScores.filter(s => s.completed).length / totalHoles) * 100;

  if (room.status === "completed") {
    router.push(`/spill/multiplayer/${room.id}/resultater`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Spiller: {currentPlayerName}</span>
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
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hull {currentHole}</h2>
          <div className="flex gap-4">
            <span>Par: {currentScore.par || 3}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Antall kast</label>
            <input
              type="number"
              min="1"
              value={currentScore.throws}
              onChange={e => handleScoreChange(currentHole, "throws", parseInt(e.target.value) || 1)}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isSubmitting || currentScore.completed}
            />
          </div>
          
          <div>
            <label className="block mb-2">OB (Out of Bounds)</label>
            <input
              type="number"
              min="0"
              value={currentScore.ob || 0}
              onChange={e => handleScoreChange(currentHole, "ob", parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isSubmitting || currentScore.completed}
            />
          </div>
        </div>
        
        <button
          onClick={() => completeHole(currentHole)}
          className={`mt-4 w-full py-2 px-4 rounded ${
            isSubmitting || currentScore.completed
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isSubmitting || currentScore.completed}
        >
          {isSubmitting ? (
            "Lagrer..."
          ) : currentScore.completed ? (
            "Fullført"
          ) : currentHole === totalHoles ? (
            "Fullfør runde"
          ) : (
            "Fullfør hull"
          )}
        </button>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dine resultater</h2>
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
              {currentPlayerScores.map(score => {
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

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Alle spillere</h2>
        <div className="space-y-4">
          {Object.entries(allScores).map(([playerId, playerData]) => {
            const totalThrows = playerData.scores.reduce((sum, score) => sum + score.throws, 0);
            const totalOb = playerData.scores.reduce((sum, score) => sum + score.ob, 0);
            const totalScore = playerData.scores.reduce((sum, score) => 
              sum + (score.throws + score.ob - score.par), 0);
            const completedHoles = playerData.scores.filter(s => s.completed).length;

            return (
              <div key={playerId} className="bg-gray-750 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    {playerData.playerName} 
                    {playerData.allHolesCompleted && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </h3>
                  <span className="text-sm">
                    {completedHoles}/{totalHoles} hull
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="p-1 text-left">Hull</th>
                        <th className="p-1 text-center">Kast</th>
                        <th className="p-1 text-center">OB</th>
                        <th className="p-1 text-center">+/-</th>
                        <th className="p-1 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerData.scores.map(score => {
                        const holeScore = score.throws + score.ob - score.par;
                        return (
                          <tr key={`${playerId}-${score.holeNumber}`} className="border-b border-gray-700">
                            <td className="p-1">{score.holeNumber}</td>
                            <td className="p-1 text-center">{score.completed ? score.throws : '-'}</td>
                            <td className="p-1 text-center">{score.completed ? score.ob : '-'}</td>
                            <td className={`p-1 text-center ${
                              holeScore > 0 ? "text-red-400" : 
                              holeScore < 0 ? "text-green-400" : ""
                            }`}>
                              {score.completed ? (holeScore > 0 ? `+${holeScore}` : holeScore) : '-'}
                            </td>
                            <td className="p-1 text-center">
                              {score.completed ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="font-medium">
                        <td className="p-1">Totalt</td>
                        <td className="p-1 text-center">{totalThrows}</td>
                        <td className="p-1 text-center">{totalOb}</td>
                        <td className={`p-1 text-center ${
                          totalScore > 0 ? "text-red-400" : 
                          totalScore < 0 ? "text-green-400" : ""
                        }`}>
                          {totalScore > 0 ? `+${totalScore}` : totalScore}
                        </td>
                        <td className="p-1 text-center">
                          {playerData.allHolesCompleted ? (
                            <span className="text-green-500">Fullført</span>
                          ) : (
                            <span className="text-yellow-500">
                              {completedHoles}/{totalHoles}
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}