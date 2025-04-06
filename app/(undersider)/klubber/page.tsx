// src/app/(undersider)/klubber/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { motion } from "framer-motion";
import { Users, MapPin, Calendar, Mail, Phone, Globe, Terminal } from "lucide-react"; // Import Terminal icon
import { loadStripe, Stripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/app/lib/utils";

// Stripe Init
let stripePromise: Promise<Stripe | null>;
if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing.");
    } else {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
}

// Club Interface
interface Club {
  id: string; name: string; location: string; description?: string | null;
  established: string; logoUrl?: string | null; imageUrl?: string | null;
  website?: string | null; email?: string | null; phone?: string | null;
  address?: string | null; postalCode?: string | null; membershipPrice?: number | null;
  _count?: { memberships?: number; };
}

// Klubber Component
const Klubber = () => {
  // State
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);
  const { status: sessionStatus } = useSession();

  // Fetch Clubs Effect
  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/clubs?page=${currentPage}`);
        setClubs(response.data.clubs || []);
        setTotalPages(response.data.totalPages || 1);
        if(response.data.currentPage) setCurrentPage(response.data.currentPage);
      } catch (error) { console.error("Fetch clubs error:", error); toast.error("Kunne ikke laste klubber."); setClubs([]); setTotalPages(1); }
      finally { setIsLoading(false); }
    };
    fetchClubs();
  }, [currentPage]);

  // Client-side Filtering
  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Handlers
  const goToPage = (pageNumber: number) => { setCurrentPage(pageNumber); };
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));

  // Stripe Checkout Handler
  const handleJoinClub = async (clubId: string, clubName: string, price?: number | null) => {
    // --- Validation and Stripe redirect logic ---
     const logPrefix = "[handleJoinClub]";
     if (sessionStatus === 'loading') { toast("Laster..."); return; }
     if (sessionStatus === 'unauthenticated') { toast.error("Logg inn."); return; }
     if (!price || price <= 0) { toast.error(`${clubName} har ikke betalt medl.`); return; }
     if (!stripePromise) { toast.error("Betaling ikke klar."); return; }
     if (!clubId) { toast.error("Mangler klubb-ID."); return; }
     setLoadingPayment(clubId);
     const toastId = toast.loading(`Starter betaling...`);
     try {
       const response = await axios.post(`/api/clubs/${clubId}/checkout`);
       if (response.status === 200 && response.data?.url) {
         const checkoutUrl = response.data.url; let sessionId: string | null = null;
         try { const urlObject = new URL(checkoutUrl); const pathParts = urlObject.pathname.split('/'); const potentialId = pathParts[pathParts.length - 1]; if (potentialId?.startsWith('cs_test_') || potentialId?.startsWith('cs_live_')) sessionId = potentialId; } catch (e) {/* Ignore */}
         if (!sessionId) { try { const potentialId = checkoutUrl.substring(checkoutUrl.lastIndexOf('/') + 1).split('#')[0]; if (potentialId?.startsWith('cs_test_') || potentialId?.startsWith('cs_live_')) sessionId = potentialId; } catch (fallbackError) {/* Ignore */}}
         if (!sessionId) throw new Error("Ugyldig økt-ID.");
         const stripe = await stripePromise; if (!stripe) throw new Error("Stripe feilet.");
         toast.dismiss(toastId); const { error } = await stripe.redirectToCheckout({ sessionId }); if (error) throw new Error(error.message || "Redirect feilet.");
       } else { throw new Error(response.data?.error || `Serverfeil ${response.status}`); }
     } catch (error: any) { console.error(`${logPrefix} Feil:`, error); toast.error(`Feil: ${error.response?.data?.error || error.message || 'Ukjent feil.'}`, { id: toastId }); setLoadingPayment(null); }
  };

  // Member Count Helper
  const getMemberCount = (club: Club): string => club._count?.memberships?.toString() ?? "0";

  // Render UI
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        DiscGolf Klubber
      </h1>

       {/* === TESTMODUS ALERT === */}
       <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-300 text-yellow-800">
           <Terminal className="h-4 w-4" /> {/* Ikon */}
           <AlertTitle className="font-semibold">Testmodus Aktiv</AlertTitle>
           <AlertDescription className="text-xs sm:text-sm">
               Betalingsløsningen er i testmodus. Bruk testkortnummer
               <code className="font-mono bg-yellow-100 px-1 py-0.5 rounded mx-1 text-yellow-900">4242 4242 4242 4242</code>,
               en fremtidig utløpsdato (MM/YY), og CVC (f.eks. 123).
           </AlertDescription>
       </Alert>
       {/* ======================= */}

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-4 mb-8">
        <Input
          type="text"
          placeholder="Søk etter klubbnavn eller sted..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 shadow-sm"
        />
      </motion.div>

      {/* Loading / Empty States */}
      {isLoading && <div className="text-center py-10"><LoadingSpinner text="Laster klubber..." /></div>}
      {!isLoading && clubs.length === 0 && !searchTerm && <p className="text-center text-gray-500 mt-6">Fant ingen klubber å vise.</p>}
      {!isLoading && filteredClubs.length === 0 && searchTerm && <p className="text-center text-gray-500 mt-6">Ingen klubber funnet for søket '{searchTerm}'.</p>}

      {/* Club Card List */}
      {!isLoading && (
          <div className="mt-8 space-y-6">
            {filteredClubs.map((club, index) => (
              <motion.div key={club.id} /* ...animation... */>
                  {/* Gjenopprettet original Card struktur */}
                  <Card className="shadow-lg border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
                    {/* Gjenopprettet original flex-retning */}
                    <div className="flex flex-col md:flex-row">
                      {/* Bilde kolonne */}
                      <div className="w-full md:w-1/3 relative h-64 md:h-auto flex-shrink-0 bg-gray-100">
                        <Image src={club.imageUrl || "/images/placeholder-course.jpg"} alt={club.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority={index < 3} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                      </div>
                      {/* Innhold kolonne */}
                      <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                        <div>
                          {/* Logo og Tittel */}
                          <div className="flex items-center space-x-4 mb-4">
                            {club.logoUrl && (<Image src={club.logoUrl} alt={`${club.name} logo`} width={48} height={48} className="rounded-full flex-shrink-0 border" />)}
                            <CardTitle className="text-2xl font-bold text-gray-900">{club.name}</CardTitle>
                          </div>
                          {/* Beskrivelse */}
                          {club.description && (<p className="text-gray-700 italic leading-relaxed border-l-4 border-green-500 pl-4 mt-4 mb-6">{club.description}</p>)}
                          <hr className="my-6 border-t-2 border-gray-200" />
                          {/* Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                              <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.location}</span></div>
                              <div className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>Etablert: {new Date(club.established).toLocaleDateString('nb-NO')}</span></div>
                              <div className="flex items-center text-gray-600"><Users className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{getMemberCount(club)} medlemmer</span></div>
                              <div className="flex items-center text-gray-600"><Mail className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.email || "Ikke oppgitt"}</span></div>
                              <div className="flex items-center text-gray-600"><Phone className="w-4 h-4 mr-2 text-green-600 shrink-0" /><span>{club.phone || "Ikke oppgitt"}</span></div>
                              <div className="flex items-center text-gray-600"><Globe className="w-4 h-4 mr-2 text-green-600 shrink-0" /><a href={club.website || undefined} target="_blank" rel="noopener noreferrer" className={`${club.website ? 'text-blue-600 hover:underline' : 'text-gray-500'} truncate`}>{club.website ? club.website.replace(/^https?:\/\//, '') : "Ingen nettside"}</a></div>
                          </div>
                        </div>
                        {/* Knapper */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                          <Link href={`/klubber/${club.id}`} passHref legacyBehavior className="flex-1">
                            <a className="block w-full">
                              <Button variant="outline" className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition duration-300">
                                Se klubbdetaljer
                              </Button>
                            </a>
                          </Link>
                          <Button
                            className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => handleJoinClub(club.id, club.name, club.membershipPrice)}
                            disabled={loadingPayment === club.id || !club.membershipPrice || club.membershipPrice <= 0 || sessionStatus === 'loading'}
                          >
                            {loadingPayment === club.id ? "Behandler..." : sessionStatus === 'loading' ? "Laster..." : (!club.membershipPrice || club.membershipPrice <= 0) ? "Medlemskap utilgj." : sessionStatus === 'unauthenticated' ? "Logg inn" : `Bli medlem (${(club.membershipPrice / 100).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}/år)`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
              </motion.div>
            ))}
          </div>
      )}

      {/* Paginering */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                 {/* Gjenopprettet pagineringsknapp-klasser */}
                <PaginationItem><PaginationPrevious onClick={() => { if (currentPage > 1) prevPage(); }} aria-disabled={currentPage === 1} className={cn("py-2 px-4 rounded-lg", currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'text-green-600 hover:bg-green-50 cursor-pointer')} /></PaginationItem>
                {[...Array(totalPages)].map((_, index) => ( <PaginationItem key={index}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); goToPage(index + 1); }} isActive={currentPage === index + 1} className={cn("py-2 px-4 rounded-lg", currentPage === index + 1 ? "bg-green-600 text-white" : "text-green-600 hover:bg-green-50 cursor-pointer")}>{index + 1}</PaginationLink> </PaginationItem> ))}
                <PaginationItem><PaginationNext onClick={() => { if (currentPage < totalPages) nextPage(); }} aria-disabled={currentPage === totalPages} className={cn("py-2 px-4 rounded-lg", currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'text-green-600 hover:bg-green-50 cursor-pointer')} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
      )}
    </div>
  );
};

export default Klubber;