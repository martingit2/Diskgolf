// Fil: src/app/(protected)/settings/page.tsx
// Formål: Side for brukerinnstillinger. Lar innloggede brukere oppdatere profilinformasjon (navn, e-post, passord, rolle, profilbilde), aktivere/deaktivere tofaktor-autentisering, og slette sin egen konto.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.




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
import { toast } from "react-hot-toast";
import ProfileAvatar from "@/components/ProfileAvatar"; // Juster stien etter hvor komponenten ligger

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isTwoFactorEnable?: boolean;
  isOAuth?: boolean;
  image?: string | null;
};

const SettingsPage = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user.role as UserRole) || UserRole.USER,
        isTwoFactorEnable: session.user.isTwoFactorEnable || false,
        isOAuth: session.user.isOAuth || false,
        image: session.user.image || null,
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
      image: user?.image || "",
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
        image: user.image || "",
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
        toast.error(data.error);
      } else {
        setUser({ ...user!, ...values, id: user!.id });
        setSuccess(data.success);
        toast.success(data.success || "Innstillinger oppdatert!");
      }
    } catch {
      setError("Noe gikk galt!");
      toast.error("Noe gikk galt!");
    }
  };

  const handleDeleteUser = async () => {
    if (confirm("Er du sikker på at du vil slette kontoen din?")) {
      setIsDeleting(true);
      try {
        const response = await deleteUser();
        if (response.success) {
          alert(response.message);
          window.location.href = "/";
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch {
        setError("Noe gikk galt under sletting.");
        toast.error("Noe gikk galt under sletting.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Håndter bildeopplasting skjer nå inne i ProfileAvatar-komponenten

  if (!user) {
    return <div>Laster inn brukerdata...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-4">
      <div className="w-full max-w-4xl p-4">
        <Card className="w-full">
          <CardHeader>
            <p className="text-2xl font-semibold text-center">⚙️ Innstillinger</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                 {/* Avatar og profilbilde */}
                 <div className="flex flex-col items-center mb-6">
                  <ProfileAvatar
                    imageUrl={form.watch("image") || ""}
                    userId={user.id} // Sender med brukerens ID
                    onChange={(url) => form.setValue("image", url)}
                    onDelete={() => {
                      form.setValue("image", "");
                      toast.success("Profilbilde fjernet!");
                    }}
                  />
                </div>

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

                  {/* E-post og passord for ikke-OAuth */}
                  {user?.isOAuth === false && (
                    <>
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
                              />
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
                              <Input
                                {...field}
                                type="password"
                                placeholder="******"
                              />
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
                              <Input
                                {...field}
                                type="password"
                                placeholder="******"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Rolle */}
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
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="USER">Bruker</SelectItem>
                            <SelectItem value="CLUB_LEADER">Klubbleder</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tofaktor-switch */}
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

                {/* Error / Success messages */}
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <Button type="submit">Lagre</Button>
              </form>

              {/* Slett bruker-knapp */}
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
      </div>
    </div>
  );
};

export default SettingsPage;
