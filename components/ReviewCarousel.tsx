// src/components/ReviewCarousel.tsx
"use client";

import { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import useReviewsCarouselStore from "@/app/stores/usereviewCarosuelStore"; // Verify path
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ReviewCardSkeleton } from "./ReviewCardSkeleton"; // Skeleton component

const ReviewCarousel = () => {
  const { reviews, courses, loading, error, fetchReviews } = useReviewsCarouselStore();
  const router = useRouter();

  // Fetch reviews only if store is empty and not currently loading/in error state
  useEffect(() => {
    if (reviews.length === 0 && !loading && !error) {
      fetchReviews();
    }
    // Dependency array includes all values read from the store and fetch function
  }, [fetchReviews, reviews.length, loading, error]);

  // --- SKELETON RENDERING ---
  const renderSkeletons = () => {
    const skeletonCount = 3; // Number of skeletons to display
    return (
      <Swiper
        key="review-skeleton-swiper" // Unique key for conditional rendering
        modules={[Navigation, Pagination]}
        pagination={false} // No pagination for skeletons
        navigation // Enable default navigation arrows
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mt-8 pb-10 review-carousel-swiper animate-pulse" // Base class + pulse animation
        allowTouchMove={false} // Disable touch interaction for skeletons
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

  // --- HEADER COMPONENT ---
  const renderHeader = () => (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       // Responsive layout: Column on mobile, Row on desktop
       className="flex flex-col items-start md:flex-row md:justify-between md:items-end mb-8"
     >
       {/* Title Block */}
       <div className="mb-4 md:mb-0">
         <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
           DiskGolf Anmeldelser
         </h2>
         <h1 className="text-3xl font-bold text-white mt-1">
           Nyeste bane anmeldelser
         </h1>
       </div>
       {/* Navigation Button */}
       <Button
         variant="ghost"
         className="text-green-600 hover:bg-green-50 group inline-flex items-center"
         onClick={() => router.push("/baner")} // Navigate to all courses page
       >
         Se alle baner
         <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
       </Button>
     </motion.div>
  );
 // -----------------------------

  // --- MAIN RENDER ---
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20 relative">
      {renderHeader()}

      {/* --- Conditional Rendering: Loading, Error, No Data, Data --- */}
      {loading ? (
        renderSkeletons()
      ) : error ? (
        // Error state UI
        <div className="h-60 flex items-center justify-center text-center text-red-600 border border-red-200 rounded-lg bg-red-50 p-4 mt-8">
           <div>
              <p className="font-semibold">Feil!</p>
              <p>Kunne ikke laste anmeldelser: {error}</p>
           </div>
         </div>
      ) : reviews.length === 0 ? (
        // No reviews found state UI
        <div className="h-60 flex items-center justify-center text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50 p-4 mt-8">
            <p>Ingen anmeldelser funnet.</p>
          </div>
      ) : (
        // --- Actual Swiper component with review data ---
        <Swiper
          key="review-real-swiper" // Unique key for conditional rendering
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{
             clickable: true,
             // Custom bullet rendering for pagination
             renderBullet: (index, className) => `<span class="${className} bg-green-600 opacity-50 hover:opacity-100 transition-opacity"></span>`,
          }}
          navigation // Enable navigation arrows
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{ // Responsive slides per view
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-lg border shadow-lg mt-8 pb-10 review-carousel-swiper" // Base class for potential global styling
        >
          {reviews.map((review) => {
            const course = courses[review.courseId];
             if (!course && !loading) {
                  // Log warning if course data is missing for a rendered review
                  console.warn(`Course data potentially missing for review ${review.id}, courseId ${review.courseId}`);
             }
            // Fallbacks for potentially missing course data during render
            const courseName = course?.name || "Laster bane...";
            const courseImage = course?.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"; // Default course image

            return (
              <SwiperSlide key={review.id} className="h-full pb-2"> {/* Ensure consistent slide height */}
                <Card
                  className="shadow-xl border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden bg-white cursor-pointer h-full group"
                  onClick={() => router.push(`/courses/${review.courseId}`)} // Card click navigates to course page
                >
                  {/* Top Image Section */}
                  <div className="relative">
                    <Image
                      src={courseImage}
                      alt={courseName}
                      width={400}
                      height={176} // Aspect ratio for h-44
                      className="w-full h-44 object-cover rounded-t-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-t-xl"></div>

                    {/* Circular User Profile Image (Overlapping) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100"> {/* Background for fallback */}
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name || 'Brukerprofil'} // Use user name for alt text
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // Fallback icon if user image is missing
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content Section - Centered Alignment */}
                  {/* items-center & text-center applied here */}
                  <CardContent className="p-6 pt-12 flex flex-col items-center text-center flex-grow"> {/* pt-12 for profile image overlap */}

                    {/* User Name & Course Name */}
                    <CardHeader className="p-0 w-full"> {/* w-full needed for text-center to work correctly */}
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">
                        {review.user.name || 'Anonym'} {/* Fallback for anonymous user */}
                      </CardTitle>
                      <p className="text-sm font-medium text-green-700 mt-1">
                        anmeldte {courseName}
                      </p>
                    </CardHeader>

                    {/* Separator */}
                    <hr className="my-3 border-gray-200 w-full" />

                    {/* Star Rating - Centered */}
                    {/* justify-center applied here */}
                    <div className="flex justify-center mt-1 w-full">
                       {Array.from({ length: 5 }).map((_, index) => (
                           <FaStar
                               key={index}
                               className={`text-lg ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                           />
                       ))}
                     </div>

                    {/* Review Comment - Left Aligned */}
                    {/* text-left overrides the parent's text-center */}
                    {/* max-h-24 limits height, overflow-y-auto enables scrolling */}
                    <blockquote className="text-gray-600 italic text-sm mt-3 border-l-4 border-green-500/50 pl-3 w-full text-left max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      "{review.comment}"
                    </blockquote>

                    {/* Spacer element pushes date to the bottom */}
                    <div className="flex-grow"></div>

                    {/* Date - Centered */}
                    {/* Inherits text-center from CardContent */}
                    <p className="text-xs text-gray-400 mt-4 w-full">
                      {new Date(review.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
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