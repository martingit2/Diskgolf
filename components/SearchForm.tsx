/** 
 * Filnavn: SearchForm.tsx
 * Beskrivelse: Skjema for søk etter diskgolfbaner basert på ulike kriterier som fylke, sted, vanskelighetsgrad, antall hull og popularitet.
 * Inneholder validering, API-forespørsler og visning av søkeresultater.
 * Utvikler: Martin Pettersen
 */


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import Image from "next/image"; // Husk å importere Image-komponenten fra Next.js

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
  const [searchResults, setSearchResults] = useState<Bane[]>([]);
  const [selectedFylke, setSelectedFylke] = useState(""); // For å lagre fylke
  const [loading, setLoading] = useState(false); // For å vise en lastemelding

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fylke: "",
      sted: "",
      difficulty: "Vis alle",  // Sett standard til "Vis alle"
      numberOfHoles: "Vis alle",  // Sett standard til "Vis alle"
      starRating: "Vis alle",     // Sett standard til "Vis alle"
      reviewCount: "Vis alle",    // Sett standard til "Vis alle"
      baneType: "",
    },
  });

  // Håndtering av skjema innsending
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true); // Start lasteindikatoren
    const query = new URLSearchParams(values as Record<string, string>).toString(); // Bygg query-streng
    try {
      const response = await fetch(`/api/search?${query}`); // Send GET-forespørsel til API-et

      // Sjekk om svaret er OK (status 200-299)
      if (!response.ok) {
        throw new Error(`API-feil: ${response.statusText}`);
      }

      // Forsøk å parse JSON hvis responsen er OK
      const data = await response.json();
      setSearchResults(data); // Sett de hentede dataene til state
    } catch (error) {
      console.error("Feil under søk:", error);
      setSearchResults([]); // Tøm søkeresultater ved feil
    } finally {
      setLoading(false); // Stopp lasteindikatoren
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
                      <SelectItem value="Vis alle">Vis alle antall hull</SelectItem>
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
                      <SelectItem value="Vis alle">Vis alle stjerner</SelectItem>
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
                      <SelectItem value="Vis alle">Vis alle anmeldelser</SelectItem>
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
