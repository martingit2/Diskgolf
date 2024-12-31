"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Switch } from "@/components/ui/switch";
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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { UserRole } from "@prisma/client";
import { settings } from "@/app/actions/settings";
import { deleteUser } from "@/app/actions/delete-user";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isTwoFactorEnable?: boolean;
  isOAuth?: boolean;
};

const SettingsPage = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false); // For sletting

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user.role as UserRole) || UserRole.USER,
        isTwoFactorEnable: session.user.isTwoFactorEnable || false,
        isOAuth: session.user.isOAuth || false,
      });
    }
  }, [session]);

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || UserRole.USER,
      isTwoFactorEnabled: user?.isTwoFactorEnable || false,
      password: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || UserRole.USER,
        isTwoFactorEnabled: user.isTwoFactorEnable || false,
        password: "",
        newPassword: "",
      });
    }
  }, [user, form]);

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


  // Funksjon for å håndtere sletting av brukeren
  const handleDeleteUser = async () => {
    if (confirm("Er du sikker på at du vil slette kontoen din?")) {
      setIsDeleting(true);
      try {
        const response = await deleteUser();
        if (response.success) {
          alert(response.message);
          window.location.href = "/"; // Send brukeren til startsiden
        } else {
          setError(response.message);
        }
      } catch {
        setError("Noe gikk galt under sletting.");
      } finally {
        setIsDeleting(false);
      }
    }
  };




  if (!user) {
    return <div>Laster inn brukerdata...</div>;
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Innstillinger</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
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
              {user?.isOAuth === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ola.nordmann@eksempel.no" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gjeldende passord</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="******" type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nytt passord</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="******" type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg en rolle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                        <SelectItem value={UserRole.USER}>Bruker</SelectItem>
                        <SelectItem value={UserRole.CLUB_LEADER}>Klubbleder</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Tofaktor-autentisering</FormLabel>
                        <FormDescription>
                          Aktiver tofaktor-autentisering for kontoen din.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit">Lagre</Button>
          </form>
          <div className="mt-6">
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Sletter..." : "Slett min konto"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
