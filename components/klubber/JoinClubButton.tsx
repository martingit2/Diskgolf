"use client"; // Marker denne som en Client Component

import React, { useState } from 'react';
import axios from "axios";
import { loadStripe, Stripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FiUserPlus } from "react-icons/fi"; // Ikon for knappen

// --- Stripe Initialisering ---
let stripePromise: Promise<Stripe | null>;
if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("FEIL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY er ikke satt.");
    } else {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
}
// -----------------------------

// Definer props
interface JoinButtonProps {
    clubId: string;
    clubName: string;
    membershipPrice?: number | null;
    isAlreadyMember: boolean;
    isLoggedIn: boolean;
}

export const JoinClubButtonClient: React.FC<JoinButtonProps> = ({
    clubId,
    clubName,
    membershipPrice,
    isAlreadyMember,
    isLoggedIn
}) => {
    // State for loading - endret til boolean
    const [loadingPayment, setLoadingPayment] = useState<boolean>(false);
    const { status: sessionStatus } = useSession();

    // Funksjon for å starte betaling
    const handleJoinClub = async () => {
        // Sjekk innlogging, medlemskap, pris og Stripe (som før)
        if (!isLoggedIn || sessionStatus === 'unauthenticated') {
            toast.error("Du må være logget inn for å bli medlem."); return;
        }
        if (sessionStatus === 'loading') {
            toast("Laster brukerinfo..."); return;
        }
        if (isAlreadyMember) {
             toast("Du er allerede medlem av denne klubben."); return; // Bruker vanlig toast
        }
        if (!membershipPrice || membershipPrice <= 0) {
            toast.error(`Beklager, ${clubName} tilbyr ikke betalt medlemskap via appen nå.`); return;
        }
        if (!stripePromise) {
            toast.error("Betalingsløsningen kunne ikke lastes."); console.error("stripePromise is not initialized."); return;
        }

        // Start prosess
        setLoadingPayment(true);
        const toastId = toast.loading(`Starter betaling for ${clubName}...`);

        try {
            const response = await axios.post(`/api/clubs/${clubId}/checkout`);
            if (response.data.url) {
                const stripe = await stripePromise;
                if (!stripe) throw new Error("Stripe.js kunne ikke initialiseres.");
                toast.dismiss(toastId);
                const { error } = await stripe.redirectToCheckout({
                   sessionId: response.data.url.substring(response.data.url.lastIndexOf('/') + 1)
                });
                if (error) throw new Error(error.message || "Kunne ikke omdirigere til Stripe.");
            } else {
                 throw new Error(response.data.error || "Ukjent feil fra server.");
            }
        } catch (error: any) {
             console.error("Feil under handleJoinClub (Client Button):", error);
             toast.error(`Feil: ${error.response?.data?.error || error.message || 'Kunne ikke starte betaling.'}`, { id: toastId });
             // Nullstill loading ved feil - endret til false
             setLoadingPayment(false);
        }
        // Ikke nullstill ved suksess (redirect)
    };

    // Bestem knappens tekst og disabled status
    const isDisabled = loadingPayment || sessionStatus === 'loading';
    let buttonText: string;
    let canJoin = isLoggedIn && !isAlreadyMember && membershipPrice && membershipPrice > 0;

    if (loadingPayment) {
        buttonText = "Behandler...";
    } else if (sessionStatus === 'loading') {
        buttonText = "Laster...";
    } else if (!isLoggedIn) {
        buttonText = "Logg inn for å bli medlem";
    } else if (isAlreadyMember) {
        buttonText = "Du er Medlem";
        // disabled blir true pga !canJoin nedenfor
    } else if (!membershipPrice || membershipPrice <= 0) {
        buttonText = "Medlemskap utilgjengelig";
        // disabled blir true pga !canJoin nedenfor
    } else {
        // Hvis alt ok, vis pris
        buttonText = `Bli medlem (${(membershipPrice / 100).toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}/år)`;
    }

    // Bestem onClick handling basert på status
    const handleClick = () => {
        if (canJoin) {
            handleJoinClub(); // Start betaling hvis brukeren kan bli medlem
        } else if (!isLoggedIn) {
            toast.error("Logg inn først.");
        } else if (isAlreadyMember) {
            toast("Du er allerede medlem."); // Bruker vanlig toast
        } else {
            toast.error("Medlemskap er ikke tilgjengelig for denne klubben via appen.");
        }
    };

    // Bestem om ikonet skal vises
    const showIcon = !loadingPayment && canJoin;

    return (
        <Button
            onClick={handleClick} // Bruk den bestemte klikk-handleren
            disabled={isDisabled || !canJoin && !isAlreadyMember} // Deaktiver ved lasting, eller hvis bruker ikke kan bli medlem (unntatt hvis de allerede er medlem, da er knappen uansett annerledes)
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={buttonText}
        >
           {showIcon && <FiUserPlus className="animate-bounce" />} {/* Vis ikon kun hvis man kan bli medlem */}
            {buttonText}
        </Button>
    );
}