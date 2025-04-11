// Fil: schemas/clubSettingsSchema.ts
// Formål: Definerer et Zod-schema for validering av data relatert til klubbinnstillinger.
//         Inkluderer felter som navn, e-post, beskrivelse, logo, sted, adresse, telefon, og postnummer med tilhørende valideringsregler.
// Utvikler: Martin Pettersen



import { z } from "zod";

export const ClubSettingsSchema = z.object({
  name: z.string().min(1, "Klubbens navn er påkrevd"), // Klubbens navn
  email: z.string().email("Ugyldig e-postadresse").optional(), // E-post (valgfritt)
  description: z.string().max(500, "Beskrivelsen kan ikke være lengre enn 500 tegn").optional(), // Beskrivelse (valgfritt)
  logoUrl: z.string().optional(), // Logo URL som streng (valgfritt)
  sted: z.string().min(1, "Sted er påkrevd"), // Sted (påkrevd)
  address: z.string().min(1, "Adresse er påkrevd"), // Adresse (påkrevd)
  phone: z.string().min(1, "Telefonnummer er påkrevd"), // Telefonnummer (påkrevd)
  postalCode: z.string().min(1, "Postnummer er påkrevd"), // Postnummer (påkrevd)
});

export type ClubSettingsSchemaType = z.infer<typeof ClubSettingsSchema>;
