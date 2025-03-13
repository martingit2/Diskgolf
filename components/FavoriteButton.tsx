"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { toast } from "react-hot-toast";

export default function FavoriteButton({ courseId }: { courseId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(courseId);
    if (result.success) {
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Fjernet fra favoritter" : "Lagt til i favoritter");
    } else {
      toast.error("Noe gikk galt. Prøv igjen.");
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-md hover:bg-white transition shadow-md"
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
    </button>
  );
}