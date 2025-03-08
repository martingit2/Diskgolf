// Filnavn: components/ClubTabs.tsx
"use client";

import { useState } from "react";

interface ClubTabsProps {
  isAdminOrClubLeader: boolean;  // Props for å sjekke om bruker har admin/klubbleder-rettigheter
}

// Komponent for seksjonsnavigasjon
const ClubTabs: React.FC<ClubTabsProps> = ({ isAdminOrClubLeader }) => {
  const [selectedSection, setSelectedSection] = useState<string>("minKlubb");

  // Funksjon for å håndtere når en tab blir valgt
  const handleTabChange = (section: string) => {
    setSelectedSection(section);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tabellignende navigasjon */}
      <div className="flex justify-center space-x-6 mt-4 border-b-2 border-gray-300">
        <button
          onClick={() => handleTabChange("minKlubb")}
          className={`py-2 px-4 ${selectedSection === "minKlubb" ? "border-b-4 border-blue-500" : ""}`}
        >
          Min Klubb
        </button>
        <button
          onClick={() => handleTabChange("klubbInnstillinger")}
          className={`py-2 px-4 ${selectedSection === "klubbInnstillinger" ? "border-b-4 border-blue-500" : ""}`}
        >
          Klubbinnstillinger
        </button>

        {/* Vis "Rediger Klubb" kun for admin/club leaders */}
        {isAdminOrClubLeader && (
          <button
            onClick={() => handleTabChange("redigerKlubb")}
            className={`py-2 px-4 ${selectedSection === "redigerKlubb" ? "border-b-4 border-blue-500" : ""}`}
          >
            Rediger Klubb
          </button>
        )}
      </div>

      {/* Innholdet som vises basert på valgt tab */}
      <div className="p-4">
        {selectedSection === "minKlubb" && <MinKlubb />}
        {selectedSection === "klubbInnstillinger" && <KlubbInnstillinger />}
        {selectedSection === "redigerKlubb" && <RedigerKlubb />}
      </div>
    </div>
  );
};

// Innhold for de forskjellige seksjonene
const MinKlubb = () => {
  return (
    <div>
      <h2>Min Klubb</h2>
      <p>Her kan du se klubbens informasjon, medlemsstatistikk og mer.</p>
    </div>
  );
};

const KlubbInnstillinger = () => {
  return (
    <div>
      <h2>Klubbinnstillinger</h2>
      <p>Her kan du endre klubbens innstillinger, som navn, e-post osv.</p>
    </div>
  );
};

const RedigerKlubb = () => {
  return (
    <div>
      <h2>Rediger Klubb</h2>
      <p>Her kan administratorer/klubbledere gjøre endringer i klubbens detaljer og baner.</p>
    </div>
  );
};

export default ClubTabs;
