// Fil: components/TournamentCreate.tsx
// Formål: Definerer en React-komponent ('use client') for et enkelt skjema for å opprette en ny turnering.
//         Tillater brukeren å angi turneringsnavn, velge type (bruker/klubb), og legge til deltakere (foreløpig via input-felt).
//         Inkluderer en placeholder-funksjon for å håndtere innsending til backend.
// Utvikler: Martin Pettersen




'use client'

import { useState } from "react";

const TournamentCreate = () => {
  const [isClubTournament, setIsClubTournament] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]); // For deltakerne

  // Håndtere type turnering
  const handleTournamentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsClubTournament(event.target.value === "club");
  };

  // Håndtere deltakerinnlegging
  const handleAddParticipant = (participantId: string) => {
    setParticipants([...participants, participantId]); // Legg til deltaker-ID til listen
  };

  const handleCreateTournament = () => {
    console.log("Creating tournament:", tournamentName, isClubTournament, participants);

    // Her kan vi sende data til backend via fetch/axios
    // Eksempel på hvordan du kan sende dataene til backend:
    // fetch('/api/tournaments', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     name: tournamentName,
    //     type: isClubTournament ? "club" : "user",
    //     participants: participants,  // Send deltakerne til backend
    //   }),
    // })
    // .then(response => response.json())
    // .then(data => console.log("Tournament created:", data))
    // .catch(error => console.error("Error:", error));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl">Opprett turnering</h2>
      
      {/* Turneringsnavn */}
      <input
        type="text"
        value={tournamentName}
        onChange={(e) => setTournamentName(e.target.value)}
        placeholder="Turneringsnavn"
        className="border p-2 mt-2 w-full"
      />

      {/* Type turnering  */}
      <div className="mt-4">
        <label>Type turnering:</label>
        <select onChange={handleTournamentTypeChange} className="border p-2 ml-2">
          <option value="user">Brukerturnering</option>
          <option value="club">Klubbtunering</option>
        </select>
      </div>

      {/* Deltakere */}
      <div className="mt-4">
        <label>Deltakere (IDer, kommaseparert):</label>
        <input
          type="text"
          onChange={(e) => handleAddParticipant(e.target.value)}
          placeholder="Legg til deltaker"
          className="border p-2 mt-2 w-full"
        />
      </div>

      {/* Opprett turnering */}
      <div className="mt-4">
      <button
       onClick={handleCreateTournament}
       className="w-full max-w-lg bg-[#292C3D] text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition duration-300"
       >
       Opprett turnering
     </button>     
      </div>
    </div>
  );
};

export default TournamentCreate;
