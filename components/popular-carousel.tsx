// src/components/BaneCarousel.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import useFavoriteStore from "@/app/stores/useFavoriteStore";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import useCarouselStore from "@/app/stores/useCarosuellStore";

const BaneCarousel = () => {
  const { topCourses, fetchTopCourses, loading: loadingCourses, error: errorCourses } = useCarouselStore();
  const {
    isFavorite,
    toggleFavorite,
    isToggling: isTogglingFavoriteMap,
    initializeFavorites,
    isInitialized: favoritesInitialized,
    isInitializing: favoritesInitializing,
  } = useFavoriteStore();
  const router = useRouter();

  useEffect(() => {
    if (!favoritesInitialized && !favoritesInitializing) {
      initializeFavorites();
    }
  }, [favoritesInitialized, favoritesInitializing, initializeFavorites]);

  useEffect(() => {
    if (topCourses.length === 0 && !loadingCourses && !errorCourses) {
      fetchTopCourses();
    }
  }, [fetchTopCourses, loadingCourses, errorCourses]);

  // --- SKELETON RENDERERING ---
  const renderSkeletons = () => {
    const skeletonCount = 3;
    return (
      <Swiper
        // ---- NYTT: Key for skeleton Swiper ----
        key="bane-carousel-skeleton-swiper"
        modules={[Navigation, Pagination]}
        pagination={false}
        navigation
        spaceBetween={25}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 25 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        className="mt-8 pb-10 bane-carousel-swiper animate-pulse"
        allowTouchMove={false}
        noSwiping={true}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SwiperSlide key={`skeleton-${index}`} className="h-full pb-2">
            <CourseCardSkeleton />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };
  // -----------------------------

 // --- HJELPEFUNKSJON FOR HEADER (uendret) ---
 const renderHeader = () => (
    <>
      <div className="flex justify-between items-end mb-4">
        <div>
           <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
             DiskGolf Baner
           </h2>
           <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mt-1">
             Topprangerte DiskGolf-baner
           </h1>
        </div>
        <Button variant="ghost" className="text-green-600 hover:bg-green-50 group hidden md:inline-flex items-center" onClick={() => router.push('/baner')}>
          Se alle baner
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      <div className="mb-4 md:hidden">
         <Button variant="ghost" className="text-green-600 hover:bg-green-50 group inline-flex items-center" onClick={() => router.push('/baner')}>
           Se alle baner
           <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
         </Button>
      </div>
    </>
  );
 // -----------------------------

  // --- Error Håndtering (uendret) ---
  if (errorCourses) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        {renderHeader()}
        <div className="mt-8 text-center text-red-600">
            <p>Kunne ikke laste baner: {errorCourses}</p>
        </div>
      </section>
    );
  }

  // --- "Ingen Baner" Håndtering ---
   if (!loadingCourses && !favoritesInitializing && topCourses.length === 0 && !errorCourses) { // La til !errorCourses
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        {renderHeader()}
        <p className="text-gray-600 mt-8 text-center">
            Fant ingen topprangerte baner for øyeblikket.
        </p>
      </section>
    );
  }

  // Bestemmer om vi laster eller ikke
  const isLoading = loadingCourses || favoritesInitializing;

  // --- HOVEDRENDERERING ---
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      {renderHeader()}

       {isLoading ? (
         renderSkeletons()
       ) : (
         // ---- ENDRING HER: Lagt til key ----
         <Swiper
           // Nøkkelen sikrer at Swiper blir fullstendig re-montert når isLoading går fra true til false
           key="bane-carousel-real-swiper"
           modules={[Navigation, Pagination, Autoplay]}
           autoplay={{ delay: 5000, disableOnInteraction: false }}
           pagination={{
             clickable: true,
             renderBullet: (index, className) => `<span class="${className} bg-green-600"></span>`,
           }}
           navigation
           spaceBetween={25}
           slidesPerView={1}
           breakpoints={{
             640: { slidesPerView: 1, spaceBetween: 20 },
             768: { slidesPerView: 2, spaceBetween: 25 },
             1024: { slidesPerView: 3, spaceBetween: 30 },
           }}
           className="mt-8 pb-10 bane-carousel-swiper"
         // ---------------------------------------
         >
           {topCourses.map((course) => {
             const favorite = isFavorite(course.id);
             const isCurrentlyToggling = isTogglingFavoriteMap[course.id] ?? false;

             return (
               <SwiperSlide key={course.id} className="h-full pb-2">
                 <CourseCard
                   course={course}
                   isFavorite={favorite}
                   onToggleFavorite={toggleFavorite}
                   isToggling={isCurrentlyToggling}
                 />
               </SwiperSlide>
             );
           })}
         </Swiper>
       )}
    </section>
  );
};

export default BaneCarousel;