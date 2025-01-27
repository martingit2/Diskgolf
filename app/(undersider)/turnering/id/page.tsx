'use client'

import { useState, useEffect } from "react";

// Definer typene for turnering og deltakere
interface Participant {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  dateTime: string;
  participants: Participant[];
}

// Funksjon for å hente turneringsdata på serveren
const fetchTournamentData = async (id: string): Promise<Tournament> => {
  const response = await fetch(`/api/tournaments/${id}`);
  const data = await response.json();
  return data;
};

const TurneringVisning = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Hent turneringsdata når komponenten lastes
  useEffect(() => {
    const loadTournament = async () => {
      try {
        const data = await fetchTournamentData('sample-id'); // Hardkode ID for testing
        setTournament(data);
        setParticipants(data.participants);
        setIsParticipant(data.participants.some((p) => p.id === "currentUserID")); // Erstatt med faktisk logikk
      } catch (error) {
        console.error("Feil ved henting av turnering:", error);
      }
    };
    loadTournament();
  }, []);

  const handleJoinTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tournamentId: 'sample-id', userId: "currentUserID" }), // Hardkode ID for testing
      });

      if (response.ok) {
        const updatedTournament = await response.json();
        setParticipants(updatedTournament.participants);
        setIsParticipant(true);
      } else {
        console.error("Feil ved å bli med i turneringen");
      }
    } catch (error) {
      console.error("Feil ved å bli med i turneringen:", error);
    }
  };

  if (!tournament) return <div>Laster...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">{tournament.name}</h1>
      <p><strong>Type:</strong> {tournament.type}</p>
      <p><strong>Sted:</strong> {tournament.location}</p>
      <p><strong>Beskrivelse:</strong> {tournament.description}</p>
      <p><strong>Dato og tid:</strong> {new Date(tournament.dateTime).toLocaleString()}</p>

      <h2 className="text-xl mt-6">Deltakere:</h2>
      <ul>
        {participants.length > 0 ? (
          participants.map((participant: Participant) => (
            <li key={participant.id}>{participant.name}</li>
          ))
        ) : (
          <p>Ingen deltakere ennå</p>
        )}
      </ul>

      {!isParticipant ? (
        <button
          onClick={handleJoinTournament}
          className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-400 transition duration-300 mt-4"
        >
          Bli med i turneringen
        </button>
      ) : (
        <p>Du er allerede påmeldt til turneringen!</p>
      )}
    </div>
  );
};

export default TurneringVisning;
