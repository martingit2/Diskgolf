/** 
 * Filnavn: ReviewForm.tsx
 * Beskrivelse: Komponent for å la brukere sende inn anmeldelser av en discgolfbane. 
 *              Inkluderer stjernevurdering, tekstfelt for kommentarer og en dialogbasert modal for innsending.
 * Funksjonalitet:
 *   - Lar brukere gi en vurdering fra 1 til 5 stjerner.
 *   - Sender anmeldelsen til API-et (/api/reviews) ved innsending.
 *   - Viser feilmeldinger hvis innsendingen mislykkes.
 *   - Lukker modalen automatisk ved vellykket innsending.
 * Utvikler: Said Hussain Khawajazada
 */


"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export default function ReviewForm({ courseId, totalReviews, averageRating = 0 }: { courseId: string; totalReviews: number; averageRating?: number }) {

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false); // ✅ Controls modal visibility

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
          comment: comment || "", // Ensure no `null` values
        }),
      });
  
      let result;
            try {
            result = await response.json();
            } catch (err) {
            console.error("❌ Kunne ikke parse serverrespons:", err);
            setError("Ugyldig svar fra serveren. Er du logget inn?");
            return;
            }

            if (!response.ok) {
            setError(result?.error || "Kunne ikke sende inn anmeldelsen. Logg inn og prøv igjen.");
            return;
            }

  
      setRating(0);
      setComment("");
      alert("✅ Anmeldelse sendt!");
      setIsOpen(false); // ✅ Close the modal after submission
    } catch (err) {
        console.error("❌ Error submitting review:", err);
      
        // ✅ Ensure `err` is treated as an Error object
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ukjent feil oppstod. Prøv igjen."); // ✅ Fallback message for unknown errors
        }
      }
       finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <>
      {/* ⭐ Trigger: Clicking on stars opens modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(true)}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.round(averageRating) ? "text-yellow-500" : "text-gray-300"}>
                ★
            </span>
            ))}

            <span className="text-gray-600 text-sm">
                {totalReviews > 0 ? `(${totalReviews} anmeldelser)` : "(Skriv anmeldelse)"}
            </span>

          </div>
        </DialogTrigger>

        {/* 📌 Modal Content */}
        <DialogContent className="p-6 rounded-lg">
            <DialogTitle className="text-lg font-semibold">Skriv en anmeldelse</DialogTitle>

          {/* ⭐ Star Rating Input */}
          <div className="flex space-x-2 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          {/* 📝 Comment Input */}
          <textarea
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Skriv en kommentar (valgfritt)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* 📌 Submit Button */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-3 w-full disabled:bg-gray-400"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Sender inn..." : "Send inn anmeldelse"}
          </button>

          {/* ❌ Error Message */}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
