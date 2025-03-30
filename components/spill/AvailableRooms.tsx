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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Ledige rom</h3>
          <p className="text-gray-500">Velg et rom å bli med i</p>
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
          {filteredRooms.length} {filteredRooms.length === 1 ? "rom tilgjengelig" : "rom tilgjengelige"}
        </span>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Søk etter rom eller bane..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-3 pl-10 bg-white text-gray-900 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-200">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-1">Ingen ledige rom funnet</h4>
          <p className="text-gray-500">Prøv et annet søkeord eller opprett et nytt rom</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {paginatedRooms.map((room) => (
            <li
              key={room.id}
              className="bg-white hover:bg-gray-50 rounded-lg p-5 transition-colors border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">{room.name}</h4>
                    {room.passwordHash && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Beskyttet
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-600 space-y-2">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{room.course?.name || "Ukjent bane"}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>{getHoleCount(room)} {getHoleCount(room) === 1 ? "hull" : "hull"}</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Opprettet av <span className="font-medium">{room.ownerName}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center bg-gray-50 px-3 py-2 rounded-lg min-w-[70px]">
                    <div className="font-bold text-gray-900">
                      {room.participants.length}/{room.maxPlayers}
                    </div>
                    <div className="text-xs text-gray-500">Spillere</div>
                  </div>
                  <button
                    onClick={() => handleJoinClick(room)}
                    disabled={isJoining}
                    className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg disabled:opacity-50 text-white font-medium shadow-sm transition-colors whitespace-nowrap"
                  >
                    {isJoining ? "Bli med..." : "Bli med"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>←</span>
            <span>Forrige</span>
          </button>
          <span className="text-sm text-gray-600">
            Side {currentPage} av {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Neste</span>
            <span>→</span>
          </button>
        </div>
      )}

      {joinRoomId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Rompassord</h3>
            <p className="mb-5 text-gray-600">
              Dette rommet er beskyttet med passord. Vennligst skriv inn passordet for å bli med.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 mb-5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Skriv inn passord"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setJoinRoomId(null);
                  setPasswordInput("");
                }}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium"
              >
                Avbryt
              </button>
              <button
                onClick={() => joinRoom(joinRoomId, passwordInput)}
                disabled={!passwordInput || isJoining}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 text-white font-medium"
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