// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'; // Importer headers
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { stripe } from '@/app/lib/stripe';

const prisma = new PrismaClient();

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!stripeWebhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET ikke satt.');
        return new NextResponse('Webhook Secret mangler', { status: 500 });
    }

    const body = await req.text();
    // --- BRUK await headers() HER ---
    const requestHeaders = await headers();
    const signature = requestHeaders.get('Stripe-Signature');
    // -----------------------------

    if (!signature) {
        console.error('❌ Mangler Stripe-Signature.');
        return new NextResponse('Mangler signatur', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
        console.log(`🔔 Stripe Webhook: ${event.type}`);
    } catch (error: any) {
        console.error(`❌ Webhook verifisering feilet: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // --- Håndtering av Events ---

    try { // Legg en overordnet try/catch rundt event-håndtering
        const session = event.data.object as Stripe.Checkout.Session;

        // Event: checkout.session.completed
        if (event.type === 'checkout.session.completed') {
             // ... (logikk som før for å hente IDs fra session.metadata) ...
             const subscriptionId = session.subscription as string;
             const customerId = session.customer as string;
             const userId = session.metadata?.userId;
             const clubId = session.metadata?.clubId;

             if (!subscriptionId || !customerId || !userId || !clubId) {
                 console.error('❌ Mangler metadata i checkout.session.completed');
                 return new NextResponse('Mangler metadata.', { status: 400 });
             }

             const existingMembershipsCount = await prisma.membership.count({ where: { userId: userId } });
             const makePrimary = existingMembershipsCount === 0;

             console.log(`   -> Oppdaterer/oppretter medlemskap for User: ${userId}, Club: ${clubId}...`);
             await prisma.membership.upsert({
                 where: { userId_clubId: { userId, clubId } },
                 update: { stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId, status: 'active', isPrimary: makePrimary },
                 create: { userId, clubId, stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId, status: 'active', isPrimary: makePrimary },
             });
             console.log(`   -> Medlemskap aktivt.`);
        }

        // Event: invoice.payment_succeeded
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice;
            // --- KORRIGERT: Hent subscription ID via linjeelement eller subscription_details ---
            // Metode 1: Hvis fakturaen KUN har ett linjeelement for abonnementet
             const subscriptionId = invoice.lines.data[0]?.subscription;

             // Metode 2 (mer robust hvis det kan være flere linjer): Bruk subscription_details
             // const subscriptionId = invoice.subscription_details?.metadata?.subscription_id // Hvis du lagret det i metadata
             // ELLER, hvis det alltid er abonnement:
             // const subscriptionId = invoice.subscription; // Prøv denne hvis den finnes på din Stripe versjon/type

            // ----------------------------------------------------------------------------

            if (subscriptionId && typeof subscriptionId === 'string') { // Sjekk at vi fikk en streng-ID
                console.log(`🧾 Faktura betalt for abonnement: ${subscriptionId}`);
                await prisma.membership.updateMany({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: { status: 'active' }
                });
                console.log(`   -> Medlemskap fornyet/satt aktivt.`);
            } else if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
                 // Hvis vi vet det *skulle* vært et abonnement, men ikke fant IDen
                 console.warn(`⚠️ Fant ikke subscription ID på invoice ${invoice.id}, selv om billing_reason er ${invoice.billing_reason}`);
            }
        }

         // Event: customer.subscription.* (deleted/updated)
         if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
             const subscription = event.data.object as Stripe.Subscription;
             const status = subscription.status;
             console.log(`🔄 Abonnement ${subscription.id} status: ${status}`);

             if (status === 'canceled' || status === 'unpaid' || status === 'past_due' || event.type === 'customer.subscription.deleted') {
                 const newDbStatus = status === 'canceled' || event.type === 'customer.subscription.deleted' ? 'cancelled' : 'inactive';
                 const updatedCount = await prisma.membership.updateMany({
                     where: { stripeSubscriptionId: subscription.id },
                     data: { status: newDbStatus, isPrimary: false }
                 });
                 if (updatedCount.count > 0) console.log(`   -> Medlemskap satt til ${newDbStatus}.`);
                 else console.warn(`   -> Fant ikke medlemskap å oppdatere for sub ${subscription.id}`);
             } else if (status === 'active' && event.type === 'customer.subscription.updated') {
                  await prisma.membership.updateMany({
                     where: { stripeSubscriptionId: subscription.id, NOT: { status: 'active' } }, // Oppdater kun hvis ikke allerede aktiv
                     data: { status: 'active' }
                 });
                 console.log(`   -> Medlemskap reaktivert (via updated).`);
             }
         }

    } catch (handlerError) {
         // Fanger opp feil inne i event-håndteringen (f.eks. databasefeil)
         console.error(`❌ Feil under behandling av webhook event ${event.id} (Type: ${event.type}):`, handlerError);
         // Returner 500 for å be Stripe prøve igjen
         return new NextResponse('Intern feil ved behandling av webhook.', { status: 500 });
    } finally {
         // Koble fra databasen etter HVER forespørsel for å unngå lekkasjer
         await prisma.$disconnect();
    }

    // Alt ok, bekreft til Stripe
    console.log(`✅ Webhook ${event.id} (Type: ${event.type}) ferdig behandlet.`);
    return new NextResponse(null, { status: 200 });
}