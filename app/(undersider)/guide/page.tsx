'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";  

// Define the GuideItem type
interface GuideItem {
  id: string;
  title: string;
  content: string;
}

// Guide items data
const guideItemsData: GuideItem[] = [
  {
    id: '1',
    title: 'Hvordan kaste en frisbee',
    content: 'Kasting av en frisbee innebærer å bruke en teknikk kjent som "backhand", hvor du holder frisbeen på samme måte som du ville holdt en vanlig tennisball. For å få et riktig kast, start med å trekke armen bakover og slipp frisbeen på høyre tidspunkt for å få den til å fly rett.'
  },
  {
    id: '2',
    title: 'Hvordan velge riktig disc',
    content: 'Det finnes forskjellige typer discs for ulike kast. En driver er god for lange kast, en midrange disc er for mer presise kast, og en putter brukes for korte kast nær kurven. Begynn med en midrange disc for å få et bedre utgangspunkt.'
  },
  {
    id: '3',
    title: 'Tips for å spille på et disk golf kurs',
    content: 'Når du spiller på et disk golf kurs, er det viktig å forstå kurvens layout og navigere gjennom hindringene. Spør om kursets "par", som er antall kast som en erfaren spiller bør bruke på et hull.'
  },
  {
    id: '4',
    title: 'Håndtere værforhold på disk golf',
    content: 'Værforhold kan påvirke spillet ditt. I vindfulle forhold, prøv å bruke mer stabile disker. Hvis det regner, bruk et håndkle for å holde diskene tørre og få et bedre grep.'
  },
  {
    id: '5',
    title: 'Hva er "par" i disk golf?',
    content: 'Par i disk golf refererer til antall kast en erfaren spiller bør bruke på et hull. Hvis du fullfører hullet med færre kast, får du en birdie. Hvis du bruker flere kast, får du en bogey.'
  },
  {
    id: '6',
    title: 'Hvordan lage et riktig kast med forehand-teknikk',
    content: 'Forehand-kastet, også kjent som "sidearm", innebærer å kaste disken med hånden på en måte som ligner på en baseballkast. Denne teknikken brukes for presisjonskast og kaster på kortere avstander.'
  },
  {
    id: '7',
    title: 'Hvordan velge en frisbee',
    content: 'Frisbeene du bruker bør være tilpasset både ditt ferdighetsnivå og de forskjellige diskene du trenger for ulike situasjoner. Se etter lette disker som er lettere å kontrollere for nybegynnere.'
  },
  {
    id: '8',
    title: 'Hvordan holde styr på diskene dine',
    content: 'Bruk en disk golfbag for å oppbevare diskene dine og beskytte dem fra skade. Sørg for at diskene dine er rene og tørre før hvert kast for å få bedre ytelse.'
  },
  {
    id: '9',
    title: 'Hvordan bli bedre i disk golf',
    content: 'For å bli bedre i disk golf, tren på presisjon og kasteteknikk. Jobb på forskjellige kaststyper og forstå hvordan vinden påvirker diskene dine. Øv regelmessig for å utvikle ferdighetene dine.'
  },
  {
    id: '10',
    title: 'Hvordan score i disk golf',
    content: 'Poengsummen i disk golf er basert på antall kast du bruker for å fullføre et hull. Du får en poengsum for hvert hull, og den totale poengsummen er summen av kastene på alle hullene.'
  }
];

const Guide = () => {
  const [guideItems, setGuideItems] = useState<GuideItem[]>(guideItemsData);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(guideItemsData.length / 6));

  // Filter guide items based on search term
  const filteredGuideItems = guideItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic for 6 items per page
  const itemsPerPage = 6;
  const paginatedItems = filteredGuideItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Guide til Discgolf</h1>

      <input
        type="text"
        placeholder="Søk etter guideinnhold..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <ul className="mt-6 space-y-6">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <Link key={item.id} href={`/guide/${item.id}`}>
              <li className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                <p className="text-gray-600 mt-4">{item.content}</p>
              </li>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">Ingen guideinnhold funnet</p>
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

export default Guide;
