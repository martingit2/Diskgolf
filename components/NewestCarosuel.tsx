"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Definerer typen for Course (baner)
interface Course {
  id: string;
  name: string;
  location: string;
  image?: string;
  createdAt: string;
  averageRating?: number; // Gjennomsnittsrating (kan være undefined)
  totalReviews?: number; // Antall anmeldelser (kan være undefined)
}

const NyesteBanerCarousel = () => {
  const [newestCourses, setNewestCourses] = useState<Course[]>([]);
  const router = useRouter(); // Bruker Next.js sin router for navigasjon

  useEffect(() => {
    const fetchNewestCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente data");

        const data: Course[] = await response.json();

        // Sorter etter `createdAt` (nyeste først)
        const sortedCourses = data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8); // Henter kun de 8 nyeste banene

        setNewestCourses(sortedCourses);
      } catch (error) {
        console.error("Feil ved henting av baner:", error);
      }
    };

    fetchNewestCourses();
  }, []);

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
          renderBullet: (index, className) => `<span class="${className} bg-blue-600"></span>`,
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
          const rating = Math.round(course.averageRating || 0); // Sikrer at vi alltid har en verdi
          const totalReviews = course.totalReviews || 0;

          return (
            <SwiperSlide key={course.id}>
              <div
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)} // Navigerer til banens side
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

                {/* 🏷 Tekst */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent text-white p-4">
                  <div className="bg-black bg-opacity-70 p-2 rounded">
                    <h3 className="text-xl font-semibold">{course.name}</h3>
                    <p className="text-sm text-gray-300">{course.location}</p>
                    <p className="text-xs text-gray-400">
                      Lagt til: {new Date(course.createdAt).toLocaleDateString("no-NO")}
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
