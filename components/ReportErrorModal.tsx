// components/ReportErrorModal.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';

// Skjema validering
const ReportErrorSchema = z.object({
  description: z.string().min(10, { message: "Beskrivelsen må være minst 10 tegn." })
                      .max(1000, { message: "Beskrivelsen kan ikke være lengre enn 1000 tegn." }),
});

type ReportErrorFormValues = z.infer<typeof ReportErrorSchema>;

interface ReportErrorModalProps {
  courseId: string;
  courseName: string;
}

export function ReportErrorModal({ courseId, courseName }: ReportErrorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportErrorFormValues>({
    resolver: zodResolver(ReportErrorSchema),
    defaultValues: {
      description: '',
    },
  });

  // Reset state når dialogen lukkes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        form.reset();
        setError(undefined);
        setSuccess(undefined);
        setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: ReportErrorFormValues) => {
    setError(undefined);
    setSuccess(undefined);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseId,
          description: values.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'En feil oppstod ved innsending.');
        toast.error(data.error || 'Kunne ikke sende rapport.');
        setIsSubmitting(false);
      } else {
        setSuccess('Feilrapport sendt! Takk for hjelpen.');
        toast.success('Feilrapport sendt!');
        form.reset();
        setTimeout(() => {
            handleOpenChange(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Nettverksfeil eller uventet feil:", err);
      setError('En uventet feil oppstod. Prøv igjen senere.');
      toast.error('En uventet feil oppstod.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          Meld Feil på Bane
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
           {/* --- KORRIGERT HER: Lagt til dark:text-gray-100 --- */}
          <DialogTitle className="flex items-center gap-2 text-black dark:text-gray-100">
             <AlertTriangle className="w-6 h-6 text-red-500" />
             Meld feil på banen: {courseName}
          </DialogTitle>
          {/* Description bør følge standard dark mode */}
          <DialogDescription>
            Beskriv problemet du fant på banen så detaljert som mulig.
            Alle rapporter hjelper oss med å holde banen i god stand.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                   {/* --- KORRIGERT HER: Lagt til dark:text-gray-100 --- */}
                  <FormLabel className='text-black dark:text-gray-100'>Beskrivelse av feilen</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="F.eks. Kurv på hull 5 er løs, Tee-skilt på hull 2 mangler, mye søppel ved utkast 8..."
                      // Beholdt klassene for textarea fra forrige svar
                       className="min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <FormError message={error} />}
            {success && <FormSuccess message={success} />}
            <DialogFooter>
                 <Button
                    type="button"
                    variant="outline" // Denne håndterer vanligvis dark mode riktig
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                    className='text-black'
                 >
                    Avbryt
                 </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600 text-white" // Sikrer hvit tekst
              >
                {isSubmitting ? (
                   <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sender... </>
                ) : (
                   'Send feilrapport'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}