"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const BaneCarousel = () => {
  const images = [
    { src: "/dummybaner/dummy_bane_1.webp", title: "USN BØ, Telemark", address: "Gullbringvegen 36, Bø", stars: 5 },
    { src: "/dummybaner/dummy_bane_2.webp", title: "Skogsveien DiscGolf Park", address: "Skogsveien 15, Skien", stars: 4 },
    { src: "/dummybaner/dummy_bane_3.webp", title: "Porsgrunn DiscGolf", address: "Fjellveien 10, Porsgrunn", stars: 3 },
    { src: "/dummybaner/dummy_bane_4.webp", title: "Drammen DiscGolf Arena", address: "Parkveien 22, Drammen", stars: 5 },
    { src: "/dummybaner/dummy_bane_5.webp", title: "Oslo DiscGolf Center", address: "Karl Johans gate 5, Oslo", stars: 4 },
    { src: "/dummybaner/dummy_bane_6.webp", title: "Sandefjord Frisbeepark", address: "Havna 4, Sandefjord", stars: 4 },
    { src: "/dummybaner/dummy_bane_7.webp", title: "Larvik DiscGolf Club", address: "Torget 8, Larvik", stars: 5 },
    { src: "/dummybaner/dummy_bane_8.webp", title: "Tønsberg DiscGolf", address: "Slottsfjellveien 1, Tønsberg", stars: 3 },
  ];

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
        Topprangerte DiskGolf-baner
      </h1>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => `<span class="${className} bg-green-600"></span>`,
        }}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="rounded-lg shadow-lg mt-8" // Forbedret avstand mellom overskrift og karusell
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative overflow-hidden rounded-lg group">
              {/* Stjerner øverst til høyre */}
              <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-70 text-yellow-400 rounded-full px-2 py-1 flex items-center space-x-1">
                {Array.from({ length: image.stars }, (_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                  >
                    <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
                  </svg>
                ))}
              </div>

              {/* Bilde */}
              <Image
                src={image.src}
                alt={image.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Tekst */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent text-white p-4">
                <div className="bg-black bg-opacity-70 p-2 rounded">
                  <h3 className="text-xl font-semibold">{image.title}</h3>
                  <p className="text-sm text-gray-300">{image.address}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default BaneCarousel;
