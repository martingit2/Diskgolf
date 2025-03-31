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
import useReviewsCarouselStore from "@/app/stores/usereviewCarosuelStore";

const ReviewCarousel = () => {
  const { reviews, courses, loading, error, fetchReviews } = useReviewsCarouselStore();
  const router = useRouter();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight text-left">
        Nyeste bane anmeldelser
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Laster anmeldelser...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500">Ingen anmeldelser funnet</p>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-lg border shadow-lg mt-8"
        >
          {reviews.map((review) => {
            const course = courses[review.courseId]; // Get course data from courses map

            return (
              <SwiperSlide key={review.id}>
                <Card
                  className="shadow-xl border border-gray-300 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden bg-white cursor-pointer"
                  onClick={() => router.push(`/courses/${review.courseId}`)}
                >
                  {/* Banner image with hover effect */}
                  <div className="relative group">
                    <Image
                      src={
                        course?.image
                          ? course.image
                          : "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"
                      }
                      alt={course?.name || "Bane"}
                      width={400}
                      height={200}
                      className="w-full h-44 object-cover rounded-t-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                    {/* User profile image */}

               <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden">
            {review.user.image ? (
            <Image
        src={review.user.image}
      alt={review.user.name}
      width={64}
      height={64}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
      <User className="w-8 h-8" />
    </div>
  )}
</div>
</div>
                  <CardContent className="p-6 flex flex-col items-center text-center mt-10">
                    {/* Username */}
                    <CardHeader className="p-0 mt-3">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {review.user.name}
                      </CardTitle>

                      {/* Highlighted course name */}
                      <p className="text-sm font-semibold text-green-700">
                        {course?.name || "Ukjent bane"}
                      </p>
                    </CardHeader>
                    {/* Separator */}
                    <hr className="my-4 border-gray-300 w-2/3 mx-auto" />

                    {/* Rating stars */}
                    <div className="flex justify-center mt-2">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <FaStar key={index} className="text-yellow-500 text-lg" />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 italic text-sm mt-4 px-4 border-l-4 border-green-500 pl-3">
                      {review.comment}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  {/* Separator */}
                  <hr className="my-4 border-gray-300 w-2/3 mx-auto" />
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