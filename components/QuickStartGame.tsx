"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";

export default function QuickStartGame() {
  const router = useRouter();

  return (
    <div className="relative text-center rounded-lg overflow-hidden shadow-2xl">
      {/* Bakgrunn med overlegg */}
      <div className="absolute inset-0 bg-gray-950 opacity-90"></div>

      {/* Innhold */}
      <div className="relative z-10 p-12">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">
          Start et <span className="text-green-400">hurtigspill</span> nå!
        </h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto text-gray-300 drop-shadow-md">
          Klar for en runde? Klikk på knappen nedenfor og kom raskt i gang med en ny DiskGolf-opplevelse.
        </p>

        <Button
          onClick={() => router.push("/spill")}
          className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-10 rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <FaPlay className="animate-pulse" /> Start nå
        </Button>
      </div>

      {/* Dekorative elementer for ekstra stil */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black opacity-50"></div>
    </div>
  );
}
