// store/useReviewsStore.ts
import { create } from 'zustand';

type Review = {
  id: string;
  username: string;
  comment: string;
  rating: number;
  role: string;
};

type ReviewsStore = {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  setReviews: (reviews: Review[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchReviews: () => Promise<void>;
};

const useReviewsStore = create<ReviewsStore>((set) => ({
  reviews: [],
  loading: false,
  error: null,
  setReviews: (reviews: Review[]) => set({ reviews }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      // Simulerer API kall med testdata for nå
      setTimeout(() => {
        set({
          reviews: [
            {
              id: "1",
              username: "Sofie A.",
              comment: "En fantastisk app! Intuitivt grensesnitt og flott design. Perfekt for både nybegynnere og erfarne spillere!",
              rating: 5,
              role: "DiskGolf-entusiast",
            },
            {
              id: "2",
              username: "Thomas R.",
              comment: "Flott app, men jeg skulle ønske den hadde mer detaljert statistikk for hver runde jeg spiller.",
              rating: 4,
              role: "Turneringsspiller",
            },
            {
              id: "3",
              username: "Camilla E.",
              comment: "Beste DiskGolf-app jeg har prøvd! Detaljerte kart, enkel baneoversikt og gode analyser. 10/10!",
              rating: 5,
              role: "Erfaren diskgolfspiller",
            },
            {
                id: "4",
                username: "Jonas H.",
                comment: "Gode funksjoner, enkelt å spille men savner flere innstillinger.",
                rating: 3,
                role: "Casual spiller",
              },
              {
                id: "5",
                username: "Elise M.",
                comment: "Elsker hvordan appen samler alle mine runder og gir en full oversikt over prestasjonene mine!",
                rating: 5,
                role: "Proff diskgolfutøver",
              },
              {
                id: "6",
                username: "Markus W.",
                comment: "Veldig nyttig app for å finne baner, men jeg savner en turneringsmodus.",
                rating: 4,
                role: "Aktiv klubbspiller",
              },
            
            // Flere anmeldelser...
          ],
        });
      }, 1000);
    } catch (error) {
      set({ error: "Feil ved henting av anmeldelser" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useReviewsStore;
