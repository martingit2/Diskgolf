"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Definerer fylker og tilhørende steder
const fylker: Record<string, string[]> = {
  "Telemark": ["Bø"],
  "Troms": ["Tromsø"],
  "Oslo": ["Oslo Sentrum"],
  "Vestland": ["Bergen"],
  "Rogaland": ["Stavanger"],
  "Trøndelag": ["Trondheim"],
  "Agder": ["Kristiansand"],
  "Møre og Romsdal": ["Ålesund"],
  "Nordland": ["Bodø"],
};

const banetyper = ["Skogsbane", "Parkbane", "Fjellbane", "Bybane", "Åpen slette"];

export const formSchema = z.object({
  fylke: z.string().optional(),
  sted: z.string().optional(),
  difficulty: z.enum(["1", "2", "3", "4", "5"]).optional(),
  numberOfHoles: z.enum(["5", "10", "15", "20"]).optional(),
  starRating: z.enum(["1", "2", "3", "4", "5"]).optional(),
  reviewCount: z.enum(["10", "50", "100", "200"]).optional(),
  baneType: z.string().optional(),
});

function SearchForm() {
  const [selectedFylke, setSelectedFylke] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fylke: "",
      sted: "",
      difficulty: undefined,
      numberOfHoles: undefined,
      starRating: undefined,
      reviewCount: undefined,
      baneType: "",
    },
  });

  // Håndtering av skjema innsending
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Fylke */}
          <FormField
            control={form.control}
            name="fylke"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fylke</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedFylke(value);
                  }} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg fylke">{field.value || "Velg fylke"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(fylker).map((fylke) => (
                        <SelectItem key={fylke} value={fylke}>
                          {fylke}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sted */}
<FormField
  control={form.control}
  name="sted"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Sted</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange} value={field.value || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Velg sted">{field.value || "Velg sted"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selectedFylke ? (
              fylker[selectedFylke].map((sted) => (
                <SelectItem key={sted} value={sted}>
                  {sted}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="placeholder" disabled>
                Velg et fylke først
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
          {/* Antall hull */}
          <FormField
            control={form.control}
            name="numberOfHoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Antall hull</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg antall hull">{field.value || "Velg antall hull"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Minst 5 hull</SelectItem>
                      <SelectItem value="10">Minst 10 hull</SelectItem>
                      <SelectItem value="15">Minst 15 hull</SelectItem>
                      <SelectItem value="20">Minst 20 hull</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Popularitet */}
          <FormField
            control={form.control}
            name="starRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Popularitet</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg antall stjerner">{field.value || "Velg antall stjerner"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 stjerne</SelectItem>
                      <SelectItem value="2">2 stjerner</SelectItem>
                      <SelectItem value="3">3 stjerner</SelectItem>
                      <SelectItem value="4">4 stjerner</SelectItem>
                      <SelectItem value="5">5 stjerner</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Antall anmeldelser */}
<FormField
  control={form.control}
  name="reviewCount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Antall anmeldelser</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Velg antall anmeldelser">{field.value || "Velg antall anmeldelser"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Ingen krav til anmeldelser</SelectItem>
            <SelectItem value="10">10+ anmeldelser</SelectItem>
            <SelectItem value="50">50+ anmeldelser</SelectItem>
            <SelectItem value="100">100+ anmeldelser</SelectItem>
            <SelectItem value="200">200+ anmeldelser</SelectItem>
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

          {/* Bane type */}
          <FormField
            control={form.control}
            name="baneType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bane type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg bane type">{field.value || "Velg bane type"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {banetyper.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <div className="col-span-full flex justify-center">
            <Button type="submit" className="w-full max-w-lg bg-[#292C3D] text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition duration-300">
              Søk
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SearchForm;
