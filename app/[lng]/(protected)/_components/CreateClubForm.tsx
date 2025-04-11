
// Fil: /_components/klubber/CreateClubForm.tsx
// Formål: Skjemakomponent for å opprette en ny discgolfklubb. Håndterer input, validering, filopplasting og innsending til API.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Schema som inkluderer membershipPrice
const ClubFormSchema = z.object({
  name: z.string().min(3, "Klubbnavn må ha minst 3 tegn."),
  location: z.string().min(2, "Sted må fylles ut."), // Bruker 'location'
  description: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse.").optional().or(z.literal('')),
  logoUrl: z.any().optional(), // For filopplasting
  imageUrl: z.any().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Ugyldig URL.").optional().or(z.literal('')),
  postalCode: z.string().optional(),
  membershipPrice: z.coerce // Konverterer input til number
    .number({ invalid_type_error: "Pris må være et tall." })
    .int("Pris må være et heltall (øre).")
    .nonnegative("Pris kan ikke være negativ.")
    .optional(), // Valgfritt
});

type ClubFormValues = z.infer<typeof ClubFormSchema>;

// Props - fjernet ubrukte
interface CreateClubFormProps {
    // Kan legge til props her hvis nødvendig fra parent
}

const CreateClubForm: FC<CreateClubFormProps> = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(ClubFormSchema),
    defaultValues: {
      name: "",
      location: "", // Bruker location
      description: "",
      email: "",
      logoUrl: undefined,
      imageUrl: undefined,
      address: "",
      phone: "",
      website: "",
      postalCode: "",
      membershipPrice: undefined, // Start som undefined
    },
  });

  // Håndter submit
  const onSubmit = async (values: ClubFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Oppretter klubb...");

    try {
      const formData = new FormData();
      // Legg til alle felter i FormData
      formData.append("name", values.name);
      formData.append("location", values.location); // Bruk location
      if (values.description) formData.append("description", values.description);
      if (values.email) formData.append("email", values.email);
      if (values.address) formData.append("address", values.address);
      if (values.phone) formData.append("phone", values.phone);
      if (values.website) formData.append("website", values.website);
      if (values.postalCode) formData.append("postalCode", values.postalCode);

      // --- Legg til pris (i øre) ---
      if (values.membershipPrice !== undefined && values.membershipPrice !== null) {
        formData.append("membershipPrice", values.membershipPrice.toString());
      }

      // Håndter filer
      if (values.logoUrl && values.logoUrl[0]) {
        formData.append("logoUrl", values.logoUrl[0]);
      }
      if (values.imageUrl && values.imageUrl[0]) {
        formData.append("imageUrl", values.imageUrl[0]);
      }

      // Kall API (antas å være /api/clubs for POST)
      const response = await fetch("/api/clubs", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ukjent feil ved opprettelse.");
      }

      toast.success("Klubb opprettet!", { id: toastId });
      router.push(`/klubber/${result.club.id}`); // Redirect til klubbside
      router.refresh(); // Refresh data

    } catch (error: any) {
      console.error("Feil ved oppretting av klubb:", error);
      toast.error(`Feil: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Opprett ny DiskGolf Klubb
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Klubbnavn *</FormLabel> <FormControl><Input placeholder="Eks: Svinndal DiscGolf Klubb" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Location */}
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Sted (By/Kommune) *</FormLabel> <FormControl><Input placeholder="Eks: Svinndal" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Beskrivelse</FormLabel> <FormControl><Textarea placeholder="Fortell litt om klubben..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Email */}
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-post (for kontakt)</FormLabel> <FormControl><Input type="email" placeholder="kontakt@klubb.no" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Website */}
            <FormField control={form.control} name="website" render={({ field }) => ( <FormItem> <FormLabel>Nettside</FormLabel> <FormControl><Input type="url" placeholder="https://www.klubb.no" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Address */}
            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Adresse</FormLabel> <FormControl><Input placeholder="Klubbveien 1" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Postal Code */}
            <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postnummer</FormLabel> <FormControl><Input placeholder="1234" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            {/* Phone */}
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Telefon</FormLabel> <FormControl><Input type="tel" placeholder="12345678" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>

            {/* === Medlemspris Felt === */}
            <FormField
              control={form.control}
              name="membershipPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Årlig Medlemspris (i øre)</FormLabel>
                  <FormControl>
                    <Input
                       type="number" // Viktig for numerisk input
                       placeholder="F.eks. 20000 for 200 kr (blank = gratis)"
                       min="0"
                       step="1" // Hele øre
                       {...field}
                       // Konverter tom string til undefined, ellers parse til int
                       onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                       // Sørg for at value er en string eller number for input
                       value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ======================== */}

            {/* Logo Upload */}
            <FormField control={form.control} name="logoUrl" render={({ field }) => ( <FormItem> <FormLabel>Klubblogo (valgfritt)</FormLabel> <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl> <FormMessage /> </FormItem> )}/>
             {/* Image Upload */}
            <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Klubb Bilde (valgfritt)</FormLabel> <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl> <FormMessage /> </FormItem> )}/>


            <div className="flex justify-center pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Oppretter..." : "Opprett Klubb"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateClubForm;