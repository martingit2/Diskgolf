"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from 'next/navigation';

interface Participant {
  id: string;
  playerName: string;
  isReady: boolean;
}

export default function MultiplayerLobby() {
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();

  // Håndter manglende roomId
  if (!params?.roomId) {
    return notFound();
  }

  const roomId = params.roomId as string;

  // Hent romdata
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Kunne ikke hente romdata");
        
        const data = await res.json();
        setRoom(data);
        setParticipants(data.participants || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
    
    // Poll for updates
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Marker deg som klar
  const handleReady = async () => {
    try {
      if (!room?.ownerId) {
        throw new Error("Mangler eier-ID for rommet");
      }

      const res = await fetch(`/api/rooms/${roomId}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: room.ownerId })
      });

      if (res.ok) {
        setIsReady(true);
        // Oppdater deltakere lokalt
        setParticipants(prev =>
          prev.map(p => p.id === room.ownerId ? { ...p, isReady: true } : p)
        );
      }
    } catch (err) {
      console.error("Feil ved klar-markering:", err);
      setError(err instanceof Error ? err.message : "Ukjent feil");
    }
  };

  // Sjekk om alle er klare
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
        <h2 className="text-xl font-semibold mb-2">Spillere ({participants.length}/{room.maxPlayers})</h2>
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
          disabled={!room?.ownerId}
        >
          Jeg er klar!
        </button>
      ) : (
        <p className="text-green-500">Venter på at alle skal bli klare...</p>
      )}
    </div>
  );
}