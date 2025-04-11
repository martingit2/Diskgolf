// Fil: src/components/klubber/JoinClubButtonClient.tsx
// Formål: Definerer en klient-side React-komponent ('use client') for "Bli medlem"-knappen på en klubbside.
//         Håndterer logikk for å sjekke innlogging (NextAuth), medlemsstatus, medlemskapspris,
//         og starter en Stripe Checkout-økt ved å kalle et API-endepunkt (/api/clubs/[clubId]/checkout).
//         Viser tilbakemeldinger (loading, success, error) med react-hot-toast og håndterer Stripe.js initialisering og omdirigering.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client"; // Viktig for hooks og event handlers

import React, { useState } from 'react';
import axios from "axios"; 
import { loadStripe, Stripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";                  
import { useSession } from "next-auth/react";       
import { Button } from "@/components/ui/button";      
import { FiUserPlus } from "react-icons/fi";         

// --- Stripe Initialisering ---
// Initialiserer Stripe.js på klienten med publishable key
let stripePromise: Promise<Stripe | null>;
if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("FEIL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY er ikke satt i .env.");
    } else {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
}
// -----------------------------

// Definerer props som komponenten mottar fra sin parent (ClubPage)
interface JoinButtonProps {
    clubId: string;                  // ID til klubben
    clubName: string;                // Navn på klubben (for meldinger)
    membershipPrice?: number | null; // Pris i øre (kan være null)
    isAlreadyMember: boolean;        // Status fra server om brukeren er aktivt medlem
    isLoggedIn: boolean;             // Status fra server om brukeren er logget inn
}

// Klientkomponenten for "Bli medlem"-knappen
export const JoinClubButtonClient: React.FC<JoinButtonProps> = ({
    clubId,
    clubName,
    membershipPrice,
    isAlreadyMember,
    isLoggedIn // Bruker props sendt fra Server Component
}) => {
    // State for å vise lasteindikator på denne knappen
    const [loadingPayment, setLoadingPayment] = useState(false);
    // Bruker useSession for å sjekke om session fortsatt lastes
    const { status: sessionStatus } = useSession();

    // Asynkron funksjon for å håndtere klikk og starte betalingsflyt
    const handleJoinClub = async () => {
        const logPrefix = "[JoinClubButtonClient]"; // For logging

        // Validering basert på props og session status
        if (!isLoggedIn || sessionStatus === 'unauthenticated') { toast.error("Du må logge inn."); return; }
        if (sessionStatus === 'loading') { toast("Laster brukerinfo..."); return; }
        if (isAlreadyMember) { toast("Du er allerede medlem."); return; } // Bruker vanlig toast
        if (!membershipPrice || membershipPrice <= 0) { toast.error(`${clubName} tilbyr ikke betalt medl.`); return; }
        if (!stripePromise) { toast.error("Betaling ikke klar."); console.error(`${logPrefix} stripePromise ikke init.`); return; }
        if (!clubId) { toast.error("Intern feil: Klubb-ID mangler."); console.error(`${logPrefix} clubId mangler!`); return; }

        setLoadingPayment(true); // Start lasteindikator
        const toastId = toast.loading(`Starter betaling for ${clubName}...`);

        try {
            console.log(`${logPrefix} Kaller POST /api/clubs/${clubId}/checkout`);
            // Kall backend API for å opprette Checkout Session
            const response = await axios.post(`/api/clubs/${clubId}/checkout`);
            console.log(`${logPrefix} Mottok respons fra API:`, response);

            // Håndter vellykket respons (200 OK og en URL)
            if (response.status === 200 && response.data?.url) {
                const checkoutUrl = response.data.url;
                let sessionId: string | null = null;

                // Forsøk å hente sessionId fra URL på en robust måte
                try {
                    const urlObject = new URL(checkoutUrl);
                    const pathParts = urlObject.pathname.split('/');
                    const potentialId = pathParts[pathParts.length - 1];
                    if (potentialId?.startsWith('cs_test_') || potentialId?.startsWith('cs_live_')) {
                        sessionId = potentialId;
                        console.log(`${logPrefix} Hentet Session ID (URL parse): ${sessionId}`);
                    }
                } catch (e) { /* Ignorer URL parse feil, prøv fallback */ }

                // Fallback med substring hvis URL-parsing feilet
                if (!sessionId) {
                    try {
                        const potentialId = checkoutUrl.substring(checkoutUrl.lastIndexOf('/') + 1).split('#')[0];
                        if (potentialId?.startsWith('cs_test_') || potentialId?.startsWith('cs_live_')) {
                            sessionId = potentialId;
                            console.log(`${logPrefix} Hentet Session ID (substring): ${sessionId}`);
                        }
                    } catch (fallbackError) { /* Ignorer */ }
                }

                // Hvis sessionId fortsatt ikke ble funnet, kast feil
                if (!sessionId) {
                    console.error(`${logPrefix} Klarte ikke hente gyldig Session ID fra URL: ${checkoutUrl}`);
                    throw new Error("Kunne ikke hente gyldig betalingsøkt-ID.");
                }

                // Hent Stripe.js instans og omdiriger
                const stripe = await stripePromise;
                if (!stripe) throw new Error("Stripe.js feilet initialisering.");
                console.log(`${logPrefix} Kaller redirectToCheckout med ID: ${sessionId}`);
                toast.dismiss(toastId); // Fjern loading toast
                const { error } = await stripe.redirectToCheckout({ sessionId }); // Send til Stripe

                // Håndter feil FØR redirect skjer
                if (error) throw new Error(error.message || "Omdirigering til betaling feilet.");

            } else {
                // Håndter ugyldig respons fra API
                console.error(`${logPrefix} Ugyldig API respons: Status ${response.status}, Data:`, response.data);
                throw new Error(response.data?.error || `Uventet svar fra server.`);
            }
        } catch (error: any) {
             // Fanger feil fra API-kall, sessionId-henting, eller redirectToCheckout
             console.error(`${logPrefix} Feil:`, error);
             toast.error(`Feil: ${error.response?.data?.error || error.message || 'Ukjent feil.'}`, { id: toastId });
             setLoadingPayment(false); // Nullstill loading KUN ved feil
        }
         // Ikke nullstill loading ved vellykket redirect
    };

    // Logikk for å bestemme knappens utseende og oppførsel
    const isDisabled = loadingPayment || sessionStatus === 'loading';
    const canJoin = isLoggedIn && !isAlreadyMember && membershipPrice && membershipPrice > 0;
    let buttonText: string;

    if (loadingPayment) buttonText = "Behandler...";
    else if (sessionStatus === 'loading') buttonText = "Laster...";
    else if (!isLoggedIn) buttonText = "Logg inn for å bli medlem";
    else if (isAlreadyMember) buttonText = "Du er Medlem";
    else if (!membershipPrice || membershipPrice <= 0) buttonText = "Medlemskap utilgjengelig";
    else buttonText = `Bli medlem (${(membershipPrice / 100).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}/år)`;

    // Bestem hva som skjer ved klikk
    const handleClick = () => {
        if (canJoin) handleJoinClub(); // Start betaling
        else if (!isLoggedIn) toast.error("Logg inn først.");
        else if (isAlreadyMember) toast("Du er allerede medlem.");
        else toast.error("Medlemskap ikke tilgjengelig.");
    };

    // Skal ikonet vises?
    const showIcon = !loadingPayment && canJoin;

    // Render knappen
    return (
        <Button
            onClick={handleClick}
            disabled={isDisabled || (!canJoin && !isAlreadyMember)}
            // Bruker stilen fra den opprinnelige ClubPage-knappen
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={buttonText}
        >
           {showIcon && <FiUserPlus className="animate-bounce" />} {/* Animerer ikon hvis showIcon er true */}
            {buttonText}
        </Button>
    );
};

// Eksporter komponenten (viktig for import i ClubPage)
// export { JoinClubButtonClient }; // Named export
export default JoinClubButtonClient; // Eller default export