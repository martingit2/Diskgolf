"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClubSettingsSchema } from "@/schemas/ClubSettingsSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";

interface CreateClubFormProps {
  onCreateClubSubmit: (values: any) => void;
  isCreatingClub: boolean;
}

const CreateClubForm: FC<CreateClubFormProps> = ({ onCreateClubSubmit, isCreatingClub }) => {
  const [submitting, setSubmitting] = useState(false); // Forhindrer dobbeltinnsending
  const createClubForm = useForm({
    resolver: zodResolver(ClubSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      logoUrl: "",
      sted: "",
      address: "",
      phone: "",
      postalCode: "",
    },
  });

  // Håndter skjemainnsendelse
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
  
    try {
      // Legg til clubId i formData før sending
      const formData = new FormData();
      formData.append("clubId", values.clubId); // Pass clubId til backend
      formData.append("name", values.name);
      formData.append("email", values.email || ''); // Set empty string if email is optional
      formData.append("description", values.description || ''); // Set empty string if description is optional
      formData.append("sted", values.sted);
      formData.append("address", values.address);
      formData.append("phone", values.phone);
      formData.append("postalCode", values.postalCode);
  
      // Only append logoUrl if it's not empty
      if (values.logoUrl && values.logoUrl[0]) {
        formData.append("logoUrl", values.logoUrl[0]);
      }
  
      // Send data til API-et
      const response = await fetch("/api/create-club", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Klubben ble opprettet!");
        onCreateClubSubmit(values);
      }
    } catch (error) {
      toast.error("Noe gikk galt, prøv igjen senere.");
      console.error("Feil ved innsending av klubbdata:", error);
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-4">
      <div className="w-full max-w-4xl p-4">
        <Card>
          <CardHeader>
            <p className="text-2xl font-semibold text-center">Opprett en ny DiskGolf Klubb</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={createClubForm.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Klubben navn */}
              <div>
                <label className="block text-center">Klubbens navn</label>
                <input
                  {...createClubForm.register("name")}
                  placeholder="Klubbens navn"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
                {createClubForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{createClubForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Klubben e-post */}
              <div>
                <label className="block text-center">Klubbens e-post</label>
                <input
                  {...createClubForm.register("email")}
                  placeholder="klubb@example.com"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
                {createClubForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{createClubForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Beskrivelse */}
              <div>
                <label className="block text-center">Beskrivelse</label>
                <textarea
                  {...createClubForm.register("description")}
                  placeholder="Klubbens beskrivelse"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
              </div>

              {/* Klubbens sted */}
              <div>
                <label className="block text-center">Klubbens sted</label>
                <input
                  {...createClubForm.register("sted")}
                  placeholder="Fyll inn klubbens sted"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
                {createClubForm.formState.errors.sted && (
                  <p className="text-red-500 text-xs mt-1">{createClubForm.formState.errors.sted.message}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-center">Adresse</label>
                <input
                  {...createClubForm.register("address")}
                  placeholder="Fyll inn klubbens adresse"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
              </div>

              {/* Postnummer */}
              <div>
                <label className="block text-center">Postnummer</label>
                <input
                  {...createClubForm.register("postalCode")}
                  placeholder="Postnummer"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-center">Telefonnummer</label>
                <input
                  {...createClubForm.register("phone")}
                  placeholder="Telefonnummer"
                  className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-center">Logo (valgfritt)</label>
                <input
                  type="file"
                  accept="image/*"
                  {...createClubForm.register("logoUrl")}
                  className="w-full mt-2 p-2 border rounded-lg"
                />
              </div>

              {/* Opprett Klubb knappen */}
              <div className="flex justify-center mt-4">
                <Button type="submit" disabled={isCreatingClub || submitting} className="mt-4">
                  {submitting ? "Laster..." : "Opprett Klubb"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateClubForm;
