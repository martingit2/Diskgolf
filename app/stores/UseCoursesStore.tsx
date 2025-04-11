// Fil: store/useCoursesStore.ts
// Formål: Zustand store for å håndtere og persistere en global liste over baner (`Course[]`).
//         Bruker `persist` middleware for å lagre banedata i localStorage for raskere lasting mellom sesjoner.
//         Inkluderer state for baner og en funksjon for å hente data fra API kun hvis storen er tom.
//         Dette var bare for å teste hvordan det ble, å lagre dette i localStorage er ikke en bra løsning
//         siden man da ikke får oppdaterte baner om det blir laget en ny bane mens det er lagret en ny bane
//         dette var bare for å se om det gjorde applikasjon noe raskere så den slapp så mange API kall
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Course = {
  id: string;
  name: string;
  location: string;
  description: string;
  par: number;
  image?: string;
  difficulty?: string;
  averageRating: number;
  totalReviews: number;
  holes?: { distance: number }[];
  totalDistance?: number;
  baskets?: { latitude: number; longitude: number }[];
  club?: { name: string; logoUrl: string };
};

type CoursesStore = {
  courses: Course[];
  setCourses: (newCourses: Course[]) => void;
  fetchCourses: () => Promise<void>;
};

const useCoursesStore = create<CoursesStore>()(
  persist(
    (set, get) => ({
      courses: [],
      setCourses: (newCourses: Course[]) => set({ courses: newCourses }),
      fetchCourses: async () => {
        if (get().courses.length === 0) {
          try {
            const response = await fetch("/api/courses");
            const data = (await response.json()) as Course[];
            set({ courses: data });
          } catch (error) {
            console.error("Feil ved henting av kurs:", error);
          }
        }
      },
    }),
    {
      name: "courses-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCoursesStore;
