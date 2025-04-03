// src/components/TournamentsCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useRouter } from "next/navigation";
import { MapPin, Users, Trophy, ChevronRight, ChevronLeft, ClipboardList } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { motion, ForwardRefComponent, HTMLMotionProps } from "framer-motion";

// ---- Importer Skeleton ----
import { TournamentCarouselSkeleton } from "./TournamentCarouselSkeleton"; // Sjekk at stien er korrekt

// --- Interface ---
interface Tournament {
  id: string; name: string; description: string; startDate: string; endDate: string | null; location: string;
  course: { id: string; name: string; location: string; image?: string; };
  organizer: { id: string; name: string; };
  _count: { participants: number; };
  maxParticipants: number | null;
}

// --- Tekstskygge-klasse ---
const textShadowClass = "[text-shadow:0_1px_3px_rgba(0,0,0,0.6)]";

// --- Motion-kompatibel Button ---
const MotionButton = motion(Button) as ForwardRefComponent<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>;

// ===========================
// TournamentsCarousel Komponent
// ===========================
const TournamentsCarousel = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- useEffect for datahenting ---
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true); // Start loading
      setError(null); // Nullstill feil
      try {
        const response = await fetch('/api/tournaments/featured');
        if (!response.ok) {
          let errorMsg = `Failed to fetch tournaments (${response.status})`;
          try {
             // Prøv å få mer detaljer fra API-svaret
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { /* Ignorer hvis body ikke er JSON */ }
          throw new Error(errorMsg);
        }
        const data: Tournament[] = await response.json();
        setTournaments(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false); // Stopp loading uansett utfall
      }
    };
    fetchTournaments();
  }, []); // Kjører kun én gang ved mount

   // =========================================
   // Conditional Rendering: Loading, Error, Empty
   // =========================================

   // --- 1. Loading State ---
  if (loading) {
    // ---- Bruker nå Skeleton-komponenten ----
    return <TournamentCarouselSkeleton />;
   }

   // --- 2. Error State ---
  if (error) {
     return (
       <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20">
          {/* Viser en dempet header-placeholder for layout-konsistens */}
          <div className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8 opacity-50 pointer-events-none">
             <div className="mb-4 md:mb-0 w-full md:w-auto">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-400 rounded w-3/4"></div>
             </div>
             <div className="h-9 bg-gray-300 rounded w-40 hidden md:block"></div>
             <div className="h-9 bg-gray-300 rounded w-40 mt-4 md:hidden"></div>
          </div>
          {/* Selve feilmeldingsboksen */}
         <div className="h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 text-center">
           <h2 className="text-xl font-semibold text-red-700 mb-2">Kunne ikke laste turneringer</h2>
           <p className="text-red-600">{error}</p>
           <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
             Prøv igjen
           </Button>
         </div>
       </section>
     );
   }

   // --- 3. Empty State (No Tournaments Found) ---
  if (tournaments.length === 0) {
     return (
       <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20">
         {/* Viser den EKTE headeren her, siden lasting er ferdig */}
         <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8" // Responsiv header layout
         >
           {/* Tittel-blokk */}
           <div className="mb-4 md:mb-0">
             <h2 className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">DiskGolf Turneringer</h2>
             <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Kommende Arrangementer</h1>
           </div>
           {/* Knapp: Vises under på mobil, til høyre på større skjermer */}
           <Button
              variant="ghost"
              className="text-green-600 hover:bg-green-50 group inline-flex items-center text-sm sm:text-base"
              onClick={() => router.push('/turneringer')}
            >
              Se alle turneringer
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
         </motion.div>
         {/* Boksen som indikerer at ingen turneringer ble funnet */}
         <div className="h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center bg-gray-100 rounded-xl shadow-lg">
           <p className="text-gray-500">Ingen fremhevede turneringer funnet.</p>
         </div>
       </section>
     );
   }

  // =========================================
  // Hovedkomponent med turneringer (Data finnes)
  // =========================================
  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20 relative">
       {/* Header (Ekte header vises når data er lastet) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8" // Responsiv header layout
      >
        {/* Tittel-blokk */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">DiskGolf Turneringer</h2>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Kommende Arrangementer</h1>
        </div>
        {/* Knapp: Vises under på mobil, til høyre på større skjermer */}
        <Button
           variant="ghost"
           className="text-green-600 hover:bg-green-50 group inline-flex items-center text-sm sm:text-base"
           onClick={() => router.push('/turneringer')}
         >
           Se alle turneringer
           <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
         </Button>
      </motion.div>

      {/* Karusell Wrapper */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          effect="fade" fadeEffect={{ crossFade: true }} speed={1000}
          pagination={{ clickable: true, el: '.tournament-pagination-container', bulletClass: 'w-2 h-2 rounded-full bg-gray-300 mx-1.5 inline-block transition-all duration-300 cursor-pointer', bulletActiveClass: '!bg-green-600 w-5', renderBullet: (index, className) => `<span class="${className}" aria-label="Gå til slide ${index + 1}"></span>` }}
          navigation={{ nextEl: '.tournament-next-button', prevEl: '.tournament-prev-button' }}
          spaceBetween={0} slidesPerView={1}
          className="rounded-xl overflow-hidden shadow-xl"
          loop={tournaments.length > 1} // Loop kun hvis det er mer enn én slide
        >
          {tournaments.map((tournament, index) => {
             // --- Logikk for dato, deltakere etc. ---
             const startDate = new Date(tournament.startDate);
             const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
             // Sikrere datoformatering
             const formatDateRange = (start: Date, end: Date | null): string => {
               try {
                 const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                 const startStr = start.toLocaleDateString('no-NO', options);
                 if (!end || start.toDateString() === end.toDateString()) return startStr; // Vis kun startdato hvis lik eller ingen sluttdato

                 const endOptions: Intl.DateTimeFormatOptions = end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear()
                   ? { day: 'numeric' } // Samme måned/år: vis kun dag
                   : { day: 'numeric', month: 'short' }; // Forskjellig måned/år: vis dag og måned
                 const endStr = end.toLocaleDateString('no-NO', endOptions);

                 // Legg til år hvis sluttdato er i et annet år enn startdato
                 if (end.getFullYear() !== start.getFullYear()) {
                    const startYearOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                    const endYearOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                    return `${start.toLocaleDateString('no-NO', startYearOptions)} - ${end.toLocaleDateString('no-NO', endYearOptions)}`;
                 }

                 return `${startStr} - ${endStr}`;
               } catch (e) {
                 console.error("Date formatting error:", e);
                 return "Ugyldig dato"; // Fallback
               }
             };
             const participantsCount = tournament._count?.participants ?? 0; // Håndter mulig undefined _count
             const participantsText = tournament.maxParticipants
               ? `${participantsCount}/${tournament.maxParticipants}`
               : `${participantsCount}`;

            // --- Returnerer SwiperSlide ---
            return (
              <SwiperSlide key={tournament.id}>
                <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] text-white">
                  {/* Bakgrunnsbilde og gradient */}
                  <div className="absolute inset-0">
                    <Image
                      // Bruk et standard placeholder bilde hvis course.image mangler
                      src={tournament.course?.image || "/images/default-course-image.webp"} // Sørg for at dette bildet finnes
                      alt={`Bilde av ${tournament.course?.name || 'bane'}`} // Håndter mulig undefined course
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                      className="object-cover"
                      priority={index === 0} // Prioriter lasting av første bilde
                      unoptimized={process.env.NODE_ENV === 'development'} // For dev-miljø
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
                  </div>

                  {/* Tekstinnhold Container */}
                  <div
                    className="relative h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10 cursor-pointer group/slide" // Lagt til group/slide for spesifikk hover på slide-innhold hvis ønskelig
                    onClick={() => router.push(`/tournament/${tournament.id}`)}
                  >
                     {/* Datobadge */}
                    <div className={`absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-10 lg:left-10 z-10 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 ${textShadowClass}`}>
                      <div className="text-sm sm:text-base font-semibold"> {formatDateRange(startDate, endDate)} </div>
                    </div>

                     {/* Tekstområde med animasjon */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      // Animer inn når sliden blir aktiv (krever litt mer avansert Swiper-integrasjon)
                      // Enklere: Animer alltid inn ved første visning av komponenten
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      className="mb-4" // Litt luft nederst før pagination
                    >
                      {/* Tittel */}
                      <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 leading-tight ${textShadowClass}`}>
                        {tournament.name}
                      </h3>

                      {/* Beskrivelse */}
                      <p className={`text-base sm:text-lg lg:text-xl text-gray-200 mb-5 sm:mb-6 max-w-2xl lg:max-w-3xl line-clamp-2 sm:line-clamp-3 leading-relaxed ${textShadowClass}`}>
                        {/* Fallback hvis beskrivelse mangler */}
                        {tournament.description || `Bli med på turnering på ${tournament.course?.name || 'banen'}!`}
                      </p>

                      {/* Animerende knapp */}
                      <MotionButton
                        variant="default" size="lg"
                        className={`
                          bg-green-600 hover:bg-green-500 text-white font-bold
                          mb-8 sm:mb-10 text-sm sm:text-base px-6 py-3 rounded-lg
                          shadow-lg hover:shadow-xl transition-colors duration-300
                          flex items-center
                          ${textShadowClass}
                        `}
                        animate={{ opacity: [1, 0.85, 1] }}
                        transition={{ duration: 2.0, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                        onClick={(e) => { e.stopPropagation(); router.push(`/tournament/${tournament.id}#registration`); }}
                      >
                        <ClipboardList className="mr-2 h-5 w-5 flex-shrink-0" />
                        Vis påmeldingsinfo
                      </MotionButton>

                      {/* Detaljer */}
                      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base">
                        <div className={`flex items-center text-gray-300 ${textShadowClass}`}>
                          <MapPin className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                          {/* Håndter mulig undefined course */}
                          <span>{tournament.course?.name || 'Ukjent bane'}, {tournament.location}</span>
                        </div>
                        <div className={`flex items-center text-gray-300 ${textShadowClass}`}>
                          <Users className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                          <span>{participantsText} deltakere</span>
                        </div>
                        {/* Vis arrangør kun hvis navnet finnes */}
                        {tournament.organizer?.name && (
                           <div className={`items-center hidden sm:flex text-gray-300 ${textShadowClass}`}>
                              <Trophy className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                              <span>Arr: {tournament.organizer.name}</span>
                           </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigasjonsknapper (Kun hvis mer enn 1 turnering) */}
        {tournaments.length > 1 && (
          <>
            <button aria-label="Forrige turnering" className={`tournament-prev-button absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 md:left-4 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed`}>
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button aria-label="Neste turnering" className={`tournament-next-button absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 md:right-4 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed`}>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div> {/* End Karusell Wrapper */}

      {/* Paginering Container (Kun hvis mer enn 1 turnering) */}
      {tournaments.length > 1 && (
        <div className="tournament-pagination-container text-center pt-4 pb-2">
          {/* Swiper rendrer kuler automatisk her basert på pagination config */}
        </div>
      )}

    </section>
  );
};

export default TournamentsCarousel;