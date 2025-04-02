// src/components/FavoriteButton.tsx (Tilbake til react-hot-toast)
"use client";

import { useState, useTransition, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFavorite } from "@/app/actions/favorites";
// Shadcn Button er fortsatt valgfritt her
// import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  courseId: string;
  initialIsFavorite: boolean;
}

export default function FavoriteButton({ courseId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);


  const handleToggleFavorite = () => {
    if (isPending) return;

    const previousIsFavorite = isFavorite;

    startTransition(async () => {
      // Optimistisk oppdatering
      setIsFavorite(!previousIsFavorite);

      try {
        const result = await toggleFavorite(courseId);

        if (result.error) {
          console.error("Feil ved veksling av favoritt:", result.error);
          // Reverser
          setIsFavorite(previousIsFavorite);
          // Bruk react-hot-toast for feilmelding
          toast.error(result.error || "Kunne ikke oppdatere favorittstatus.");

        } else {
          // Suksess - bruk react-hot-toast
           toast.success(`Bane ${!previousIsFavorite ? 'lagt til i' : 'fjernet fra'} favoritter.`);
          // Optional: Synkroniser med resultat hvis du vil
          // setIsFavorite(result.favorites?.includes(courseId) ?? false);
        }
      } catch (error) {
        console.error("Uventet feil ved veksling av favoritt:", error);
        // Reverser
        setIsFavorite(previousIsFavorite);
        // Bruk react-hot-toast for generell feil
        toast.error("Noe gikk galt. Prøv igjen.");
      }
    });
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isPending}
      // Klassenavn fra forrige versjon
      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-md hover:bg-white transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed z-10"
      aria-label={isFavorite ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      ) : (
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorite
              ? 'text-red-500 fill-red-500'
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      )}
    </button>
  );
}