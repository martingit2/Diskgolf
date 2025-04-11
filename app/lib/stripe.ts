// Fil: lib/stripe.ts
// Formål: Konfigurerer og eksporterer Stripe SDK-instansen for bruk server-side.
//         Bruker den hemmelige Stripe-nøkkelen fra miljøvariabler og inkluderer en sjekk for å sikre at den er satt.
// Utvikler: Martin Pettersen


import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});