// src/components/klubber/CreateMeetingForm.tsx
"use client";

import { FC, useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { UploadCloud, FileText } from 'lucide-react';
// EKSEMPEL: Importer din globale loading store
// import { useLoadingStore } from '@/store/loadingStore';

// Zod schema - Validerer File client-side, Object server-side
const CreateMeetingFormSchema = z.object({
    title: z.string().min(3, "Tittel må ha minst 3 tegn."),
    description: z.string().optional(),
    pdfFile: z.instanceof(typeof window !== 'undefined' ? File : Object, { message: "Du må velge én PDF-fil." })
      .refine((file): file is File => file instanceof File && file.size > 0, { // Type guard og size check
          message: "PDF-fil kan ikke være tom.",
      })
      .refine((file) => file instanceof File && file.size <= 5 * 1024 * 1024, {
          message: `Filstørrelsen må være under 5MB.`,
      })
      .refine((file) => file instanceof File && file.type === "application/pdf", {
          message: "Filen må være en PDF.",
      }),
});

type CreateMeetingFormValues = z.infer<typeof CreateMeetingFormSchema>;

interface CreateMeetingFormProps {
  clubId: string;
  onSuccess: () => void;
}

const CreateMeetingForm: FC<CreateMeetingFormProps> = ({ clubId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  // EKSEMPEL: Hent global loading state setter
  // const setGlobalLoading = useLoadingStore((state) => state.setLoading);

  const form = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(CreateMeetingFormSchema),
    defaultValues: { title: "", description: "", pdfFile: undefined },
  });

   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
       const file = event.target.files?.[0];
       setSelectedFileName(file ? file.name : null);
       // RHF settes i FormField onChange
   };

   const onSubmit = async (values: CreateMeetingFormValues) => {
    // Zod har allerede validert at pdfFile er en File client-side
    // Men vi legger inn en instanceof sjekk for type sikkerhet før append
    if (!(values.pdfFile instanceof File)) {
        console.error("onSubmit ble kalt, men pdfFile er ikke et File objekt:", values.pdfFile);
        toast.error("En feil oppstod med filen. Vennligst velg den på nytt.");
        form.setError("pdfFile", { type: "manual", message: "Ugyldig filobjekt." });
        return;
    }

    setIsSubmitting(true);
    // EKSEMPEL: Sett global loading
    // setGlobalLoading(true);
    const toastId = toast.loading("Laster opp og lagrer...");

    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    // ------ TRYGG APPEND ------
    formData.append("pdfFile", values.pdfFile); // Nå vet vi at dette er et File-objekt
    // -------------------------

    try {
      const response = await fetch(`/api/clubs/${clubId}/meetings`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorPayload: any = { error: `API feil: ${response.status} ${response.statusText}` };
         try { errorPayload = await response.json(); } catch (e) { console.warn("Kunne ikke parse feil-JSON"); }
        console.error("API Error Payload:", errorPayload);
        throw new Error(errorPayload.error || `API feil: ${response.status}`);
      }

      form.reset();
      setSelectedFileName(null);
      // EKSEMPEL: Nullstill global loading FØR onSuccess
      // setGlobalLoading(false);
      toast.dismiss(toastId);
      onSuccess();

    } catch (error: any) {
      console.error("Feil i onSubmit (CreateMeetingForm):", error);
      // EKSEMPEL: Nullstill global loading ved feil
      // setGlobalLoading(false);
      toast.error(`Feil: ${error.message || 'Ukjent feil'}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-4">
        {/* Tittel Felt */}
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-800 dark:text-gray-200"> Tittel * </FormLabel>
              <FormControl>
                <Input placeholder="F.eks. Referat fra styremøte..." {...field} className="border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900"/>
              </FormControl>
              <FormMessage className="text-xs text-red-600 dark:text-red-400" />
            </FormItem>
        )}/>
        {/* Beskrivelse Felt */}
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-800 dark:text-gray-200"> Beskrivelse <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(valgfritt)</span> </FormLabel>
              <FormControl>
                <Textarea placeholder="Kort sammendrag..." {...field} rows={3} className="border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900"/>
              </FormControl>
              <FormMessage className="text-xs text-red-600 dark:text-red-400" />
            </FormItem>
        )}/>
        {/* PDF-fil Felt */}
        <FormField
          control={form.control}
          name="pdfFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-800 dark:text-gray-200"> PDF-fil * </FormLabel>
              <FormControl>
                 <Input id="pdf-upload-input" type="file" accept=".pdf" className="sr-only" onChange={(e) => { const file = e.target.files?.[0] ?? null; field.onChange(file); handleFileChange(e); }} ref={field.ref} aria-hidden="true"/>
               </FormControl>
               {/* ------ KORRIGERT JSX className ------ */}
               <label
                 htmlFor="pdf-upload-input"
                 className={`flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200 ease-in-out ${form.formState.errors.pdfFile ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} ${isSubmitting ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
               >
                 <UploadCloud className={`mr-2 h-5 w-5 ${form.formState.errors.pdfFile ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
                 <span className={`text-sm font-medium ${form.formState.errors.pdfFile ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                   {selectedFileName ? 'Endre fil' : 'Klikk for å velge PDF'}
                 </span>
               </label>
               {/* ------ KORRIGERT JSX className ------ */}
              {selectedFileName && !form.formState.errors.pdfFile && (
                  <div className="flex items-center mt-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-green-800 dark:text-green-200 truncate" title={selectedFileName}>
                          Valgt: {selectedFileName}
                      </span>
                  </div>
              )}
               <FormMessage className="text-xs text-red-600 dark:text-red-400 mt-1" />
            </FormItem>
          )}
        />
        {/* Submit-knapp */}
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} size="lg"> {isSubmitting ? "Lagrer..." : "Lagre dokument"} </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateMeetingForm;