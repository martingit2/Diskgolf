"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  course?: {
    name: string;
    holes?: { number: number }[];
    baskets?: { id: string }[];
    goal?: { id: string };
    totalHoles?: number;
  };
  participants: {
    id: string;
    playerName: string;
  }[];
  passwordHash: string | null;
  ownerName: string;
}

interface AvailableRoomsProps {
  rooms: Room[];
  guestName: string;
  user: any;
}

export default function AvailableRooms({ rooms, guestName, user }: AvailableRoomsProps) {
  const router = useRouter();
  const [passwordInput, setPasswordInput] = useState("");
  const [joinRoomId, setJoinRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const pageSize = 5;

  const getHoleCount = (room: Room) => {
    return room.course?.totalHoles || 
           room.course?.holes?.length || 
           room.course?.baskets?.length || 
           0;
  };

  const filteredRooms = rooms
    .filter((room) => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.course?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isNotFull = room.participants.length < room.maxPlayers;
      return matchesSearch && isNotFull;
    })
    .sort((a, b) => b.participants.length - a.participants.length);

  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const joinRoom = async (roomId: string, password: string | null) => {
    setIsJoining(true);
    try {
      const playerName = user?.name || guestName;
      if (!playerName) {
        alert("Vennligst skriv inn navn eller logg inn");
        return;
      }

      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          password,
          userId: user?.id || null,
          playerName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Kunne ikke bli med i rommet");
      }

      router.push(`/spill/multiplayer/${roomId}`);
    } catch (error) {
      console.error("Feil ved deltakelse:", error);
      alert(error instanceof Error ? error.message : "Ukjent feil");
    } finally {
      setIsJoining(false);
      setJoinRoomId(null);
      setPasswordInput("");
    }
  };

  const handleJoinClick = (room: Room) => {
    if (room.passwordHash) {
      setJoinRoomId(room.id);
    } else {
      joinRoom(room.id, null);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Ledige rom</h3>
        <span className="text-sm text-gray-400">
          {filteredRooms.length} rom tilgjengelig
        </span>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Søk etter rom eller bane..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 pl-10 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {paginatedRooms.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Ingen ledige rom funnet
        </div>
      ) : (
        <ul className="space-y-3">
          {paginatedRooms.map((room) => (
            <li
              key={room.id}
              className="bg-gray-750 hover:bg-gray-700 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{room.name}</h4>
                  <div className="text-sm text-gray-400">
                    {room.course?.name || "Ukjent bane"} • {getHoleCount(room)} hull • Opprettet av {room.ownerName}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-medium">
                      {room.participants.length}/{room.maxPlayers}
                    </div>
                    <div className="text-xs text-gray-400">Spillere</div>
                  </div>
                  <button
                    onClick={() => handleJoinClick(room)}
                    disabled={isJoining}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Bli med
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <span>←</span>
            <span>Forrige</span>
          </button>
          <span className="text-sm">
            Side {currentPage} av {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <span>Neste</span>
            <span>→</span>
          </button>
        </div>
      )}

      {joinRoomId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Rompassord</h3>
            <p className="mb-4 text-gray-300">
              Dette rommet er beskyttet med passord.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 mb-4"
              placeholder="Skriv inn passord"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setJoinRoomId(null);
                  setPasswordInput("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Avbryt
              </button>
              <button
                onClick={() => joinRoom(joinRoomId, passwordInput)}
                disabled={!passwordInput || isJoining}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {isJoining ? "Bli med..." : "Bekreft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}