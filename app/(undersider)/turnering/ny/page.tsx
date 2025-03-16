// components/NyTurnering.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const NyTurnering = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const router = useRouter();

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setMaxParticipants("");
    } else {
      const numberValue = parseInt(value, 10);
      if (!isNaN(numberValue)) {
        setMaxParticipants(numberValue);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (maxParticipants === "" || maxParticipants < 1) {
      toast.error("Maksimalt antall deltakere må være minst 1");
      return;
    }

    const tournamentData = {
      name,
      location,
      description,
      dateTime,
      maxParticipants,
    };

    try {
      const response = await fetch("/api/tournaments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke opprette turnering");
      }

      const data = await response.json();
      console.log("Turnering opprettet:", data);
      toast.success("Turnering opprettet!");
      router.push(`/turnering/${data.id}`);
    } catch (error) {
      console.error("Feil ved oppretting av turnering:", error);
      toast.error(error instanceof Error ? error.message : "Ukjent feil");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Opprett ny turnering</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Turneringsnavn:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Sted:</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Beskrivelse:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
            required
          />
        </div>

        <div>
          <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">Dato og tid:</label>
          <input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
            required
          />
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">Maksimalt antall deltakere:</label>
          <input
            id="maxParticipants"
            type="number"
            value={maxParticipants}
            onChange={handleMaxParticipantsChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300"
            min={1}
            max={500}
            required
          />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Opprett turnering
          </button>
        </div>
      </form>
    </div>
  );
};

export default NyTurnering;