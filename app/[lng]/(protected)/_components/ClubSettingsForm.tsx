// src/app/(protected)/_components/ClubSettingsForm.tsx
"use client";

import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image"; // For å vise bildeforhåndsvisninger
import toast from "react-hot-toast";

/**
 * Zod-skjema for klient-side validering av klubbinnstillingsskjemaet.
 */
const EditClubSchemaFrontend = z.object({
  name: z.string().min(3, "Klubbnavn må ha minst 3 tegn."),
  location: z.string().min(2, "Sted må fylles ut."),
  description: z.string().trim().optional(),
  email: z.string().email("Ugyldig e-postadresse.").optional().or(z.literal('')), // Tillat tom streng
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().url("Ugyldig URL.").optional().or(z.literal('')), // Tillat tom streng
  postalCode: z.string().trim().optional(),
  // Inputfelt for medlemspris (string) for å tillate komma/punktum
  membershipPriceInput: z.string()
    .optional()
    .refine((val) => {
        // Tillat tom eller mellomromstreng (tolkes som 0/null senere)
        if (!val || val.trim() === '') return true;
        // Valider format som "200" eller "200,50" eller "200.50"
        return /^[0-9]+([,.][0-9]{1,2})?$/.test(val.trim());
    }, { message: "Ugyldig prisformat (f.eks. 200 eller 200,50)" }),
});

// Type avledet fra Zod-skjemaet for skjemaverdier
type EditClubValuesFrontend = z.infer<typeof EditClubSchemaFrontend>;

/**
 * Interface for eksisterende klubbdata som sendes til skjemaet.
 */
interface ClubDataForEdit {
    id: string;
    name?: string | null;
    location?: string | null;
    description?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    imageUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    postalCode?: string | null;
    membershipPrice?: number | null; // Pris i øre fra DB
}

/**
 * Props for ClubSettingsForm-komponenten.
 */
interface ClubSettingsFormProps {
  clubData: ClubDataForEdit; // Nåværende data for klubben som redigeres
  // Callback-funksjon for å håndtere lagring av endringer (kaller server action)
  onSaveChanges: (
      clubId: string,
      values: { // Datastruktur forventet av lagringshandleren
         name?: string | null;
         location?: string | null;
         description?: string | null;
         email?: string | null;
         address?: string | null;
         phone?: string | null;
         website?: string | null;
         postalCode?: string | null;
         membershipPrice: number | null; // Pris i øre
      },
      logoFile: File | null, // Valgfri ny logofil
      imageFile: File | null // Valgfri ny bildefil
    ) => Promise<void>; // Forventer en asynkron funksjon
  isSaving: boolean; // Flagg som indikerer om lagring pågår
  isAuthorizedToEdit: boolean; // Flagg som indikerer om brukeren kan redigere
}

/**
 * Hjelpefunksjon for å konvertere pris i øre (tall) til en kr/øre-streng for visning.
 * @param priceInOre - Pris i øre (heltall eller null/undefined).
 * @returns Formatert prisstreng (f.eks. "200,50") eller tom streng.
 */
const convertToKrOreString = (priceInOre: number | null | undefined): string => {
    if (priceInOre === null || priceInOre === undefined) return '';
    // Bruk norsk locale for komma-separator og korrekt formatering
    return (priceInOre / 100).toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

/**
 * Hjelpefunksjon for å konvertere kr/øre-streng input tilbake til øre (heltall).
 * @param priceString - Prisstreng fra inputfeltet.
 * @returns Pris i øre (heltall) eller null hvis input er tom/ugyldig.
 */
const convertToOre = (priceString: string | undefined): number | null => {
    if (!priceString || priceString.trim() === '') return null; // Behandle tom som null (ingen pris)
    try {
        // Normaliser desimalskilletegn til punktum og fjern mellomrom
        const cleanedString = priceString.replace(',', '.').replace(/\s/g, '');
        const priceInKr = parseFloat(cleanedString);
        // Sjekk for ugyldig parsing eller negativ pris
        if (isNaN(priceInKr) || priceInKr < 0) return null;
        // Konverter til øre og rund til nærmeste heltall
        return Math.round(priceInKr * 100);
    } catch (e) {
        // Fang potensielle feil under konvertering
        console.error("Feil ved konvertering av prisstreng til øre:", e);
        return null;
    }
};

/**
 * Skjemakomponent for redigering av klubbinnstillinger.
 * Håndterer inputfelter, filopplastinger, forhåndsvisninger og innsendingslogikk.
 * Deaktiverer redigering basert på `isAuthorizedToEdit`-propen.
 */
const ClubSettingsForm: FC<ClubSettingsFormProps> = ({
    clubData,
    onSaveChanges,
    isSaving,
    isAuthorizedToEdit // Motta autorisasjonsstatus
}) => {
  // State for valgte filer (logo og hovedbilde)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // State for å vise eksisterende bilde-URLer (brukes for initial visning og forhåndsvisning)
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(clubData?.logoUrl ?? null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(clubData?.imageUrl ?? null);

  // Initialiser react-hook-form
  const form = useForm<EditClubValuesFrontend>({
    resolver: zodResolver(EditClubSchemaFrontend), // Bruk Zod for validering
    // Sett initiale skjemaverdier basert på mottatt clubData
    defaultValues: {
      name: clubData?.name || "",
      location: clubData?.location || "",
      description: clubData?.description || "",
      email: clubData?.email || "",
      address: clubData?.address || "",
      phone: clubData?.phone || "",
      website: clubData?.website || "",
      postalCode: clubData?.postalCode || "",
      // Konverter initial pris fra øre (tall) til kr/øre-streng for inputfeltet
      membershipPriceInput: convertToKrOreString(clubData?.membershipPrice),
    },
  });

   /**
    * Effekt for å nullstille skjemaet og bildeforhåndsvisninger når `clubData`-propen endres
    * (f.eks. bruker velger en annen klubb å redigere).
    */
   useEffect(() => {
       form.reset({ // Nullstill skjemafelter med ny data
           name: clubData?.name || "",
           location: clubData?.location || "",
           description: clubData?.description || "",
           email: clubData?.email || "",
           address: clubData?.address || "",
           phone: clubData?.phone || "",
           website: clubData?.website || "",
           postalCode: clubData?.postalCode || "",
           membershipPriceInput: convertToKrOreString(clubData?.membershipPrice),
       });
       // Oppdater viste bilder for å matche ny klubbdata
       setCurrentLogoUrl(clubData?.logoUrl ?? null);
       setCurrentImageUrl(clubData?.imageUrl ?? null);
       // Fjern eventuelle valgte filer fra forrige klubb
       setLogoFile(null);
       setImageFile(null);
   }, [clubData, form]); // Avhengighetsarray inkluderer clubData og form-instansen


  /**
   * Håndterer innsending av skjemaet.
   * Validerer input, konverterer pris, og kaller `onSaveChanges`-callbacken.
   * @param values - Skjemaverdier validert av Zod.
   */
  const onSubmit = async (values: EditClubValuesFrontend) => {
     // Forhindre innsending hvis bruker ikke er autorisert (UI burde allerede forhindre dette)
     if (!isAuthorizedToEdit) {
         toast.error("Du har ikke tillatelse til å lagre endringer for denne klubben.");
         return;
     }

     // Konverter medlemspris-inputstrengen til øre (tall eller null)
     const priceInOre = convertToOre(values.membershipPriceInput);

     // Forbered dataobjektet som skal sendes til server action
     // Bruk null for tomme valgfrie felter for å sikre DB-konsistens
     const dataToSend = {
         name: values.name?.trim() || null,
         location: values.location?.trim() || null,
         description: values.description?.trim() || null,
         email: values.email?.trim() || null,
         address: values.address?.trim() || null,
         phone: values.phone?.trim() || null,
         website: values.website?.trim() || null,
         postalCode: values.postalCode?.trim() || null,
         membershipPrice: priceInOre, // Send pris som tall (øre) eller null
     };

     // Kall forelderkomponentens lagringshandler med data og filer
     await onSaveChanges(clubData.id, dataToSend, logoFile, imageFile);

     // Valgfritt: Fjern filvalg etter vellykket lagring
     // setLogoFile(null);
     // setImageFile(null);
     // Merk: Skjemafelter oppdateres via useEffect som lytter på clubData hvis lagringen var vellykket
  };

  // Bestem om skjemaelementer skal deaktiveres (lagring pågår ELLER bruker ikke autorisert)
  const isDisabled = isSaving || !isAuthorizedToEdit;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rediger {clubData?.name || "Klubb"} Innstillinger</h2>

      {/* Vis en advarselsmelding hvis brukeren ikke er autorisert til å redigere */}
      {!isAuthorizedToEdit && (
          <p className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm">
              Du har ikke tillatelse til å redigere innstillinger for denne klubben.
          </p>
      )}

       <Form {...form}>
          {/* Form-elementet bruker react-hook-form's handleSubmit */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {/* --- Standard Tekst Inputfelter --- */}
             {/* Hvert felt bruker `isDisabled`-flagget */}
             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Klubbnavn *</FormLabel> <FormControl><Input {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Sted (By/Kommune) *</FormLabel> <FormControl><Input {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Beskrivelse</FormLabel> <FormControl><Textarea {...field} disabled={isDisabled} rows={4} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-post</FormLabel> <FormControl><Input type="email" {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="website" render={({ field }) => ( <FormItem> <FormLabel>Nettside</FormLabel> <FormControl><Input type="url" placeholder="https://..." {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Adresse</FormLabel> <FormControl><Input {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postnummer</FormLabel> <FormControl><Input {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Telefon</FormLabel> <FormControl><Input type="tel" {...field} disabled={isDisabled} /></FormControl> <FormMessage /> </FormItem> )}/>

            {/* --- Medlemspris Input --- */}
            <FormField
              control={form.control}
              name="membershipPriceInput" // Bundet til string inputfeltet
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Årlig Medlemspris (Kr)</FormLabel>
                  <FormControl>
                    <Input
                       type="text" // Bruk text for å tillate komma/punktum
                       placeholder="F.eks. 200 eller 200,50 (la stå tom for gratis)"
                       {...field} // Bind input-props
                       disabled={isDisabled} // Deaktiver basert på lagringsstatus eller autorisasjon
                    />
                  </FormControl>
                  <FormMessage /> {/* Vis valideringsfeil */}
                </FormItem>
              )}
            />

             {/* --- Logo Opplastingsfelt --- */}
             <FormItem>
                 <FormLabel>Endre Klubblogo (valgfritt)</FormLabel>
                 {/* Vis nåværende logo hvis den finnes og ingen ny fil er valgt */}
                  {currentLogoUrl && !logoFile && (
                    <div className="mb-2">
                        <Image src={currentLogoUrl} alt="Nåværende klubblogo" width={64} height={64} className="h-16 w-auto rounded object-contain bg-gray-100" />
                    </div>
                  )}
                  {/* Vis forhåndsvisning av nylig valgt logo */}
                   {logoFile && (
                       <div className="mb-2">
                           {/* Bruk URL.createObjectURL for lokal forhåndsvisning */}
                           <Image src={URL.createObjectURL(logoFile)} alt="Forhåndsvisning ny logo" width={64} height={64} className="h-16 w-auto rounded object-contain" />
                           <p className="text-xs text-muted-foreground mt-1">Ny fil valgt: {logoFile.name}</p>
                       </div>
                   )}
                 <FormControl>
                     <Input
                         type="file"
                         accept="image/*" // Aksepter standard bildetyper
                         disabled={isDisabled} // Deaktiver basert på lagringsstatus eller autorisasjon
                         onChange={(e) => {
                             // Forhindre state-oppdatering hvis deaktivert
                             if (isDisabled) return;
                             const file = e.target.files ? e.target.files[0] : null;
                             setLogoFile(file); // Oppdater state med valgt fil
                         }}
                     />
                 </FormControl>
                 {/* Merk: FormMessage virker ikke automatisk her siden det ikke er direkte kontrollert av RHF's `register` */}
             </FormItem>

             {/* --- Hovedbilde Opplastingsfelt --- */}
              <FormItem>
                 <FormLabel>Endre Klubb Bilde (valgfritt)</FormLabel>
                  {/* Vis nåværende bilde hvis det finnes og ingen ny fil er valgt */}
                  {currentImageUrl && !imageFile && (
                      <div className="mb-2">
                          <Image src={currentImageUrl} alt="Nåværende klubb bilde" width={150} height={84} className="w-auto h-auto max-w-[150px] rounded object-contain bg-gray-100" />
                      </div>
                  )}
                  {/* Vis forhåndsvisning av nylig valgt bilde */}
                  {imageFile && (
                      <div className="mb-2">
                          <Image src={URL.createObjectURL(imageFile)} alt="Forhåndsvisning nytt bilde" width={150} height={84} className="w-auto h-auto max-w-[150px] rounded object-contain" />
                          <p className="text-xs text-muted-foreground mt-1">Ny fil valgt: {imageFile.name}</p>
                      </div>
                  )}
                 <FormControl>
                     <Input
                         type="file"
                         accept="image/*"
                         disabled={isDisabled} // Deaktiver basert på lagringsstatus eller autorisasjon
                         onChange={(e) => {
                            if (isDisabled) return;
                            const file = e.target.files ? e.target.files[0] : null;
                            setImageFile(file); // Oppdater state med valgt fil
                         }}
                     />
                 </FormControl>
             </FormItem>

             {/* --- Lagre-knapp --- */}
             <div className="flex justify-end pt-4">
                 <Button
                     type="submit"
                     disabled={isDisabled} // Deaktiver basert på lagringsstatus eller autorisasjon
                     className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     {isSaving ? "Lagrer..." : "Lagre endringer"}
                 </Button>
            </div>
          </form>
       </Form>
    </div>
  );
};

export default ClubSettingsForm;