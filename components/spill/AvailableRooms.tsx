"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  course?: {
    name: string;
  };
  participants: {
    id: string;
    playerName: string;
  }[];
  passwordHash: string | null;
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

  const pageSize = 5;

  const filteredRooms = rooms.filter((room) => {
    const isMultiplayer = room.maxPlayers > 1;
    const isNotFull = room.participants.length < room.maxPlayers;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    return isMultiplayer && isNotFull && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const roomsOnPage = filteredRooms.slice(startIndex, endIndex);

  const handleJoinRoom = async (room: Room) => {
    if (room.passwordHash) {
      setJoinRoomId(room.id);
    } else {
      await joinRoomRequest(room.id, null);
    }
  };

  const joinRoomRequest = async (roomId: string, enteredPassword: string | null) => {
    try {
      const playerName = user?.name || guestName || "Gjest";
      if (!playerName) {
        alert("Vennligst skriv inn navn eller logg inn for å bli med i rommet.");
        return;
      }

      const res = await fetch(`/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          password: enteredPassword,
          userId: user?.id || null,
          playerName,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        // ✅ Naviger til spill-lobbyen etter vellykket join
        router.push(`/spill/${roomId}`);
      }
    } catch (error) {
      console.error("Feil ved innlogging til rom:", error);
      alert("Kunne ikke bli med i rommet.");
    }
  };

  const handleSubmitPassword = async () => {
    if (!joinRoomId) return;
    await joinRoomRequest(joinRoomId, passwordInput);
    // ❌ Ikke tøm tilstanden før redirect – ellers mister vi tilgangen til roomId
    setPasswordInput("");
    setJoinRoomId(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Tilgjengelige Rom</h2>

      <div className="mb-4">
        <label htmlFor="search" className="block mb-1">
          Søk på romnavn:
        </label>
        <input
          id="search"
          type="text"
          placeholder="F.eks. 'Anna sitt rom'"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 text-black rounded"
        />
      </div>

      {roomsOnPage.length === 0 ? (
        <p>Ingen ledige flerspillerrom akkurat nå.</p>
      ) : (
        <ul>
          {roomsOnPage.map((room) => {
            const currentPlayers = room.participants.length;
            return (
              <li key={room.id} className="mb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <span className="font-semibold">{room.name}</span>{" "}
                    <span className="text-sm text-gray-300">
                      ({room.course?.name || "Ukjent bane"})
                    </span>
                    <div className="text-sm text-gray-400">
                      Spillere: {currentPlayers}/{room.maxPlayers}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room)}
                    className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded text-white"
                  >
                    Bli med
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded disabled:opacity-50"
          >
            Forrige
          </button>
          <span>
            Side {currentPage} av {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded disabled:opacity-50"
          >
            Neste
          </button>
        </div>
      )}

      {joinRoomId && (
        <div className="mt-6 bg-gray-700 p-4 rounded shadow-lg">
          <label className="block mb-2 text-white font-semibold">
            Skriv inn passord for rommet:
          </label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-2 text-black rounded mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSubmitPassword}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Bli med
            </button>
            <button
              onClick={() => {
                setJoinRoomId(null);
                setPasswordInput("");
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
