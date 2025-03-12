"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

function StarRating({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (val: number) => void;
}) {
  const maxStars = 5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const starIndex = i + 1;
        return (
          <span
            key={starIndex}
            onClick={() => setRating(starIndex)}
            className={`cursor-pointer text-2xl ${
              starIndex <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function WriteReview({ courseId }: { courseId: string }) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!rating) {
      setErrorMsg("Vennligst velg en vurdering (1–5 stjerner).");
      toast.error("Vennligst velg en vurdering (1–5 stjerner).");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke lagre anmeldelsen.");
      }

      // Tøm inputfeltene ved suksess
      setRating(0);
      setComment("");
      toast.success("Anmeldelsen ble sendt inn!");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Noe gikk galt.");
      toast.error(error.message || "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-6 shadow-lg bg-white mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Skriv en anmeldelse
      </h3>

      {/* Vurdering */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">
          Din vurdering:
        </label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      {/* Kommentar */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">
          Din kommentar (valgfritt):
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Fortell hva du likte/ikke likte..."
        />
      </div>

      {/* Feilmelding */}
      {errorMsg && (
        <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
      )}

      {/* Send-knapp */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-gray-900 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-md shadow-md transition-all duration-300"
      >
        {loading ? "Sender..." : "Send inn anmeldelse"}
      </Button>
    </div>
  );
}
