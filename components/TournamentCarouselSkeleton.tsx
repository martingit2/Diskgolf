// Fil: src/components/TournamentCarouselSkeleton.tsx
// Formål: Definerer en React-komponent som viser en "skeleton"-versjon (lasteplassholder) for turneringskarusellen.
//         Bruker animerte, grå plassholderelementer for å etterligne layouten til den faktiske karusellen mens data lastes.
// Utvikler: Martin Pettersen



import { MapPin, Users, Trophy, ChevronRight } from "lucide-react";

export const TournamentCarouselSkeleton = () => {
  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20 animate-pulse">
      {/* Header Placeholder */}
      <div className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8">
        {/* Tittel-blokk placeholder */}
        <div className="mb-4 md:mb-0 w-full md:w-auto">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div> {/* Sub-tittel */}
          <div className="h-8 bg-gray-400 rounded w-3/4"></div> {/* Hovedtittel */}
        </div>
        {/* Knapp placeholder (skjult på mobil i ekte, men kan vises svakt her) */}
        <div className="h-9 bg-gray-300 rounded w-40 hidden md:block"></div>
         {/* Viser en mindre knapp-placeholder på mobil for layoutens skyld */}
         <div className="h-9 bg-gray-300 rounded w-40 mt-4 md:hidden"></div>
      </div>

      {/* Karusell/Slide Placeholder */}
      <div className="relative rounded-xl overflow-hidden shadow-xl bg-gray-200 h-[400px] sm:h-[450px] lg:h-[500px]">
        {/* Mørk gradient-lignende bunn for kontrast */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-gray-400/50 via-gray-300/20 to-transparent"></div>

        {/* Innhold i sliden placeholder */}
        <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10">
          {/* Dato Badge Placeholder */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-10 lg:left-10 h-7 w-24 bg-gray-400/50 rounded-lg"></div>

          {/* Tekstområde Placeholder */}
          <div className="space-y-4 w-full max-w-2xl lg:max-w-3xl">
            {/* Tittel Placeholder */}
            <div className="h-10 bg-gray-400 rounded w-4/5"></div>
            {/* Beskrivelse Placeholder (2 linjer) */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-300 rounded w-full"></div>
              <div className="h-5 bg-gray-300 rounded w-5/6"></div>
            </div>
            {/* Knapp Placeholder */}
            <div className="h-12 bg-gray-400 rounded w-48 mb-8 sm:mb-10"></div>
            {/* Detaljer Placeholder */}
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="h-5 bg-gray-300 rounded w-48"></div> {/* Sted */}
              <div className="h-5 bg-gray-300 rounded w-32"></div> {/* Deltakere */}
              <div className="h-5 bg-gray-300 rounded w-40 hidden sm:block"></div> {/* Arrangør */}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Placeholder (valgfritt, men bra for layout) */}
      <div className="flex justify-center pt-4 pb-2 space-x-3">
        <div className="h-2 w-5 rounded-full bg-gray-400"></div> {/* Aktiv */}
        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
      </div>
    </section>
  );
};