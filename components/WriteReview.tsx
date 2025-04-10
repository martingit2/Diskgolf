/**
 * Filnavn: WriteReview.tsx
 * Beskrivelse: Komponent for å skrive og sende inn en ny anmeldelse for en spesifikk bane.
 * Inkluderer stjernevurdering, kommentarfelt og håndtering av innsending (lasting, feil, suksess).
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.
 */

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useTranslation } from 'react-i18next'; // Hook for oversettelser.

// --- StarRating Underkomponent ---
// Gjenbrukbar komponent for å velge en stjernevurdering.
function StarRating({
  rating,
  setRating,
  maxStars = 5, // Standard maks antall stjerner
}: {
  rating: number;
  setRating: (val: number) => void;
  maxStars?: number;
}) {
  const { t } = useTranslation('translation');

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const starIndex = i + 1;
        return (
          <button // Bruker <button> for bedre tilgjengelighet enn <span>
            type="button" // Hindrer utilsiktet form-innsending
            key={starIndex}
            onClick={() => setRating(starIndex)}
            className={`cursor-pointer text-2xl ${
              starIndex <= rating ? "text-yellow-500" : "text-gray-300"
            } transition-colors duration-150 hover:text-yellow-400`} // Visuell feedback ved hover
             // TODO: Vurder en mer beskrivende aria-label for hele rating-containeren, ikke bare hver stjerne
            aria-label={t('write_review.star_rating.aria_label', { count: starIndex })}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// --- Hovedkomponent: WriteReview ---
export default function WriteReview({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { t } = useTranslation('translation'); // Hook for å hente oversatte tekster

  // State-variabler for brukerinput og UI-tilstand
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false); // Styrer lasteindikator på knapp
  const [errorMsg, setErrorMsg] = useState(""); // Viser feilmelding direkte i komponenten

  // Samler oversettelsesnøkler for enklere vedlikehold
  const translationKeys = {
    title: 'write_review.title',
    rating_label: 'write_review.rating_label',
    comment_label: 'write_review.comment_label',
    comment_placeholder: 'write_review.comment_placeholder',
    submit_button: 'write_review.submit_button',
    submitting_button: 'write_review.submitting_button',
    error_no_rating: 'write_review.error_no_rating',
    error_submit_failed: 'write_review.error_submit_failed',
    error_generic: 'write_review.error_generic',
    success_message: 'write_review.success_message',
    star_rating_aria_label: 'write_review.star_rating.aria_label',
  };

  // Asynkron funksjon for å håndtere innsending av anmeldelsen
  const handleSubmit = async () => {
    // Klientside-validering: Sjekker om bruker har valgt en rating
    if (!rating) {
      const errMsg = t(translationKeys.error_no_rating);
      setErrorMsg(errMsg); // Viser feil i UI
      toast.error(errMsg); // Viser feil som toast-notifikasjon
      return; // Avbryter innsending
    }

    setLoading(true); // Aktiverer lasteindikator
    setErrorMsg(""); // Nullstiller eventuell tidligere feilmelding

    try {
      // Kaller API-endepunktet for å lagre anmeldelsen
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, comment }), // Sender data som JSON
      });

      // Håndterer feilrespons fra APIet
      if (!response.ok) {
        let specificError = t(translationKeys.error_submit_failed); // Standard feilmelding ved innsending
        try {
            // Forsøker å hente en mer spesifikk feilmelding fra API-responsen
            const errorData = await response.json();
            specificError = errorData.error || specificError;
        } catch (parseError) {
            // Ignorerer feil ved parsing av JSON, bruker standard feilmelding
        }
        throw new Error(specificError); // Kaster feil for å bli fanget av catch-blokken
      }

      // Nullstiller skjemaet og gir brukeren bekreftelse ved suksess
      setRating(0);
      setComment("");
      toast.success(t(translationKeys.success_message));
      // Trigger en refresh av data på siden for å vise den nye anmeldelsen
      // Forutsetter at siden henter data på en måte som `router.refresh()` påvirker
      router.refresh();
    } catch (error: any) {
       // Håndterer feil under fetch eller feil kastet fra API-sjekk
      const errMsg = error.message || t(translationKeys.error_generic); // Bruker generisk fallback
      setErrorMsg(errMsg); // Viser feil i UI
      toast.error(errMsg); // Viser feil som toast
    } finally {
      setLoading(false); // Deaktiverer lasteindikator uansett resultat
    }
  };

  return (
    <div className="border rounded-md p-6 shadow-lg bg-white mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {t(translationKeys.title)}
      </h3>

      {/* Seksjon for stjernevurdering */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">
          {t(translationKeys.rating_label)}
        </label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      {/* Seksjon for kommentarfelt */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">
          {t(translationKeys.comment_label)}
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t(translationKeys.comment_placeholder)}
        />
      </div>

      {/* Område for å vise feilmelding til brukeren */}
      {errorMsg && (
        <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
      )}

      {/* Knappen for å sende inn anmeldelsen */}
      <Button
        onClick={handleSubmit}
        disabled={loading} // Deaktiveres under innsending
        className="bg-gray-900 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-md shadow-md transition-all duration-300"
      >
        {/* Dynamisk tekst på knappen basert på laste-status */}
        {loading ? t(translationKeys.submitting_button) : t(translationKeys.submit_button)}
      </Button>
    </div>
  );
}