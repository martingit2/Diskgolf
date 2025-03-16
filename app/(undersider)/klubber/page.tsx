"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; // For animasjoner
import { Users, Star, MapPin, Calendar, Mail, Phone, Globe } from "lucide-react"; // Ikoner for premium-følelse

interface Club {
  id: string;
  name: string;
  location: string;
  description: string;
  established: string;
  logoUrl?: string;
  imageUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  memberships?: { id: string }[]; // Antall medlemmer
  clubNews?: { title: string; content: string; createdAt: string }[]; // Siste nyheter
}

const Klubber = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get(`/api/clubs?page=${currentPage}`);
        setClubs(response.data.clubs);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Feil ved henting av klubber:", error);
      }
    };
    fetchClubs();
  }, [currentPage]);

  // Filter clubs based on search term
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle pagination
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        DiscGolf Klubber
      </h1>

      {/* Søkefelt med fancy animasjon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4"
      >
        <input
          type="text"
          placeholder="Søk etter klubb..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 shadow-sm"
        />
      </motion.div>

      {/* Klubbkort i et grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <motion.div
              key={club.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-2xl border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-3xl transition-shadow duration-300">
                {/* Innhold */}
                <CardContent className="p-6">
                  {/* Klubbens logo og navn */}
                  <div className="flex items-center space-x-4 mb-4">
                    {club.logoUrl && (
                      <Image
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {club.name}
                    </CardTitle>
                  </div>
                  <hr className="my-3 border-t-2 border-gray-200" />

                  {/* Informasjon med ikoner */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      <p>{club.location}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-green-600" />
                      <p>Etablert: {new Date(club.established).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      <p>{club.memberships?.length || "0"} medlemmer</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-green-600" />
                      <p>{club.email || "Ingen e-post"}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      <p>{club.phone || "Ingen telefon"}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2 text-green-600" />
                      <a
                        href={club.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {club.website || "Ingen nettside"}
                      </a>
                    </div>
                  </div>

                  {/* Grønn border med italic tekst */}
                  <p className="text-gray-700 italic leading-relaxed border-l-4 border-green-500 pl-4 mt-4">
                    {club.description}
                  </p>

                  {/* Bilde i midten med premium border-layout */}
                  <div className="relative h-48 mt-6 rounded-xl overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                    {/* Subtle border with shadow */}
                    <div className="absolute inset-0 border-2 border-white/20 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)]"></div>
                    <Image
                      src={club.imageUrl || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
                      alt={club.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Knapper nederst */}
                  <div className="mt-6 flex flex-col gap-3">
                    <Link href={`/klubb/${club.id}`} passHref>
                      <Button className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition duration-300">
                        Se klubbdetaljer
                      </Button>
                    </Link>
                    <Button className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition duration-300">
                      Bli medlem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full mt-6">
            Ingen klubber funnet
          </p>
        )}
      </div>

      {/* Paginering */}
      <div className="mt-10 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                className={`py-2 px-4 rounded-lg ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "text-green-600 hover:bg-green-50"}`}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(index + 1)}
                  className={`py-2 px-4 rounded-lg ${currentPage === index + 1 ? "bg-green-600 text-white" : "text-green-600 hover:bg-green-50"}`}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={`py-2 px-4 rounded-lg ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "text-green-600 hover:bg-green-50"}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Klubber;