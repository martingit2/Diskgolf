// Fil: src/app/(protected)/spill/multiplayer/[roomId]/page.tsx
// Formål: Klientkomponent for en pågående multiplayer-spilløkt. Henter romdata basert på rom-ID fra URL og rendrer MultiplayerScoreForm for scoreføring.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const MultiplayerScoreForm = dynamic(
  () => import("@/components/spill/MultiPlayerScoreForm").then(mod => mod.default),
  { ssr: false }
);

export default function MultiplayerGamePage() {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const roomId = params?.roomId as string;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Kunne ikke hente romdata");
        
        const data = await res.json();
        if (data.status !== "inProgress") {
          router.push(`/spill/multiplayer/${roomId}`);
          return;
        }
        
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Laster...</div>;
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Rom ikke funnet"}</p>
        <button
          onClick={() => router.push("/spill")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Tilbake til spill
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MultiplayerScoreForm 
        room={room} 
        onGameComplete={() => router.push(`/spill/multiplayer/${roomId}/resultater`)}
        currentUserId={session?.user?.id}
        currentPlayerName={session?.user?.name || room.ownerName}
      />
    </div>
  );
}