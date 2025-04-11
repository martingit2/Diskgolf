// Fil: src/app/(protected)/club-settings/page.tsx
// Formål: Hovedside for klubbadministrasjon. Gir brukeren mulighet til å se sine administrerte klubber, redigere innstillinger, administrere medlemmer, opprette nye klubber og publisere nyheter via et fanebasert grensesnitt.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import TabNavigation from "../_components/TabNavigation";
import CreateClubForm from "../_components/CreateClubForm";
import ClubSettingsForm from "../_components/ClubSettingsForm"; // Importerer typen herfra
import ClubMembers from "../_components/ClubMembers";
import UserClubsList from "../_components/UserClubList";
import CreateClubNewsForm from "../_components/CreateClubNewsForm";
import toast from "react-hot-toast";
import { updateClubSettings } from "@/app/actions/update-club-settings"; // Server Action
import LoadingSpinner from "@/components/ui/loading-spinner";
import axios from "axios"; // For henting av brukerens klubber
import { UserRole } from "@prisma/client"; // Bruk Enum for rollesammenligning

/**
 * Interface som definerer strukturen for klubbdata brukeren administrerer.
 */
interface ManagedClubData {
    id: string;
    name: string; // Merk: I databasen er name påkrevd, men vi håndterer null/undefined fra form
    location?: string | null;
    isPrimary?: boolean;
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

/**
 * Type for datastrukturen som forventes av onSaveChanges-propen i ClubSettingsForm.
 * Dette definerer nøyaktig hva skjemaet sender opp.
 */
type ClubSettingsFormValues = {
    name?: string | null;
    location?: string | null;
    description?: string | null;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    postalCode?: string | null;
    membershipPrice: number | null; // Pris i øre, kan være null
};


/**
 * Klubbinnstillinger-side: Lar brukere (ADMIN/CLUB_LEADER) administrere klubbinnstillinger,
 * se medlemmer, opprette klubber, og publisere nyheter.
 */
const ClubSettingsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedTab, setSelectedTab] = useState("minKlubb"); // Standard fane
  const [managedClubs, setManagedClubs] = useState<ManagedClubData[]>([]); // Liste over klubber brukeren kan administrere
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null); // ID-en til klubben som er valgt for visning/redigering
  const [clubSettings, setClubSettings] = useState<ManagedClubData | null>(null); // Data for den valgte klubben
  const [isLoadingClubs, setIsLoadingClubs] = useState(true); // Lastestatus for henting av klubber
  const [isSaving, setIsSaving] = useState(false); // Lagringsstatus for innstillingsskjemaet

  // Hent brukerrolle fra session, default til 'guest' hvis uautentisert eller rolle mangler
  const userRole = session?.user?.role as UserRole | "guest" || "guest";

  /**
   * Hent klubber som den nåværende brukeren er autorisert til å administrere (ADMIN eller CLUB_LEADER).
   * Antar at API-endepunktet `/api/user-clubs` kun returnerer disse klubbene.
   */
  const fetchManagedClubs = useCallback(async (userId: string) => {
    setIsLoadingClubs(true);
    try {
      const response = await axios.get(`/api/user-clubs?userId=${userId}`);
      const fetchedClubs = response.data?.clubs;

      if (Array.isArray(fetchedClubs)) {
        setManagedClubs(fetchedClubs);
        // Autovelg den første klubben eller primærklubben hvis ingen er valgt
        if (!selectedClubId && fetchedClubs.length > 0) {
          const primaryClub = fetchedClubs.find(c => c.isPrimary) || fetchedClubs[0];
          if (primaryClub) {
            setSelectedClubId(primaryClub.id);
            setClubSettings(primaryClub); // Forhåndsutfyll data i innstillingsskjemaet
            console.log("Autovelger klubb:", primaryClub.name);
          }
        }
      } else {
        setManagedClubs([]);
        if (response.data?.error) {
            toast.error(response.data.error);
        }
      }
    } catch (error) {
      console.error("Feil ved henting av administrerte klubber:", error);
      toast.error("Kunne ikke hente dine klubber.");
      setManagedClubs([]);
    } finally {
      setIsLoadingClubs(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClubId]); // Kjør på nytt hvis selectedClubId endres (men neppe nødvendig her)

  // Effekt for å hente klubber når session er autentisert
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.id) {
      fetchManagedClubs(session.user.id);
    } else if (sessionStatus !== 'loading') {
      // Hvis ikke laster og ikke autentisert, nullstill state
      setIsLoadingClubs(false);
      setManagedClubs([]);
      setSelectedClubId(null);
      setClubSettings(null);
    }
  }, [sessionStatus, session?.user?.id, fetchManagedClubs]);

  /**
   * Handler for å velge en klubb fra en liste eller nedtrekksmeny.
   * Oppdaterer både valgt ID og dataen som brukes av innstillingsskjemaet.
   * @param club - Den valgte klubbens data.
   */
  const handleSelectClub = (club: ManagedClubData) => {
    setSelectedClubId(club.id);
    setClubSettings(club); // Oppdater data for skjemaet
    console.log(`Klubb valgt for redigering/visning: ${club.name}`);
  };

  /**
   * Handler for å klikke "Rediger"-knappen i UserClubsList.
   * Velger klubben og bytter til innstillingsfanen.
   * @param club - Klubben som skal redigeres.
   */
  const handleGoToEditClub = (club: ManagedClubData) => {
       handleSelectClub(club); // Sett aktiv klubb
       setSelectedTab("klubbInnstillinger"); // Naviger til innstillingsfanen
   };

  /**
   * Handler for å lagre endringer gjort i ClubSettingsForm.
   * Kaller `updateClubSettings` server action.
   * !!! VIKTIG: Typen for 'values' MÅ matche den definert i ClubSettingsFormProps !!!
   * @param clubId - ID-en til klubben som oppdateres.
   * @param values - Skjemaverdiene (matcher ClubSettingsFormValues type).
   * @param logoFile - Den nye logofilen, hvis noen.
   * @param imageFile - Den nye bildefilen, hvis noen.
   */
  const handleSaveChanges = async (
      clubId: string,
      values: ClubSettingsFormValues, // Bruk den eksplisitte typen her
      logoFile: File | null,
      imageFile: File | null
  ) => {
       if (!clubId) {
           toast.error("Kan ikke lagre endringer: Klubb-ID mangler.");
           return;
       }
       setIsSaving(true);
       const toastId = toast.loading("Lagrer klubbinnstillinger...");

       try {
           // Kall server action (autorisasjon skjer server-side)
           // Server action håndterer undefined felter korrekt
           const result = await updateClubSettings({
               clubId,
               ...values, // Spread skjemaverdiene direkte
               logoFile,
               imageFile
           });

           if (result.success) {
               toast.success(result.success || "Innstillinger lagret!", { id: toastId }); // Lagt til standard suksessmelding

               // Optimistisk oppdater lokal state for skjemaet og listen
               // Viktig: Håndter potensiell null/undefined fra 'values' ved oppdatering av state
               const updatedClubData: ManagedClubData = {
                   // Start med eksisterende data eller en basisstruktur hvis ingen finnes
                   ...(clubSettings || { id: clubId, name: values.name || 'Navnløs Klubb' }), // Gi et fallback-navn om nødvendig
                   ...values, // Bruk endringer fra skjemaet
                   name: values.name || clubSettings?.name || 'Navnløs Klubb', // Sikre at name aldri er undefined i ManagedClubData
                   // Bruk oppdaterte URLer fra action-resultat hvis de finnes, ellers behold eksisterende
                   logoUrl: result.logoUrl !== undefined ? result.logoUrl : clubSettings?.logoUrl,
                   imageUrl: result.imageUrl !== undefined ? result.imageUrl : clubSettings?.imageUrl,
                   // Sikre at påkrevde felter som 'name' har en verdi i state-objektet
               };


               // Oppdater dataen som vises i skjemaet
               setClubSettings(updatedClubData);
               // Oppdater dataen i listen over administrerte klubber
               setManagedClubs(prevClubs =>
                   prevClubs.map(club =>
                       club.id === clubId ? updatedClubData : club
                   )
               );

           } else {
               // Vis feilmelding fra server action
               toast.error(result.error || "Kunne ikke lagre innstillingene.", { id: toastId });
           }
       } catch (error) {
           console.error("Feil ved lagring av klubbinnstillinger:", error);
           toast.error("En uventet feil oppstod under lagring.", { id: toastId });
       } finally {
           setIsSaving(false);
       }
   };

   /**
    * Bestem om den nåværende brukeren er autorisert til å redigere den *valgte* klubben.
    * - ADMIN-brukere kan alltid redigere.
    * - CLUB_LEADERs kan redigere hvis en klubb er valgt (antar at `managedClubs` kun inneholder klubber de leder).
    */
   const isAuthorizedToEditSelectedClub =
       userRole === UserRole.ADMIN ||
       (userRole === UserRole.CLUB_LEADER && !!clubSettings);

  // --- Renderingslogikk ---

  // Vis lastespinner mens session laster
  if (sessionStatus === "loading") {
      return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><LoadingSpinner /></div>;
  }

  // Be bruker logge inn hvis ikke autentisert
  if (sessionStatus !== "authenticated") {
      return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Vennligst logg inn for å administrere klubbinnstillinger.</p></div>;
  }

  // Hovedsidens layout
  return (
    <div className="flex flex-col items-center w-full px-4 py-6">
      {/* Fane-navigasjon */}
      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} userRole={userRole} />

      {/* Fane-innhold */}
      <div className="mt-6 w-full max-w-4xl">
          {/* Fane: Mine Klubber */}
          {selectedTab === "minKlubb" && (
              <UserClubsList
                  clubs={managedClubs}
                  isLoading={isLoadingClubs}
                  onEditClub={handleGoToEditClub} // Callback for å bytte fane og velge klubb
              />
          )}

          {/* Fane: Klubbinnstillinger */}
          {selectedTab === "klubbInnstillinger" && (
               // Render skjema kun hvis en klubb er valgt
              clubSettings ? (
                  <ClubSettingsForm
                      clubData={clubSettings}        // Send data for den valgte klubben
                      onSaveChanges={handleSaveChanges} // Send den korrekt typede lagringshandleren
                      isSaving={isSaving}             // Send lagringsstatus
                      isAuthorizedToEdit={isAuthorizedToEditSelectedClub} // Send autorisasjonsstatus
                  />
              ) : (
                  // Vis placeholder hvis ingen klubb er valgt ennå
                  <p className="text-center text-gray-500 py-10">
                      {isLoadingClubs ? "Laster klubber..." : "Velg en klubb fra 'Mine Klubber'-fanen for å redigere innstillingene."}
                  </p>
              )
          )}

          {/* Fane: Klubbmedlemmer */}
          {selectedTab === "klubbMedlemmer" && (
              isLoadingClubs ? (
                   <div className="flex justify-center py-10"><LoadingSpinner text="Laster klubber..." /></div>
              ) : managedClubs.length > 0 ? (
                  <ClubMembers
                      // Gi liste over administrerte klubber for nedtrekksmeny
                      managedClubs={managedClubs.map(c => ({ id: c.id, name: c.name }))}
                      // Sett den initielt valgte klubben i nedtrekksmenyen
                      initialClubId={selectedClubId}
                  />
              ) : (
                   // Vis melding hvis brukeren ikke administrerer noen klubber
                   <p className="text-center text-gray-500 py-10">Du administrerer ingen klubber.</p>
              )
          )}

          {/* Fane: Opprett Klubb */}
          {selectedTab === "opprettKlubb" && ( <CreateClubForm /> )}

          {/* Fane: Klubbnyheter (betinget basert på rolle og administrerte klubber) */}
          {/* Antar at fanen heter "klubbNyheter" */}
          {selectedTab === "klubbNyheter" && (userRole === UserRole.ADMIN || userRole === UserRole.CLUB_LEADER) && (
               isLoadingClubs ? (
                  <div className="flex justify-center py-10"><LoadingSpinner text="Laster klubber..." /></div>
              ) : managedClubs.length > 0 ? (
                  <CreateClubNewsForm
                      managedClubs={managedClubs} // Send full klubbdata for nedtrekksmeny
                      initialClubId={selectedClubId} // Forhåndsvelg nåværende klubb hvis mulig
                  />
              ) : (
                   <p className="text-center text-gray-500 py-10">Du må administrere en klubb for å legge ut nyheter.</p>
              )
          )}
          {/* Fanen skjules for brukere uten passende rolle */}
      </div>
    </div>
  );
};

export default ClubSettingsPage;