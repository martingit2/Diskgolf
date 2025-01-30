'use client'

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Guide items data
const guideItemsData = [
  {
    id: '1',
    title: 'Hvordan kaste en frisbee',
    content: 'Lær grunnleggende kasteteknikker som backhand og forehand for å få presise kast.',
    image: '/guideBilder/kast-frisbee.webp',
    link: 'https://www.wikihow.com/Throw-a-Frisbee'
  },
  {
    id: '2',
    title: 'Hvordan velge riktig disc',
    content: 'Forstå forskjellen mellom drivere, midrange og puttere for å forbedre spillet ditt.',
    image: '/guideBilder/riktig-disk.webp',
    link: 'https://discgolfoutlet.com/page/12/disc-selection-guide'
  },
  {
    id: '3',
    title: 'Spillestrategier og teknikker',
    content: 'Oppdag hvordan du kan navigere på en bane og velge de beste kastene for ulike situasjoner.',
    image: '/guideBilder/disc-golf-navigation.jpg',
    link: 'https://noodlearmdiscgolf.com/beginner-tips/'
  },
  {
    id: '4',
    title: 'Håndtering av værforhold',
    content: 'Lær hvordan du justerer spillet ditt i vind, regn og ulike terrengforhold.',
    image: '/guideBilder/weather-strategy.jpg',
    link: 'https://www.pdga.com/weather-strategies'
  },
  {
    id: '5',
    title: 'Hvordan trene for å bli bedre',
    content: 'Øvelser for å forbedre presisjon, kraft og teknikk.                ',
    image: '/guideBilder/training-discgolf.jpg',
    link: 'https://www.discgolfunited.com/training-tips'
  },
  {
    id: '6',
    title: 'Hvordan lage et riktig kast med forehand-teknikk',
    content: 'Forehand-kastet, også kjent som "sidearm", innebærer å kaste disken med hånden på en måte som ligner på en baseballkast.',
    image: '/guideBilder/forehand-throw.jpg', 
    link: 'https://www.wikihow.com/Throw-a-Frisbee-Sidearm' 
  },
  {
    id: '7',
    title: 'Hvordan velge en frisbee',
    content: 'Frisbeene du bruker bør være tilpasset både ditt ferdighetsnivå og de forskjellige diskene du trenger for ulike situasjoner. Se etter lette disker som er lettere å kontrollere for nybegynnere.',
    image: '/guideBilder/selecting-disc-golf.jpg', 
    link: 'https://www.udisc.com/blog/post/how-to-choose-the-right-disc-golf-disc' 
  },
  {
    id: '8',
    title: 'Hvordan holde styr på diskene dine',
    content: 'Bruk en disk golfbag for å oppbevare diskene dine og beskytte dem fra skade. Sørg for at diskene dine er rene og tørre før hvert kast for å få bedre ytelse.',
    image: '/guideBilder/disc-bag-organization.jpg', 
    link: 'https://discgolfunited.com/disc-golf-bag-guide' 
  },{
    id: '9',
    title: 'Hvordan bli bedre i disk golf',
    content: 'For å bli bedre i disk golf, tren på presisjon og kasteteknikk. Jobb på forskjellige kaststyper og forstå hvordan vinden påvirker diskene dine. Øv regelmessig for å utvikle ferdighetene dine.',
    image: '/guideBilder/disc-golf-training-practice.jpg',
    link: 'https://www.discgolfunited.com/training-tips' 
  }  
  
];

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set how many items to show per page

  // Filter items based on search input
  const filteredGuideItems = guideItemsData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredGuideItems.length / itemsPerPage);

  // Get items for the current page
  const paginatedItems = filteredGuideItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Guide til Discgolf 🥏
      </h1>

      <input
        type="text"
        placeholder="Søk etter guideinnhold..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset to first page on new search
        }}
        className="mb-6 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      {/* Render the guide items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              {item.image && (
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  width={600} 
                  height={400} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                <p className="text-gray-600 mt-2">{item.content}</p>

                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline mt-3 block"
                  >
                    Lær mer her →
                  </a>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4 col-span-3">Ingen guideinnhold funnet</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 text-white rounded-md ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            ← Forrige
          </button>
          
          <span className="text-gray-700 text-lg">
            Side {currentPage} av {totalPages}
          </span>

          <button 
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 text-white rounded-md ${currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            Neste →
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
