// lib/stores.ts
export type Review = {
    id: string;
    username: string;
    comment: string;
    rating: number;
    role: string;
    createdAt?: string; // Legg til hvis nødvendig
    courseId?: string; // Legg til hvis nødvendig
    user?: { name: string; image?: string }; // Legg til hvis nødvendig
  };
  
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
    createdAt?: string; // For nyeste baner
  };