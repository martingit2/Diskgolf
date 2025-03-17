'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Tournament {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  dateTime: string;
  maxParticipants: number;
  createdAt: string;
  image?: string;
}

const Turneringer = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [about, setAbout] = useState<string>("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`/api/tournaments?page=${currentPage}`);
        const text = await response.text();

        if (!response.ok) {
          throw new Error("Kunne ikke hente turneringer");
        }

        const data = JSON.parse(text);

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

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Vennligst fyll inn både navn og e-post før du sender forespørselen.");
      return;
    }

    const registrationData = {
      tournament: selectedTournament,
      name,
      email,
      about,
    };

    console.log("Sending registration:", registrationData);
    alert("Din registrering er sendt!");

    setName("");
    setEmail("");
    setAbout("");
    setSelectedTournament(null);
  };

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

      <div className="mt-6 space-y-6">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="p-6 border-4 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl border-green-200 hover:shadow-2xl transition duration-300 transform hover:scale-105 cursor-pointer mb-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={
                      tournament.image ||
                      "https://res.cloudinary.com/dmuhg7btj/image/upload/v1742194308/discgolf/courses/file_umrb0p.webp"
                    }
                    alt={tournament.name}
                    width={300}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-300">{tournament.name}</h2>
                  <p className="text-gray-100 text-sm mt-2">
                    <strong>Type:</strong> {tournament.type}
                  </p>
                  <p className="text-gray-100 text-sm mt-2">
                    <strong>Sted:</strong> {tournament.location}
                  </p>
                  <p className="text-gray-100 text-sm mt-2">
                    <strong>Dato:</strong> {new Date(tournament.dateTime).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    <strong>Opprettet:</strong> {new Date(tournament.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-4 text-gray-200">{tournament.description}</p>
                  <div className="mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 transition duration-300"
                          onClick={() => setSelectedTournament(tournament.name)}
                        >
                          Registrer deg
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Meld deg på {selectedTournament}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <Input
                            placeholder="Ditt navn"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                          <Input
                            placeholder="Din e-post"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <Textarea
                            placeholder="Fortell litt om deg selv..."
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                          />
                          <Button className="w-full" onClick={handleSubmit}>
                            Send registrering
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">Ingen turneringer funnet</p>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                className={`py-2 px-4 rounded-md ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "text-blue-600 hover:bg-blue-200"
                }`}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(index + 1)}
                  className={`py-2 px-4 rounded-md ${
                    currentPage === index + 1 ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={`py-2 px-4 rounded-md ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "text-blue-600 hover:bg-blue-200"
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="mt-8 text-center">
        <Link href="/turnering/ny">
          <Button className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-400 transition duration-300">
            Opprett en ny turnering
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Turneringer;
