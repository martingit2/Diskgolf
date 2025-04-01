// src/components/ReviewCardSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "lucide-react"; // Importer User-ikonet for placeholder

export const ReviewCardSkeleton = () => {
  return (
    <Card className="shadow-lg border border-gray-200 flex flex-col rounded-xl overflow-hidden bg-white h-full animate-pulse">
      {/* Bannerbilde placeholder */}
      <div className="relative">
        <div className="w-full h-44 bg-gray-300 rounded-t-xl"></div>
        {/* Brukerprofilbilde placeholder */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-16 h-16 rounded-full border-4 border-white bg-gray-400 shadow-md flex items-center justify-center">
            {/* Viser et grått User-ikon inni sirkelen */}
            <User className="w-8 h-8 text-gray-200" />
        </div>
      </div>
      <CardContent className="p-6 flex flex-col items-center text-center mt-10 flex-grow">
        {/* Brukernavn placeholder */}
        <CardHeader className="p-0 mt-3 space-y-2"> {/* Litt space mellom placeholder-linjene */}
            <div className="h-5 w-32 bg-gray-400 rounded mx-auto"></div>
            {/* Banenavn placeholder */}
            <div className="h-4 w-24 bg-gray-400 rounded mx-auto"></div>
        </CardHeader>
        {/* Separator */}
        <hr className="my-4 border-gray-300 w-2/3 mx-auto" />
         {/* Ingen stjerner i skeleton */}
        {/* Kommentar placeholder */}
        <div className="space-y-2 mt-4 px-4 w-full">
          <div className="h-3 w-full bg-gray-300 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
          <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
        </div>
        {/* Spacer for å dytte datoen ned */}
        <div className="flex-grow"></div>
         {/* Dato placeholder */}
        <div className="h-3 w-16 bg-gray-300 rounded mt-4 pt-2"></div>
      </CardContent>
       {/* Ingen separator nederst for skeleton */}
    </Card>
  );
};