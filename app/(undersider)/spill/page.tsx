"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SoloSpill from "@/components/spill/SoloSpill";
import MultiplayerSpill from "@/components/spill/MultiplayerSpill";

export default function SpillPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [guestName, setGuestName] = useState(""); // For gjester som ikke er innlogget
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  // Hent innlogget bruker
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente brukerdata");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((error) => {
        console.error("❌ Feil ved henting av bruker:", error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Hent tilgjengelige baner
  useEffect(() => {
    fetch("/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente baner");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((error) => {
        console.error("❌ Feil ved henting av baner:", error);
        setCourses([]);
      });
  }, []);

  // Hent tilgjengelige rom
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente rom");
        return res.json();
      })
      .then((data) => setRooms(data))
      .catch((error) => {
        console.error("❌ Feil ved henting av rom:", error);
        setRooms([]);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center items-center">Laster...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl text-green-300 font-bold mb-6">DiskGolf Spill</h1>

      {/* Vis brukerinfo */}
      {user ? (
        <div className="bg-green-700 text-white py-2 px-4 rounded-lg mb-6">
          Innlogget som: <strong>{user.name}</strong>
        </div>
      ) : (
        <div className="bg-yellow-600 text-white py-2 px-4 rounded-lg mb-6">
          Du er ikke innlogget. Skriv inn navn for å fortsette som gjest.
          <input
            type="text"
            placeholder="Ditt navn"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-2 text-black rounded mt-2"
          />
        </div>
      )}

      {/* Solo-spill-komponent */}
      <SoloSpill
        courses={courses}
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
      />

      {/* Flerspiller-komponent */}
      <MultiplayerSpill
        courses={courses}
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
        rooms={rooms}
      />
    </div>
  );
}