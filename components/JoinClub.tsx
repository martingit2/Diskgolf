"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function JoinClub() {
  const router = useRouter();

  return (
    <div className="relative text-center rounded-lg overflow-hidden shadow-2xl">
      {/* Bakgrunn med overlegg */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl"></div>

      {/* Innhold */}
      <div className="relative z-10 p-12 text-center">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">
          Bli med i en <span className="text-green-400">DiskGolf-klubb</span>!
        </h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto text-gray-300 drop-shadow-md">
          Knytt deg til et fellesskap, delta i turneringer, og få eksklusive fordeler.  
          Finn en klubb nær deg og bli en del av det voksende DiskGolf-miljøet!  
        </p>

        {/* CTA Knapp */}
        <Button
          onClick={() => router.push("/klubber")}
          className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-10 rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <Users className="w-6 h-6" /> Finn en klubb
        </Button>
      </div>

      {/* Dekorative elementer for ekstra stil */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black opacity-50"></div>
    </div>
  );
}
