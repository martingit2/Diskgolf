// Fil: src/components/CourseCardSkeleton.tsx
// Formål: Definerer en React-komponent som viser en "skeleton"-versjon av CourseCard.
//         Brukes som en placeholder mens data for faktiske banekort lastes, for å gi en bedre brukeropplevelse ved lasting.
//         Bruker Skeleton-komponenten fra Shadcn UI for å etterligne layouten til CourseCard.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; 

export function CourseCardSkeleton() {
  return (
    // Bruker samme grunnstruktur og padding/margin som CourseCard for lik layout
    <Card className="shadow-lg border border-gray-200 flex flex-col rounded-xl overflow-hidden h-full">
      {/* Bildeskelett */}
      <Skeleton className="w-full h-48 rounded-t-xl" /> {/* Matcher bildets høyde */}

      <CardContent className="flex flex-col flex-grow p-6 bg-white"> {/* Samme padding som CourseCard */}
        <CardHeader className="p-0 mb-4"> {/* Samme padding/margin som CourseCard */}
          {/* Tittelskelett */}
          <Skeleton className="h-7 w-3/4 mb-2 rounded" /> {/* Omtrentlig tittelstørrelse */}
          {/* Skillerskelett */}
          <Skeleton className="h-0.5 w-full my-3 rounded" /> {/* Matcher hr */}
        </CardHeader>

        {/* Info-skeletter */}
        <div className="space-y-3 flex-grow mb-4"> {/* Samme space og margin som CourseCard */}
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-1/5 rounded" /> {/* "Sted:" */}
            <Skeleton className="h-4 w-1/2 rounded" /> {/* Lokasjon */}
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-[40px] rounded" /> {/* "Par:" */}
            <Skeleton className="h-4 w-10 rounded" /> {/* Par-verdi */}
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-1/4 rounded" /> {/* "Vanskelighet:" */}
            <Skeleton className="h-4 w-1/4 rounded" /> {/* Vanskelighet-verdi */}
          </div>
           <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-1/4 rounded" /> {/* "Antall kurver:" */}
            <Skeleton className="h-4 w-12 rounded" /> {/* Antall */}
          </div>
           <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-1/4 rounded" /> {/* "Banelengde:" */}
            <Skeleton className="h-4 w-16 rounded" /> {/* Lengde */}
          </div>
        </div>

        {/* Anmeldelse-skelett (matcher ReviewForm layout) */}
        <div className="mt-6 flex flex-col items-center text-center mb-4">
             <Skeleton className="h-5 w-24 mb-1 rounded" /> {/* Stjerner */}
             <Skeleton className="h-4 w-28 rounded" /> {/* (x anmeldelser) */}
        </div>

        {/* Knappe-skeletter */}
        <div className="mt-auto pt-4"> {/* Samme margin som CourseCard */}
          <div className="flex flex-col gap-4"> {/* Samme gap som CourseCard */}
            {/* Matcher høyden til Button (inkl. padding) */}
            <Skeleton className="h-[52px] w-full rounded-lg" />
            <Skeleton className="h-[52px] w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
