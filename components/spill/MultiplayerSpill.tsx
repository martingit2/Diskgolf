"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AvailableRooms from "./AvailableRooms";

interface Course {
  id: string;
  name: string;
  holes?: { number: number }[];
  baskets?: { id: string }[];
  goal?: { id: string };
  par?: number;
}

interface MultiplayerSpillProps {
  courses: Course[];
  user: { id: string; name: string } | null;
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
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const getTotalHoles = (course: Course) => {
    if (course.holes?.length) return course.holes.length;
    // Tell kun baskets, ignorer goal helt
    return course.baskets?.length || 0;
  };

  const handleCreateRoom = async () => {
    if (!selectedCourseId || !roomName) {
      alert("⚠️ Velg bane og gi rommet et navn!");
      return;
    }

    if (!user && !guestName) {
      alert("⚠️ Du må skrive inn et navn hvis du ikke er innlogget!");
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 20) {
      alert("Antall spillere må være mellom 2 og 20");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          password: roomPassword,
          courseId: selectedCourseId,
          ownerId: user?.id || null,
          ownerName: user?.name || guestName,
          maxPlayers,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke opprette rom");
      }

      router.push(`/spill/multiplayer/${data.newRoom.id}`);
    } catch (error) {
      console.error("Feil ved opprettelse av rom:", error);
      alert(error instanceof Error ? error.message : "Ukjent feil");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
      <h2 className="text-2xl font-semibold mb-4">Flerspillermodus</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Velg bane
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          >
            <option value="">Velg en bane</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({getTotalHoles(course)} hull)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Romnavn
            </label>
            <input
              type="text"
              placeholder="F.eks. 'Team Viking'"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Antall spillere (2-20)
            </label>
            <input
              type="number"
              min="2"
              max="20"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Math.min(20, Math.max(2, Number(e.target.value) || 2)))}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Rompassord (valgfritt)
          </label>
          <input
            type="password"
            placeholder="Passord for rommet"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ditt spillernavn
            </label>
            <input
              type="text"
              placeholder="Ditt navn"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>
        )}

        <button
          onClick={handleCreateRoom}
          disabled={isCreating || !selectedCourseId || !roomName}
          className={`w-full py-3 rounded-lg font-medium ${
            isCreating
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } transition-colors`}
        >
          {isCreating ? "Oppretter rom..." : "Opprett flerspillerrom"}
        </button>
      </div>

      <div className="mt-8">
        <AvailableRooms 
          rooms={rooms} 
          guestName={guestName} 
          user={user} 
        />
      </div>
    </div>
  );
}