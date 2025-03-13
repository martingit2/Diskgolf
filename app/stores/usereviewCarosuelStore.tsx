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
  setReviews: (reviews: Review[]) => void;
  setCourses: (courses: { [key: string]: Course }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useReviewsCarouselStore = create<ReviewsCarouselStore>((set) => ({
  reviews: [],
  courses: {},
  loading: true,
  error: null,
  setReviews: (reviews) => set({ reviews }),
  setCourses: (courses) => set({ courses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Fetching reviews and courses
  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const reviewsResponse = await fetch("/api/reviews");
      if (!reviewsResponse.ok) throw new Error("Kunne ikke hente anmeldelser");

      const reviewData: Review[] = await reviewsResponse.json();
      set({ reviews: reviewData });

      // Fetch courses for unique course IDs
      const uniqueCourseIds = Array.from(
        new Set(reviewData.map((review) => review.courseId))
      );

      const coursePromises = uniqueCourseIds.map(async (courseId) => {
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) return null;
        return courseResponse.json();
      });

      const courseResults = await Promise.all(coursePromises);
      const courseMap = courseResults.reduce((acc, course) => {
        if (course) acc[course.id] = course;
        return acc;
      }, {} as { [key: string]: Course });

      set({ courses: courseMap });
    } catch (error) {
      set({ error: "Feil ved henting av anmeldelser" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useReviewsCarouselStore;
