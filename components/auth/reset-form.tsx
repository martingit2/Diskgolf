/**
 * Filnavn: reset-form.tsx
 * Beskrivelse: Komponent for å håndtere tilbakestilling av passord via CardWrapper (Alternativ implementasjon, muligens ikke i bruk).
 * Gir brukeren mulighet til å be om en e-post for å tilbakestille passordet.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */

"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResetSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"; // Antar denne finnes
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error"; // Antar denne finnes
import { FormSuccess } from "@/components/form-success"; // Antar denne finnes
import { reset } from "@/app/actions/reset";

interface ResetFormProps {
  onBackToLogin: () => void; // Callback for å gå tilbake
}

export const ResetForm = ({ onBackToLogin }: ResetFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        if (data?.success) {
           form.reset(); // Tøm skjema ved suksess
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Glemt passord?"
      backButtonLabel="Tilbake til innlogging"
      backButtonHref="#" // Bruker onClick i stedet
      onBackButtonClick={(e) => { // 'e' kan være undefined basert på CardWrapper sin prop-type
        // --- LEGG TIL SJEKK HER ---
        if (e) {
          e.preventDefault(); // Kall preventDefault kun hvis 'e' finnes
        }
        // --------------------------
        if (onBackToLogin) {
           onBackToLogin(); // Kall callback-funksjonen
        }
      }}
      showSocial={false} // Viser ikke sosiale knapper her
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel> {/* Endret til E-post */}
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="din@epost.no" // Endret placeholder
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Send tilbakestillings e-post
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
