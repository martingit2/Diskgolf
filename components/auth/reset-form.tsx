/** 
 * Filnavn: reset-form.tsx
 * Beskrivelse: Komponent for å håndtere tilbakestilling av passord. 
 * Gir brukeren mulighet til å be om en e-post for å tilbakestille passordet.
 * Utvikler: Martin Pettersen
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
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { reset } from "@/app/actions/reset";

interface ResetFormProps {
  onBackToLogin: () => void; // Riktig definert funksjon
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
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Glemt passord?"
      backButtonLabel="Tilbake til innlogging"
      backButtonHref="#"
      onBackButtonClick={(e) => {
        e.preventDefault();
        if (onBackToLogin) onBackToLogin(); // Kaller funksjonen riktig
      }}
      showSocial={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Epost</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="ola.nordmann@eksempel.no"
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
