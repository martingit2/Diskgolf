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
  description?: string; // Valgfri
  par: number; // Antar denne er påkrevd basert på din kode
  image?: string;
  difficulty?: string;
  averageRating: number; // Antar påkrevd
  totalReviews: number; // Antar påkrevd
  baskets?: { latitude: number; longitude: number }[]; // Valgfri, men bør være array
  totalDistance?: number; // Valgfri
  numHoles?: number; // Lagt til for konsistens med CourseCard, settes i onSubmit
}

// Valideringsskjema (uendret)
const formSchema = z.object({
  location: z.string().optional(),
  starRating: z.enum(["1", "2", "3", "4", "5", "Vis alle"]).optional(),
  difficulty: z.enum(["Lett", "Middels", "Vanskelig", "Vis alle"]).optional(),
});

const SearchForm = () => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      starRating: "Vis alle",
      difficulty: "Vis alle",
    },
  });

  // Henter unike locations fra API-et (uendret)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente data");

        const data: Course[] = await response.json();
        // Fjerner ", Ukjent fylke" når locations settes
        const uniqueLocations = Array.from(
          new Set(
            data
              .map((course) => course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim()) // Mer robust fjerning
              .filter(Boolean) // Fjerner tomme strenger hvis noen skulle oppstå
          )
        ).sort(); // Sorterer stedene alfabetisk
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Feil ved henting av steder:", error);
      }
    };
    fetchLocations();
  }, []);

  // Søke-funksjon (uendret logikk, kun formattering for CourseCard)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await fetch(`/api/courses`);
      if (!response.ok) throw new Error(`API-feil: ${response.statusText}`);

      const data: Course[] = await response.json();

      // Filtrerer resultater
      const filteredData = data.filter((course) => {
        const formattedLocation = course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim();
        const locationMatches = !values.location || values.location === "Vis alle" || formattedLocation === values.location;
        const difficultyMatches = !values.difficulty || values.difficulty === "Vis alle" || course.difficulty === values.difficulty;
        const starRatingMatches = !values.starRating || values.starRating === "Vis alle" || (course.averageRating >= parseInt(values.starRating));

        return locationMatches && difficultyMatches && starRatingMatches;
      });

      // Formatterer dataen for CourseCard (inkluderer numHoles)
      const formattedResults = filteredData.map((course) => ({
        ...course,
        location: course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim(), // Fjerner "Ukjent fylke" for visning
        description: course.description ?? "Ingen beskrivelse tilgjengelig.", // Sikrer at beskrivelse er en streng
        numHoles: course.baskets?.length ?? 0, // Beregner antall hull
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
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* --- Skjema (uendret) --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Sted */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sted</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger>
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
                <FormLabel>Minst antall stjerner</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "Vis alle"}>
                    <SelectTrigger>
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
                <FormLabel>Vanskelighetsgrad</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || "Vis alle"}>
                    <SelectTrigger>
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
            <Button type="submit" disabled={loading} className="w-full max-w-md bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition duration-300 disabled:opacity-50">
              {loading ? "Søker..." : "Søk"}
            </Button>
          </div>
        </form>
      </Form>

      {/* --- Søkeresultater --- */}
      <div className="mt-6">
        {loading ? (
             <p className="text-center text-gray-500">Laster søkeresultater...</p>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Økt gap litt */}
            {searchResults.map((course) => (
              <CourseCard
                key={course.id}
                course={course} // Sender hele det formaterte course-objektet
                isFavorite={false} // SearchForm håndterer ikke favorittstatus her
                onToggleFavorite={() => {
                  console.warn("Favoritt-toggling ikke implementert i SearchForm.");
                  // Kan evt. navigere til kurssiden eller vise en melding
                }}
                isToggling={false} // *** VIKTIG: Lagt til denne linjen ***
              />
            ))}
          </div>
        // Viser "Ingen baner funnet" kun etter et søk (isSubmitted) og hvis det ikke lastes
        ) : !loading && form.formState.isSubmitted ? (
          <p className="text-center text-gray-500 mt-4">Ingen baner matchet søkekriteriene.</p>
        ) : null /* Ikke vis noe før et søk er utført */}
      </div>
    </div>
  );
};

export default SearchForm;