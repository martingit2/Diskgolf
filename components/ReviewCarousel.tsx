/** 
 * Filnavn: ReviewCarousel.tsx
 * Beskrivelse: Karusellkomponent for visning av brukeranmeldelser av diskgolfbaner.
 * Viser anmeldelser med navn, rating, tekst og tilknyttede baner.
 * Utvikler: Martin Pettersen
 */



"use client";

import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";

// Anmeldelser med avatarer og tilknyttede baner
const reviews = [
  {
    id: 1,
    name: "Ole Hansen",
    text: "Fantastisk bane! Flotte omgivelser og utfordrende hull.",
    rating: 5,
    course: "USN BØ, Telemark",
    avatar: "/avatars/male.jpg",
  },
  {
    id: 2,
    name: "Kari Nordmann",
    text: "Veldig bra atmosfære og godt vedlikeholdt bane.",
    rating: 4,
    course: "Skogsveien DiscGolf Park",
    avatar: "/avatars/woman.jpg",
  },
  {
    id: 3,
    name: "Lars Pettersen",
    text: "God bane, passer til både nybegynnere og erfarne spillere.",
    rating: 5,
    course: "Porsgrunn DiscGolf",
    avatar: "/avatars/male2.jpg",
  },
  {
    id: 4,
    name: "Mona Jakobsen",
    text: "Fin bane med utfordrende fairways og fantastisk utsikt, anbefales!",
    rating: 3,
    course: "Drammen DiscGolf Arena",
    avatar: "/avatars/woman2.jpg",
  },
  {
    id: 5,
    name: "Erik Olsen",
    text: "Gode treningsmuligheter og hyggelig miljø.",
    rating: 5,
    course: "Oslo DiscGolf Center",
    avatar: "/avatars/male3.jpg",
  },
  {
    id: 6,
    name: "Anna Kristiansen",
    text: "Fantastisk beliggenhet, men litt for mange folk på helgene.",
    rating: 4,
    course: "Sandefjord Frisbeepark",
    avatar: "/avatars/woman3.jpg",
  },
];

export default function ReviewCarousel() {
  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      {/* Tittel for Nyeste Anmeldelser */}
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
        Nyeste anmeldelser
      </h1>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="rounded-lg border shadow-lg mt-8"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="relative p-8 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl rounded-lg border flex flex-col justify-between items-center min-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl opacity-90 rounded-lg"></div>
              <h3 className="text-2xl font-extrabold text-green-300 mb-2 relative">
                {review.course}
              </h3>
              <div className="flex justify-center mb-4 relative">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <FaStar key={index} className="text-yellow-400 text-xl" />
                ))}
              </div>
              <p className="text-lg italic text-gray-400 text-center flex-grow relative">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center mt-6 relative">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={60}
                  height={60}
                  className="avatar"
                />
                <p className="ml-4 text-lg font-semibold text-gray-100">
                  - {review.name}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
