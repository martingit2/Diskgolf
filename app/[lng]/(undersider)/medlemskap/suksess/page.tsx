// Fil: src/app/medlemskap/suksess/page.tsx
// Formål: Viser en bekreftelsesside etter vellykket betaling for klubbmedlemskap. Bruker `useSearchParams` (via Suspense) for å hente informasjon og viser en suksessmelding med lenker.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react'; // Importer Suspense
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner'; // Importer spinner

// --- Indre komponent som bruker useSearchParams ---
function SuccessContent() {
    const searchParams = useSearchParams();
    const clubId = searchParams?.get('clubId');
    const sessionId = searchParams?.get('session_id');

     useEffect(() => {
        console.log("Suksess-innhold lastet.");
        if (sessionId) console.log("Checkout Session ID:", sessionId);
        if (clubId) console.log("Club ID:", clubId);
        try {
            confetti({ /* ... confetti options ... */ });
        } catch (e) { console.warn("Confetti-feil:", e); }
     }, [sessionId, clubId]);

     // Returner selve innholdet som var i MembershipSuccessPage før
      return (
          <Card className="w-full max-w-md shadow-lg border-green-200">
            <CardHeader className="items-center text-center space-y-2 pt-8">
               <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
               <CardTitle className="text-3xl font-bold text-gray-800">Betaling Vellykket!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 pb-8">
               <p className="text-lg text-gray-600">Gratulerer! Ditt medlemskap er nå aktivert.</p>
               <p className="text-sm text-gray-500">En bekreftelse sendes snart til din e-post (fra Stripe).</p>
               <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                   {clubId && (
                     <Link href={`/klubber/${clubId}`} passHref legacyBehavior>
                        <a className="flex-1"><Button className="w-full bg-green-600 hover:bg-green-700">Se klubbsiden</Button></a>
                     </Link>
                   )}
                    <Link href="/klubber" passHref legacyBehavior>
                      <a className="flex-1"><Button variant="outline" className="w-full">Se alle klubber</Button></a>
                    </Link>
               </div>
            </CardContent>
          </Card>
      );
}
// ---------------------------------------------

// --- Hovedkomponenten wrapper nå SuccessContent i Suspense ---
export default function MembershipSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white p-4">
        {/* Wrap komponenten som bruker useSearchParams */}
      <Suspense fallback={<LoadingSpinner text="Laster resultat..." />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
// ---------------------------------------------------------