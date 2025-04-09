// app/actions/update-club-settings.ts
"use server";

import { PrismaClient, UserRole } from "@prisma/client";
import { currentUser } from "../lib/auth"; // Hjelpefunksjon for å hente session-bruker server-side
import cloudinary from "@/app/lib/cloudinary"; // Cloudinary SDK instans
import type { UploadApiResponse } from "cloudinary";
import { stripe } from "../lib/stripe"; // Stripe SDK instans

const prisma = new PrismaClient();

/**
 * Hjelpefunksjon for å laste opp en fil til Cloudinary.
 * @param file - Filen som skal lastes opp.
 * @param folder - Målmappen i Cloudinary.
 * @returns Sikker URL til den opplastede filen, eller null hvis ingen fil ble gitt.
 * @throws Error hvis filvalidering feiler eller Cloudinary-opplasting feiler.
 */
async function uploadFileToCloudinaryAction(file: File, folder: string): Promise<string | null> {
    if (!file) return null;

    // Grunnleggende filvalidering
    if (file.size > 10 * 1024 * 1024) throw new Error(`Filen "${file.name}" er for stor (maks 10MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error(`Ugyldig filtype for "${file.name}" (kun JPG, PNG, WEBP).`);

    const buffer = await file.arrayBuffer();
    try {
        // Last opp med Cloudinary's upload_stream
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const timestamp = Date.now();
            const public_id = `${file.name.split('.')[0]}_${timestamp}`; // Lag en unik public ID
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    upload_preset: "discgolf_uploads", // Bruk forhåndsdefinert upload preset
                    resource_type: "image",
                    public_id: public_id
                },
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
        throw error; // Kast feilen videre slik at den fanges av hoved-action-handleren
    }
}

/**
 * Input type for updateClubSettings server action.
 */
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
  membershipPrice?: number | null; // Pris i øre (heltall) eller null
  logoFile?: File | null;
  imageFile?: File | null;
}

/**
 * Returtype for updateClubSettings server action.
 */
interface UpdateClubSettingsResult {
    success?: string; // Suksessmelding
    error?: string;   // Feilmelding
    logoUrl?: string | null; // Oppdatert logo URL fra DB
    imageUrl?: string | null; // Oppdatert bilde URL fra DB
}

/**
 * Server Action for å oppdatere klubbinnstillinger, inkludert håndtering av bildeopplastinger og Stripe pris-oppdateringer.
 * Utfører autorisasjonssjekk for å sikre at kun ADMINs eller autoriserte CLUB_LEADERs kan oppdatere.
 * @param input - Data med de oppdaterte klubbinnstillingene.
 * @returns Et resultatobjekt som indikerer suksess eller feil, og potensielt oppdaterte bilde-URLer.
 */
export async function updateClubSettings(
    input: UpdateClubSettingsInput
): Promise<UpdateClubSettingsResult> {
  // 1. Hent nåværende bruker-session
  const user = await currentUser();
  if (!user?.id || !user.role) {
    // Uautorisert hvis ingen bruker eller rolle finnes i session
    return { error: "Uautorisert: Brukersesjon ikke funnet eller ufullstendig." };
  }

  // 2. Hent eksisterende klubbdata, inkludert admins for autorisasjonssjekk
  try {
     const existingClub = await prisma.club.findUnique({
        where: { id: input.clubId },
        select: {
            logoUrl: true,
            imageUrl: true,
            stripeProductId: true,
            stripePriceId: true,
            membershipPrice: true,
            admins: { // Inkluder admins knyttet til denne klubben
                select: { id: true } // Trenger kun ID-ene for sjekken
            }
        }
     });

     if (!existingClub) {
         return { error: "Klubben ble ikke funnet." };
     }

     // 3. Autorisjonssjekk
     const isAdmin = user.role === UserRole.ADMIN;
     // Sjekk om bruker er CLUB_LEADER OG er listet som admin for *denne spesifikke* klubben
     const isClubLeaderForThisClub = user.role === UserRole.CLUB_LEADER &&
                                      existingClub.admins.some(admin => admin.id === user.id);

     if (!isAdmin && !isClubLeaderForThisClub) {
         // Hvis bruker verken er ADMIN eller autorisert CLUB_LEADER, nekt tilgang
         console.warn(`Uautorisert forsøk på å oppdatere klubb ${input.clubId} av bruker ${user.id} (Rolle: ${user.role})`);
         return { error: "Uautorisert: Du har ikke tillatelse til å endre denne klubbens innstillinger." };
     }

     console.log(`Bruker ${user.id} (Rolle: ${user.role}) autorisert til å oppdatere klubb ${input.clubId}.`);

    // 4. Håndter potensielle filopplastinger
    const [newLogoUrl, newImageUrl] = await Promise.all([
        input.logoFile ? uploadFileToCloudinaryAction(input.logoFile, 'discgolf/clubs/logos') : Promise.resolve(null),
        input.imageFile ? uploadFileToCloudinaryAction(input.imageFile, 'discgolf/clubs/images') : Promise.resolve(null)
    ]);

     // 5. Håndter Stripe Pris-oppdateringer hvis medlemspris er endret
     let newStripePriceId = existingClub.stripePriceId; // Start med eksisterende ID
     const oldPriceInDb = existingClub.membershipPrice;
     // Sikre at input-pris er number eller null (håndter potensiell undefined fra frontend)
     const newPriceFromInput = input.membershipPrice === undefined ? null : input.membershipPrice;

     if (newPriceFromInput !== oldPriceInDb) {
         console.log(`Medlemspris endret for klubb ${input.clubId}. Gammel: ${oldPriceInDb}, Ny: ${newPriceFromInput}`);

         // Arkiver den gamle Stripe-prisen hvis den eksisterer
         if (existingClub.stripePriceId) {
             try {
                 await stripe.prices.update(existingClub.stripePriceId, { active: false });
                 console.log(`Arkiverte gammel Stripe Price: ${existingClub.stripePriceId}`);
                 newStripePriceId = null; // Fjern ID-en siden den gamle prisen ikke lenger er aktiv
             } catch (stripeError: any) {
                  // Logg feil, men fortsett - DB vil oppdateres, men Stripe kan ha en inaktiv pris hengende igjen
                  console.error(`Kunne ikke arkivere Stripe Price ${existingClub.stripePriceId}:`, stripeError.message || stripeError);
             }
         }

         // Opprett en ny Stripe Price hvis en ny pris (> 0) er satt og et Stripe Produkt eksisterer
         if (newPriceFromInput !== null && newPriceFromInput > 0 && existingClub.stripeProductId) {
            try {
                 const newPrice = await stripe.prices.create({
                     product: existingClub.stripeProductId, // Koble til klubbens Stripe Produkt
                     unit_amount: newPriceFromInput,        // Pris i øre
                     currency: 'nok',
                     recurring: { interval: 'year' },     // Antar årlig medlemskap
                     metadata: { clubId: input.clubId }   // Koble prisen tilbake til klubb-ID
                 });
                 newStripePriceId = newPrice.id;
                 console.log(`Opprettet ny Stripe Price: ${newStripePriceId}`);
            } catch (stripeError: any) {
                 console.error(`Kunne ikke opprette ny Stripe Price for klubb ${input.clubId}:`, stripeError.message || stripeError);
                 // Hvis opprettelse av ny pris feiler, returner feil da det er kritisk for betalingsflyten
                 return { error: "Kunne ikke opprette den nye medlemsprisen i betalingssystemet." };
            }
         } else if (newPriceFromInput !== null && newPriceFromInput > 0 && !existingClub.stripeProductId) {
             // Advar hvis pris er satt, men Stripe Produkt mangler (burde vært opprettet med klubben)
             console.warn(`Klubb ${input.clubId} har medlemspris, men mangler Stripe Produkt ID.`);
             // Ikke sett pris-ID i dette tilfellet
             newStripePriceId = null;
         } else {
             // Hvis pris er 0 eller null, sikre at ingen pris-ID er satt
             newStripePriceId = null;
         }
     }

    // 6. Forbered dataobjekt for Prisma-oppdatering (inkluder kun felter som faktisk ble sendt)
    const dataToUpdate: Record<string, any> = {};
    if (input.name !== undefined) dataToUpdate.name = input.name;
    if (input.location !== undefined) dataToUpdate.location = input.location;
    if (input.description !== undefined) dataToUpdate.description = input.description;
    if (input.email !== undefined) dataToUpdate.email = input.email;
    if (input.address !== undefined) dataToUpdate.address = input.address;
    if (input.phone !== undefined) dataToUpdate.phone = input.phone;
    if (input.website !== undefined) dataToUpdate.website = input.website;
    if (input.postalCode !== undefined) dataToUpdate.postalCode = input.postalCode;

    // Inkluder nye bilde-URLer hvis filer ble lastet opp
    if (newLogoUrl !== null) dataToUpdate.logoUrl = newLogoUrl;
    if (newImageUrl !== null) dataToUpdate.imageUrl = newImageUrl;

    // Inkluder pris og Stripe Price ID kun hvis prisen faktisk endret seg
    if (newPriceFromInput !== oldPriceInDb) {
        dataToUpdate.membershipPrice = newPriceFromInput; // Kan være null
        dataToUpdate.stripePriceId = newStripePriceId;   // Kan være null
    }

    // 7. Oppdater databasen hvis det er endringer
    if (Object.keys(dataToUpdate).length > 0) {
        const updatedClub = await prisma.club.update({
            where: { id: input.clubId },
            data: dataToUpdate,
            select: { logoUrl: true, imageUrl: true } // Velg de potensielt oppdaterte URLene for retur
        });
        console.log(`Klubb ${input.clubId} oppdatert.`);
        return {
             success: "Klubbinnstillinger oppdatert!",
             logoUrl: updatedClub.logoUrl, // Returner den endelige URLen fra databasen
             imageUrl: updatedClub.imageUrl,
         };
    } else {
        // Ingen endringer ble gjort i dataene
        console.log(`Ingen dataendringer oppdaget for klubb ${input.clubId}.`);
         return {
             success: "Ingen endringer å lagre.",
             logoUrl: existingClub.logoUrl, // Returner eksisterende URLer
             imageUrl: existingClub.imageUrl,
         };
    }
  } catch (error) {
    // Fang feil fra Prisma, Cloudinary, eller Stripe-operasjoner
    console.error("Feil ved oppdatering av klubbinnstillinger:", error);
    const errorMsg = error instanceof Error ? error.message : "En ukjent feil oppstod";
    // Sjekk om det var den spesifikke autorisasjonsfeilen vi kan ha kastet over
    if (errorMsg.startsWith("Uautorisert:")) {
        return { error: errorMsg };
    }
    // Returner en generisk feilmelding for andre feil
    return { error: `Kunne ikke oppdatere klubbinnstillinger: ${errorMsg}` };
  }
}