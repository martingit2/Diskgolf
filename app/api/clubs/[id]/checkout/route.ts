// src/app/api/clubs/[id]/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { stripe } from '@/app/lib/stripe';


const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Korrekt type for params
) {
  let clubId: string | undefined; // Definer utenfor try/catch for logging

  try {
    // --- Hent og valider ID fra params ---
    const awaitedParams = await params;
    clubId = awaitedParams?.id;

    if (!clubId || typeof clubId !== 'string') {
      console.error("API Checkout: Invalid or missing club ID from route parameter '[id]'.");
      return NextResponse.json({ error: "Ugyldig klubb-ID i URL." }, { status: 400 });
    }
    const endpoint = `/api/clubs/${clubId}/checkout`; // Definer endpoint etter at clubId er validert
    console.log(`[${endpoint}] Received POST request`);
    // -----------------------------------

    // === Autentisering ===
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const userName = session?.user?.name; // Hent navn her

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }
    console.log(`[${endpoint}] User authenticated: ${userId}`);
    // =====================

    // === Hent og Valider Klubb ===
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, membershipPrice: true, stripeProductId: true, stripePriceId: true }
    });

    // --- Sjekk om klubb finnes ---
    if (!club) {
      console.error(`[${endpoint}] Club not found for ID: ${clubId}`);
      return NextResponse.json({ error: "Klubb ikke funnet." }, { status: 404 });
    }
    // --- Nå vet TypeScript at 'club' ikke er null ---
    console.log(`[${endpoint}] Found club: ${club.name}`);

    // --- Sjekk pris NØYE ---
    if (club.membershipPrice === null || club.membershipPrice <= 0) {
      console.warn(`[${endpoint}] Club ${clubId} (${club.name}) has invalid price: ${club.membershipPrice}`);
      return NextResponse.json({ error: "Klubben tilbyr ikke betalt medlemskap." }, { status: 400 });
    }
     // Nå vet vi at club.membershipPrice er et tall > 0
    const validMembershipPrice = club.membershipPrice;
    console.log(`[${endpoint}] Valid price found: ${validMembershipPrice}`);
     // =========================

    // === Sjekk Medlemskap ===
    const existingMembership = await prisma.membership.findUnique({ where: { userId_clubId: { userId, clubId }, status: 'active' }, select: { userId: true } });
    if (existingMembership) {
        return NextResponse.json({ error: "Du er allerede aktivt medlem." }, { status: 400 });
    }
    console.log(`[${endpoint}] User not an active member yet.`);
    // ========================

    // === Stripe Produkt & Pris ===
    let stripePriceId = club.stripePriceId;
    let stripeProductId = club.stripeProductId;

    if (!stripePriceId) {
        console.log(`[${endpoint}] Creating Stripe Product/Price...`);
        if (!stripeProductId) {
            try {
                const product = await stripe.products.create({
                    name: `${club.name} Medlemskap`,
                    metadata: { clubId: club.id } // Bruk club.id som er garantert string
                });
                stripeProductId = product.id;
            } catch (e: any) { console.error("Stripe Prod Err:", e); return NextResponse.json({ error: `Stripe Prod feil: ${e.message}` }, { status: 500 }); }
        }
        try {
            const price = await stripe.prices.create({
                product: stripeProductId!,
                unit_amount: validMembershipPrice, // Bruk validert pris
                currency: 'nok',
                recurring: { interval: 'year' },
                metadata: { clubId: club.id } // Bruk club.id
            });
            stripePriceId = price.id;
        } catch (e: any) { console.error("Stripe Price Err:", e); return NextResponse.json({ error: `Stripe Price feil: ${e.message}` }, { status: 500 }); }
        try {
            await prisma.club.update({ where: { id: clubId }, data: { stripeProductId, stripePriceId } });
        } catch (e: any) { console.error("DB Update Err:", e); return NextResponse.json({ error: "DB feil etter Stripe." }, { status: 500 }); }
        console.log(`[${endpoint}] Stripe IDs created/updated.`);
    } else {
        console.log(`[${endpoint}] Using existing Stripe Price ID: ${stripePriceId}`);
    }
    // ==========================

    // === Stripe Kunde ===
    let stripeCustomerId: string | undefined;
    // ... (logikk for å finne/opprette kunde som før) ...
     const userMemberships = await prisma.membership.findMany({ where: { userId, stripeCustomerId: { not: null } }, select: { stripeCustomerId: true }, distinct: ['stripeCustomerId'] });
     const validCustomerIds = userMemberships.map(m => m.stripeCustomerId).filter(Boolean) as string[];
     if (validCustomerIds.length > 0) {
         stripeCustomerId = validCustomerIds[0];
         try { await stripe.customers.retrieve(stripeCustomerId); console.log(`[${endpoint}] Existing Stripe Customer found: ${stripeCustomerId}`); }
         catch (e: any) { if (e.type === 'StripeInvalidRequestError') { stripeCustomerId = undefined; console.warn("Stripe Customer ID from DB invalid."); } else { throw e; } }
     }
     if (!stripeCustomerId) {
         try {
             // --- Korrekt objekt for customers.create ---
             const customer = await stripe.customers.create({
                 email: userEmail, // 'email' er et gyldig felt
                 name: userName ?? undefined, // 'name' er et gyldig felt
                 metadata: { userId: userId } // 'metadata' er gyldig
             });
             // ------------------------------------------
             stripeCustomerId = customer.id;
             console.log(`[${endpoint}] New Stripe Customer created: ${stripeCustomerId}`);
         } catch (e: any) { console.error("Stripe Cust Err:", e); return NextResponse.json({ error: `Stripe Kunde feil: ${e.message}` }, { status: 500 }); }
     }
    // =================

    // === Checkout Session ===
    console.log(`[${endpoint}] Creating Checkout Session...`);
    const requestHeaders = await headers(); // *** Legg til await her igjen ***
    const origin = requestHeaders.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
    const successUrl = `${appUrl}/medlemskap/suksess?session_id={CHECKOUT_SESSION_ID}&clubId=${clubId}`;
    const cancelUrl = `${appUrl}/klubber/${clubId}?status=kansellert`;

    // --- Valider data før Stripe kall ---
    if (!stripeCustomerId) {
         console.error(`[${endpoint}] Stripe Customer ID is missing before creating checkout session.`);
         return NextResponse.json({ error: "Intern feil: Stripe kunde-ID mangler." }, { status: 500 });
    }
     if (!stripePriceId) {
         console.error(`[${endpoint}] Stripe Price ID is missing before creating checkout session.`);
         return NextResponse.json({ error: "Intern feil: Stripe pris-ID mangler." }, { status: 500 });
    }
    // ----------------------------------

    try {
        // --- Korrekt objekt for checkout.sessions.create ---
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,         // Gyldig felt
        payment_method_types: ['card'],   // Gyldig felt
        line_items: [                     // Gyldig felt
            { price: stripePriceId, quantity: 1 }
        ],
        mode: 'subscription',             // Gyldig felt
        success_url: successUrl,          // Gyldig felt
        cancel_url: cancelUrl,            // Gyldig felt
        metadata: {                       // Gyldig felt
          clubId: clubId, // Sikrer at clubId er string
          userId: userId,
          stripeCustomerId: stripeCustomerId
        },
        subscription_data: {              // Gyldig felt
           metadata: { clubId: clubId, userId: userId } // Sikrer at clubId er string
        },
      });
      // -------------------------------------------------
      console.log(`[${endpoint}] Checkout Session created: ${checkoutSession.id}`);
      return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error(`[${endpoint}] Stripe Checkout Session creation error:`, error);
        return NextResponse.json({ error: `Kunne ikke starte betalingsprosess: ${error.message}` }, { status: 500 });
    }
    // ======================

  } catch (error: any) {
    const errorClubId = clubId ?? 'unknown';
    console.error(`[API /api/clubs/${errorClubId}/checkout] Unhandled Error:`, error);
    return NextResponse.json({ error: "En uventet intern feil." }, { status: 500 });
  } finally {
     await prisma.$disconnect();
     const finalClubId = clubId ?? 'unknown';
     console.log(`[API /api/clubs/${finalClubId}/checkout] DB disconnected.`);
  }
}