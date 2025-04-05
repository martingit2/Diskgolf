// src/app/klubber/page.tsx (eller der din Klubber-komponent er)
"use client";

import { useState, useEffect } from "react";
import axios from "axios"; // For API-kall
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
import { motion } from "framer-motion";
import { Users, MapPin, Calendar, Mail, Phone, Globe } from "lucide-react"; // Fjernet Star, brukt i ClubPage
import { loadStripe, Stripe } from '@stripe/stripe-js'; // Importer loadStripe og Stripe type
import toast from "react-hot-toast";                  // For varsler
import { useSession } from "next-auth/react";         // For å sjekke innlogging

// --- Stripe Initialisering ---
// Last inn Stripe.js én gang utenfor komponenten. Bruk NEXT_PUBLIC_ prefiks for nøkkelen.
let stripePromise: Promise<Stripe | null>;
if (typeof window !== 'undefined') { // Kjør kun i nettleseren
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("FEIL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY er ikke satt i .env filen.");
        // Vurder en fallback eller feilmelding i UI hvis betaling er kritisk
        // stripePromise = Promise.resolve(null); // Kan sette til null for å unngå feil, men betaling vil ikke virke
    } else {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
}
// --------------------------

// Oppdatert interface for å matche API-respons med _count
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
  membershipPrice?: number | null; // Pris for medlemskap
  _count?: {                 // Forventer _count fra API
    memberships?: number;
  };
  // memberships?: { id: string }[]; // Fjerner denne, da vi bruker _count
}

const Klubber = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null); // Holder ID-en til klubben som behandles
  const { data: session, status: sessionStatus } = useSession(); // Hent bruker sesjon og status

  // Hent klubbdata fra API
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        // APIet /api/clubs skal nå returnere 'membershipPrice' og '_count.memberships'
        const response = await axios.get(`/api/clubs?page=${currentPage}`);
        setClubs(response.data.clubs);
        setTotalPages(response.data.totalPages);
        // Oppdater currentPage hvis APIet returnerer det (valgfritt, men bra praksis)
        if(response.data.currentPage) {
            setCurrentPage(response.data.currentPage);
        }
      } catch (error) {
        console.error("Feil ved henting av klubber:", error);
        toast.error("Kunne ikke laste klubber.");
      }
    };
    fetchClubs();
  }, [currentPage]); // Kjør på nytt når siden endres

  // Filtrer klubber basert på søketerm lokalt
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Håndter pagineringsklikk
  const goToPage = (pageNumber: number) => {
      setCurrentPage(pageNumber);
  };
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));

  // --- Funksjon for å starte betaling ---
  const handleJoinClub = async (clubId: string, clubName: string, price?: number | null) => {
    // Sjekk innlogging
    if (sessionStatus === 'loading') {
        toast("Laster brukerinfo...", { id: `join-${clubId}` });
        return;
    }
    if (sessionStatus === 'unauthenticated') {
        toast.error("Du må være logget inn for å bli medlem.", { id: `join-${clubId}` });
        return;
    }

    // Sjekk pris
    if (!price || price <= 0) {
        toast.error(`Beklager, ${clubName} tilbyr ikke betalt medlemskap via appen nå.`, { id: `join-${clubId}` });
        return;
    }

    // Sjekk om Stripe er klar
     if (!stripePromise) {
        toast.error("Betalingsløsningen kunne ikke lastes. Prøv igjen senere.", { id: `join-${clubId}` });
        console.error("stripePromise is not initialized. Missing publishable key?");
        return;
     }

    // Start prosess og vis loading
    setLoadingPayment(clubId);
    const toastId = toast.loading(`Starter betaling for ${clubName}...`, { id: `join-${clubId}` });

    try {
      // Kall backend API for å opprette checkout session
      const response = await axios.post(`/api/clubs/${clubId}/checkout`);

      // Håndter respons
      if (response.data.url) {
        const stripe = await stripePromise;
        if (!stripe) {
             throw new Error("Stripe.js kunne ikke initialiseres.");
        }

        // Omdiriger til Stripe Checkout
        toast.dismiss(toastId);
        const { error } = await stripe.redirectToCheckout({
           // Forutsetter at API returnerer en URL som slutter på /sessionId
           // En mer robust løsning er om API returnerer { sessionId: 'cs_...' }
           sessionId: response.data.url.substring(response.data.url.lastIndexOf('/') + 1)
        });

        // Håndter feil under omdirigering
        if (error) {
            console.error("Stripe redirectToCheckout error:", error);
            throw new Error(error.message || "Kunne ikke omdirigere til Stripe.");
        }
        // Brukeren blir omdirigert, ingen videre kode her kjøres normalt

      } else {
         // Håndter feil fra APIet
         throw new Error(response.data.error || "Ukjent feil fra server ved oppretting av betalingsøkt.");
      }

    } catch (error: any) {
      console.error("Feil under handleJoinClub:", error);
      toast.error(`Feil: ${error.response?.data?.error || error.message || 'Kunne ikke starte betaling.'}`, { id: toastId });
      setLoadingPayment(null); // Nullstill loading KUN ved feil
    }
    // Ikke nullstill loading her hvis redirect er vellykket
  };
  // --------------------------------------

  // Hjelpefunksjon for å få medlemstall fra _count
  const getMemberCount = (club: Club): string => {
    return club._count?.memberships?.toString() ?? "0"; // Les fra _count.memberships, fallback til "0"
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        DiscGolf Klubber
      </h1>

      {/* Søkefelt */}
      <motion.div /* ... animasjon ... */ className="mt-4">
        <input
          type="text"
          placeholder="Søk etter klubbnavn eller sted..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 shadow-sm"
        />
      </motion.div>

      {/* Klubbkort */}
      <div className="mt-8 space-y-6">
        {clubs.length === 0 && !searchTerm && <p className="text-center text-gray-500 mt-6">Laster klubber...</p>}
        {clubs.length > 0 && filteredClubs.length === 0 && searchTerm && <p className="text-center text-gray-500 mt-6">Ingen klubber funnet som passer søket.</p>}
        {filteredClubs.map((club) => (
          <motion.div
            key={club.id}
            layout // Animerer posisjonsendringer ved filtrering
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
              <Card className="shadow-lg border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Bilde */}
                  <div className="w-full md:w-1/3 relative h-64 md:h-auto flex-shrink-0">
                    <Image
                      src={club.imageUrl || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
                      alt={club.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      priority={clubs.indexOf(club) < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                  </div>

                  {/* Innhold */}
                  <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      {/* Logo og Tittel */}
                      <div className="flex items-center space-x-4 mb-4">
                        {club.logoUrl && (
                          <Image src={club.logoUrl} alt={`${club.name} logo`} width={48} height={48} className="rounded-full flex-shrink-0" />
                        )}
                        <CardTitle className="text-2xl font-bold text-gray-900">{club.name}</CardTitle>
                      </div>
                      {/* Beskrivelse */}
                      {club.description && (
                        <p className="text-gray-700 italic leading-relaxed border-l-4 border-green-500 pl-4 mt-4 mb-6">
                           {club.description}
                         </p>
                       )}
                       <hr className="my-4 border-t border-gray-200" />
                       {/* Info Grid */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                           <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.location}</span></div>
                           <div className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>Etablert: {new Date(club.established).toLocaleDateString('nb-NO')}</span></div>
                           {/* === Oppdatert Medlemstall === */}
                           <div className="flex items-center text-gray-600"><Users className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{getMemberCount(club)} medlemmer</span></div>
                           {/* ============================ */}
                           <div className="flex items-center text-gray-600"><Mail className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.email || "Ikke oppgitt"}</span></div>
                           <div className="flex items-center text-gray-600"><Phone className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.phone || "Ikke oppgitt"}</span></div>
                           <div className="flex items-center text-gray-600"><Globe className="w-4 h-4 mr-2 text-green-600 shrink-0" />
                               <a href={club.website || undefined} target="_blank" rel="noopener noreferrer" className={`${club.website ? 'text-blue-600 hover:underline' : 'text-gray-500'} truncate`}>
                                   {club.website ? club.website.replace(/^https?:\/\//, '') : "Ingen nettside"}
                               </a>
                           </div>
                       </div>
                    </div>

                    {/* Knapper */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Link href={`/klubber/${club.id}`} passHref legacyBehavior className="flex-1">
                        <a className="block w-full">
                          <Button variant="outline" className="w-full py-2.5 border-gray-600 bg-gray-900 text-white font-medium rounded-lg hover:bg-green-600 hover:-text-white transition duration-300 text-sm">
                            Se klubbdetaljer
                          </Button>
                        </a>
                      </Link>
                      {/* === Oppdatert Bli Medlem Knapp === */}
                      <Button
                        className="flex-1 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        onClick={() => handleJoinClub(club.id, club.name, club.membershipPrice)}
                        disabled={loadingPayment === club.id || !club.membershipPrice || club.membershipPrice <= 0 || sessionStatus === 'loading'}
                      >
                        {loadingPayment === club.id ? "Behandler..." :                            // Viser "Behandler..." når aktiv
                         sessionStatus === 'loading' ? "Laster..." :                             // Viser "Laster..." mens session sjekkes
                         (!club.membershipPrice || club.membershipPrice <= 0) ? "Medlemskap utilgj." : // Viser utilgjengelig hvis ingen/ugyldig pris
                         sessionStatus === 'unauthenticated' ? "Logg inn for å bli medlem" :     // Ber om innlogging hvis ikke logget inn
                         `Bli medlem (${(club.membershipPrice / 100).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}/år)` // Viser pris hvis alt er ok
                        }
                      </Button>
                       {/* =================================== */}
                    </div>
                  </div>
                </div>
              </Card>
          </motion.div>
        ))}
      </div>

    {/* Paginering */}
    {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    // Fjernet 'disabled' prop
                    onClick={() => { if (currentPage > 1) prevPage(); }} // Sjekk betingelse i onClick
                    aria-disabled={currentPage === 1} // Bruk aria-disabled
                    className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  />
                </PaginationItem>
                {/* ... PaginationLink-elementer ... */}
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#" // Hindrer scrolling til toppen
                      onClick={(e) => { e.preventDefault(); goToPage(index + 1); }}
                      isActive={currentPage === index + 1}
                      className={`py-1 px-3 rounded-md text-sm ${currentPage === index + 1 ? "bg-green-600 text-white hover:bg-green-700" : "text-green-700 hover:bg-green-100"}`}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {/* ========================== */}
                <PaginationItem>
                  <PaginationNext
                    // Fjernet 'disabled' prop
                    onClick={() => { if (currentPage < totalPages) nextPage(); }} // Sjekk betingelse i onClick
                    aria-disabled={currentPage === totalPages} // Bruk aria-disabled
                    className={`${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
      )}
    </div>
  );
};

export default Klubber;