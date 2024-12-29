"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onForgotPassword, onRegister, onLoginSuccess }: LoginFormProps) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess(undefined);
    setIsPending(true);

    try {
      // Kall signIn direkte i klientkomponenten
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-post eller passord er feil!");
        return;
      }

      setSuccess("Innlogging vellykket!");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error("Innloggingsfeil:", err);
      setError("Noe gikk galt under innloggingen.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Velkommen tilbake"
      backButtonLabel="Har du ikke konto?"
      backButtonHref="/"
      onBackButtonClick={onRegister}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                      placeholder="ola@nordmann.no"
                      type="email"
                    />
                  </FormControl>
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
                  <Button
                    size="sm"
                    variant="link"
                    onClick={onForgotPassword}
                    className="px-0 font-medium text-gray-800 hover:text-black hover:underline"
                    type="button"
                  >
                    Glemt passord?
                  </Button>
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Logg inn
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
