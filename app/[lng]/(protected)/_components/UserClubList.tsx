// Fil: src/app/(protected)/_components/UserClubsList.tsx
// Formål: Komponent for å vise en liste over klubber brukeren administrerer. Viser grunnleggende klubbinformasjon og en knapp for å gå til klubbens innstillinger. Håndterer lasting og tom liste-tilstander.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner"; // Importer spinner

// Definer type for data som mottas (matcher ManagedClubData)
interface ClubInList {
  id: string;
  name: string;
  location?: string | null;
  isPrimary?: boolean;
  // Inkluder andre felter hvis de skal vises i listen
}

// Definer props for komponenten
interface UserClubsListProps {
  clubs: ClubInList[]; // Mottar listen som prop
  isLoading: boolean; // Mottar loading state
  onEditClub: (club: ClubInList) => void; // Funksjon for når "Rediger" klikkes
  // onSelectClub?: (club: ClubInList) => void; // Valgfri funksjon for klikk på selve raden
  // onSetPrimary?: (clubId: string) => void; // Funksjoner for primærklubb
  // onRemovePrimary?: (clubId: string) => void;
  // onLeaveClub?: (clubId: string) => void;
}

const UserClubsList: React.FC<UserClubsListProps> = ({
  clubs,
  isLoading,
  onEditClub,
  // onSelectClub,
  // onSetPrimary,
  // onRemovePrimary,
  // onLeaveClub,
}) => {

  // Loading state
  if (isLoading) {
    return <div className="flex justify-center py-10"><LoadingSpinner text="Laster dine klubber..." /></div>;
  }

  // Tom state
  if (clubs.length === 0) {
    return <p className="text-center text-gray-500 py-10">Du administrerer ingen klubber enda. Gå til "Opprett Klubb"-fanen for å lage en.</p>;
  }

  // Render listen
  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Mine Administrerte Klubber</h3>
      <p className="text-sm text-gray-600 mb-6">Velg en klubb for å se detaljer, redigere innstillinger, administrere medlemmer eller legge til nyheter.</p>
      <ul className="space-y-3">
        {clubs.map((club) => (
          <li key={club.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Info om klubben */}
            <div
              className="flex-grow cursor-pointer"
              // onClick={() => onSelectClub?.(club)} // Aktiver hvis du vil ha klikk på raden
            >
              <strong className="text-lg font-medium text-blue-950 block">{club.name}</strong>
              {club.location && <span className="text-sm text-gray-600">{club.location}</span>}
            </div>
             {/* Knapper for handlinger */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 flex-shrink-0">
               {/* TODO: Implementer logikk for primærklubb hvis nødvendig */}
               {/* {club.isPrimary ? ( <Button size="sm" variant="outline" disabled>Primær</Button> ) : ( <Button size="sm" onClick={() => onSetPrimary?.(club.id)}>Velg som primær</Button> )} */}
               <Button size="sm" variant="outline" onClick={() => onEditClub(club)}>
                 Innstillinger
               </Button>
               {/* TODO: Legg til knapp for å forlate/slette hvis brukeren kan det */}
               {/* <Button size="sm" variant="destructive" onClick={() => onLeaveClub?.(club.id)}>Forlat/Slett</Button> */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserClubsList;