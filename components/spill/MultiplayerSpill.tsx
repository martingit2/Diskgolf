// Fil: components/spill/MultiplayerSpill.tsx
// Formål: Definerer en React-komponent ('use client') som fungerer som hovedsiden for flerspillermodus.
//         Lar brukere (innloggede og gjester) opprette nye spillrom ved å velge bane, sette romnavn, passord (valgfritt),
//         maks antall spillere, og oppgi navn hvis de er gjest. Kaller et API-endepunkt for å opprette rommet.
//         Viser også tilgjengelige rom ved å rendre `AvailableRooms`-komponenten.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";
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

  const isFormValid = selectedCourseId && roomName && (user || guestName);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-4xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flerspillermodus</h2>
          <p className="text-gray-500">Opprett eller bli med i et spill</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Velg bane
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Romnavn
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="F.eks. 'Team Viking'"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
              disabled={isCreating}
            />
          </div>
          
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Antall spillere (2-20)
  </label>
  <input
    type="number"
    min="2"
    max="20"
    value={maxPlayers}
    onChange={(e) => setMaxPlayers(Math.min(20, Math.max(2, Number(e.target.value) || 2)))}
    className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
    disabled={isCreating}
  />
</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rompassord (valgfritt)
          </label>
          <input
            type="password"
            placeholder="Passord for rommet"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
            disabled={isCreating}
          />
        </div>

        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ditt spillernavn
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ditt navn"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
              disabled={isCreating}
            />
          </div>
        )}

        <button
          onClick={handleCreateRoom}
          disabled={isCreating || !isFormValid}
          className={`w-full py-3.5 rounded-lg font-medium text-white shadow-lg ${
            isCreating
              ? "bg-gray-400 cursor-not-allowed"
              : isFormValid
                ? "bg-gray-900 hover:bg-green-600"
                : "bg-gray-300 cursor-not-allowed"
          } transition-all duration-300 flex items-center justify-center gap-3 group`}
        >
          {isCreating ? (
            <>
              <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Oppretter rom...</span>
            </>
          ) : (
            <>
              <FaPlay className={`text-base ${isFormValid ? "animate-pulse group-hover:animate-none group-hover:scale-110" : ""} transition-transform`} />
              <span className="font-semibold tracking-wide">Opprett flerspillerrom</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-10">
        <AvailableRooms 
          rooms={rooms} 
          guestName={guestName} 
          user={user} 
        />
      </div>
    </div>
  );
}