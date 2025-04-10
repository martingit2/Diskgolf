// Fil: /components/ReviewCarousel.tsx
// Formål: Viser en karusell med de nyeste baneanmeldelsene. Håndterer henting, lasting, feil og visning av anmeldelseskort.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useEffect } from "react";
import { FaStar } from "react-icons/fa"; // Stjerneikon for rating.
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // UI-komponenter.
import { User } from "lucide-react"; // Ikon for bruker-fallback.
import { useRouter } from "next/navigation";
import useReviewsCarouselStore from "@/app/stores/usereviewCarosuelStore"; // Zustand store for anmeldelser.
import { motion } from "framer-motion"; // For animasjoner.
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ReviewCardSkeleton } from "./ReviewCardSkeleton"; // Skeleton loader.
import { useTranslation } from 'react-i18next'; // Importer hook for oversettelser.

const ReviewCarousel = () => {
  // Henter oversettelsesfunksjon (t) og i18n-instans (for språkinfo).
  const { t, i18n } = useTranslation('translation');
  const { reviews, courses, loading, error, fetchReviews } = useReviewsCarouselStore();
  const router = useRouter();
  const currentLang = i18n.language; // Henter aktivt språk.

  // Henter anmeldelser kun hvis store er tom og vi ikke laster/har feil.
  useEffect(() => {
    if (reviews.length === 0 && !loading && !error) {
      fetchReviews();
    }
  }, [fetchReviews, reviews.length, loading, error]);

  // --- SKELETON RENDERING ---
  // Funksjon for å rendre et sett med skeleton loaders mens data hentes.
  const renderSkeletons = () => {
    const skeletonCount = 3; // Antall skeletons å vise.
    return (
      <Swiper
        key="review-skeleton-swiper" // Unik nøkkel for betinget rendering.
        modules={[Navigation, Pagination]}
        pagination={false} // Ingen paginering for skeletons.
        navigation // Aktiverer standard navigasjonspiler.
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{ // Responsivt antall slides.
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mt-8 pb-10 review-carousel-swiper animate-pulse" // Styling og pulserende animasjon.
        allowTouchMove={false} // Deaktiverer touch-interaksjon.
        noSwiping={true}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SwiperSlide key={`skeleton-${index}`} className="h-full pb-2">
            <ReviewCardSkeleton /> {/* Viser individuell skeleton. */}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };
  // -----------------------------

  // --- HEADER KOMPONENT ---
  // Funksjon for å rendre header-seksjonen med titler og knapp.
  const renderHeader = () => (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       // Responsiv layout: Kolonne på mobil, rad på desktop.
       className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8"
     >
       {/* Tittelblokk */}
       <div className="mb-4 md:mb-0">
         <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
           {t('review_carousel.header.subtitle')} {/* Oversatt undertittel. */}
         </h2>
         <h1 className="text-3xl font-bold text-gray-900 mt-1">
           {t('review_carousel.header.title')} {/* Oversatt hovedtittel. */}
         </h1>
       </div>
       {/* Navigasjonsknapp */}
       <Button
         variant="ghost"
         className="text-green-600 hover:bg-green-50 group inline-flex items-center"
         onClick={() => router.push(`/${currentLang}/courses`)} // Navigerer til baneoversikt med språk.
       >
         {t('review_carousel.header.view_all_button')} {/* Oversatt knappetekst. */}
         <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
       </Button>
     </motion.div>
  );
 // -----------------------------

  // --- HOVEDRENDERERING ---
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20 relative">
      {renderHeader()} {/* Rendrer headeren. */}

      {/* --- Betinget rendering: Laster, Feil, Ingen data, Data --- */}
      {loading ? (
        renderSkeletons() // Viser skeletons ved lasting.
      ) : error ? (
        // UI for feiltilstand.
        <div className="h-60 flex items-center justify-center text-center text-red-600 border border-red-200 rounded-lg bg-red-50 p-4 mt-8">
           <div>
              <p className="font-semibold">{t('review_carousel.error.title')}</p> {/* Oversatt feiltittel. */}
              {/* Oversatt feilmelding med interpolert feildetalj. */}
              <p>{t('review_carousel.error.load_failed', { error: error })}</p>
           </div>
         </div>
      ) : reviews.length === 0 ? (
        // UI for tilstand uten anmeldelser.
        <div className="h-60 flex items-center justify-center text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50 p-4 mt-8">
            <p>{t('review_carousel.empty.message')}</p> {/* Oversatt melding. */}
          </div>
      ) : (
        // --- Faktisk Swiper-komponent med anmeldelsesdata ---
        <Swiper
          key="review-real-swiper" // Unik nøkkel for betinget rendering.
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{
             clickable: true,
             // Egendefinert kulerendering for paginering.
             renderBullet: (index, className) => `<span class="${className} bg-green-600 opacity-50 hover:opacity-100 transition-opacity"></span>`,
          }}
          navigation // Aktiverer navigasjonspiler.
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ // Responsivt antall slides.
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-lg border shadow-lg mt-8 pb-10 review-carousel-swiper" // Styling.
        >
          {/* Mapper gjennom hentede anmeldelser. */}
          {reviews.map((review) => {
            // Finner tilhørende banedata fra store.
            const course = courses[review.courseId];
             if (!course && !loading) {
                  // Logger advarsel hvis banedata mangler for en anmeldelse som rendres.
                  console.warn(`Course data potentially missing for review ${review.id}, courseId ${review.courseId}`);
             }
            // Fallbacks for data som kanskje ikke er lastet ennå.
            const courseName = course?.name || t('review_carousel.card.loading_course'); // Oversatt fallback for banenavn.
            const courseImage = course?.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"; // Standard bilde.
            const userName = review.user.name || t('review_carousel.card.anonymous_user'); // Oversatt fallback for brukernavn.
            const userImageAlt = review.user.name ? t('review_carousel.card.user_profile_alt_named', { name: review.user.name }) : t('review_carousel.card.user_profile_alt_anonymous'); // Dynamisk alt-tekst for brukerbilde.


            // --- Datoformatering basert på språk ---
            const formatDate = (dateString: string, lang: string): string => {
              try {
                const locale = lang === 'no' ? 'nb-NO' : 'en-GB'; // Velger riktig locale.
                const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                return new Date(dateString).toLocaleDateString(locale, options);
              } catch (e) {
                console.error("Date formatting error:", e);
                return t('common.invalid_date'); // Fallback ved feil.
              }
            };
            const formattedDate = formatDate(review.createdAt, currentLang);
            // -----------------------------------------


            return (
              <SwiperSlide key={review.id} className="h-full pb-2"> {/* Sikrer konsistent slide-høyde. */}
                <Card
                  className="shadow-xl border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden bg-white cursor-pointer h-full group"
                  onClick={() => router.push(`/${currentLang}/courses/${review.courseId}`)} // Kortklikk navigerer til baneside med språk.
                >
                  {/* Topp Bilde-seksjon */}
                  <div className="relative">
                    <Image
                      src={courseImage}
                      alt={courseName} // Bruker fallback hvis navnet lastes.
                      width={400}
                      height={176} // Svarer til h-44.
                      className="w-full h-44 object-cover rounded-t-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-t-xl"></div>

                    {/* Sirkulært Brukerprofilbilde (Overlappende) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100"> {/* Bakgrunn for fallback */}
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={userImageAlt} // Bruker dynamisk alt-tekst.
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // Fallback-ikon hvis brukerbilde mangler.
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kortinnhold-seksjon - Sentrert justering */}
                  <CardContent className="p-6 pt-12 flex flex-col items-center text-center flex-grow"> {/* pt-12 for profilbilde-overlap */}

                    {/* Brukernavn & Banenavn */}
                    <CardHeader className="p-0 w-full"> {/* w-full for korrekt sentrering. */}
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">
                        {userName} {/* Viser brukernavn eller fallback. */}
                      </CardTitle>
                      <p className="text-sm font-medium text-green-700 mt-1">
                        {/* Viser oversatt "anmeldte" og banenavn. */}
                        {t('review_carousel.card.reviewed')} {courseName}
                      </p>
                    </CardHeader>

                    {/* Separator */}
                    <hr className="my-3 border-gray-200 w-full" />

                    {/* Stjernerating - Sentrert */}
                    <div className="flex justify-center mt-1 w-full">
                       {Array.from({ length: 5 }).map((_, index) => (
                           <FaStar
                               key={index}
                               className={`text-lg ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                           />
                       ))}
                     </div>

                    {/* Anmeldelseskommentar - Venstrejustert */}
                    {/* max-h-24 begrenser høyde, overflow-y-auto tillater scrolling. */}
                    <blockquote className="text-gray-600 italic text-sm mt-3 border-l-4 border-green-500/50 pl-3 w-full text-left max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      "{review.comment}"
                    </blockquote>

                    {/* Spacer-element dytter datoen ned. */}
                    <div className="flex-grow"></div>

                    {/* Dato - Sentrert */}
                    <p className="text-xs text-gray-400 mt-4 w-full">
                      {formattedDate} {/* Viser formatert dato basert på språk. */}
                    </p>
                  </CardContent>
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