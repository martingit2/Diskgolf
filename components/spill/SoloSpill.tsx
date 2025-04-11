// Fil: components/spill/SoloSpill.tsx
// Formål: Definerer en React-komponent ('use client') for å starte et nytt solo-spill.
//         Lar brukere (innloggede og gjester) velge en bane og starte en solo-spilløkt. Kaller et API-endepunkt (/api/games) for å opprette spillet og håndterer omdirigering, loading state og feil. Krever navn for gjestespillere.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";

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
    return course.baskets?.length || 0;
  };

  const handlePlayAlone = async () => {
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
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          playerId,
          playerName
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
  
      if (!data.gameId) {
        throw new Error("Mangler gameId i respons");
      }

      router.push(`/spill/solo/${data.gameId}`);
      
    } catch (error) {
      console.error("Feil:", error);
      alert(`Noe gikk galt: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-4xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solo-spill</h2>
          <p className="text-gray-500">Start din eksklusive enkeltspiller-opplevelse</p>
        </div>
      </div>

      <div className="space-y-5">
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ditt spillernavn
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Skriv inn ditt navn"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Velg bane
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 appearance-none"
            required
          >
            <option value="">Velg en bane</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({getTotalHoles(course)} hull)
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handlePlayAlone}
          disabled={isLoading || !selectedCourseId || (!user && !guestName)}
          className={`w-full py-3.5 rounded-lg font-medium text-white shadow-lg ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-900 hover:bg-green-600 disabled:bg-gray-300"
          } transition-all duration-300 flex items-center justify-center gap-3 group`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Starter spill-opplevelse...</span>
            </>
          ) : (
            <>
              <FaPlay className="text-base animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform" />
              <span className="text-white font-semibold tracking-wide">Start Solo-spill</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}