"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Hole {
  number: number;
}

interface Basket {
  id: string;
}

interface Course {
  id: string;
  name: string;
  holes?: Hole[];
  baskets?: Basket[];
  goal?: { id: string };
}

interface SoloSpillProps {
  courses: Course[];
  user: { id: string; name: string } | null;
  guestName: string;
  setGuestName: (name: string) => void;
}

export default function SoloSpill({ courses, user, guestName, setGuestName }: SoloSpillProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getTotalHoles = (course: Course) => {
    if (course.holes?.length) return course.holes.length;
    // Tell kun baskets, ignorer goal helt
    return course.baskets?.length || 0;
  };

  const handlePlayAlone = async () => {
    console.log("Start spill klikket"); // Debug log
    
    if (!selectedCourseId) {
      alert("⚠️ Velg en bane før du starter!");
      return;
    }
  
    const playerName = user?.name || guestName;
    const playerId = user?.id || null;
  
    if (!playerName) {
      alert("⚠️ Du må skrive inn et navn hvis du ikke er innlogget!");
      return;
    }
  
    setIsLoading(true);
    try {
      console.log("Sender forespørsel til /api/games"); // Debug log
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          playerId,
          playerName
        }),
      });
  
      console.log("Mottatt respons:", res.status); // Debug log
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API feil:", errorData); // Debug log
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Mottatt data:", data); // Debug log
      
      if (data.error) {
        alert(data.error);
        return;
      }
  
      if (!data.gameId) {
        throw new Error("Mangler gameId i respons");
      }

      console.log("Redirecter til:", `/spill/solo/${data.gameId}`); // Debug log
      router.push(`/spill/solo/${data.gameId}`);
      
    } catch (error) {
      console.error("Full feilmelding:", error); // Debug log
      alert(`Noe gikk galt: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
      <h2 className="text-2xl font-semibold mb-4">Spill Alene</h2>
      
      {!user && (
        <input
          type="text"
          placeholder="Ditt navn"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-2 text-black rounded mb-4"
          required
        />
      )}
      
      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full p-2 text-black rounded mb-4"
        required
      >
        <option value="">Velg en bane</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name} ({getTotalHoles(course)} hull)
          </option>
        ))}
      </select>
      
      <button
        onClick={handlePlayAlone}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded text-white ${
          isLoading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isLoading ? 'Starter spill...' : 'Start Spill Alene'}
      </button>
    </div>
  );
}