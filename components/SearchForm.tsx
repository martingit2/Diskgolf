"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { CourseCard } from "@/components/CourseCard"; // Importer CourseCard

// Definerer Course-typen (match denne med CourseCard sin forventning)
interface Course {
  id: string;
  name: string;
  location: string;
  description?: string;
  par: number;
  image?: string;
  difficulty?: string;
  averageRating: number;
  totalReviews: number;
  baskets?: { latitude: number; longitude: number }[];
  totalDistance?: number;
  numHoles?: number;
}

// Valideringsskjema
const formSchema = z.object({
  location: z.string().optional(),
  starRating: z.enum(["1", "2", "3", "4", "5", "Vis alle"]).optional(),
  difficulty: z.enum(["Lett", "Middels", "Vanskelig", "Vis alle"]).optional(),
});

const SearchForm = () => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // State for å vite om et søk er utført minst én gang
  const [isSubmitted, setIsSubmitted] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      starRating: "Vis alle",
      difficulty: "Vis alle",
    },
  });

  // Henter unike locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente data");
        const data: Course[] = await response.json();
        const uniqueLocations = Array.from(
          new Set(
            data
              .map((course) => course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim())
              .filter(Boolean)
          )
        ).sort();
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Feil ved henting av steder:", error);
      }
    };
    fetchLocations();
  }, []);

  // Søke-funksjon
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setIsSubmitted(true); // Marker at et søk er utført
    try {
      const response = await fetch(`/api/courses`);
      if (!response.ok) throw new Error(`API-feil: ${response.statusText}`);
      const data: Course[] = await response.json();

      const filteredData = data.filter((course) => {
        const formattedLocation = course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim();
        const locationMatches = !values.location || values.location === "Vis alle" || formattedLocation === values.location;
        const difficultyMatches = !values.difficulty || values.difficulty === "Vis alle" || course.difficulty === values.difficulty;
        const starRatingMatches = !values.starRating || values.starRating === "Vis alle" || (course.averageRating >= parseInt(values.starRating));
        return locationMatches && difficultyMatches && starRatingMatches;
      });

      const formattedResults = filteredData.map((course) => ({
        ...course,
        location: course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim(),
        description: course.description ?? "Ingen beskrivelse tilgjengelig.",
        numHoles: course.baskets?.length ?? 0,
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Feil under søk:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    // SETTER STANDARD TEKSTFARGE FOR KOMPONENTEN HER
    <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800"> {/* <-- Endret tekstfarge */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Sted */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                {/* Setter spesifikk farge for label */}
                <FormLabel className="text-gray-700 font-medium">Sted</FormLabel> {/* <-- Endret farge */}
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    {/* Sørger for at SelectTrigger også får mørk tekst (Shadcn håndterer ofte dette greit) */}
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder="Velg sted">{field.value || "Velg sted"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vis alle">Vis alle steder</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stjerner */}
          <FormField
            control={form.control}
            name="starRating"
            render={({ field }) => (
              <FormItem>
                 {/* Setter spesifikk farge for label */}
                <FormLabel className="text-gray-700 font-medium">Minst antall stjerner</FormLabel> {/* <-- Endret farge */}
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "Vis alle"}>
                     {/* Sørger for at SelectTrigger også får mørk tekst */}
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder="Velg stjerner">{field.value || "Vis alle"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vis alle">Vis alle</SelectItem>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {"★".repeat(star)} ({star}+)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vanskelighetsgrad */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                 {/* Setter spesifikk farge for label */}
                <FormLabel className="text-gray-700 font-medium">Vanskelighetsgrad</FormLabel> {/* <-- Endret farge */}
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "Vis alle"}>
                     {/* Sørger for at SelectTrigger også får mørk tekst */}
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder="Velg vanskelighetsgrad">{field.value || "Velg vanskelighetsgrad"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vis alle">Vis alle</SelectItem>
                      <SelectItem value="Lett">Lett</SelectItem>
                      <SelectItem value="Middels">Middels</SelectItem>
                      <SelectItem value="Vanskelig">Vanskelig</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Søk-knapp */}
          <div className="col-span-full flex justify-center mt-4">
            {/* Knappen har allerede egne farger */}
            <Button type="submit" disabled={loading} className="w-full max-w-md bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition duration-300 disabled:opacity-50">
              {loading ? "Søker..." : "Søk"}
            </Button>
          </div>
        </form>
      </Form>

      {/* --- Søkeresultater --- */}
      <div className="mt-6">
        {loading ? (
             <p className="text-center text-gray-500">Laster søkeresultater...</p> // Denne får OK farge
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={false}
                onToggleFavorite={() => { console.warn("Favoritt-toggling ikke implementert i SearchForm."); }}
                isToggling={false}
              />
            ))}
          </div>
        // Viser "Ingen baner funnet" kun etter et søk og hvis det ikke lastes
        ) : !loading && isSubmitted ? ( // Bruker isSubmitted state
          <p className="text-center text-gray-500 mt-4">Ingen baner matchet søkekriteriene.</p> // Denne får OK farge
        ) : null /* Ikke vis noe før et søk er utført */}
      </div>
    </div>
  );
};

export default SearchForm;