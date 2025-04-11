// Fil: stores/useReviewsStore.ts
// Formål: Definerer en Zustand store for å håndtere tilstand relatert til brukeranmeldelser.
//         Inkluderer state for anmeldelser, lasting, feil, og funksjoner for å oppdatere og hente anmeldelser (for øyeblikket simulert).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

import { create } from 'zustand';

// Types for review and course
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  courseId: string;
  user: { name: string; image?: string };
}

interface Course {
  id: string;
  name: string;
  image?: string;
}

interface ReviewsCarouselStore {
  reviews: Review[];
  courses: { [key: string]: Course };
  loading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  
  // setReviews: (reviews: Review[]) => void;
  // setCourses: (courses: { [key: string]: Course }) => void;
  // setLoading: (loading: boolean) => void;
  // setError: (error: string | null) => void;
}

const useReviewsCarouselStore = create<ReviewsCarouselStore>((set, get) => ({ // Lagt til get
  reviews: [],
  courses: {},
  loading: false, 
  error: null,
  // Fjernet settere herfra også

  // Fetching reviews and courses
  fetchReviews: async () => {
    // Unngå doble kall hvis den allerede laster
    if (get().loading) return;

    console.log("Store: fetchReviews called. Setting loading=true"); // Debug
    set({ loading: true, error: null }); // Sett loading=true FØR try-blokken

    try {
      console.log("Store: Fetching /api/reviews..."); // Debug
      const reviewsResponse = await fetch("/api/reviews");
      console.log("Store: /api/reviews status:", reviewsResponse.status); // Debug

      if (!reviewsResponse.ok) {
         // Prøv å få mer info fra feilresponsen
         let errorDetails = `Status: ${reviewsResponse.status}`;
         try {
            const errorBody = await reviewsResponse.text(); // Les som tekst først
            errorDetails += `, Body: ${errorBody.substring(0, 100)}...`; // Begrens lengde
         } catch (e) { /* Ignorer */ }
        throw new Error(`Kunne ikke hente anmeldelser. ${errorDetails}`);
      }

      const reviewData: Review[] = await reviewsResponse.json();
      console.log("Store: Received review data:", reviewData); // Debug

      // Sorter anmeldelser etter createdAt (nyeste først) og begrens til 5
      const sortedReviews = Array.isArray(reviewData) // Sjekk om det er et array
        ? reviewData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5) // Begrens til 5 anmeldelser
        : []; // Sett til tomt array hvis ikke

      console.log("Store: Setting sorted reviews:", sortedReviews); // Debug
      set({ reviews: sortedReviews });

      // Hent kursdata for de 5 nyeste anmeldelsene
      const uniqueCourseIds = Array.from(
        new Set(sortedReviews.map((review) => review.courseId))
      );

      if (uniqueCourseIds.length > 0) {
         console.log("Store: Fetching courses for IDs:", uniqueCourseIds); // Debug
        const coursePromises = uniqueCourseIds.map(async (courseId) => {
           try {
             const courseResponse = await fetch(`/api/courses/${courseId}`);
             if (!courseResponse.ok) {
                console.warn(`Store: Failed to fetch course ${courseId}, status: ${courseResponse.status}`);
                return null; // Returner null ved feil, ikke kast error for å la Promise.all fullføre
             }
             return await courseResponse.json();
           } catch (courseFetchError) {
               console.error(`Store: Network or parsing error fetching course ${courseId}:`, courseFetchError);
               return null; // Returner null ved feil
           }
        });

        const courseResults = await Promise.all(coursePromises);
        const courseMap = courseResults.reduce((acc, course) => {
    
          if (course && course.id) {
            acc[course.id] = course;
          }
          return acc;
        }, {} as { [key: string]: Course });

        console.log("Store: Setting courses map:", courseMap); // Debug
        set({ courses: courseMap });
      } else {
         console.log("Store: No unique course IDs found, setting empty courses map."); // Debug
         set({ courses: {} }); // Sett tomt kart hvis ingen IDer
      }

    } catch (error) {
      console.error("Store: Error during fetchReviews:", error); // Logg hele feilen
      // Sett en mer informativ feilmelding hvis mulig
      const errorMessage = error instanceof Error ? error.message : "Feil ved henting av anmeldelser";
      set({ error: errorMessage });
    } finally {
      // DENNE ER KRITISK: Må alltid settes til false
      console.log("Store: Setting loading=false in finally block."); // Debug
      set({ loading: false });
    }
  },
}));

export default useReviewsCarouselStore;