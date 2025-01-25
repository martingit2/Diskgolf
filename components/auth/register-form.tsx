/** 
 * Filnavn: register-form.tsx
 * Beskrivelse: Komponent for å håndtere brukerregistrering med skjema, validering og innsending.
 * Inkluderer feilmeldinger, suksessmeldinger og sosial innlogging.
 * Utvikler: Martin Pettersen
 */


"Use client";

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
import { register } from "@/app/actions/register";
import { useTransition } from "react";

interface RegisterFormProps {
  onAlreadyHaveAccount: () => void;
}

const RegisterForm = ({ onAlreadyHaveAccount }: RegisterFormProps) => {
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
    setError("");
    setSuccess(undefined);

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Opprett ny bruker"
      backButtonLabel="Har du allerede konto?"
      backButtonHref="#"
      onBackButtonClick={onAlreadyHaveAccount}
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                    />
                  </FormControl>
                  <FormMessage /> {/* Viser valideringsfeil for "name" */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="ola.nordmann@eksempel.no"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage /> {/* Viser valideringsfeil for "email" */}
                </FormItem>
              )}
            />
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
                    />
                  </FormControl>
                  <FormMessage /> {/* Viser valideringsfeil for "password" */}
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Opprett konto
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
