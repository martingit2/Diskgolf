"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AvailableRooms from "./AvailableRooms";

interface MultiplayerSpillProps {
  courses: any[];
  user: any;
  guestName: string;
  setGuestName: (name: string) => void;
  rooms: any[];
}

export default function MultiplayerSpill({
  courses,
  user,
  guestName,
  setGuestName,
  rooms,
}: MultiplayerSpillProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!selectedCourseId || !roomName || !roomPassword) {
      alert("⚠️ Fyll ut alle feltene!");
      return;
    }

    // Sjekk at guestName er satt hvis brukeren ikke er innlogget
    if (!user && !guestName) {
      alert("⚠️ Du må skrive inn et navn hvis du ikke er innlogget!");
      return;
    }

    const ownerName = user?.name || guestName || "Gjest"; // Bruk brukerens navn eller gjestenavn
    const ownerId = user?.id || null;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          password: roomPassword,
          courseId: selectedCourseId,
          ownerId,
          ownerName, // Send med ownerName hvis ownerId ikke er satt
          maxPlayers,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error); // Vis feilmelding hvis noe går galt
      } else {
        // Naviger til det nye rommet
        router.push(`/spill/${data.newRoom.id}`);
      }
    } catch (error) {
      console.error("❌ Feil ved opprettelse av rom:", error);
      alert("Kunne ikke opprette rom");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
      <h2 className="text-2xl font-semibold mb-4">Opprett Rom (Flerspiller)</h2>

      {/* Velg bane */}
      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full p-2 text-black rounded mb-2"
      >
        <option value="">Velg en bane</option>
        {courses.map((course: any) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>

      {/* Romnavn */}
      <input
        type="text"
        placeholder="Romnavn"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="w-full p-2 text-black rounded mb-2"
      />

      {/* Passord */}
      <input
        type="password"
        placeholder="Passord"
        value={roomPassword}
        onChange={(e) => setRoomPassword(e.target.value)}
        className="w-full p-2 text-black rounded mb-2"
      />

      {/* Antall spillere */}
      <input
        type="number"
        placeholder="Antall spillere"
        value={maxPlayers}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          setMaxPlayers(isNaN(value) ? 2 : value); // Bruk 2 som fallback hvis inputen er ugyldig
        }}
        className="w-full p-2 text-black rounded mb-2"
      />

      {/* Gjestenavn hvis ikke innlogget */}
      {!user && (
        <input
          type="text"
          placeholder="Ditt navn (gjest)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-2 text-black rounded mb-2"
        />
      )}

      {/* Opprett-knapp */}
      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
      >
        Opprett Rom
      </button>

      {/* Tilgjengelige Rom (bruker ny komponent) */}
      <AvailableRooms rooms={rooms} guestName={guestName} user={user} />
    </div>
  );
}
