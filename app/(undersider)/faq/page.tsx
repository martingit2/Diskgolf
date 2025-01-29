'use client'
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Sample FAQ data (replace this with dynamic data later)
const sampleFAQs = [
  { id: '1', question: 'Hva er frisbeegolf?', answer: 'Frisbeegolf er et spill som ligner på tradisjonell golf, men i stedet for å bruke køller og en ball, kaster spillerne en frisbee mot et målkurv. Målet er å fullføre hver bane med færrest mulig kast.' },
  { id: '2', question: 'Hvordan kommer jeg i gang med frisbeegolf?', answer: 'For å komme i gang trenger du en frisbee, som kan kjøpes i en lokal frisbeegolfbutikk eller på nett. Mange parker har frisbeegolfbaner, så finn en i nærheten og prøv det. Det er en flott utendørsaktivitet for alle ferdighetsnivåer.' },
  { id: '3', question: 'Hva slags utstyr trenger jeg for frisbeegolf?', answer: 'Som et minimum trenger du en frisbee. De fleste spillere starter med en driver, en midrange og en putter. Du kan også ha behov for en bag til å bære diskene dine og et håndkle for å tørke dem.' },
  { id: '4', question: 'Hva er de grunnleggende reglene for frisbeegolf?', answer: 'De grunnleggende reglene ligner på tradisjonell golf. Spillerne starter fra utslagsfeltet, kaster en frisbee mot kurven og prøver å fullføre banen med færrest mulig kast. Banen består av flere hull, vanligvis 18.' },
  { id: '5', question: 'Er frisbeegolf en god sport for nybegynnere?', answer: 'Ja! Frisbeegolf er nybegynnervennlig og kan nytes av folk på alle ferdighetsnivåer. Start med noen få grunnleggende disker og øv på en lokal bane.'},
  { id: '6', question: 'Hvor lang tid tar en runde frisbeegolf?', answer: 'En runde frisbeegolf tar vanligvis mellom 1,5 og 3 timer, avhengig av banens vanskelighetsgrad, antall spillere og deres ferdighetsnivåer.'},
  { id: '7', question: 'Hva er en frisbeegolfbane?',answer: 'En frisbeegolfbane er en utendørs bane som består av en serie med "hull" (vanligvis 9 eller 18). Hvert hull har et utslagsfelt, en målkurv og ulike hindringer som trær, vann og bakker.'},
  { id: '8', question: 'Hvilke typer disker brukes i frisbeegolf?', answer: 'Det finnes tre hovedtyper disker i frisbeegolf: drivere (for lange kast), midrange-disker (for mer kontrollerte kast) og puttere (for korte, presise kast nær kurven).'},
  { id: '9', question: 'Kan jeg spille frisbeegolf på hvilken som helst golfbane?',
    answer: 'Nei, frisbeegolf spilles vanligvis på dedikerte frisbeegolfbaner. Noen tradisjonelle golfbaner kan tilby frisbeegolf, men det er best å finne en bane som er spesifikt designet for frisbeegolf.'
  },
  { id: '10', question: 'Hva er fordelene med å spille frisbeegolf?',
    answer: 'Frisbeegolf gir både fysisk trening og mental stimulering. Det kan være en morsom og sosial aktivitet, samtidig som du forbedrer kasteteknikken, nøyaktigheten og den strategiske tenkningen din.'
  },
  { id: '11', question: 'Hvordan holder jeg diskene mine i god stand?',
    answer: 'For å holde diskene dine i god stand, unngå å la dem ligge ute i ekstremt vær (varme, kulde eller våte forhold). Oppbevar dem i en bag og rengjør dem regelmessig for å fjerne smuss og rusk.'
  },
  { id: '12', question: 'Hvordan vet jeg hvilken disk jeg skal kaste?',
    answer: 'Å velge riktig disk avhenger av ferdighetsnivået ditt, avstanden du må kaste, og vindforholdene. Nybegynnere bruker vanligvis midrange-disker og puttere, mens mer erfarne spillere bruker drivere for lange kast.'
  },
  { id: '13', question: 'Kan jeg spille frisbeegolf i regnet?',
    answer: 'Ja, du kan spille frisbeegolf i regnet, men vær forberedt på å justere kastet ditt, da diskene kanskje ikke flyr på samme måte i våte forhold. Bruk et håndkle for å holde diskene tørre og få et bedre grep.'
  },
  { id: '14', question: 'Hva er par i frisbeegolf?',
    answer: 'Akkurat som i tradisjonell golf har frisbeegolfbaner en "par" for hvert hull, som er antall kast en erfaren spiller forventes å trenge for å fullføre hullet. Par er vanligvis 3 eller 4 for de fleste hull.'
  },
  { id: '15', question: 'Hva er de ulike kasteteknikkene i frisbeegolf?',
    answer: 'Det finnes ulike kasteteknikker i frisbeegolf, inkludert backhand, forehand (sidearm) og overhåndskast. Hver teknikk er nyttig avhengig av hvilken type kast du trenger å gjøre.'
  }
];

const FAQPage = () => {
  const [faqs, setFaqs] = useState(sampleFAQs);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const itemsPerPage = 7; 

  useEffect(() => {
    const filteredFaqs = faqs.filter((faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalPages(Math.ceil(filteredFaqs.length / itemsPerPage));
  }, [faqs, searchTerm, itemsPerPage]);

  const getPaginatedFAQs = () => {
    const filteredFaqs = faqs.filter((faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredFaqs.slice(startIndex, endIndex);
  };

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Frequently Asked Questions</h1>

      <input
        type="text"
        placeholder="Søk etter et spørsmål..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <ul className="mt-6 space-y-6">
        {getPaginatedFAQs().length > 0 ? (
          getPaginatedFAQs().map((faq) => (
            <li key={faq.id} className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm cursor-pointer" onClick={() => toggleFAQ(faq.id)}>
              <h2 className="text-xl font-semibold text-gray-900 flex justify-between items-center">
                {faq.question}
                <span className="text-blue-500 text-lg">{expandedFAQ === faq.id ? "▲" : "▼"}</span>
              </h2>
              {expandedFAQ === faq.id && (
                <p className="text-gray-700 mt-4">{faq.answer}</p>
              )}
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No questions found</p>
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

export default FAQPage;
