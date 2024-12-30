"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSchema } from "@/schemas";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { UserRole } from "@prisma/client";
import { settings } from "@/app/actions/settings";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOAuth: boolean;
};

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isReady, setIsReady] = useState(false);

  // Oppdaterer brukerdata basert på session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id || "",
        name: session.user.name || "Ukjent bruker",
        email: session.user.email || "Ingen e-post",
        role: (session.user.role as UserRole) || UserRole.USER,
        isOAuth: session.user.isOAuth ?? false,
      });
      setIsReady(true);
    }
  }, [status, session]);

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.USER,
      password: undefined,
      newPassword: undefined,
    },
  });

  // Oppdater skjemaet når brukerdata endres
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
    setError("");
    setSuccess("");

    try {
      const data = await settings(values);
      if (data.error) {
        setError(data.error);
      } else {
        setUser({ ...user!, ...values, id: user!.id });
        setSuccess(data.success);
      }
    } catch {
      setError("Noe gikk galt!");
    }
  };

  if (status === "loading" || !isReady) {
    return <div>Laster inn brukerdata...</div>;
  }

  if (!user) {
    return <div>Ingen brukerdata tilgjengelig.</div>;
  }

  return (
    <Card key={user.id} className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Innstillinger</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Navn */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ola Nordmann" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* E-post */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ola.nordmann@eksempel.no"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Rolle */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg en rolle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                        <SelectItem value={UserRole.USER}>Bruker</SelectItem>
                        <SelectItem value={UserRole.CLUB_LEADER}>
                          Klubbleder
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Passord-felter, hvis ikke OAuth */}
              {user.isOAuth === false && (
                <>
                  {/* Gjeldende passord */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gjeldende passord</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Nytt passord */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nytt passord</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit">Lagre</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
