// Fil: lib/stores.ts 
// Formål: Definerer TypeScript-typer/interfaces for sentrale datastrukturer i applikasjonen,
//         slik som 'Review' (anmeldelse) og 'Course' (bane), for å sikre datakonsistens.
// Utvikler: Martin Pettersen


export type Review = {
    id: string;
    username: string;
    comment: string;
    rating: number;
    role: string;
    createdAt?: string; 
    courseId?: string; 
    user?: { name: string; image?: string }; 
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