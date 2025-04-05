// app/actions/update-club-settings.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { currentUser } from "../lib/auth";
import cloudinary from "@/app/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { stripe } from "../lib/stripe"; // Importer Stripe

const prisma = new PrismaClient();

// Hjelpefunksjon for Cloudinary-opplasting
async function uploadFileToCloudinaryAction(file: File, folder: string): Promise<string | null> {
    if (!file) return null;
    // Enkel validering (kan utvides)
    if (file.size > 10 * 1024 * 1024) throw new Error(`Filen "${file.name}" er for stor (maks 10MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error(`Ugyldig filtype for "${file.name}" (kun JPG, PNG, WEBP).`);

    const buffer = await file.arrayBuffer();
    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const timestamp = Date.now();
            const public_id = `${file.name.split('.')[0]}_${timestamp}`;
             const stream = cloudinary.uploader.upload_stream(
                { folder: folder, upload_preset: "discgolf_uploads", resource_type: "image", public_id: public_id },
                (error, result) => {
                    if (error) return reject(new Error(`Cloudinary feil: ${error.message}`));
                    if (!result?.secure_url) return reject(new Error("Mangler secure_url fra Cloudinary"));
                    resolve(result);
                }
            );
             stream.end(Buffer.from(buffer));
        });
        console.log(`✅ Fil (${file.name}) lastet opp til Cloudinary (${folder}): ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Cloudinary opplastingsfeil i action (${folder}):`, error);
        throw error;
    }
}

// Input type for action
interface UpdateClubSettingsInput {
  clubId: string;
  name?: string | null;
  location?: string | null;
  description?: string | null;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  postalCode?: string | null;
  membershipPrice?: number | null; // Pris i øre (eller null)
  logoFile?: File | null;
  imageFile?: File | null;
}

// Returtype for action
interface UpdateClubSettingsResult {
    success?: string;
    error?: string;
    logoUrl?: string | null;
    imageUrl?: string | null;
}

export async function updateClubSettings(
    input: UpdateClubSettingsInput
): Promise<UpdateClubSettingsResult> {
  const user = await currentUser();
  if (!user?.id) {
    return { error: "Uautorisert" };
  }

  // TODO: Implementer autorisasjonssjekk (er bruker admin for klubben?)

  try {
     const existingClub = await prisma.club.findUnique({
        where: { id: input.clubId },
        select: { logoUrl: true, imageUrl: true, stripeProductId: true, stripePriceId: true, membershipPrice: true }
     });

     if (!existingClub) {
         return { error: "Klubben finnes ikke." };
     }

    // Håndter filopplastinger
    const [newLogoUrl, newImageUrl] = await Promise.all([
        input.logoFile ? uploadFileToCloudinaryAction(input.logoFile, 'discgolf/clubs/logos') : Promise.resolve(null),
        input.imageFile ? uploadFileToCloudinaryAction(input.imageFile, 'discgolf/clubs/images') : Promise.resolve(null)
    ]);

     // --- Stripe Price Håndtering (med undefined sjekk) ---
     let newStripePriceId = existingClub.stripePriceId;
     const oldPriceInDb = existingClub.membershipPrice;
     // Sikrer at newPriceFromInput er number | null
     const newPriceFromInput = input.membershipPrice === undefined ? null : input.membershipPrice;

     if (newPriceFromInput !== oldPriceInDb) {
         console.log(`Pris endret for ${input.clubId}. G: ${oldPriceInDb}, N: ${newPriceFromInput}`);
         if (existingClub.stripePriceId) {
             try {
                 await stripe.prices.update(existingClub.stripePriceId, { active: false });
                 console.log(`Gammel Stripe Price ${existingClub.stripePriceId} arkivert.`);
                 newStripePriceId = null;
             } catch (stripeError: any) {
                  console.error(`Kunne ikke arkivere Stripe Price ${existingClub.stripePriceId}:`, stripeError);
                  // Logg feil, men fortsett (DB oppdateres, men gammel pris henger igjen i Stripe)
             }
         }

         // Opprett ny pris HVIS ny pris er satt (>0) OG produkt finnes
         // Sjekker eksplisitt for null før > 0 sammenligning
         if (newPriceFromInput !== null && newPriceFromInput > 0 && existingClub.stripeProductId) {
            try {
                 const newPrice = await stripe.prices.create({
                     product: existingClub.stripeProductId,
                     unit_amount: newPriceFromInput, // Nå trygt å bruke
                     currency: 'nok',
                     recurring: { interval: 'year' },
                     metadata: { clubId: input.clubId }
                 });
                 newStripePriceId = newPrice.id;
                 console.log(`Ny Stripe Price opprettet: ${newStripePriceId}`);
            } catch (stripeError: any) {
                 console.error(`Kunne ikke opprette ny Stripe Price for ${input.clubId}:`, stripeError);
                 return { error: "Klarte ikke å opprette ny pris i Stripe." }; // Stopp hvis dette feiler
            }
         } else if (newPriceFromInput !== null && newPriceFromInput > 0 && !existingClub.stripeProductId) {
             console.warn(`Klubb ${input.clubId} har pris, men mangler Stripe Product ID.`);
         } else {
             newStripePriceId = null; // Pris er 0 eller null
         }
     }
     // ---------------------------------------

    // Forbered data for oppdatering
    const dataToUpdate: Record<string, any> = {}; // Bruk Record for fleksibilitet
    // Legg kun til felter som er sendt inn (ikke undefined)
    if (input.name !== undefined) dataToUpdate.name = input.name;
    if (input.location !== undefined) dataToUpdate.location = input.location;
    if (input.description !== undefined) dataToUpdate.description = input.description;
    if (input.email !== undefined) dataToUpdate.email = input.email;
    if (input.address !== undefined) dataToUpdate.address = input.address;
    if (input.phone !== undefined) dataToUpdate.phone = input.phone;
    if (input.website !== undefined) dataToUpdate.website = input.website;
    if (input.postalCode !== undefined) dataToUpdate.postalCode = input.postalCode;
    if (newLogoUrl !== null) dataToUpdate.logoUrl = newLogoUrl; // Legg til hvis ny fil er lastet opp
    if (newImageUrl !== null) dataToUpdate.imageUrl = newImageUrl;

    // Oppdater pris og stripePriceId kun hvis de har endret seg
    if (newPriceFromInput !== oldPriceInDb) {
        dataToUpdate.membershipPrice = newPriceFromInput; // Kan være null
        dataToUpdate.stripePriceId = newStripePriceId;   // Kan være null
    }

    // Oppdater databasen hvis det er noe å oppdatere
    if (Object.keys(dataToUpdate).length > 0) {
        const updatedClub = await prisma.club.update({
            where: { id: input.clubId },
            data: dataToUpdate,
             // Velg felter som trengs for returverdien
             select: { logoUrl: true, imageUrl: true }
        });
        return {
             success: "Klubbinnstillinger oppdatert!",
             logoUrl: updatedClub.logoUrl, // Returner den faktiske verdien fra DB
             imageUrl: updatedClub.imageUrl,
         };
    } else {
         // Ingen endringer, returner suksess med eksisterende data
          return {
              success: "Ingen endringer å lagre.",
              logoUrl: existingClub.logoUrl,
              imageUrl: existingClub.imageUrl,
          };
    }
  } catch (error) {
    console.error("Feil under oppdatering av klubbinnstillinger:", error);
    const errorMsg = error instanceof Error ? error.message : "Ukjent feil";
    return { error: `Kunne ikke oppdatere klubbinnstillinger: ${errorMsg}` };
  }
}