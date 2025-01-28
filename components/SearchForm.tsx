"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import Image from "next/image";

// Definerer typen for Bane
interface Bane {
  id: number;
  name: string;
  fylke: string;
  sted: string;
  holes: number;
  difficulty: string;
  starRating: string;
  reviewCount: number;
  baneType: string;
  imageSrc: string;
  address: string;
}

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
  difficulty: z.enum(["1", "2", "3", "4", "5", "Vis alle"]).optional(),
  numberOfHoles: z.enum(["5", "10", "15", "20", "Vis alle"]).optional(),
  starRating: z.enum(["1", "2", "3", "4", "5", "Vis alle"]).optional(),
  reviewCount: z.enum(["10", "50", "100", "200", "Vis alle"]).optional(),
  baneType: z.string().optional(),
});

function SearchForm() {
  const [searchResults, setSearchResults] = useState<Bane[]>([]);  // Angir eksplisitt type for searchResults
  const [selectedFylke, setSelectedFylke] = useState(""); // For å lagre fylke
  const [loading, setLoading] = useState(false); // For å vise en lastemelding

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fylke: "",
      sted: "",
      difficulty: "Vis alle",
      numberOfHoles: "Vis alle",
      starRating: "Vis alle",
      reviewCount: "Vis alle",
      baneType: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const query = new URLSearchParams(values as Record<string, string>).toString();
    try {
      const response = await fetch(`/api/search?${query}`);

      if (!response.ok) {
        throw new Error(`API-feil: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data); // TypeScript vil nå vite at `data` er en array av `Bane`
    } catch (error) {
      console.error("Feil under søk:", error);
      setSearchResults([]);  // Tømmer resultater ved feil
    } finally {
      setLoading(false);
    }
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

          {/* Banetype */}
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
                      <SelectItem value="Vis alle">Vis alle banetyper</SelectItem>
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

      {/* Lastemelding */}
      {loading && <div className="text-center mt-4">Laster resultater...</div>}

      {/* Resultater */}
      <div className="mt-4">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((bane) => (
              <div key={bane.id} className="relative overflow-hidden rounded-lg group bg-white shadow-lg">
                <Image
                  src={bane.imageSrc}
                  alt={bane.name}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent text-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{bane.name}</h3>
                    <div className="text-yellow-400">
                      {Array.from({ length: parseInt(bane.starRating) }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
                          <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{bane.address}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Ingen baner funnet</p>
        )}
      </div>
    </div>
  );
}

export default SearchForm;
