"use client";

import { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import "swiper/css";
import useReviewsStore from "@/app/stores/useAppReviewStore";

// Avatar map for users
const avatarMap: { [key: string]: string } = {
  "Sofie A.": "https://randomuser.me/api/portraits/women/44.jpg",
  "Camilla E.": "https://randomuser.me/api/portraits/women/62.jpg",
  "Elise M.": "https://randomuser.me/api/portraits/women/18.jpg",
  "Thomas R.": "https://randomuser.me/api/portraits/men/32.jpg",
  "Jonas H.": "https://randomuser.me/api/portraits/men/56.jpg",
  "Markus W.": "https://randomuser.me/api/portraits/men/73.jpg",
};

const AppReviews = () => {
  // Access the state and actions from the zustand store
  const { reviews, loading, error, fetchReviews } = useReviewsStore();

  useEffect(() => {
    // Fetch reviews when the component mounts
    fetchReviews();
  }, [fetchReviews]);

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-800 leading-tight text-center">
        Hva sier brukerne våre om oss?
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Laster anmeldelser...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
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
                src={review.username in avatarMap ? avatarMap[review.username] : "https://randomuser.me/api/portraits/lego/5.jpg"}
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
                    className={`text-lg ${starIndex < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              {/* 🔹 Kommentar */}
              <p className="text-gray-700 italic mt-4 px-4">{`"${review.comment}"`}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AppReviews;
