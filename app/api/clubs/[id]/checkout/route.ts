import { NextResponse } from 'next/server';
import { headers } from "next/headers";         // Brukes for å hente 'origin' header for fallback URL
import { PrismaClient } from "@prisma/client"; // Prisma ORM klient
import { auth } from "@/auth";                 // Autentiseringsfunksjon (f.eks. NextAuth)
import { stripe } from '@/app/lib/stripe';


// Initialiser Prisma Client for denne API-ruten
const prisma = new PrismaClient();

/**
 * POST /api/clubs/[clubId]/checkout
 * Oppretter en Stripe Checkout Session for å betale medlemskap i en spesifikk klubb.
 * Krever at brukeren er autentisert.
 * MERK: Bruker Promise<...> for params for å matche Next.js type-sjekk...
 */
export async function POST(
  req: Request, // Innkommende HTTP forespørsel
  // --- OPPDATERT TYPESIGNATUR FOR PARAMS (matcher dine eksempler) ---
  { params }: { params: Promise<{ clubId: string }> }
  // -------------------------------------------------------------------
) {
  // --- HENT UT clubId ETTER await ---
  const awaitedParams = await params;
  const clubId = awaitedParams.clubId;
  // ------------------------------------

  const endpoint = `/api/clubs/${clubId}/checkout`; // For logging
  console.log(`[${endpoint}] Received POST request for clubId: ${clubId}`);

  try {
    // === Autentisering ===
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId || !userEmail) {
      console.warn(`[${endpoint}] Unauthorized access attempt.`);
      return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }
    console.log(`[${endpoint}] User authenticated: ${userId}`);

    // === Hent og Valider Klubb ===
    // clubId er nå hentet via awaitedParams
    if (!clubId) {
      // Denne sjekken er mindre sannsynlig nå, men beholdes for sikkerhets skyld
      console.error(`[${endpoint}] Missing clubId after awaiting params.`);
      return NextResponse.json({ error: "Mangler klubb-ID." }, { status: 400 });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        membershipPrice: true,
        stripeProductId: true,
        stripePriceId: true,
      }
    });

    if (!club) {
      console.error(`[${endpoint}] Club not found for ID: ${clubId}`);
      return NextResponse.json({ error: "Klubb ikke funnet." }, { status: 404 });
    }

    if (!club.membershipPrice || club.membershipPrice <= 0) {
      console.warn(`[${endpoint}] Club ${clubId} (${club.name}) has no valid membership price.`);
      return NextResponse.json({ error: "Denne klubben tilbyr ikke betalt medlemskap via appen for øyeblikket." }, { status: 400 });
    }
    console.log(`[${endpoint}] Club found: ${club.name}, Price: ${club.membershipPrice}`);

    // === Sjekk Eksisterende Aktivt Medlemskap ===
    const existingMembership = await prisma.membership.findUnique({
        where: {
            userId_clubId: { userId, clubId },
            status: 'active'
        },
        select: { userId: true }
    });

    if (existingMembership) {
        console.warn(`[${endpoint}] User ${userId} is already an active member of club ${clubId}.`);
        return NextResponse.json({ error: "Du er allerede et aktivt medlem i denne klubben." }, { status: 400 });
    }
    console.log(`[${endpoint}] User ${userId} is not an active member yet.`);

    // === Stripe Produkt & Pris (Lazy Creation) ===
    let stripePriceId = club.stripePriceId;
    let stripeProductId = club.stripeProductId;

    if (!stripePriceId) {
      console.log(`[${endpoint}] Stripe Price ID not found. Initiating creation...`);
      if (!stripeProductId) {
        try {
          console.log(`[${endpoint}] Creating Stripe Product...`);
          const product = await stripe.products.create({
            name: `${club.name} Medlemskap`,
            description: `Årlig medlemskontingent for ${club.name}`,
            metadata: { clubId: club.id }
          });
          stripeProductId = product.id;
          console.log(`[${endpoint}] Stripe Product created: ${stripeProductId}`);
        } catch (prodError: any) {
           console.error(`[${endpoint}] Stripe Product creation error:`, prodError);
           return NextResponse.json({ error: `Kunne ikke opprette Stripe produkt: ${prodError.message}` }, { status: 500 });
        }
      } else {
          console.log(`[${endpoint}] Found existing Stripe Product ID: ${stripeProductId}`);
      }

      try {
         console.log(`[${endpoint}] Creating Stripe Price for product ${stripeProductId}...`);
         const price = await stripe.prices.create({
           product: stripeProductId!,
           unit_amount: club.membershipPrice,
           currency: 'nok',
           recurring: { interval: 'year' },
           metadata: { clubId: club.id }
         });
         stripePriceId = price.id;
         console.log(`[${endpoint}] Stripe Price created: ${stripePriceId}`);
      } catch(priceError: any){
           console.error(`[${endpoint}] Stripe Price creation error:`, priceError);
           return NextResponse.json({ error: `Kunne ikke opprette Stripe pris: ${priceError.message}` }, { status: 500 });
      }

      try {
          console.log(`[${endpoint}] Updating club ${clubId} in DB with Stripe IDs...`);
          await prisma.club.update({
              where: { id: clubId },
              data: { stripeProductId, stripePriceId },
          });
          console.log(`[${endpoint}] Club ${clubId} DB update successful.`);
      } catch(dbUpdateError: any) {
           console.error(`[${endpoint}] Database update error after creating Stripe IDs:`, dbUpdateError);
           return NextResponse.json({ error: "Databasefeil etter Stripe-opprettelse. Kontakt support." }, { status: 500 });
      }
    } else {
        console.log(`[${endpoint}] Found existing Stripe Price ID: ${stripePriceId}`);
    }

    // === Stripe Kunde (Finn eller Opprett) ===
    let stripeCustomerId: string | undefined;
    console.log(`[${endpoint}] Finding or creating Stripe Customer for user ${userId}`);

    const userMemberships = await prisma.membership.findMany({
        where: { userId: userId, stripeCustomerId: { not: null } },
        select: { stripeCustomerId: true },
        distinct: ['stripeCustomerId']
    });
    const validCustomerIds = userMemberships.map(m => m.stripeCustomerId).filter(Boolean) as string[];

    if (validCustomerIds.length > 0) {
        stripeCustomerId = validCustomerIds[0];
        console.log(`[${endpoint}] Found potential existing Stripe Customer ID: ${stripeCustomerId}`);
        try {
            await stripe.customers.retrieve(stripeCustomerId);
            console.log(`[${endpoint}] Verified Stripe Customer ID ${stripeCustomerId} exists.`);
        } catch (retrieveError: any) {
            if (retrieveError.type === 'StripeInvalidRequestError') {
                console.warn(`[${endpoint}] Stripe Customer ID ${stripeCustomerId} from DB not found in Stripe. Will create a new one.`);
                stripeCustomerId = undefined;
            } else {
                console.error(`[${endpoint}] Error retrieving Stripe Customer ${stripeCustomerId}:`, retrieveError);
                 return NextResponse.json({ error: "Feil ved verifisering av Stripe-kunde." }, { status: 500 });
            }
        }
    }

     if (!stripeCustomerId) {
         try {
             console.log(`[${endpoint}] Creating new Stripe Customer for user ${userId} (${userEmail})`);
             const customer = await stripe.customers.create({
                 email: userEmail,
                 name: session.user.name ?? undefined,
                 metadata: { userId: userId },
             });
             stripeCustomerId = customer.id;
             console.log(`[${endpoint}] New Stripe Customer created: ${stripeCustomerId}`);
         } catch (customerError: any) {
             console.error(`[${endpoint}] Stripe Customer creation error:`, customerError);
             return NextResponse.json({ error: `Kunne ikke opprette Stripe-kunde: ${customerError.message}` }, { status: 500 });
         }
     }

    // === Opprett Stripe Checkout Session ===
    console.log(`[${endpoint}] Preparing to create Stripe Checkout Session...`);

    // *** Bruk await for headers() ***
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
    const successUrl = `${appUrl}/medlemskap/suksess?session_id={CHECKOUT_SESSION_ID}&clubId=${clubId}`;
    const cancelUrl = `${appUrl}/klubber/${clubId}?status=kansellert`;
    console.log(`[${endpoint}] Using Success URL: ${successUrl}`);
    console.log(`[${endpoint}] Using Cancel URL: ${cancelUrl}`);

    try {
      console.log(`[${endpoint}] Creating Stripe Checkout Session for customer ${stripeCustomerId}, price ${stripePriceId}`);
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [ { price: stripePriceId, quantity: 1 } ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          clubId: club.id,
          userId: userId,
          stripeCustomerId: stripeCustomerId
        },
        subscription_data: {
           metadata: {
               clubId: club.id,
               userId: userId,
           }
        },
      });

      console.log(`[${endpoint}] Stripe Checkout Session created: ${checkoutSession.id}`);
      return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
      console.error(`[${endpoint}] Stripe Checkout Session creation error:`, error);
      return NextResponse.json({ error: `Kunne ikke starte betalingsprosess: ${error.message}` }, { status: 500 });
    }
  } catch (error: any) {
    // Prøv å få clubId for bedre logging, selv ved tidlig feil
    let errorClubId = 'unknown';
    try { errorClubId = (await params)?.clubId || 'unknown'; } catch { /* Ignorer feil her */ }
    console.error(`[API /api/clubs/${errorClubId}/checkout] Unhandled Internal Server Error:`, error);
    return NextResponse.json({ error: "En uventet intern feil oppstod." }, { status: 500 });
  } finally {
     await prisma.$disconnect();
     // Prøv å få clubId for logging
     let finalClubId = 'unknown';
     try { finalClubId = (await params)?.clubId || 'unknown'; } catch { /* Ignorer feil her */ }
     console.log(`[API /api/clubs/${finalClubId}/checkout] Database connection disconnected.`);
  }
}