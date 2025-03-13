"use client";

import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import useCarouselStore from "@/app/stores/useCarosuellStore"; // Importer Zustand-storen for karusellen
import { useRouter } from "next/navigation";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const NyesteBanerCarousel = () => {
  const { newestCourses, fetchNewestCourses, loading, error } = useCarouselStore(); // Bruk Zustand-storen for å hente dataene
  const router = useRouter();

  useEffect(() => {
    if (newestCourses.length === 0 && !loading) {
      fetchNewestCourses(); // Hent nyeste baner hvis de ikke er hentet fra før
    }
  }, [newestCourses, fetchNewestCourses, loading]);

  if (loading) {
    return <p>Laster nyeste baner...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
        Nyeste DiskGolf-baner
      </h1>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index: number, className: string) => (
            // Return a string that represents the bullet, you can still add styles
            `<span class="${className} bg-blue-600"></span>`
          ),
        }}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="rounded-lg shadow-lg mt-8"
      >
        {newestCourses.map((course) => {
          const rating = Math.round(course.averageRating ?? 0);
          const totalReviews = course.totalReviews ?? 0;

          return (
            <SwiperSlide key={course.id}>
              <div
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                {/* ⭐ Stjerner øverst til høyre */}
                <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-70 text-yellow-400 rounded-full px-2 py-1 flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={i < rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-400"}`}
                    >
                      <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
                    </svg>
                  ))}
                  {totalReviews > 0 && (
                    <span className="text-white text-xs ml-1">
                      ({totalReviews})
                    </span>
                  )}
                </div>

                {/* 📸 Bilde */}
                <Image
                  src={course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
                  alt={course.name}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Tekst */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent text-white p-4">
                  <div className="bg-black bg-opacity-70 p-2 rounded">
                    <h3 className="text-xl text-green-300 font-semibold">{course.name}</h3>
                    <p className="text-sm text-gray-300">{course.location}</p>
                    <p className="text-xs text-gray-400">
                      Lagt til: {course.createdAt ? new Date(course.createdAt).toLocaleDateString("no-NO") : "Ukjent dato"}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default NyesteBanerCarousel;
