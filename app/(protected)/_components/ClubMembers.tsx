// src/app/(protected)/_components/ClubMembers.tsx (eller hvor den ligger)
"use client";

import React, { useEffect, useState } from 'react';
// ... andre importer

// Definer props for ClubMembers
interface ClubMembersProps {
    clubId: string; // Forventer clubId som en string prop
}

// Komponenten tar nå imot props
const ClubMembers: React.FC<ClubMembersProps> = ({ clubId }) => {
    const [members, setMembers] = useState<any[]>([]); // Tilpass 'any'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clubId) { // Kjør kun hvis clubId finnes
            setLoading(true);
            setError(null);
            // --- Hent medlemmer basert på clubId ---
            const fetchMembers = async () => {
                try {
                    // Bytt ut med ditt faktiske API-kall
                    const response = await fetch(`/api/clubs/${clubId}/members`);
                    if (!response.ok) {
                        throw new Error('Kunne ikke hente medlemmer');
                    }
                    const data = await response.json();
                    setMembers(data.members || []); // Anta at API returnerer { members: [...] }
                } catch (err: any) {
                    setError(err.message || 'Feil ved henting av medlemmer.');
                    setMembers([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchMembers();
            // --------------------------------------
        } else {
            // Håndter tilfellet der clubId er null/undefined (skal ikke skje pga. sjekken i parent)
            setMembers([]);
            setError("Ingen klubb valgt.");
        }
    }, [clubId]); // Kjør effekten når clubId endres

    if (loading) return <p>Laster medlemmer...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Medlemmer</h2>
            {members.length > 0 ? (
                <ul>
                    {members.map(member => (
                        <li key={member.id}>{member.name} ({member.email})</li> // Tilpass felter
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Ingen medlemmer funnet for denne klubben.</p>
            )}
        </div>
    );
};

export default ClubMembers;