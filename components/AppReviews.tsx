/**
 * Filnavn: AppReviews.tsx
 * Beskrivelse: Viser en seksjon med brukeranmeldelser hentet fra en Zustand store.
 * Håndterer lasting, feil og tom tilstand. Bruker et statisk kart for avatarbilder.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.
 */

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import "swiper/css"; // Antas å være for en annen del av appen, men beholdes hvis nødvendig globalt.
import useReviewsStore from "@/app/stores/useAppReviewStore"; // Zustand store for anmeldelser.
import { useTranslation } from 'react-i18next'; // Hook for oversettelser.

// Statisk mapping av brukernavn til avatar-URLer.
const avatarMap: { [key: string]: string } = {
  "Sofie A.": "https://randomuser.me/api/portraits/women/44.jpg",
  "Camilla E.": "https://randomuser.me/api/portraits/women/62.jpg",
  "Elise M.": "https://randomuser.me/api/portraits/women/18.jpg",
  "Thomas R.": "https://randomuser.me/api/portraits/men/32.jpg",
  "Jonas H.": "https://randomuser.me/api/portraits/men/56.jpg",
  "Markus W.": "https://randomuser.me/api/portraits/men/73.jpg",
};

const AppReviews = () => {
  // Henter tilstand og handlinger fra review store.
  const { reviews, loading, error, fetchReviews } = useReviewsStore();
  // Henter oversettelsesfunksjon.
  const { t } = useTranslation('translation');

  // Nøkler for oversettelser brukt i denne komponenten.
  const translationKeys = {
    title: 'app_reviews.title',
    loading: 'app_reviews.loading',
    error_generic: 'app_reviews.error_generic', // Fallback feilmelding
    empty: 'app_reviews.empty',
    avatar_alt_prefix: 'app_reviews.avatar_alt_prefix',
    avatar_alt_fallback: 'app_reviews.avatar_alt_fallback'
  };

  useEffect(() => {
    // Fetch reviews when the component mounts
    // Unngår unødvendig henting hvis data allerede finnes eller laster.
    if (reviews.length === 0 && !loading && !error) {
        fetchReviews();
    }
  }, [fetchReviews, reviews.length, loading, error]); // Avhengigheter for useEffect

  return (
    <section className="max-w-7xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-extrabold text-gray-900 leading-tight text-center">
        {/* Oversatt tittel */}
        {t(translationKeys.title)}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 mt-8">{t(translationKeys.loading)}</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-8">{error || t(translationKeys.error_generic)}</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">{t(translationKeys.empty)}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center"
            >
              <Image
                src={review.username in avatarMap ? avatarMap[review.username] : "https://randomuser.me/api/portraits/lego/5.jpg"}
                alt={`${t(translationKeys.avatar_alt_prefix)} ${review.username || t(translationKeys.avatar_alt_fallback)}`}
                width={60}
                height={60}
                className="rounded-full border-2 border-gray-300 shadow-md"
                unoptimized={true} // <--- NÅ ER DETTE EN FORNUFTIG ENDRING
              />

              <p className="text-lg font-semibold text-gray-800 mt-3">{review.username || t('common.anonymous_user', 'Anonym')}</p>
              {review.role && <p className="text-sm text-green-700">{review.role}</p>}

              <div className="flex justify-center mt-2">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <FaStar
                    key={starIndex}
                    className={`text-lg ${starIndex < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="text-gray-700 italic mt-4 px-4">{`"${review.comment}"`}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AppReviews;