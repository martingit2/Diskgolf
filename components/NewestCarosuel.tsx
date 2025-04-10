// Fil: /components/NyesteBanerCarousel.tsx
// Formål: Viser en karusell med de nyeste discgolf-banene. Håndterer henting, favoritter, lasting og feiltilstander.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdatering.

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useTranslation } from 'react-i18next'; // Importer hook for oversettelser.

import useFavoriteStore from "@/app/stores/useFavoriteStore"; // Store for favorittstatus.
import { CourseCard } from "@/components/CourseCard"; // Komponent for å vise enkeltbaner.
import { Button } from "@/components/ui/button"; // Standard knappekomponent.
import { ChevronRight } from "lucide-react"; // Ikon for knapp.
import useCarouselStore from "@/app/stores/useCarosuellStore"; // Store for karuselldata (her: nyeste baner).
import { CourseCardSkeleton } from "./CourseCardSkeleton"; // Skeleton loader for banekort.

const NyesteBanerCarousel = () => {
  // Henter oversettelsesfunksjon (t) og i18n-instans (for språkinfo).
  const { t, i18n } = useTranslation('translation');
  const router = useRouter(); // Hook for programmatisk navigasjon.

  // Henter tilstand og funksjoner fra Zustand stores.
  const { newestCourses, fetchNewestCourses, loading: loadingCourses, error: errorCourses } = useCarouselStore();
  const {
    isFavorite,
    toggleFavorite,
    isToggling: isTogglingFavoriteMap,
    initializeFavorites,
    isInitialized: favoritesInitialized,
    isInitializing: favoritesInitializing,
  } = useFavoriteStore();

  // Initialiserer favoritter fra localStorage hvis det ikke er gjort ennå.
  useEffect(() => {
    if (!favoritesInitialized && !favoritesInitializing) {
      initializeFavorites();
    }
  }, [favoritesInitialized, favoritesInitializing, initializeFavorites]);

  // Henter nyeste baner hvis listen er tom og vi ikke laster eller har feil.
  useEffect(() => {
    // Sjekker at vi ikke allerede har data, ikke laster, og ikke har en feil før vi henter.
    if (newestCourses.length === 0 && !loadingCourses && !errorCourses) {
      fetchNewestCourses();
    }
    // Dependency array sikrer at vi ikke kjører unødvendig.
  }, [newestCourses.length, fetchNewestCourses, loadingCourses, errorCourses]);

  // --- SKELETON RENDERERING ---
  // Funksjon for å rendre et sett med skeleton loaders mens data hentes.
  const renderSkeletons = () => {
    const skeletonCount = 3; // Antall skeletons å vise.
    return (
       <Swiper
        key="nyeste-baner-skeleton-swiper" // Unik nøkkel for skeleton Swiper.
        modules={[Navigation, Pagination]}
        pagination={false} // Ingen paginering for skeletons.
        navigation // Viser navigasjonspiler (kan være deaktivert i stil).
        spaceBetween={25}
        slidesPerView={1}
        breakpoints={{ // Responsivt antall slides.
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 25 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        className="mt-8 pb-10 bane-carousel-swiper animate-pulse" // Styling og pulserende animasjon.
        allowTouchMove={false} // Deaktiverer touch-swipe for skeletons.
        noSwiping={true}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SwiperSlide key={`skeleton-${index}`} className="h-full pb-2">
            <CourseCardSkeleton /> {/* Viser individuell skeleton. */}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  // --- HJELPEFUNKSJON FOR HEADER ---
  // Funksjon for å rendre header-seksjonen med titler og "se alle"-knapp.
   const renderHeader = () => (
    <>
      {/* Hoved-header container med flexbox for layout. */}
      <div className="flex justify-between items-end mb-4">
        {/* Venstre del med titler. */}
        <div>
           <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
             {t('newest_courses_carousel.header.subtitle')} {/* Oversatt undertittel. */}
           </h2>
           <h1 className="text-3xl font-bold text-gray-900 mt-1">
             {t('newest_courses_carousel.header.title')} {/* Oversatt hovedtittel. */}
           </h1>
        </div>
        {/* Høyre del med "Se alle"-knapp (skjult på små skjermer). */}
        <Button
          variant="ghost"
          className="text-green-600 hover:bg-green-50 group hidden md:inline-flex items-center"
          onClick={() => router.push(`/${i18n.language}/courses`)} // Navigerer til baneoversikt med korrekt språk.
        >
          {t('newest_courses_carousel.header.view_all_button')} {/* Oversatt knappetekst. */}
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
       {/* "Se alle"-knapp som vises kun på små skjermer (under md breakpoint). */}
       <div className="mb-4 md:hidden">
           <Button
             variant="ghost"
             className="text-green-600 hover:bg-green-50 group inline-flex items-center"
             onClick={() => router.push(`/${i18n.language}/courses`)} // Navigerer til baneoversikt med korrekt språk.
           >
            {t('newest_courses_carousel.header.view_all_button')} {/* Oversatt knappetekst. */}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Button>
       </div>
    </>
  );

  // --- Feilhåndtering ---
  // Viser feilmelding hvis henting av baner feilet.
  if (errorCourses) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
          {renderHeader()} {/* Viser headeren selv ved feil. */}
         <div className="mt-8 text-center text-red-600">
            {/* Viser oversatt feilmelding med interpolert feildetalj. */}
           <p>{t('newest_courses_carousel.error.load_failed', { error: errorCourses })}</p>
         </div>
       </section>
    );
  }

  // --- "Ingen Baner" Håndtering ---
  // Viser en melding hvis lasting er ferdig, ingen feil oppstod, men ingen baner ble funnet.
   if (!loadingCourses && !favoritesInitializing && newestCourses.length === 0 && !errorCourses) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        {renderHeader()} {/* Viser headeren. */}
         {/* Viser oversatt melding. */}
         <p className="text-gray-600 mt-2 text-center md:text-left">{t('newest_courses_carousel.empty.message')}</p>
      </section>
    );
  }

  // Bestemmer om vi skal vise lasteindikator (enten baner eller favoritter laster).
  const isLoading = loadingCourses || favoritesInitializing;

  // --- HOVEDRENDERERING ---
  // Viser enten skeletons (hvis isLoading) eller den faktiske karusellen.
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      {renderHeader()} {/* Rendrer headeren. */}

       {isLoading ? (
         renderSkeletons() // Viser skeletons ved lasting.
       ) : (
         // Viser Swiper-karusellen med faktiske banedata.
         <Swiper
           key="nyeste-baner-real-swiper" // Unik nøkkel for å tvinge re-mount etter lasting.
           modules={[Navigation, Pagination, Autoplay]}
           autoplay={{ delay: 7000, disableOnInteraction: false }} // Litt lengre delay enn de andre? Kan justeres.
           pagination={{
             clickable: true,
             // Tilpasset rendering av pagineringskuler.
             renderBullet: (index, className) => `<span class="${className} bg-green-600"></span>`,
           }}
           navigation // Aktiverer standard navigasjonspiler.
           spaceBetween={25}
           slidesPerView={1}
           breakpoints={{ // Responsivt antall slides.
             640: { slidesPerView: 1, spaceBetween: 20 },
             768: { slidesPerView: 2, spaceBetween: 25 },
             1024: { slidesPerView: 3, spaceBetween: 30 },
           }}
           className="mt-8 pb-10 bane-carousel-swiper" // Styling for karusellen.
         >
           {/* Mapper gjennom de hentede nyeste banene. */}
           {newestCourses.map((course) => {
             // Sjekker favorittstatus og om favorittstatus er under endring for denne banen.
             const favorite = isFavorite(course.id);
             const isCurrentlyToggling = isTogglingFavoriteMap[course.id] ?? false;

             return (
               // Rendrer en SwiperSlide for hver bane.
               <SwiperSlide key={course.id} className="h-full pb-2">
                 {/* Rendrer CourseCard-komponenten med nødvendige props. */}
                 <CourseCard
                   course={course}
                   isFavorite={favorite}
                   onToggleFavorite={toggleFavorite} // Sender funksjon for å veksle favoritt.
                   isToggling={isCurrentlyToggling} // Sender status for om favoritt veksles.
                 />
               </SwiperSlide>
             );
           })}
         </Swiper>
       )}

    </section>
  );
};

export default NyesteBanerCarousel;