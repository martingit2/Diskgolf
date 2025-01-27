'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

const NyTurnering = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("USER");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
    }
  };

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/^0+/, ''); // Fjern ledende nuller
    if (!value) {
      value = '0'; // Hvis ingen tall er skrevet inn, sett verdien til 0
    }
    const numberValue = parseInt(value, 10); // Konverter til et heltall
    setMaxParticipants(numberValue);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Send POST request to backend to create a new tournament
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("dateTime", dateTime);
    if (image) {
      formData.append("image", image);
    }
    formData.append("maxParticipants", maxParticipants.toString());

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Turnering opprettet:", data);
      router.push("/turneringer");
    } catch (error) {
      console.error("Feil ved oppretting av turnering:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Opprett ny turnering</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">Turneringsnavn:</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" required />
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700">Type turnering:</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-2 p-3 w-full border border-gray-300 rounded-lg">
            <option value="USER">Brukerturnering</option>
            <option value="CLUB">Klubbtunering</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700">Sted:</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" required />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">Beskrivelse:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" required />
        </div>

        <div className="mb-4">
          <label htmlFor="dateTime" className="block text-gray-700">Dato og tid:</label>
          <input id="dateTime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" required />
        </div>

        <div className="mb-4">
          <label htmlFor="maxParticipants" className="block text-gray-700">Maksimalt antall deltakere:</label>
          <input id="maxParticipants" type="number" value={maxParticipants} onChange={handleMaxParticipantsChange} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" min={1} max={500} required />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-gray-700">Last opp bilde (valgfritt):</label>
          <input id="image" type="file" onChange={handleImageUpload} className="mt-2 p-3 w-full border border-gray-300 rounded-lg" />
        </div>

        <div className="mt-6">
          <button type="submit" className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-400 transition duration-300">
            Opprett turnering
          </button>
        </div>
      </form>
    </div>
  );
};

export default NyTurnering;
