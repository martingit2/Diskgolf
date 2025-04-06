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
import LoadingSpinner from "@/components/ui/loading-spinner";
import axios from "axios";

// Type for klubbdata
interface ManagedClubData {
    id: string; name: string; location?: string | null; isPrimary?: boolean;
    description?: string | null; email?: string | null; logoUrl?: string | null;
    imageUrl?: string | null; address?: string | null; phone?: string | null;
    website?: string | null; postalCode?: string | null; membershipPrice?: number | null;
}

// Hovedkomponent
const ClubSettingsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedTab, setSelectedTab] = useState("minKlubb");
  const [managedClubs, setManagedClubs] = useState<ManagedClubData[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  // clubSettings holder data for den AKTIVT VALGTE klubben (for redigering)
  const [clubSettings, setClubSettings] = useState<ManagedClubData | null>(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const userRole = session?.user?.role || "guest";

  // Hent administrerte klubber
  useEffect(() => {
     if (sessionStatus !== 'authenticated' || !session?.user?.id) { setIsLoadingClubs(false); setManagedClubs([]); return; }
     setIsLoadingClubs(true); const userId = session.user.id;
     const fetchManagedClubs = async () => {
       try {
         const response = await axios.get(`/api/user-clubs?userId=${userId}`); // Anta henter admin-klubber
         const fetchedClubs = response.data?.clubs;
         if (Array.isArray(fetchedClubs)) {
           setManagedClubs(fetchedClubs);
           // Autovelg basert på primær eller første, KUN hvis ingen er valgt
           if (!selectedClubId && fetchedClubs.length > 0) {
             const primaryClub = fetchedClubs.find(c => c.isPrimary) || fetchedClubs[0];
             if (primaryClub) {
                // Sett BÅDE ID og data for den autovalgte klubben
                setSelectedClubId(primaryClub.id);
                setClubSettings(primaryClub);
                console.log("Autoselecting club:", primaryClub.name);
             }
           }
         } else { setManagedClubs([]); if (response.data?.error) toast.error(response.data.error); }
       } catch (error) { console.error("Feil:", error); toast.error("Kunne ikke hente klubber."); setManagedClubs([]); }
       finally { setIsLoadingClubs(false); }
     };
     fetchManagedClubs();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.id]); // Kjør kun når session endres

  // Når en klubb VELGES (f.eks. fra UserClubsList eller en annen mekanisme)
  // Oppdaterer BÅDE selectedClubId og clubSettings
  const handleSelectClub = (club: ManagedClubData) => {
    setSelectedClubId(club.id);
    setClubSettings(club); // Oppdater data for den valgte klubben
    console.log(`Club selected: ${club.name}`);
  };

  // Når bruker klikker "Rediger" i listen
  const handleGoToEditClub = (club: ManagedClubData) => {
       handleSelectClub(club); // Først velg klubben (setter ID og data)
       setSelectedTab("klubbInnstillinger"); // Så bytt til riktig fane
   };

  // Lagre endringer (Server Action kall)
  const handleSaveChanges = async ( clubId: string, updatedSettings: any, logoFile: File | null, imageFile: File | null ) => {
       setIsSaving(true);
       const toastId = toast.loading("Lagrer...");
       try {
           // Kall action
           const data = await updateClubSettings({ clubId, ...updatedSettings, logoFile, imageFile });
           if (data.success) {
               toast.success(data.success || "Lagret!", { id: toastId });
               // Oppdater både clubSettings (for aktivt skjema) og listen managedClubs
               const updatedClubData = {
                   ...(managedClubs.find(c => c.id === clubId) || {}), // Start med eksisterende fra listen
                   ...updatedSettings, // Overskriv med endringer
                   logoUrl: data.logoUrl !== undefined ? data.logoUrl : clubSettings?.logoUrl, // Oppdater URLer
                   imageUrl: data.imageUrl !== undefined ? data.imageUrl : clubSettings?.imageUrl,
               } as ManagedClubData;

               setClubSettings(updatedClubData); // Oppdater data for aktivt valgt klubb
               setManagedClubs(prev => prev.map(c => c.id === clubId ? updatedClubData : c)); // Oppdater i listen

           } else { toast.error(data.error || "Feil.", { id: toastId }); }
       } catch (error) { console.error("Lagringsfeil:", error); toast.error("Noe gikk galt.", { id: toastId }); }
       finally { setIsSaving(false); }
   };


  // ----- Rendering -----
  if (sessionStatus === "loading") return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><LoadingSpinner /></div>;
  if (sessionStatus !== "authenticated") return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Logg inn.</p></div>;

  return (
    <div className="flex flex-col items-center w-full px-4 py-6">
      {/* Tabs */}
      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} userRole={userRole} />

      {/* Innhold */}
      <div className="mt-6 w-full max-w-4xl">
          {/* --- Fane: Mine Klubber --- */}
          {selectedTab === "minKlubb" && (
              <UserClubsList
                  clubs={managedClubs}
                  isLoading={isLoadingClubs}
                  onEditClub={handleGoToEditClub} // Går til redigering
                  // onSelectClub={handleSelectClub} // Kan legge til for bare valg
              />
          )}

          {/* --- Fane: Klubbinnstillinger --- */}
          {selectedTab === "klubbInnstillinger" && (
               // Vis skjema KUN hvis en klubb er valgt (clubSettings har data)
              clubSettings ? (
                  <ClubSettingsForm
                      clubData={clubSettings} // Send data for den VALGTE klubben
                      onSaveChanges={handleSaveChanges}
                      isSaving={isSaving}
                  />
              ) : (
                  // Vis melding hvis ingen klubb er valgt
                  <p className="text-center text-gray-500 py-10">
                      {isLoadingClubs ? "Laster klubber..." : "Velg en klubb fra 'Min Klubb'-fanen for å redigere."}
                  </p>
              )
          )}

          {/* --- Fane: Klubbmedlemmer --- */}
          {selectedTab === "klubbMedlemmer" && (
              // Vis medlemskomponent KUN hvis klubber er lastet
              isLoadingClubs ? (
                   <div className="flex justify-center py-10"><LoadingSpinner text="Laster klubber..." /></div>
              ) : managedClubs.length > 0 ? (
                  <ClubMembers
                      // Send listen for dropdown
                      managedClubs={managedClubs.map(c => ({ id: c.id, name: c.name }))}
                      // Send IDen til den klubben som sist ble valgt
                      initialClubId={selectedClubId}
                  />
              ) : (
                   // Vis melding hvis ingen klubber finnes
                   <p className="text-center text-gray-500 py-10">Du administrerer ingen klubber.</p>
              )
          )}

          {/* --- Fane: Opprett Klubb --- */}
          {selectedTab === "opprettKlubb" && ( <CreateClubForm /> )}

          {/* --- Fane: Klubbnyheter --- */}
          {selectedTab === "redigerKlubb" && (userRole === "ADMIN" || userRole === "CLUB_LEADER") && (
              // Vis nyhetsskjema KUN hvis klubber er lastet
               isLoadingClubs ? (
                  <div className="flex justify-center py-10"><LoadingSpinner text="Laster klubber..." /></div>
              ) : managedClubs.length > 0 ? (
                  <CreateClubNewsForm
                      managedClubs={managedClubs} // Send hele listen for dropdown
                      initialClubId={selectedClubId} // Send aktivt valgt ID
                  />
              ) : (
                   // Vis melding hvis ingen klubber finnes
                   <p className="text-center text-gray-500 py-10">Du administrerer ingen klubber å legge til nyheter for.</p>
              )
          )}
          {/* Viser ingenting for 'redigerKlubb' hvis bruker ikke har rettigheter */}
      </div>
    </div>
  );
};

export default ClubSettingsPage;