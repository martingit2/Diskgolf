"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export default function ReviewForm({ courseId, totalReviews }: { courseId: string; totalReviews: number }) {

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
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke sende inn anmeldelsen.");
      }

      setRating(0);
      setComment("");
      alert("Anmeldelse sendt!");
      setIsOpen(false); // ✅ Close the modal after submission
    } catch (err) {
      setError("Det oppstod en feil. Prøv igjen.");
    } finally {
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
              <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
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
