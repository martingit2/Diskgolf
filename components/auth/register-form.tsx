/**
 * Filnavn: register-form.tsx
 * Beskrivelse: Komponent for å håndtere brukerregistrering med skjema, validering og innsending.
 * Inkluderer feilmeldinger, suksessmeldinger og sosial innlogging.
 * Utvikler: Martin Pettersen
 */

// Rettet skrivefeil fra "Use client" til "use client"
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { register } from "@/app/actions/register"; // Antar at denne returnerer { error?: string, success?: string }
import { useTransition } from "react";

// --- OPPDATER INTERFACE ---
interface RegisterFormProps {
  onAlreadyHaveAccount: () => void;
  onRegisterSuccess?: () => void; // Gjør denne valgfri
}
// --------------------------

// --- OPPDATER FUNKSJONSSIGNATUR ---
const RegisterForm = ({ onAlreadyHaveAccount, onRegisterSuccess }: RegisterFormProps) => {
// ---------------------------------

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError(""); // Nullstill feil ved nytt forsøk
    setSuccess(undefined); // Nullstill suksess ved nytt forsøk

    startTransition(() => {
      register(values) // Kall server action for registrering
        .then((data) => { // Håndter svaret
          if (data?.error) { // Hvis det er en feilmelding fra serveren
             setError(data.error);
             setSuccess(undefined); // Sørg for at suksess er borte
          }
          if (data?.success) { // Hvis det er en suksessmelding fra serveren
            setError(undefined); // Sørg for at feil er borte
            setSuccess(data.success);
            // --- KALL CALLBACK VED SUKSESS ---
            if (onRegisterSuccess) {
              // Du kan legge inn en liten forsinkelse her hvis du vil at brukeren
              // skal rekke å se suksessmeldingen før dialogen byttes.
              // setTimeout(() => {
              //   onRegisterSuccess();
              // }, 1500); // F.eks. 1.5 sekunder
              // Eller kall den med en gang:
              onRegisterSuccess();
            }
            // ---------------------------------
          }
        })
        .catch(() => { // Håndter uventede feil under API-kallet
            setError("Noe gikk galt. Prøv igjen.");
            setSuccess(undefined);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Opprett ny bruker"
      backButtonLabel="Har du allerede konto?"
      backButtonHref="#" // Holder denne som # siden onBackButtonClick håndterer logikken
      onBackButtonClick={onAlreadyHaveAccount} // Bruker callback for å bytte dialog
      showSocial // Antar denne viser Google/Github etc. knapper
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Ola Nordmann"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email Input */}
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
                      placeholder="ola.nordmann@eksempel.no"
                      type="email"
                      autoComplete="email"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Input */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passord</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="********"
                      type="password"
                      autoComplete="new-password"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Vis feil- eller suksessmelding */}
          <FormError message={error} />
          <FormSuccess message={success} />
          {/* Send inn-knapp */}
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? "Oppretter..." : "Opprett konto"} {/* Vis feedback ved lasting */}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;