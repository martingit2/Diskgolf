// Fil: src/components/TournamentsCarousel.tsx
// Formål: Viser en karusell med fremhevede turneringer. Henter data fra API og håndterer lasting, feil og tomme tilstander.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.

"use client"; // Nødvendig for hooks (useState, useEffect) og klientinteraksjon.

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useRouter } from "next/navigation"; // Brukes for navigasjon ved klikk.
import { MapPin, Users, Trophy, ChevronRight, ChevronLeft, ClipboardList } from "lucide-react"; // Ikoner for UI.
import { Button, ButtonProps } from "@/components/ui/button"; // Standard knapp-komponent.
import { motion, ForwardRefComponent, HTMLMotionProps } from "framer-motion"; // For animasjoner.
import { useTranslation } from 'react-i18next'; // Importer hook for oversettelser.

// Importer Skeleton-komponenten for lastingstilstand.
import { TournamentCarouselSkeleton } from "./TournamentCarouselSkeleton"; // Sjekk at stien er korrekt

// --- Interface for turneringsdata ---
// Definerer datastrukturen for en turnering hentet fra APIet.
interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO dato-streng
  endDate: string | null; // Kan være null
  location: string; // Stednavn
  course: { // Relatert baneinformasjon
    id: string;
    name: string;
    location: string;
    image?: string; // Valgfritt bilde
  };
  organizer: { // Relatert arrangørinformasjon
    id: string;
    name: string;
  };
  _count: { // Antall deltakere (fra Prisma _count)
    participants: number;
  };
  maxParticipants: number | null; // Maks antall deltakere, kan være null
}

// --- Hjelpeklasse for tekstskygge ---
// Gjenbrukbar CSS-klasse for bedre lesbarhet av tekst på bilder.
const textShadowClass = "[text-shadow:0_1px_3px_rgba(0,0,0,0.6)]";

// --- Motion-kompatibel Button ---
// Gjør Shadcn UI Button kompatibel med Framer Motion for animasjoner.
const MotionButton = motion(Button) as ForwardRefComponent<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>;

// ===========================
// TournamentsCarousel Komponent
// ===========================
const TournamentsCarousel = () => {
  // Henter oversettelsesfunksjon (t) og i18n instans (for språk).
  const { t, i18n } = useTranslation('translation');
  const router = useRouter(); // Hook for programmatisk navigasjon.

  // --- State Hooks ---
  const [tournaments, setTournaments] = useState<Tournament[]>([]); // Holder liste med turneringer.
  const [loading, setLoading] = useState(true); // Styrer visning av lasteindikator.
  const [error, setError] = useState<string | null>(null); // Holder eventuelle feilmeldinger.

  // --- useEffect for datahenting ---
  // Henter fremhevede turneringer fra APIet når komponenten mountes.
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true); // Starter lasting.
      setError(null); // Nullstiller tidligere feil.
      try {
        const response = await fetch('/api/tournaments/featured'); // Kaller API endepunkt.
        if (!response.ok) {
          // Prøver å hente en mer spesifikk feilmelding fra API-svaret.
          let errorMsg = `Failed to fetch tournaments (${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { /* Ignorerer feil hvis respons-body ikke er JSON */ }
          throw new Error(errorMsg); // Kaster feil for å bli fanget av catch-blokken.
        }
        const data: Tournament[] = await response.json(); // Parser JSON-data.
        setTournaments(data); // Oppdaterer state med hentede turneringer.
      } catch (err) {
        console.error("Fetch error:", err); // Logger feil til konsollen.
        // Setter en generell eller spesifikk feilmelding for visning i UI.
        setError(err instanceof Error ? err.message : t('tournaments_carousel.error.unknown_error', 'An unknown error occurred')); // Bruker oversatt fallback
      } finally {
        setLoading(false); // Stopper lasting uansett om henting var vellykket eller ikke.
      }
    };
    fetchTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); // Legger til 't' som dependency for å hente på nytt hvis språket endres (valgfritt, men kan være nyttig for feilmelding).

   // =========================================
   // Conditional Rendering: Loading, Error, Empty
   // =========================================

   // --- 1. Loading State ---
   // Viser Skeleton-komponenten mens data hentes.
  if (loading) {
    return <TournamentCarouselSkeleton />;
   }

   // --- 2. Error State ---
   // Viser en feilmeldingsboks hvis noe gikk galt under henting.
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
           <h2 className="text-xl font-semibold text-red-700 mb-2">{t('tournaments_carousel.error.title')}</h2>
           <p className="text-red-600">{error}</p> {/* Viser den spesifikke feilmeldingen */}
           {/* Knapp for å prøve å laste siden på nytt */}
           <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
             {t('tournaments_carousel.error.retry_button')}
           </Button>
         </div>
       </section>
     );
   }

   // --- 3. Empty State (No Tournaments Found) ---
   // Viser en melding hvis APIet returnerte en tom liste med turneringer.
  if (tournaments.length === 0) {
     return (
       <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20">
         {/* Viser den faktiske headeren, da lasting er ferdig */}
         <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8"
         >
           {/* Tittel-blokk */}
           <div className="mb-4 md:mb-0">
             <h2 className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">{t('tournaments_carousel.header.subtitle')}</h2>
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{t('tournaments_carousel.header.title')}</h1>
           </div>
           {/* Knapp for å se alle turneringer */}
           <Button
              variant="ghost"
              className="text-green-600 hover:bg-green-50 group inline-flex items-center text-sm sm:text-base"
              onClick={() => router.push(`/${i18n.language}/tournaments`)} // Navigerer til oversiktsside, bruker gjeldende språk
            >
              {t('tournaments_carousel.header.view_all_button')}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
         </motion.div>
         {/* Melding om at ingen turneringer ble funnet */}
         <div className="h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center bg-gray-100 rounded-xl shadow-lg">
           <p className="text-gray-500">{t('tournaments_carousel.empty.message')}</p>
         </div>
       </section>
     );
   }

  // =========================================
  // Hovedkomponent med turneringer (Data finnes)
  // =========================================
  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 mt-16 sm:mt-20 relative">
       {/* Header - Vises når data er lastet og det finnes turneringer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8"
      >
        {/* Tittel-blokk */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">{t('tournaments_carousel.header.subtitle')}</h2>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{t('tournaments_carousel.header.title')}</h1>
        </div>
        {/* Knapp for å se alle turneringer */}
        <Button
           variant="ghost"
           className="text-green-600 hover:bg-green-50 group inline-flex items-center text-sm sm:text-base"
           onClick={() => router.push(`/${i18n.language}/tournaments`)} // Navigerer til oversiktsside med språk
         >
           {t('tournaments_carousel.header.view_all_button')}
           <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
         </Button>
      </motion.div>

      {/* Karusell Wrapper - Kontainer for Swiper og navigasjonselementer */}
      <div className="relative group">
        <Swiper
          // Swiper konfigurasjon
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }} // Autoplay instillinger
          effect="fade" // Bruker fade-effekt for overganger
          fadeEffect={{ crossFade: true }}
          speed={1000} // Overgangshastighet
          pagination={{
             clickable: true,
             el: '.tournament-pagination-container', // Egendefinert container for paginering
             bulletClass: 'w-2 h-2 rounded-full bg-gray-300 mx-1.5 inline-block transition-all duration-300 cursor-pointer', // Styling for inaktive kuler
             bulletActiveClass: '!bg-green-600 w-5', // Styling for aktiv kule
             // Genererer kuler med dynamisk ARIA label basert på språk - bruker {{index}} for interpolering
             renderBullet: (index, className) => `<span class="${className}" aria-label="${t('tournaments_carousel.pagination.aria_label', { index: index + 1 })}"></span>`
           }}
          navigation={{ // Konfigurerer navigasjonspiler
            nextEl: '.tournament-next-button',
            prevEl: '.tournament-prev-button',
          }}
          spaceBetween={0} // Ingen mellomrom mellom slides (pga. fade-effekt)
          slidesPerView={1} // Viser én slide om gangen
          className="rounded-xl overflow-hidden shadow-xl" // Styling for Swiper container
          loop={tournaments.length > 1} // Aktiverer loop kun hvis det er mer enn én slide
        >
          {/* Mapper gjennom turneringene og lager en SwiperSlide for hver */}
          {tournaments.map((tournament, index) => {
             // --- Datoformatering og logikk ---
             const startDate = new Date(tournament.startDate);
             const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
             const currentLang = i18n.language; // Henter aktivt språk ('en', 'no', etc.)

             // Funksjon for å formatere datoperioden basert på språk og datoer.
             const formatDateRange = (start: Date, end: Date | null, lang: string): string => {
               try {
                 const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                 const startStr = start.toLocaleDateString(lang === 'no' ? 'nb-NO' : 'en-GB', options);

                 if (!end || start.toDateString() === end.toDateString()) return startStr;

                 const isDifferentMonth = end.getMonth() !== start.getMonth();
                 const isDifferentYear = end.getFullYear() !== start.getFullYear();

                 const endOptions: Intl.DateTimeFormatOptions = {};
                 if (isDifferentYear) {
                    endOptions.day = 'numeric';
                    endOptions.month = 'short';
                    endOptions.year = 'numeric';
                 } else if (isDifferentMonth) {
                    endOptions.day = 'numeric';
                    endOptions.month = 'short';
                 } else {
                    endOptions.day = 'numeric';
                 }

                 const endStr = end.toLocaleDateString(lang === 'no' ? 'nb-NO' : 'en-GB', endOptions);

                 if (isDifferentYear) {
                    const startYearOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                    const startYearStr = start.toLocaleDateString(lang === 'no' ? 'nb-NO' : 'en-GB', startYearOptions);
                    return `${startYearStr} - ${endStr}`;
                 }

                 return `${startStr} - ${endStr}`;

               } catch (e) {
                 console.error("Date formatting error:", e);
                 return t('common.invalid_date'); // Fallback ved feil, bruker oversatt tekst
               }
             };

             // --- Deltakertekst-logikk ---
             // Denne logikken stoler på at i18next håndterer plural automatisk
             // basert på 'count' og de korrigerte JSON-nøklene.
             const participantsCount = tournament._count?.participants ?? 0;
             let participantsText: string;
             if (tournament.maxParticipants !== null && tournament.maxParticipants > 0) {
                 // Bruker den spesifikke nøkkelen for "count/max"-formatet.
                 participantsText = t('tournaments_carousel.slide.participants_with_max', {
                     count: participantsCount,
                     max: tournament.maxParticipants
                 });
             } else {
                 // Bruker basisnøkkelen. i18next vil velge _one eller _other
                 // og interpolere {{count}} basert på JSON-filene.
                 participantsText = t('tournaments_carousel.slide.participants', {
                     count: participantsCount
                 });
             }

            // --- Returnerer SwiperSlide for turneringen ---
            return (
              <SwiperSlide key={tournament.id}>
                {/* Hovedcontainer for slide-innhold */}
                <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] text-white">
                  {/* Bakgrunnsbilde og overlay */}
                  <div className="absolute inset-0">
                    <Image
                      src={tournament.course?.image || "/images/default-course-image.webp"}
                      alt={`${t('tournaments_carousel.slide.image_alt_prefix')} ${tournament.course?.name || t('tournaments_carousel.slide.image_alt_fallback')}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                      className="object-cover"
                      priority={index === 0}
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
                  </div>

                  {/* Tekstinnhold Container */}
                  <div
                    className="relative h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10 cursor-pointer group/slide"
                    onClick={() => router.push(`/${currentLang}/tournament/${tournament.id}`)}
                  >
                     {/* Datobadge */}
                    <div className={`absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-10 lg:left-10 z-10 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 ${textShadowClass}`}>
                      <div className="text-sm sm:text-base font-semibold"> {formatDateRange(startDate, endDate, currentLang)} </div>
                    </div>

                     {/* Tekstområde med animasjon */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      className="mb-4"
                    >
                      {/* Tittel */}
                      <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 leading-tight ${textShadowClass}`}>
                        {tournament.name}
                      </h3>

                      {/* Beskrivelse */}
                      <p className={`text-base sm:text-lg lg:text-xl text-gray-200 mb-5 sm:mb-6 max-w-2xl lg:max-w-3xl line-clamp-2 sm:line-clamp-3 leading-relaxed ${textShadowClass}`}>
                        {tournament.description || `${t('tournaments_carousel.slide.default_description_prefix')} ${tournament.course?.name || t('tournaments_carousel.slide.unknown_course')}${t('tournaments_carousel.slide.default_description_suffix')}`}
                      </p>

                      {/* Animerende knapp for påmelding */}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${currentLang}/tournament/${tournament.id}#registration`);
                        }}
                      >
                        <ClipboardList className="mr-2 h-5 w-5 flex-shrink-0" />
                        {t('tournaments_carousel.slide.registration_button')}
                      </MotionButton>

                      {/* Detaljer (Sted, Deltakere, Arrangør) */}
                      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base">
                        {/* Sted */}
                        <div className={`flex items-center text-gray-300 ${textShadowClass}`}>
                          <MapPin className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                          <span>{tournament.course?.name || t('common.unknown_course')}, {tournament.location}</span>
                        </div>
                        {/* Deltakere */}
                        <div className={`flex items-center text-gray-300 ${textShadowClass}`}>
                          <Users className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                          {/* Viser den korrekt interpolerte og pluraliserte teksten */}
                          <span>{participantsText}</span>
                        </div>
                        {/* Arrangør */}
                        {tournament.organizer?.name && (
                           <div className={`items-center hidden sm:flex text-gray-300 ${textShadowClass}`}>
                              <Trophy className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                              <span>{t('tournaments_carousel.slide.organizer_prefix')} {tournament.organizer.name}</span>
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

        {/* Navigasjonsknapper */}
        {tournaments.length > 1 && (
          <>
            <button
              aria-label={t('tournaments_carousel.navigation.prev_aria_label')}
              className={`tournament-prev-button absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 md:left-4 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed`}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              aria-label={t('tournaments_carousel.navigation.next_aria_label')}
              className={`tournament-next-button absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 md:right-4 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed`}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div> {/* Slutt på Karusell Wrapper */}

      {/* Paginering Container */}
      {tournaments.length > 1 && (
        <div className="tournament-pagination-container text-center pt-4 pb-2"></div>
      )}

    </section>
  );
};

export default TournamentsCarousel;