// src/app/(protected)/_components/ClubSettingsForm.tsx (eller hvor den ligger)
"use client";

import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image"; // Importer Image
import toast from "react-hot-toast"; // Kan brukes for feil/suksess i skjemaet om ønskelig

// Frontend Zod schema (likt som i CreateClubForm for konsistens)
const EditClubSchemaFrontend = z.object({
  name: z.string().min(3, "Klubbnavn må ha minst 3 tegn."),
  location: z.string().min(2, "Sted må fylles ut."),
  description: z.string().trim().optional(),
  email: z.string().email("Ugyldig e-postadresse.").optional().or(z.literal('')),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().url("Ugyldig URL.").optional().or(z.literal('')),
  postalCode: z.string().trim().optional(),
  membershipPriceInput: z.string() // Pris som string for input
    .optional()
    .refine((val) => {
        if (!val || val.trim() === '') return true;
        return /^[0-9]+([,.][0-9]{1,2})?$/.test(val.trim());
    }, { message: "Ugyldig prisformat (f.eks. 200 eller 200,50)" }),
});

type EditClubValuesFrontend = z.infer<typeof EditClubSchemaFrontend>;

// Definer den forventede typen for innkommende klubbdata
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

// Definer props for skjemaet
interface ClubSettingsFormProps {
  clubData: ClubDataForEdit; // Eksisterende data
  // Korrekt signatur som matcher handleSaveChanges i ClubSettingsPage
  onSaveChanges: (
      clubId: string,
      values: { // Send kun relevant data, pris som number|null (øre)
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
      logoFile: File | null,
      imageFile: File | null
    ) => Promise<void>; // Returnerer Promise da det er en async operasjon
  isSaving: boolean; // Loading state
}

// Hjelpefunksjon: Konverter øre (number) til kr/øre string
const convertToKrOreString = (priceInOre: number | null | undefined): string => {
    if (priceInOre === null || priceInOre === undefined) return '';
    // Bruk toLocaleString for korrekt formatering (komma)
    return (priceInOre / 100).toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Hjelpefunksjon: Konverter kr/øre string til øre (integer)
const convertToOre = (priceString: string | undefined): number | null => {
    if (!priceString || priceString.trim() === '') return null;
    try {
        const cleanedString = priceString.replace(',', '.').replace(/\s/g, '');
        const priceInKr = parseFloat(cleanedString);
        if (isNaN(priceInKr) || priceInKr < 0) return null;
        return Math.round(priceInKr * 100);
    } catch (e) { return null; }
};


const ClubSettingsForm: FC<ClubSettingsFormProps> = ({ clubData, onSaveChanges, isSaving }) => {
  // State for å holde styr på valgte filer
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // State for å vise nåværende bilder (fra clubData)
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(clubData?.logoUrl ?? null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(clubData?.imageUrl ?? null);

  // Initialiser react-hook-form
  const form = useForm<EditClubValuesFrontend>({
    resolver: zodResolver(EditClubSchemaFrontend),
    // Sett startverdier basert på clubData
    defaultValues: {
      name: clubData?.name || "",
      location: clubData?.location || "",
      description: clubData?.description || "",
      email: clubData?.email || "",
      address: clubData?.address || "",
      phone: clubData?.phone || "",
      website: clubData?.website || "",
      postalCode: clubData?.postalCode || "",
      membershipPriceInput: convertToKrOreString(clubData?.membershipPrice), // Konverter øre til string
    },
  });

   // Effekt for å resette skjemaet hvis clubData (fra props) endres
   useEffect(() => {
       form.reset({
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
       // Oppdater viste bilder og nullstill filvalg
        setCurrentLogoUrl(clubData?.logoUrl ?? null);
        setCurrentImageUrl(clubData?.imageUrl ?? null);
        setLogoFile(null);
        setImageFile(null);
   }, [clubData, form]); // Kjør når clubData eller form endres


  // Håndter innsending av skjemaet
  const onSubmit = async (values: EditClubValuesFrontend) => {
     // Konverter prisinput (string) til øre (number | null)
     const priceInOre = convertToOre(values.membershipPriceInput);

     // Forbered dataobjektet som skal sendes til onSaveChanges
      const dataToSend = {
         name: values.name || null, // Send null hvis tom streng
         location: values.location || null,
         description: values.description || null,
         email: values.email || null,
         address: values.address || null,
         phone: values.phone || null,
         website: values.website || null,
         postalCode: values.postalCode || null,
         membershipPrice: priceInOre, // Send prisen i øre (eller null)
      };

     // Kall onSaveChanges (fra parent) med all nødvendig info
     await onSaveChanges(clubData.id, dataToSend, logoFile, imageFile);
     // Nullstill filvalg etter lagring (valgfritt)
      // setLogoFile(null);
      // setImageFile(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rediger {clubData?.name || "Klubb"}</h2>
       <Form {...form}>
          {/* Bruk form.handleSubmit for å trigge validering og onSubmit */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {/* --- Standard Inputfelter (bruker FormField) --- */}
             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Klubbnavn *</FormLabel> <FormControl><Input {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Sted (By/Kommune) *</FormLabel> <FormControl><Input {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Beskrivelse</FormLabel> <FormControl><Textarea {...field} disabled={isSaving} rows={4} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-post</FormLabel> <FormControl><Input type="email" {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="website" render={({ field }) => ( <FormItem> <FormLabel>Nettside</FormLabel> <FormControl><Input type="url" {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Adresse</FormLabel> <FormControl><Input {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postnummer</FormLabel> <FormControl><Input {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Telefon</FormLabel> <FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl> <FormMessage /> </FormItem> )}/>
             {/* ------------------------------------------------- */}

            {/* --- Oppdatert Medlemspris Felt --- */}
            <FormField
              control={form.control}
              name="membershipPriceInput" // Binder til string-feltet i form state
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Årlig Medlemspris (Kr)</FormLabel>
                  <FormControl>
                    <Input
                       type="text" // Tillater komma/punktum
                       placeholder="F.eks. 200 eller 200,50 (blank = gratis)"
                       {...field} // Binder input til RHF state
                       disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage /> {/* Viser Zod valideringsfeil */}
                </FormItem>
              )}
            />
            {/* -------------------------------- */}

             {/* --- Logo Felt --- */}
             <FormItem>
                 <FormLabel>Endre Klubblogo (valgfritt)</FormLabel>
                 {/* Vis nåværende logo */}
                  {currentLogoUrl && !logoFile && (
                    <div className="mb-2">
                        <Image src={currentLogoUrl} alt="Nåværende logo" width={64} height={64} className="h-16 w-auto rounded object-contain bg-gray-100" />
                    </div>
                  )}
                  {/* Vis preview av ny logo */}
                   {logoFile && (
                       <div className="mb-2">
                           <Image src={URL.createObjectURL(logoFile)} alt="Ny logo preview" width={64} height={64} className="h-16 w-auto rounded object-contain" />
                           <p className="text-xs text-muted-foreground mt-1">Ny fil valgt: {logoFile.name}</p>
                       </div>
                   )}
                 <FormControl>
                     <Input
                         type="file"
                         accept="image/*" // Aksepter kun bilder
                         disabled={isSaving}
                         onChange={(e) => {
                             const file = e.target.files ? e.target.files[0] : null;
                             setLogoFile(file); // Oppdater state for den valgte filen
                         }}
                     />
                 </FormControl>
                 {/* FormMessage vises ikke her siden det ikke er et RHF-kontrollert felt */}
             </FormItem>
             {/* ---------------- */}

             {/* --- Bilde Felt --- */}
              <FormItem>
                 <FormLabel>Endre Klubb Bilde (valgfritt)</FormLabel>
                  {/* Vis nåværende bilde */}
                  {currentImageUrl && !imageFile && (
                      <div className="mb-2">
                          <Image src={currentImageUrl} alt="Nåværende bilde" width={150} height={84} className="w-auto h-auto max-w-[150px] rounded object-contain bg-gray-100" />
                      </div>
                  )}
                  {/* Vis preview av nytt bilde */}
                  {imageFile && (
                      <div className="mb-2">
                          <Image src={URL.createObjectURL(imageFile)} alt="Nytt bilde preview" width={150} height={84} className="w-auto h-auto max-w-[150px] rounded object-contain" />
                          <p className="text-xs text-muted-foreground mt-1">Ny fil valgt: {imageFile.name}</p>
                      </div>
                  )}
                 <FormControl>
                     <Input
                         type="file"
                         accept="image/*"
                         disabled={isSaving}
                         onChange={(e) => {
                             const file = e.target.files ? e.target.files[0] : null;
                             setImageFile(file); // Oppdater state for den valgte filen
                         }}
                     />
                 </FormControl>
             </FormItem>
             {/* ---------------- */}

             {/* Lagre-knapp */}
             <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                     {isSaving ? "Lagrer..." : "Lagre endringer"}
                 </Button>
            </div>
          </form>
       </Form>
    </div>
  );
};

export default ClubSettingsForm;