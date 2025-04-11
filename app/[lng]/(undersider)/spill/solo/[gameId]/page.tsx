// Fil: src/app/(undersider)/spill/[gameId]/page.tsx
// Formål: Klientkomponent for en pågående alenespiller-runde (single-player). Henter spill- og banedata basert på spill-ID fra URL og rendrer ScoreForm for scoreføring.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ScoreForm = dynamic(() => import("@/components/spill/ScoreForm"), {
  loading: () => <p>Laster skjema...</p>,
  ssr: false
});

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
  par: number; // Global par for hele banen
  holes: Hole[];
  baskets: Basket[];
  start: {
    latitude: number;
    longitude: number;
  }[];
  goal?: {
    latitude: number;
    longitude: number;
  };
  totalDistance: number;
}

interface GameData {
  id: string;
  course: Course;
  ownerId: string;
  ownerName: string;
}

export default function Page({ params }: { params: Promise<{ gameId: string }> }) {
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { gameId } = use(params);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        
        if (!res.ok) throw new Error(await res.text());
        
        const data = await res.json();
        // Tell kun baskets, ignorer goal helt
        const totalHoles = data.course.holes?.length || data.course.baskets?.length || 0;

        const transformedData: GameData = {
          ...data,
          course: {
            ...data.course,
            holes: data.course.holes?.length ? data.course.holes : 
                  Array.from({ length: totalHoles }, (_, index) => ({
                    number: index + 1,
                    par: data.course.par || 3, // Bruk banens globale par
                    distance: 0
                  }))
          }
        };

        setGame(transformedData);
      } catch (err) {
        console.error("Feil ved lasting av spill:", err);
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Laster spilldata...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col justify-center items-center">
        <p className="text-red-500 text-center mb-4 max-w-md">
          {error || "Kunne ikke laste spilldata"}
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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {game.course && (
          <ScoreForm 
            course={game.course} 
            gameId={game.id}
            user={{ id: game.ownerId, name: game.ownerName }}
          />
        )}
      </div>
    </div>
  );
}