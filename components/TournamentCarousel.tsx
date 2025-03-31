"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string;
  course: {
    id: string;
    name: string;
    location: string;
    image?: string;
  };
  organizer: {
    id: string;
    name: string;
  };
  _count: {
    participants: number;
  };
  maxParticipants: number | null;
}

const TournamentsCarousel = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments/featured');
        if (!response.ok) throw new Error('Failed to fetch tournaments');
        const data = await response.json();
        setTournaments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Laster turneringer...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        <div className="h-96 flex items-center justify-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  if (tournaments.length === 0) {
    return (
      <section className="max-w-7xl mx-auto p-6 mt-20">
        <div className="h-96 flex items-center justify-center text-gray-500">
          Ingen kommende turneringer
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20 relative">
      {/* Section header with subtle animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-end mb-8"
      >
        <div>
          <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
            DiskGolf Turneringer
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Kommende Arrangementer
          </h1>
        </div>
        <Button
          variant="ghost"
          className="text-green-600 hover:bg-green-50 group"
          onClick={() => router.push('/tournaments')}
        >
          Se alle turneringer
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      {/* Premium carousel */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          pagination={{
            clickable: true,
            el: '.tournament-pagination',
            bulletClass: 'w-2 h-2 rounded-full bg-gray-300 mx-1 inline-block transition-all',
            bulletActiveClass: 'w-20 bg-green-600'
          }}
          navigation={{
            nextEl: '.tournament-next',
            prevEl: '.tournament-prev',
          }}
          spaceBetween={0}
          slidesPerView={1}
          className="rounded-xl overflow-hidden shadow-2xl"
        >
          {tournaments.map((tournament) => {
            const startDate = new Date(tournament.startDate);
            const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
            
            const participantsText = tournament.maxParticipants 
              ? `${tournament._count.participants}/${tournament.maxParticipants}`
              : `${tournament._count.participants}`;

            return (
              <SwiperSlide key={tournament.id}>
                <div className="relative aspect-video w-full h-[500px]">
                  {/* Background image with overlay */}
                  <div className="absolute inset-0">
                    <Image
                      src={tournament.course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
                      alt={tournament.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div 
                    className="relative h-full flex flex-col justify-end p-8 text-white cursor-pointer"
                    onClick={() => router.push(`/tournament/${tournament.id}`)}
                  >
                    {/* Date badge */}
                    <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                      <div className="text-sm font-medium">
                        {startDate.toLocaleDateString('no-NO', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                        {endDate && (
                          <>
                            <span className="mx-1">-</span>
                            {endDate.toLocaleDateString('no-NO', { 
                              day: 'numeric', 
                              month: endDate.getMonth() !== startDate.getMonth() ? 'short' : undefined 
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tournament info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-4xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                        {tournament.description || `Turnering på ${tournament.course.name}`}
                      </p>

                      <Button 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700 mb-6"
                      >
                        Vis påmeldingsinfo
                      </Button>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-green-400" />
                          <span>{tournament.course.name}, {tournament.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-green-400" />
                          <span>{participantsText} deltakere</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-green-400" />
                          <span>Arrangør: {tournament.organizer.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Combined navigation and pagination container */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end">
          {/* Navigation buttons */}
          <div className="flex space-x-4">
            <button className="tournament-prev bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/20 transition-all">
              <ChevronRight className="h-5 w-5 text-white rotate-180" />
            </button>
            <button className="tournament-next bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/20 transition-all">
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
          
          {/* Pagination - placed below navigation buttons, just shifted a bit to the right */}
          <div className="tournament-pagination translate-x-2" />
        </div>
      </div>
    </section>
  );
};

export default TournamentsCarousel;
