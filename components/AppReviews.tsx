"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import "swiper/css";

// 📌 Midlertidig testdata for app-anmeldelser
const testReviews = [
  {
    id: "1",
    username: "Sofie A.",
    comment: "En fantastisk app! Intuitivt grensesnitt og flott design. Perfekt for både nybegynnere og erfarne spillere!",
    rating: 5,
    role: "DiskGolf-entusiast",
  },
  {
    id: "2",
    username: "Thomas R.",
    comment: "Flott app, men jeg skulle ønske den hadde mer detaljert statistikk for hver runde jeg spiller.",
    rating: 4,
    role: "Turneringsspiller",
  },
  {
    id: "3",
    username: "Camilla E.",
    comment: "Beste DiskGolf-app jeg har prøvd! Detaljerte kart, enkel baneoversikt og gode analyser. 10/10!",
    rating: 5,
    role: "Erfaren diskgolfspiller",
  },
  {
    id: "4",
    username: "Jonas H.",
    comment: "Gode funksjoner, enkelt å spille men savner flere innstillinger.",
    rating: 3,
    role: "Casual spiller",
  },
  {
    id: "5",
    username: "Elise M.",
    comment: "Elsker hvordan appen samler alle mine runder og gir en full oversikt over prestasjonene mine!",
    rating: 5,
    role: "Proff diskgolfutøver",
  },
  {
    id: "6",
    username: "Markus W.",
    comment: "Veldig nyttig app for å finne baner, men jeg savner en turneringsmodus.",
    rating: 4,
    role: "Aktiv klubbspiller",
  },
];

// 📌 Avatarer basert på kjønn (hentes fra `randomuser.me`)
const avatarMap: { [key: string]: string } = {
  "Sofie A.": "https://randomuser.me/api/portraits/women/44.jpg",
  "Camilla E.": "https://randomuser.me/api/portraits/women/62.jpg",
  "Elise M.": "https://randomuser.me/api/portraits/women/18.jpg",
  "Thomas R.": "https://randomuser.me/api/portraits/men/32.jpg",
  "Jonas H.": "https://randomuser.me/api/portraits/men/56.jpg",
  "Markus W.": "https://randomuser.me/api/portraits/men/73.jpg",
};

const AppReviews = () => {
  const [reviews, setReviews] = useState(testReviews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // 🚀 Når API er klart, bytt ut med faktisk fetch()
        setReviews(testReviews);
      } catch (error) {
        console.error("Feil ved henting av anmeldelser:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight text-center">
        Hva sier brukerne våre om oss?
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Laster anmeldelser...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500">Ingen anmeldelser funnet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center"
            >
              {/* 🔹 Avatar */}
              <Image
                src={avatarMap[review.username] || "https://randomuser.me/api/portraits/lego/5.jpg"} // Standard avatar hvis navn ikke finnes
                alt={review.username}
                width={60}
                height={60}
                className="rounded-full border-2 border-gray-300 shadow-md"
              />

              {/* 🔹 Brukernavn & rolle */}
              <p className="text-lg font-semibold text-gray-800 mt-3">{review.username}</p>
              <p className="text-sm text-green-700">{review.role}</p>

              {/* 🔹 Stjerner */}
              <div className="flex justify-center mt-2">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <FaStar
                    key={starIndex}
                    className={`text-lg ${
                      starIndex < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* 🔹 Kommentar */}
              <p className="text-gray-700 italic mt-4 px-4">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AppReviews;
