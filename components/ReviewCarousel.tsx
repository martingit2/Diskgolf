"use client";

import { useEffect, useState } from "react";
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

// 🌟 API Response Typing
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  courseId: string;
  user: { name: string; image?: string };
}

interface Course {
  id: string;
  name: string;
  image?: string;
}

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<{ [key: string]: Course }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await fetch("/api/reviews");
        if (!reviewsResponse.ok) throw new Error("Kunne ikke hente anmeldelser");

        const reviewData: Review[] = await reviewsResponse.json();
        setReviews(reviewData);

        // 🔹 Hent unike courseId'er og tilhørende banedata
        const uniqueCourseIds = Array.from(
          new Set(reviewData.map((review) => review.courseId))
        );

        const coursePromises = uniqueCourseIds.map(async (courseId) => {
          const courseResponse = await fetch(`/api/courses/${courseId}`);
          if (!courseResponse.ok) return null;
          return courseResponse.json();
        });

        const courseResults = await Promise.all(coursePromises);
        const courseMap = courseResults.reduce((acc, course) => {
          if (course) acc[course.id] = course;
          return acc;
        }, {} as { [key: string]: Course });

        setCourses(courseMap);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
        Nyeste bane anmeldelser
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Laster anmeldelser...</p>
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
            const course = courses[review.courseId]; // 🔹 Hent baneinfo fra courseMap

            return (
              <SwiperSlide key={review.id}>
                <Card
                  className="shadow-xl border border-gray-300 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden bg-white cursor-pointer"
                  onClick={() => router.push(`/courses/${review.courseId}`)} // 🚀 Gjør kortet klikkbart
                >
                  {/* 🔹 Banebilde øverst med skygge og hover-effekt */}
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
                    {/* 🌟 Subtil overlay-effekt ved hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                    {/* 🔹 Profilbilde over banebildet */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name}
                          width={70}
                          height={70}
                          className="rounded-full border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-4 border-white shadow-md">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col items-center text-center mt-10">
                    {/* 🔹 Brukernavn */}
                    <CardHeader className="p-0 mt-3">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {review.user.name}
                      </CardTitle>
                      {/* 🔹 Highlightet banenavn */}
                      <p className="text-sm font-semibold text-green-700">
                        {course?.name || "Ukjent bane"}
                      </p>
                    </CardHeader>

                    {/* 🔹 Stjerner */}
                    <div className="flex justify-center mt-2">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <FaStar key={index} className="text-yellow-500 text-lg" />
                      ))}
                    </div>

                    {/* 🔹 Kommentar */}
                    <p className="text-gray-700 italic text-sm mt-4 px-4 border-l-4 border-green-500 pl-3">
                      {review.comment}
                    </p>

                    {/* 🔹 Dato */}
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(review.createdAt).toLocaleDateString()}
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
}
