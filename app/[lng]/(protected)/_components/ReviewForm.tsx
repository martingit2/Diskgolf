// Utviklere Martin og Said
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

// 1. Oppdater props-typen til å inkludere 'size' (valgfri)
type ReviewFormProps = {
  courseId: string;
  totalReviews: number;
  averageRating?: number;
  size?: 'small' | 'default'; // Gjør 'size' valgfri, med spesifikke verdier
};

export default function ReviewForm({
  courseId,
  totalReviews,
  averageRating = 0,
  size = 'default' // 2. Sett en standardverdi for 'size'
}: ReviewFormProps) {

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          rating,
          comment: comment || "",
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (err) {
        console.error("❌ Kunne ikke parse serverrespons:", err);
        setError("Ugyldig svar fra serveren. Er du logget inn?");
        setIsSubmitting(false); // Stopp submitting her
        return;
      }

      if (!response.ok) {
        setError(result?.error || "Kunne ikke sende inn anmeldelsen. Logg inn og prøv igjen.");
        setIsSubmitting(false); // Stopp submitting her
        return;
      }

      setRating(0);
      setComment("");
      alert("✅ Anmeldelse sendt!");
      setIsOpen(false); // Lukk modalen
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent feil oppstod. Prøv igjen.");
      }
    } finally {
      // Sikrer at isSubmitting alltid settes til false til slutt
       if (isSubmitting) { // Sjekk for å unngå unødvendig state-oppdatering
          setIsSubmitting(false);
       }
    }
  };

  // 3. Bruk 'size' til å justere klasser
  const triggerTextSize = size === 'small' ? 'text-xs' : 'text-sm';
  const triggerStarSize = size === 'small' ? 'text-base' : 'text-lg'; // Bruk text-størrelse for stjerner
  const modalTitleSize = size === 'small' ? 'text-md' : 'text-lg';
  const modalStarSize = size === 'small' ? 'text-xl' : 'text-2xl';
  const buttonPadding = size === 'small' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  const errorTextSize = size === 'small' ? 'text-xs' : 'text-sm';


  return (
    <>
      {/* Trigger */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {/* Bruk betingede klasser for trigger */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsOpen(true)}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`${i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-300"} ${triggerStarSize}`}>
                ★
            </span>
            ))}
            <span className={`text-gray-600 ${triggerTextSize}`}>
                {totalReviews > 0 ? `(${totalReviews})` : "(Skriv anm.)"} {/* Forkortet tekst for small */}
            </span>
          </div>
        </DialogTrigger>

        {/* Modal Content */}
        <DialogContent className="p-4 rounded-lg max-w-sm"> {/* Litt mindre padding/bredde */}
            {/* Bruk betinget klasse for tittel */}
            <DialogTitle className={`${modalTitleSize} font-semibold`}>Skriv en anmeldelse</DialogTitle>

          {/* Star Rating Input */}
          {/* Bruk betinget klasse for stjerner */}
          <div className="flex space-x-1 my-2 justify-center"> {/* Sentrer stjerner */}
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer ${modalStarSize} ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          {/* Comment Input */}
          <textarea
            className={`w-full p-2 border rounded-md ${triggerTextSize}`} // Bruk samme tekststørrelse som trigger
            rows={size === 'small' ? 2 : 3} // Færre rader for small
            placeholder="Kommentar (valgfritt)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Submit Button */}
          {/* Bruk betinget klasse for padding/tekststørrelse */}
          <button
            className={`bg-blue-500 text-white rounded mt-2 w-full disabled:bg-gray-400 ${buttonPadding}`}
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Sender..." : "Send inn"} {/* Kortere tekst */}
          </button>

          {/* Error Message */}
          {/* Bruk betinget klasse for tekststørrelse */}
          {error && <p className={`text-red-500 mt-1.5 ${errorTextSize}`}>{error}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}