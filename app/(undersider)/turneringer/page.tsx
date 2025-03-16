// app/turneringer/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Tournament {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  dateTime: string;
  maxParticipants: number;
  createdAt: string;
}

const Turneringer = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`/api/tournaments?page=${currentPage}`);
        const text = await response.text(); // Hent responsen som tekst
        console.log("Response Text:", text); // Logg responsen som tekst

        if (!response.ok) {
          throw new Error("Kunne ikke hente turneringer");
        }

        const data = JSON.parse(text); // Prøv å parse responsen som JSON
        console.log("Parsed Data:", data); // Logg den parsede dataen

        if (!data.tournaments || !data.totalPages) {
          throw new Error("Ugyldig dataformat fra API-et");
        }

        setTournaments(data.tournaments);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Feil ved henting av turneringer:", error);
        toast.error(error instanceof Error ? error.message : "Ukjent feil");
      }
    };
    fetchTournaments();
  }, [currentPage]);

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">DiskGolf Turneringer</h1>

      <input
        type="text"
        placeholder="Søk etter turnering..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <ul className="mt-6 space-y-6">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <Link key={tournament.id} href={`/turnering/${tournament.id}`}>
              <li className="p-6 border-4 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl border-green-200 hover:shadow-2xl transition duration-300 transform hover:scale-105 cursor-pointer mb-6">
                <h2 className="text-2xl font-bold text-green-300">{tournament.name}</h2>
                <p className="text-gray-100 text-sm mt-2">Type: <span className="font-semibold">{tournament.type}</span></p>
                <p className="text-gray-100 text-sm mt-2">Sted: <span className="font-semibold">{tournament.location}</span></p>
                <p className="text-gray-100 text-sm mt-2">Dato: <span className="font-semibold">{new Date(tournament.dateTime).toLocaleDateString()}</span></p>
                <p className="text-gray-400 text-xs mt-2">Opprettet: {new Date(tournament.createdAt).toLocaleDateString()}</p>
              </li>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">Ingen turneringer funnet</p>
        )}
      </ul>

      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                className={`py-2 px-4 rounded-md ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "text-blue-600 hover:bg-blue-200"}`}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(index + 1)}
                  className={`py-2 px-4 rounded-md ${currentPage === index + 1 ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"}`}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={`py-2 px-4 rounded-md ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "text-blue-600 hover:bg-blue-200"}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="mt-8 text-center">
        <Link href="/turnering/ny">
          <button className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-400 transition duration-300">
            Opprett en ny turnering
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Turneringer;