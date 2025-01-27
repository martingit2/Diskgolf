'use client'
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";  
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";  

interface Club {
  id: string;
  name: string;
  location: string;
  description: string;
  established: string;
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
        console.log(response.data);  // Log API response for debugging

        // Ensure you set the correct data structure here
        setClubs(response.data.clubs); // Use response.data.clubs
        setTotalPages(response.data.totalPages); // Use response.data.totalPages
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">DiscGolf Klubber</h1>

      <input
        type="text"
        placeholder="Søk etter klubb..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <ul className="mt-6 space-y-6">
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <Link key={club.id} href={`/klubb/${club.id}`}>
              <li className="p-6 border-4 bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl border-green-200 hover:shadow-2xl transition duration-300 transform hover:scale-105 cursor-pointer mb-6">
                <h2 className="text-2xl font-bold text-green-300">{club.name}</h2>
                <p className="text-gray-100 text-sm mt-2">Lokasjon: <span className="font-semibold">{club.location}</span></p>
                <p className="text-gray-100 mt-4">{club.description}</p>
                <p className="text-gray-400 text-xs mt-2">Etablert: {new Date(club.established).toLocaleDateString()}</p>
              </li>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">Ingen klubber funnet</p>
        )}
      </ul>

      {/* Pagination Controls */}
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
    </div>
  );
};

export default Klubber;
