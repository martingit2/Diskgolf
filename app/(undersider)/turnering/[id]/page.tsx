// app/turnering/[id]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Tournament {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  dateTime: string;
  maxParticipants: number;
  participants: { id: string; name: string }[];
  club?: { id: string; name: string };
}

const TurneringVisning = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const params = useParams(); // Hent params med useParams()

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        // Sjekk at params og params.id eksisterer
        if (!params || !params.id) {
          console.error("Turnering-ID mangler");
          return;
        }

        const response = await fetch(`/api/tournaments/${params.id}`);
        const data = await response.json();
        setTournament(data);
      } catch (error) {
        console.error("Feil ved henting av turnering:", error);
      }
    };

    fetchTournament();
  }, [params]); // Bruk params som avhengighet

  if (!tournament) return <div>Laster...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">{tournament.name}</h1>
      <p><strong>Type:</strong> {tournament.type}</p>
      <p><strong>Sted:</strong> {tournament.location}</p>
      <p><strong>Beskrivelse:</strong> {tournament.description}</p>
      <p><strong>Dato og tid:</strong> {new Date(tournament.dateTime).toLocaleString()}</p>
      <p><strong>Maks antall deltakere:</strong> {tournament.maxParticipants}</p>

      {tournament.club && (
        <p><strong>Opprettet av klubb:</strong> {tournament.club.name}</p>
      )}

      <h2 className="text-xl mt-6">Deltakere:</h2>
      <ul>
        {tournament.participants.length > 0 ? (
          tournament.participants.map((participant) => (
            <li key={participant.id}>{participant.name}</li>
          ))
        ) : (
          <p>Ingen deltakere ennå</p>
        )}
      </ul>
    </div>
  );
};

export default TurneringVisning;