// Zustand fil for å lagre data så vi kan bruke dem mellom sider uten å laste de på nytt for raskere lasting.
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
