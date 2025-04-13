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
    name: string;
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
 * Type for klubbene som sendes til nyhetsskjemaet (kun ID og navn trengs der).
 */
interface NewsClubOption {
    id: string;
    name: string;
}

/**
 * Klubbinnstillinger-side: Lar brukere (ADMIN/CLUB_LEADER) administrere klubbinnstillinger,
 * se medlemmer, opprette klubber, og publisere nyheter.
 */
const ClubSettingsPage = () => {
    const { data: session, status: sessionStatus } = useSession();
    const [selectedTab, setSelectedTab] = useState("minKlubb"); // Standard fane
    const [managedClubs, setManagedClubs] = useState<ManagedClubData[]>([]); // Liste for "Mine Klubber" og "Innstillinger" fanene
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null); // ID-en til klubben som er valgt for visning/redigering
    const [clubSettings, setClubSettings] = useState<ManagedClubData | null>(null); // Data for den valgte klubben (for innstillingsskjema)
    const [isLoadingClubs, setIsLoadingClubs] = useState(true); // Laster for innstillinger/medlemmer
    const [isSaving, setIsSaving] = useState(false); // Lagringsstatus for innstillingsskjemaet

    // --- STATE FOR NYHETSSKJEMA ---
    const [newsClubList, setNewsClubList] = useState<NewsClubOption[]>([]); // Liste for nyhetsskjema-dropdown
    const [isLoadingNewsClubs, setIsLoadingNewsClubs] = useState(true); // Egen lastestatus for nyhetslisten
    // -----------------------------

    // Hent brukerrolle og ID fra session
    const userRole = session?.user?.role as UserRole | "guest" || "guest";
    const userId = session?.user?.id;

    /**
     * Hent klubber som den nåværende brukeren er autorisert til å administrere (via /api/user-clubs).
     * Denne brukes for "Mine Klubber", "Innstillinger" og "Medlemmer".
     */
    const fetchManagedClubs = useCallback(async (id: string) => {
        setIsLoadingClubs(true);
        try {
            const response = await axios.get(`/api/user-clubs?userId=${id}`);
            const fetchedClubs = response.data?.clubs;

            if (Array.isArray(fetchedClubs)) {
                const sortedClubs = [...fetchedClubs].sort((a, b) => a.name.localeCompare(b.name));
                setManagedClubs(sortedClubs);
                // Autovelg primær eller første klubb HVIS ingen er valgt ennå
                if (!selectedClubId && sortedClubs.length > 0) {
                    const primaryClub = sortedClubs.find(c => c.isPrimary) || sortedClubs[0];
                    if (primaryClub) {
                        setSelectedClubId(primaryClub.id);
                        setClubSettings(primaryClub);
                    }
                } else if (selectedClubId && !sortedClubs.some(c => c.id === selectedClubId)) {
                    // Hvis valgt klubb ikke lenger er i listen, nullstill
                    setSelectedClubId(null);
                    setClubSettings(null);
                } else if (fetchedClubs.length === 0) {
                    setSelectedClubId(null);
                    setClubSettings(null);
                }
            } else {
                setManagedClubs([]);
                setSelectedClubId(null);
                setClubSettings(null);
                if (response.data?.error) {
                    toast.error(response.data.error);
                }
            }
        } catch (error) {
            console.error("[fetchManagedClubs] Feil ved henting av administrerte klubber:", error);
            toast.error("Kunne ikke hente dine administrerte klubber.");
            setManagedClubs([]);
            setSelectedClubId(null);
            setClubSettings(null);
        } finally {
            setIsLoadingClubs(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClubId]); // Kjør på nytt hvis selectedClubId endres

    /**
     * Hent klubber som brukeren kan poste nyheter for.
     * ADMIN: Henter alle klubber fra /api/clubs.
     * CLUB_LEADER: Henter klubber de administrerer fra /api/user-clubs.
     */
    const fetchClubsForNews = useCallback(async () => {
        if (!userId) {
            setIsLoadingNewsClubs(false);
            return;
        }

        setIsLoadingNewsClubs(true);
        setNewsClubList([]);
        let apiUrl = '';
        let errorMessage = '';

        if (userRole === UserRole.ADMIN) {
            apiUrl = `/api/clubs?limit=1000`;
            errorMessage = "Kunne ikke hente listen over alle klubber for nyheter.";
        } else if (userRole === UserRole.CLUB_LEADER) {
            apiUrl = `/api/user-clubs?userId=${userId}`;
            errorMessage = "Kunne ikke hente dine administrerte klubber for nyheter.";
        } else {
            setIsLoadingNewsClubs(false);
            return;
        }

        try {
            const response = await axios.get(apiUrl);
            const fetchedClubs = response.data?.clubs;

            if (Array.isArray(fetchedClubs) && fetchedClubs.length > 0) {
                const sortedAndMappedClubs: NewsClubOption[] = [...fetchedClubs]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(club => ({ id: club.id, name: club.name }));

                setNewsClubList(sortedAndMappedClubs);
            } else {
                setNewsClubList([]);
                if (response.data?.error && typeof response.data.error === 'string') {
                    toast.error(response.data.error);
                } else if (!Array.isArray(fetchedClubs) && fetchedClubs?.length !== 0) {
                    // Vis generell feil hvis ikke tom array og ingen error-melding fra API
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            console.error(`[fetchClubsForNews] Feil ved henting fra ${apiUrl}:`, error);
            toast.error(errorMessage);
            setNewsClubList([]);
        } finally {
            setIsLoadingNewsClubs(false);
        }
    }, [userId, userRole]);

    // Effekt for å hente ADMINISTRERTE klubber
    useEffect(() => {
        if (sessionStatus === 'authenticated' && userId) {
            fetchManagedClubs(userId);
        } else if (sessionStatus !== 'loading') {
            setIsLoadingClubs(false);
            setManagedClubs([]);
            setSelectedClubId(null);
            setClubSettings(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStatus, userId]); // Lytter kun på sessionStatus og userId

    // Effekt for å hente klubber for NYHETER
    useEffect(() => {
        if (sessionStatus === 'authenticated' && userId && (userRole === UserRole.ADMIN || userRole === UserRole.CLUB_LEADER)) {
            fetchClubsForNews();
        } else if (sessionStatus !== 'loading') {
            setIsLoadingNewsClubs(false);
            setNewsClubList([]);
        }
     // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStatus, userId, userRole]); // Lytter kun på sessionStatus, userId og userRole

    /**
     * Handler for å velge en klubb fra UserClubsList.
     */
    const handleSelectClub = (club: ManagedClubData) => {
        setSelectedClubId(club.id);
        setClubSettings(club);
    };

    /**
     * Handler for å klikke "Rediger"-knappen i UserClubsList.
     */
    const handleGoToEditClub = (club: ManagedClubData) => {
        handleSelectClub(club);
        setSelectedTab("klubbInnstillinger");
    };

    /**
     * Handler for å lagre endringer gjort i ClubSettingsForm.
     */
    const handleSaveChanges = async (
        clubId: string,
        values: ClubSettingsFormValues,
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
            const result = await updateClubSettings({ clubId, ...values, logoFile, imageFile });

            if (result.success) {
                toast.success(result.success || "Innstillinger lagret!", { id: toastId });

                // Optimistisk oppdatering av lokal state
                const updatedClubData: ManagedClubData = {
                    ...(clubSettings || { id: clubId, name: 'Ukjent Klubb' }),
                    ...values,
                    name: values.name || clubSettings?.name || 'Ukjent Klubb',
                    logoUrl: result.logoUrl !== undefined ? result.logoUrl : clubSettings?.logoUrl,
                    imageUrl: result.imageUrl !== undefined ? result.imageUrl : clubSettings?.imageUrl,
                };

                setClubSettings(updatedClubData); // Oppdater innstillingsskjemaet
                setManagedClubs(prevClubs => // Oppdater listen over administrerte klubber
                    prevClubs.map(club =>
                        club.id === clubId ? updatedClubData : club
                    )
                );
                // Oppdater også nyhetslisten hvis navnet endret seg
                setNewsClubList(prevNewsClubs =>
                    prevNewsClubs.map(club =>
                        club.id === clubId ? { ...club, name: updatedClubData.name } : club
                     )
                );

            } else {
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
     */
    const isAuthorizedToEditSelectedClub =
        userRole === UserRole.ADMIN ||
        (userRole === UserRole.CLUB_LEADER && !!clubSettings && managedClubs.some(c => c.id === clubSettings.id));

    // --- Renderingslogikk ---

    if (sessionStatus === "loading") {
        return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><LoadingSpinner /></div>;
    }

    if (sessionStatus !== "authenticated") {
        return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Vennligst logg inn for å administrere klubbinnstillinger.</p></div>;
    }

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
                        onEditClub={handleGoToEditClub}
                    />
                )}

                {/* Fane: Klubbinnstillinger */}
                {selectedTab === "klubbInnstillinger" && (
                    clubSettings ? (
                        <ClubSettingsForm
                            clubData={clubSettings}
                            onSaveChanges={handleSaveChanges}
                            isSaving={isSaving}
                            isAuthorizedToEdit={isAuthorizedToEditSelectedClub}
                        />
                    ) : (
                        <p className="text-center text-gray-500 py-10">
                            {isLoadingClubs ? "Laster klubbdata..." : "Velg en klubb fra 'Mine Klubber'-fanen for å redigere."}
                        </p>
                    )
                )}

                {/* Fane: Klubbmedlemmer */}
                {selectedTab === "klubbMedlemmer" && (
                    isLoadingClubs ? (
                        <div className="flex justify-center py-10"><LoadingSpinner text="Laster dine klubber..." /></div>
                    ) : managedClubs.length > 0 ? (
                        <ClubMembers
                            managedClubs={managedClubs.map(c => ({ id: c.id, name: c.name }))}
                            initialClubId={selectedClubId}
                        />
                    ) : (
                        <p className="text-center text-gray-500 py-10">Du administrerer ingen klubber.</p>
                    )
                )}

                {/* Fane: Opprett Klubb */}
                {selectedTab === "opprettKlubb" && ( <CreateClubForm /> )}

                {/* Fane: Klubbnyheter */}
                {selectedTab === "klubbNyheter" && (userRole === UserRole.ADMIN || userRole === UserRole.CLUB_LEADER) && (
                    isLoadingNewsClubs ? (
                        <div className="flex justify-center py-10"><LoadingSpinner text="Laster klubbliste for nyheter..." /></div>
                    ) : newsClubList.length > 0 ? (
                        <CreateClubNewsForm
                            managedClubs={newsClubList}
                            initialClubId={newsClubList.some(c => c.id === selectedClubId) ? selectedClubId : null}
                        />
                    ) : (
                        <p className="text-center text-gray-500 py-10">
                            {userRole === UserRole.ADMIN
                                ? "Fant ingen klubber i systemet å poste nyheter for."
                                : "Du administrerer ingen klubber og kan derfor ikke legge ut nyheter."
                            }
                        </p>
                    )
                )}
                {/* Fanen skjules hvis betingelsen over ikke er sann */}

            </div>
        </div>
    );
};

export default ClubSettingsPage;