// Fil: src/app/stores/useFavoriteStore.ts
// Formål: Zustand store for å håndtere brukerens favorittbaner. Inkluderer state for favoritt-IDer,
//         status for initialisering og toggling, samt actions for å initialisere listen fra serveren
//         og for å legge til/fjerne en favoritt via server actions.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { create } from 'zustand';
import { toast } from 'sonner'; 
import { getCurrentUserFavorites } from '../actions/get-user-favorites';
import { toggleFavorite } from '../actions/favorites';

type CourseId = string | number;

interface FavoriteState {
  favoriteIds: CourseId[];
  isInitialized: boolean; 
  isInitializing: boolean; 
  isToggling: Record<CourseId, boolean>;
  initializeFavorites: () => Promise<void>; 
  toggleFavorite: (courseId: CourseId) => Promise<void>;
  isFavorite: (courseId: CourseId) => boolean;
}

const useFavoriteStore = create<FavoriteState>((set, get) => ({
  // --- State ---
  favoriteIds: [],
  isInitialized: false,   // Starter som uinitialisert
  isInitializing: false,  // Starter uten å initialisere
  isToggling: {},

  // --- Actions ---
  /**
   * Henter brukerens favoritter fra serveren og setter den initielle state.
   * Bør kalles én gang når brukerstatus er kjent (f.eks. etter useSession har lastet).
   */
  initializeFavorites: async () => {
    // Ikke initialiser på nytt hvis det allerede er gjort eller pågår
    if (get().isInitialized || get().isInitializing) {
        // console.log("Initialization already done or in progress. Skipping."); // Debug
        return;
    }

    // console.log("Initializing favorites..."); // Debug
    set({ isInitializing: true }); // Marker at lasting starter

    try {
      const result = await getCurrentUserFavorites(); // Kall den nye server-action

      if (result.error) {
        console.error("Feil under initialisering av favoritter:", result.error);
        toast.error(`Kunne ikke laste favoritter: ${result.error}`);
        set({ favoriteIds: [], isInitialized: true, isInitializing: false }); // Sett som initialisert (med feil)
      } else if (result.data !== undefined) {
        // console.log("Favorites initialized successfully:", result.data); // Debug
        set({
          favoriteIds: result.data, // Sett listen fra serveren
          isInitialized: true,      // Marker som fullført
          isInitializing: false,   // Marker at lasting er ferdig
        });
      }
    } catch (error) {
      console.error("Uventet feil under initializeFavorites:", error);
      toast.error("En uventet feil oppstod under lasting av favoritter.");
      set({ favoriteIds: [], isInitialized: true, isInitializing: false }); // Sett som initialisert (med feil)
    }
  },

  /**
   * Kaller server-action for å legge til/fjerne en favoritt i databasen
   * og oppdaterer state lokalt ved suksess. (Denne forblir lik)
   */
  toggleFavorite: async (courseId) => {
    // --- Ingen endringer i denne funksjonen ---
    const currentToggling = get().isToggling;
    if (currentToggling[courseId]) return;

    set((state) => ({ isToggling: { ...state.isToggling, [courseId]: true } }));

    try {
      const result = await toggleFavorite(String(courseId));

      if (result.error) {
        console.error("Feil ved oppdatering av favoritt:", result.error);
        toast.error(`Kunne ikke oppdatere favoritt: ${result.error}`);
      } else if (result.success && result.favorites) {
        set({ favoriteIds: result.favorites });
      }
    } catch (error) {
      console.error("Uventet feil ved toggleFavorite:", error);
      toast.error("En uventet feil oppstod.");
    } finally {
      set((state) => ({ isToggling: { ...state.isToggling, [courseId]: false } }));
    }
  },

  /**
   * Sjekker om en gitt bane-ID er i den lokale favorittlisten. (Denne forblir lik)
   */
  isFavorite: (courseId) => {
    return get().favoriteIds.includes(courseId);
  },
}));

export default useFavoriteStore;