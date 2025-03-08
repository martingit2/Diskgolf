"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import TabNavigation from "../_components/TabNavigation";
import CreateClubForm from "../_components/CreateClubForm"; // Importere CreateClubForm
import ClubSettingsForm from "../_components/ClubSettingsForm";
import ClubMembers from "../_components/ClubMembers";
import toast from "react-hot-toast"; // Importere toast for tilbakemeldinger

const ClubSettingsPage = () => {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("minKlubb");
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [clubSettings, setClubSettings] = useState<any>(null);

  // Fallback for userRole hvis session?.user?.role er undefined
  const userRole = session?.user?.role || "guest"; // Setter en standardverdi ("guest")

  // Funksjon som håndterer skjemaets innsending og suksessmelding
  const onCreateClubSubmit = (values: any) => {
    setIsCreatingClub(false);
    toast.success("Klubben ble opprettet!"); // Vis en enkelt suksessmelding etter innsending
  };

  return (
    <div className="flex flex-col items-center">
      {/* TabNavigation viser de valgte tabbene med visuell stil */}
      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} userRole={userRole} />

      {/* Innholdet som vises basert på valgt tab */}
      <div className="py-4 w-full max-w-4xl">
        <div className="tab-content">
          {selectedTab === "minKlubb" && (
            <div>
              <h2>Min Klubb</h2>
              <p>Her kan du se klubbens informasjon.</p>
            </div>
          )}
          {selectedTab === "klubbInnstillinger" && (
            <ClubSettingsForm clubSettings={clubSettings} onSaveChanges={() => {}} />
          )}
          {selectedTab === "klubbMedlemmer" && <ClubMembers />}
          {selectedTab === "opprettKlubb" && (
            <CreateClubForm onCreateClubSubmit={onCreateClubSubmit} isCreatingClub={isCreatingClub} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubSettingsPage;
