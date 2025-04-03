/**
 * Filnavn: login-form.tsx
 * Beskrivelse: Komponent for brukerinnlogging med CardWrapper.
 * Utvikler: Martin Pettersen
 */
"use client";

import React, { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginSchema } from "@/schemas"; // Sørg for at denne finnes
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Bruker shadcn form
import { Input } from "@/components/ui/input"; // Bruker shadcn input
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button"; // Bruker shadcn button
import { FormError } from "../form-error"; // Sørg for at denne finnes
import { FormSuccess } from "../form-success"; // Sørg for at denne finnes
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Brukes for refresh etter login om nødvendig
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"; // Importer redirect path

interface LoginFormProps {
  onForgotPassword: () => void; // Callback for å åpne reset modal
  onRegister: () => void; // Callback for å åpne register modal
  onLoginSuccess?: () => void; // Callback for å lukke modalen etter suksess
}

const LoginForm = ({
  onForgotPassword,
  onRegister,
  onLoginSuccess,
}: LoginFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Kall onForgotPassword når linken klikkes
  const handleForgotPasswordClick = useCallback(() => {
    console.log("[LoginForm] 'Glemt passord?' clicked. Calling onForgotPassword prop.");
    onForgotPassword();
  }, [onForgotPassword]);

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      signIn("credentials", {
        ...values, // Send email og password
        redirect: false, // Vi håndterer redirect/feedback manuelt
      })
        .then((callback) => {
          if (callback?.error) {
             if (callback.error === "CredentialsSignin") {
               setError("Ugyldig e-post eller passord.");
             } else {
               setError(callback.error); // Vis annen feil fra next-auth
             }
          } else if (callback?.ok && !callback?.error) {
            setSuccess("Innlogging vellykket!");
            form.reset();
            // Vent litt før redirect/lukking for å vise suksessmelding
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess(); // Lukk modalen
                }
                // Router refresh kan være lurt for å oppdatere server components
                 router.refresh();
                // Alternativt, redirect til dashboard manuelt hvis ikke refresh er nok
                // router.push(DEFAULT_LOGIN_REDIRECT);
            }, 1000);
          }
        })
        .catch(() => {
           setError("Noe uventet gikk galt under innlogging.");
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Velkommen tilbake"
      backButtonLabel="Har du ikke konto? Opprett her" // Endret tekst
      backButtonHref="#" // Ikke i bruk pga onClick
      onBackButtonClick={onRegister} // Kall onRegister når tilbakeknappen klikkes
      showSocial={true} // Viser Google/Github knapper via <Social />
    >
      {/* Info-boks (kan beholdes hvis ønskelig) */}
      <div className="p-3 mb-4 bg-blue-50 text-xs text-blue-700 border border-blue-200 rounded">
        Til Sensor og lærer: Bruk <strong>admin@diskgolf.app</strong> (admin) eller{" "}
        <strong>bruker@diskgolf.app</strong> (bruker). Passord som i oppgaven.
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Mindre space */}
          <div className="space-y-2"> {/* Mindre space */}
            {/* E-post felt */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="din@epost.no"
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Passord felt */}
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
                       autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                  {/* "Glemt passord?" knapp */}
                   <Button
                     size="sm"
                     variant="link"
                     onClick={handleForgotPasswordClick} // Bruker lokal handler
                     className="px-0 font-normal text-xs text-muted-foreground hover:text-foreground" // Mindre tekst, justert farge
                     type="button" // Viktig!
                     disabled={isPending}
                   >
                     Glemt passord?
                   </Button>
                </FormItem>
              )}
            />
          </div>
          {/* Vis globale feil- eller suksessmeldinger */}
          <FormError message={error} />
          <FormSuccess message={success} />
          {/* Send inn-knapp */}
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? "Logger inn..." : "Logg inn"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;