// src/app/(protected)/club-settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TabNavigation from "../_components/TabNavigation";
import CreateClubForm from "../_components/CreateClubForm";
import ClubSettingsForm from "../_components/ClubSettingsForm";
import ClubMembers from "../_components/ClubMembers";
import UserClubsList from "../_components/UserClubList";
import CreateClubNewsForm from "../_components/CreateClubNewsForm";
import toast from "react-hot-toast";
import { updateClubSettings } from "@/app/actions/update-club-settings";
import LoadingSpinner from "@/components/ui/loading-spinner"; // Importer loading spinner

// Definer type for klubbdata direkte her
interface ClubSettingsData {
    id: string;
    name?: string | null;
    location?: string | null;
    description?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    imageUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    postalCode?: string | null;
    membershipPrice?: number | null; // Pris i øre
}

// Hovedkomponent
const ClubSettingsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedTab, setSelectedTab] = useState("minKlubb");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [clubSettings, setClubSettings] = useState<ClubSettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const userRole = session?.user?.role || "guest";

  // Velg klubb for redigering
  const handleEditClub = (club: ClubSettingsData) => {
    setSelectedClubId(club.id);
    setClubSettings(club);
    setSelectedTab("klubbInnstillinger");
  };

  // Lagre endringer via Server Action
  const handleSaveChanges = async (
      clubId: string,
      // Data fra skjemaet (pris i øre)
      updatedSettings: {
         name?: string | null;
         location?: string | null;
         description?: string | null;
         email?: string | null;
         address?: string | null;
         phone?: string | null;
         website?: string | null;
         postalCode?: string | null;
         membershipPrice: number | null; // Pris i øre
      },
      logoFile: File | null,
      imageFile: File | null
    ) => {
    setIsSaving(true);
    const toastId = toast.loading("Lagrer endringer...");

    try {
        // Forbered input for action
        const actionInput = {
            clubId: clubId,
            name: updatedSettings.name,
            location: updatedSettings.location,
            description: updatedSettings.description,
            email: updatedSettings.email,
            address: updatedSettings.address,
            phone: updatedSettings.phone,
            website: updatedSettings.website,
            postalCode: updatedSettings.postalCode,
            membershipPrice: updatedSettings.membershipPrice, // Send øre
            logoFile: logoFile,
            imageFile: imageFile,
        };

        // Kall Server Action
         const data = await updateClubSettings(actionInput);

      if (data.success) {
        toast.success(data.success || "Klubbinnstillinger lagret!", { id: toastId });
        // Oppdater lokal state
        setClubSettings(prev => prev ? {
             ...prev,
             ...updatedSettings, // Bruk oppdaterte verdier fra skjemaet
             logoUrl: data.logoUrl !== undefined ? data.logoUrl : prev.logoUrl, // Oppdater med returnert URL
             imageUrl: data.imageUrl !== undefined ? data.imageUrl : prev.imageUrl,
             // membershipPrice er allerede oppdatert via updatedSettings
            } : null
        );
      } else {
        toast.error(data.error || "Ukjent feil ved lagring.", { id: toastId });
      }
    } catch (error) {
      console.error("Feil ved lagring av klubbinnstillinger:", error);
      toast.error("Noe gikk galt. Kunne ikke lagre.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Vis lasteindikator for session
  if (sessionStatus === "loading") {
    return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><LoadingSpinner text="Laster brukerdata..." /></div>;
  }

  // Håndter manglende autentisering
  if (sessionStatus !== "authenticated") {
      // TODO: Send til login eller vis "Ingen tilgang"-melding
      return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Du må være logget inn.</p></div>;
  }

  // Render UI
  return (
    <div className="flex flex-col items-center w-full px-4 py-6">
      {/* Tab-navigasjon */}
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        userRole={userRole}
        clubId={selectedClubId || ""}
      />

      {/* Innhold */}
      <div className="mt-6 w-full max-w-4xl">
          {/* Fane: Mine Klubber */}
          {selectedTab === "minKlubb" && (<UserClubsList onEditClub={handleEditClub} />)}

          {/* Fane: Klubbinnstillinger */}
          {selectedTab === "klubbInnstillinger" && (
              clubSettings ? (
                  <ClubSettingsForm
                      clubData={clubSettings}
                      onSaveChanges={handleSaveChanges} // Signaturen matcher nå
                      isSaving={isSaving}
                  />
              ) : (
                  <p className="text-center text-gray-500 py-10">Velg en klubb fra "Min Klubb"-fanen for å redigere innstillinger.</p>
              )
          )}

          {/* Fane: Klubbmedlemmer */}
          {selectedTab === "klubbMedlemmer" && (
              selectedClubId ? (
                  <ClubMembers clubId={selectedClubId} /> // Send string
              ) : (
                  <p className="text-center text-gray-500 py-10">Velg en klubb fra "Min Klubb"-fanen for å se medlemmer.</p>
              )
          )}

          {/* Fane: Opprett Klubb */}
          {selectedTab === "opprettKlubb" && ( <CreateClubForm /> )}

          {/* Fane: Klubbnyheter */}
          {selectedTab === "redigerKlubb" && (userRole === "ADMIN" || userRole === "CLUB_LEADER") && (
              selectedClubId ? (
                  <CreateClubNewsForm clubId={selectedClubId} /> // Send string
              ) : (
                  <p className="text-center text-gray-500 py-10">Velg en klubb fra "Min Klubb"-fanen for å legge til nyheter.</p>
              )
          )}
      </div>
    </div>
  );
};

export default ClubSettingsPage;