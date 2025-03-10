"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TabNavigation from "../_components/TabNavigation";
import CreateClubForm from "../_components/CreateClubForm";
import ClubSettingsForm from "../_components/ClubSettingsForm";
import ClubMembers from "../_components/ClubMembers";
import UserClubsList from "../_components/UserClubList";
import toast from "react-hot-toast";
import { updateClubSettings } from "@/app/actions/update-club-settings";
import CreateClubNewsForm from "../_components/CreateClubNewsForm"; // Importere CreateClubNewsForm

const ClubSettingsPage = () => {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("minKlubb");
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [clubSettings, setClubSettings] = useState<any>(null); // Hold klubbinnstillinger her
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null); // For å holde styr på valgt klubb
  const [clubNews, setClubNews] = useState<any[]>([]); // For å lagre klubbnyheter

  // Fallback for userRole hvis session?.user?.role er undefined
  const userRole = session?.user?.role || "guest"; // Setter en standardverdi ("guest")

  // Funksjon som håndterer skjemaets innsending og suksessmelding.
  const onCreateClubSubmit = (values: any) => {
    setIsCreatingClub(false);
    toast.success("Klubben ble opprettet!"); // Vis en enkelt suksessmelding etter innsending
  };

  // Funksjon for å hente inn klubbens innstillinger når en klubb er valgt
  const onEditClub = (club: any) => {
    setSelectedClubId(club.id); // Sett ID til den valgte klubben
    setClubSettings(club); // Sett klubbens innstillinger i state
    setSelectedTab("klubbInnstillinger"); // Sett tabben til klubbinnstillinger
  };

  // Funksjon som håndterer lagring av endrede klubbinnstillinger
  const onSaveChanges = async (updatedSettings: any, logoFile: File | null) => {
    try {
      const data = await updateClubSettings({
        clubId: updatedSettings.id,
        name: updatedSettings.name,
        address: updatedSettings.address,
        phone: updatedSettings.phone,
        postalCode: updatedSettings.postalCode,
        logoFile: logoFile,
      });

      if (data.success) {
        toast.success("Klubben ble oppdatert!");
        setClubSettings(updatedSettings); // Oppdater UI med de nye innstillingene
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt med å lagre endringene.");
      console.error("Feil:", error);
    }
  };

  // Funksjon for å hente klubbnyheter
  const fetchClubNews = async () => {
    try {
      const response = await fetch(`/api/get-club-news?clubId=${selectedClubId}`);
      const data = await response.json();

      if (response.ok) {
        setClubNews(data.clubNews || []); // Sett klubbnyheter i state
      } else {
        toast.error(data.error || "Kunne ikke hente nyheter.");
      }
    } catch (error) {
      console.error("Feil ved henting av klubbnyheter:", error);
      toast.error("Noe gikk galt med å hente nyhetene.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* TabNavigation viser de valgte tabbene med visuell stil */}
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        userRole={userRole}
        clubId={selectedClubId || ""}  // Sørg for at clubId sendes riktig
      />

      {/* Innholdet som vises basert på valgt tab */}
      <div className="py-4 w-full max-w-4xl">
        <div className="tab-content">
          {selectedTab === "minKlubb" && (
            <div>
              <UserClubsList onEditClub={onEditClub} />
            </div>
          )}
          {selectedTab === "klubbInnstillinger" && (
            <ClubSettingsForm
              clubSettings={clubSettings}
              onSaveChanges={onSaveChanges} // Send begge: innstillinger og logo til onSaveChanges
            />
          )}
          {selectedTab === "klubbMedlemmer" && <ClubMembers />}
          {selectedTab === "opprettKlubb" && (
            <CreateClubForm onCreateClubSubmit={onCreateClubSubmit} isCreatingClub={isCreatingClub} />
          )}
          {selectedTab === "redigerKlubb" && (userRole === "ADMIN" || userRole === "CLUB_LEADER") && (
            <CreateClubNewsForm clubId={selectedClubId || ""} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubSettingsPage;
