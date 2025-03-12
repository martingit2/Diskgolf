"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

interface Tournament {
  id: string;
  name: string;
  location: string;
  date: string;
  image?: string;
}

const TournamentsCarousel = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("/api/tournaments");
        if (!response.ok) throw new Error("Kunne ikke hente turneringer");

        const data: Tournament[] = await response.json();
        setTournaments(data);
      } catch (error) {
        console.error("Feil ved henting av turneringer:", error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
        Kommende <span className="text-green-600">Turneringer</span>
      </h1>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{ 640: { slidesPerView: 1 }, 1024: { slidesPerView: 2 } }}
        className="rounded-lg shadow-lg mt-8"
      >
        {tournaments.map((tournament) => (
          <SwiperSlide key={tournament.id}>
            <div
              className="relative rounded-lg group cursor-pointer overflow-hidden"
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
            >
              {/* Bilde */}
              <img
                src={tournament.image || "/default-tournament.jpg"}
                alt={tournament.name}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4">
                <h3 className="text-xl font-bold">{tournament.name}</h3>
                <p className="text-sm text-gray-300">{tournament.location}</p>
                <p className="text-xs text-gray-400">
                  {new Date(tournament.date).toLocaleDateString("no-NO")}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default TournamentsCarousel;
