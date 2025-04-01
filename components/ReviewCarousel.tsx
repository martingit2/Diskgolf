// src/components/ReviewCarousel.tsx
"use client";

import { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation"; // Importerer standard pil-styling (vi overstyrer med CSS)
import "swiper/css/pagination"; // Importerer standard pagination-styling (vi overstyrer med CSS/renderBullet)
import "swiper/css/autoplay";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import useReviewsCarouselStore from "@/app/stores/usereviewCarosuelStore"; // Sjekk stien
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ReviewCardSkeleton } from "./ReviewCardSkeleton"; // Importer skeleton

const ReviewCarousel = () => {
  const { reviews, courses, loading, error, fetchReviews } = useReviewsCarouselStore();
  const router = useRouter();

  // Korrekt useEffect: Henter data kun én gang hvis nødvendig
  useEffect(() => {
    if (reviews.length === 0 && !loading && !error) {
      fetchReviews();
    }
  }, [fetchReviews]); // Kun fetchReviews som dependency

  // --- SKELETON RENDERERING ---
  const renderSkeletons = () => {
    const skeletonCount = 3;
    return (
      <Swiper
        key="review-skeleton-swiper"
        modules={[Navigation, Pagination]}
        pagination={false} // Ingen klikkbare prikker for skeleton
        navigation // Viser standard piler
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        // Bruker samme klasse for potensiell CSS-target + animate-pulse
        className="mt-8 pb-10 review-carousel-swiper animate-pulse"
        allowTouchMove={false}
        noSwiping={true}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SwiperSlide key={`skeleton-${index}`} className="h-full pb-2">
            <ReviewCardSkeleton />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };
  // -----------------------------

  // --- HJELPEFUNKSJON FOR HEADER (MED RESPONSIV LAYOUT) ---
  const renderHeader = () => (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       // Standard (mobil): flex-col, items-start
       // Fra 'md' og opp: flex-row, justify-between, items-end
       className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8"
     >
       {/* Tittel-blokk: Bunnmarg på mobil */}
       <div className="mb-4 md:mb-0">
         <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
           DiskGolf Anmeldelser
         </h2>
         <h1 className="text-3xl font-bold text-gray-900 mt-1">
           Nyeste bane anmeldelser
         </h1>
       </div>

       {/* "Se alle baner"-knapp: Enkel knapp, layout styrer posisjon */}
       <Button
         variant="ghost"
         className="text-green-600 hover:bg-green-50 group inline-flex items-center"
         onClick={() => router.push("/baner")}
       >
         Se alle baner
         <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
       </Button>
     </motion.div>
  );
 // -----------------------------

  // --- HOVEDRENDERERING ---
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20 relative">
      {renderHeader()}

      {/* --- Conditional Rendering Logikk --- */}
      {loading ? (
        renderSkeletons()
      ) : error ? (
        <div className="h-60 flex items-center justify-center text-center text-red-600 border border-red-200 rounded-lg bg-red-50 p-4 mt-8">
           <div>
              <p className="font-semibold">Feil!</p>
              <p>Kunne ikke laste anmeldelser: {error}</p>
           </div>
         </div>
      ) : reviews.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50 p-4 mt-8">
            <p>Ingen anmeldelser funnet.</p>
          </div>
      ) : (
        // --- Den faktiske Swiper-komponenten ---
        <Swiper
          key="review-real-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{
             clickable: true,
             // Bruker renderBullet for enkel farge, men CSSen vil også fungere/overstyre hvis lagt til
             renderBullet: (index, className) => `<span class="${className} bg-green-600"></span>`,
          }}
          navigation // Aktiverer piler - styling via global CSS
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          // VIKTIG: Legg til klassen slik at CSS-reglene under treffer
          className="rounded-lg border shadow-lg mt-8 pb-10 review-carousel-swiper"
        >
          {reviews.map((review) => {
            const course = courses[review.courseId];
            if (!course && !loading) {
                 console.warn(`Course data missing or still loading for review ${review.id} with courseId ${review.courseId}`);
            }
            const courseName = course?.name || "Laster bane...";
            const courseImage = course?.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp";

            return (
              // Bruker den opprinnelige Card-strukturen din for layout og bildevisning
              <SwiperSlide key={review.id} className="h-full pb-2">
                <Card
                  className="shadow-xl border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden bg-white cursor-pointer h-full group"
                  onClick={() => router.push(`/courses/${review.courseId}`)}
                >
                  {/* Bannerbilde med hover-effekt */}
                  <div className="relative"> {/* Fjernet 'group' her, satt på Card */}
                    <Image
                      src={courseImage}
                      alt={courseName}
                      width={400}
                      height={176} // h-44
                      className="w-full h-44 object-cover rounded-t-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay på hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-t-xl"></div>

                    {/* Brukerprofilbilde (Din opprinnelige struktur) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          // VIKTIG: Bruk review.user.name for alt-tekst
                          alt={review.user.name || 'Brukerprofil'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover" // Viktig for at bildet fyller sirkelen
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Endret til text-left og items-start for venstrejustering */}
                  <CardContent className="p-6 pt-12 flex flex-col items-start text-left flex-grow"> {/* pt-12 for plass til bilde */}
                    {/* Brukernavn og banenavn */}
                    {/* Satt bredde til 100% for å sikre venstrejustering innenfor flex container */}
                    <CardHeader className="p-0 w-full">
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">
                        {review.user.name || 'Anonym'}
                      </CardTitle>
                      <p className="text-sm font-medium text-green-700 mt-1">
                        anmeldte {courseName}
                      </p>
                    </CardHeader>

                    {/* Separator */}
                    <hr className="my-3 border-gray-200 w-full" /> {/* Full bredde */}

                    {/* Vurderingsstjerner (venstrejustert) */}
                    <div className="flex justify-start mt-1 w-full"> {/* Justify-start */}
                       {Array.from({ length: 5 }).map((_, index) => (
                           <FaStar
                               key={index}
                               className={`text-lg ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                           />
                       ))}
                     </div>

                    {/* Kommentar */}
                    {/* Fjernet px-4 for å unngå ekstra innrykk */}
                    <blockquote className="text-gray-600 italic text-sm mt-3 border-l-4 border-green-500/50 pl-3 w-full max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      "{review.comment}"
                    </blockquote>

                    {/* Spacer */}
                    <div className="flex-grow"></div>

                    {/* Dato */}
                    <p className="text-xs text-gray-400 mt-4 w-full"> {/* w-full for å sikre venstrejustering */}
                      {new Date(review.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </CardContent>
                  {/* Fjernet den nederste separatoren fra den opprinnelige koden */}
                </Card>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
};

export default ReviewCarousel;