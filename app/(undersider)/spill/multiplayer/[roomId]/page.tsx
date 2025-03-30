"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from 'next/navigation';
import { useSession } from "next-auth/react";

interface Participant {
  id: string;
  userId: string | null;
  playerName: string;
  isReady: boolean;
}

export default function MultiplayerLobby() {
  const { data: session } = useSession();
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyCount, setReadyCount] = useState(0);
  
  const router = useRouter();
  const params = useParams();

  if (!params?.roomId) {
    return notFound();
  }

  const roomId = params.roomId as string;

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) throw new Error("Kunne ikke hente romdata");
      
      const data = await res.json();
      setRoom(data);
      setParticipants(data.participants || []);
      setReadyCount(data.participants?.filter((p: any) => p.isReady).length || 0);

      // Sjekk om den innloggede brukeren er klar
      const currentPlayer = data.participants?.find((p: any) => 
        p.userId === session?.user?.id || p.playerName === (session?.user?.name || data.ownerName)
      );
      setIsReady(currentPlayer?.isReady || false);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [roomId, session]);

  const handleReady = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId: session?.user?.id,
          playerName: session?.user?.name || room?.ownerName
        })
      });

      const data = await res.json();
      console.log('Ready response:', data);

      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke sette klar-status");
      }

      setIsReady(true);
      setReadyCount(data.readyCount);

      if (data.gameStarted) {
        router.push(`/spill/multiplayer/${roomId}/spill`);
      }
    } catch (err) {
      console.error("Feil ved klar-markering:", err);
      setError(err instanceof Error ? err.message : "Ukjent feil");
    }
  };

  useEffect(() => {
    if (room?.status === "inProgress") {
      router.push(`/spill/multiplayer/${roomId}/spill`);
    }
  }, [room?.status, roomId, router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">Laster rom...</div>;
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Feil: {error || "Rom ikke funnet"}</p>
        <button
          onClick={() => router.push("/spill")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Tilbake til spill
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{room.name}</h1>
      <p className="mb-4">Bane: {room.course?.name}</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Spillere ({participants.length}/{room.maxPlayers})
        </h2>
        <ul className="space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center">
              <span>{p.playerName}</span>
              {p.isReady && <span className="ml-2 text-green-500">✓</span>}
            </li>
          ))}
        </ul>
      </div>

      {!isReady ? (
        <button
          onClick={handleReady}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg"
        >
          Jeg er klar!
        </button>
      ) : (
        <div>
          <p className="text-green-500 mb-2">
            Du er klar! ({readyCount}/{participants.length})
          </p>
          <p className="text-gray-400">
            {readyCount === participants.length 
              ? "Starter spillet..." 
              : "Venter på at alle skal bli klare..."}
          </p>
        </div>
      )}
    </div>
  );
}