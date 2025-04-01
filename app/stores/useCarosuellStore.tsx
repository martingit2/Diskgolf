import { create } from 'zustand';

export type Course = {
  id: string;
  name: string;
  location: string;
  description: string;
  par?: number; // Gjør valgfri hvis den ikke alltid finnes
  image?: string;
  difficulty?: string;
  averageRating: number;
  totalReviews: number;
  holes?: { distance: number }[];
  totalDistance?: number;
  baskets?: { latitude: number; longitude: number }[];
  club?: { name: string; logoUrl: string };
  createdAt?: string; // For nyeste baner
  numHoles?: number; 
};

type CarouselStore = {
  topCourses: Course[];
  newestCourses: Course[];
  loading: boolean;
  error: string | null;
  setTopCourses: (newCourses: Course[]) => void;
  setNewestCourses: (newCourses: Course[]) => void;
  fetchTopCourses: () => Promise<void>;
  fetchNewestCourses: () => Promise<void>;
};

const useCarouselStore = create<CarouselStore>((set) => ({
  topCourses: [],
  newestCourses: [],
  loading: false,
  error: null,
  setTopCourses: (newCourses: Course[]) => set({ topCourses: newCourses }),
  setNewestCourses: (newCourses: Course[]) => set({ newestCourses: newCourses }),
  fetchTopCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/courses");
      const data: Course[] = await response.json();

      const sortedCourses = data
        .filter(course => course.averageRating > 0)
        .sort((a, b) => {
          if (b.averageRating === a.averageRating) {
            return b.totalReviews - a.totalReviews;
          }
          return b.averageRating - a.averageRating;
        })
        .slice(0, 8); // Hent de 8 beste

      set({ topCourses: sortedCourses });
    } catch (error) {
      set({ error: "Feil ved henting av topprangerte baner" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  fetchNewestCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/courses");
      const data: Course[] = await response.json();

      const sortedCourses = data
        .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
        .slice(0, 8); // Hent de 8 nyeste

      set({ newestCourses: sortedCourses });
    } catch (error) {
      set({ error: "Feil ved henting av nyeste baner" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCarouselStore;