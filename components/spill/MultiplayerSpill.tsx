"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MultiplayerSpillProps {
  courses: any[];
  user: any;
  guestName: string;
  setGuestName: (name: string) => void;
  rooms: any[];
}

export default function MultiplayerSpill({ courses, user, guestName, setGuestName, rooms }: MultiplayerSpillProps) {
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

    console.log("Data som sendes til backend:", {
      name: roomName,
      password: roomPassword,
      courseId: selectedCourseId,
      ownerId,
      ownerName, // Sjekk at denne har en verdi
      maxPlayers,
    });

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
        router.push(`/spill/${data.newRoom.id}`); // Naviger til det nye rommet
      }
    } catch (error) {
      console.error("❌ Feil ved opprettelse av rom:", error);
      alert("Kunne ikke opprette rom");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
      <h2 className="text-2xl font-semibold mb-4">Opprett Rom (Flerspiller)</h2>
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
      <input
        type="text"
        placeholder="Romnavn"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="w-full p-2 text-black rounded mb-2"
      />
      <input
        type="password"
        placeholder="Passord"
        value={roomPassword}
        onChange={(e) => setRoomPassword(e.target.value)}
        className="w-full p-2 text-black rounded mb-2"
      />
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
      {!user && (
        <input
          type="text"
          placeholder="Ditt navn (gjest)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-2 text-black rounded mb-2"
        />
      )}
      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
      >
        Opprett Rom
      </button>

      {/* Vis tilgjengelige rom */}
      {rooms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Tilgjengelige Rom</h2>
          <ul>
            {rooms.map((room) => (
              <li key={room.id} className="mt-2">
                {room.name} ({room.course?.name})
                <button
                  onClick={() => router.push(`/spill/${room.id}`)}
                  className="ml-4 bg-blue-500 px-3 py-1 rounded"
                >
                  Bli med
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}