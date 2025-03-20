"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SoloSpillProps {
  courses: any[];
  user: any;
  guestName: string;
  setGuestName: (name: string) => void;
}

export default function SoloSpill({ courses, user, guestName, setGuestName }: SoloSpillProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const router = useRouter();

  const handlePlayAlone = async () => {
    if (!selectedCourseId) {
      alert("⚠️ Velg en bane før du starter!");
      return;
    }

    const ownerName = user?.name || guestName || "Gjest"; // Bruk brukerens navn eller gjestenavn
    const ownerId = user?.id || null;

    if (!ownerName) {
      alert("⚠️ Du må skrive inn et navn hvis du ikke er innlogget!");
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Solo - ${ownerName}`,
          password: null, // Ingen passord for solo-spill
          courseId: selectedCourseId,
          ownerId,
          ownerName, // Send med ownerName hvis ownerId ikke er satt
          maxPlayers: 1, // Solo-spill har maks 1 spiller
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error); // Vis feilmelding hvis noe går galt
      } else {
        router.push(`/spill/${data.newRoom.id}`); // Naviger til solo-spillet
      }
    } catch (error) {
      console.error("❌ Feil ved opprettelse av solo-spill:", error);
      alert("Kunne ikke starte solo-spill");
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
          className="w-full p-2 text-black rounded mb-2"
        />
      )}
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
      <button
        onClick={handlePlayAlone}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
      >
        Start Spill Alene
      </button>
    </div>
  );
}