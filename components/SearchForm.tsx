"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { CourseCard } from "@/components/CourseCard";

// **Definerer Course-typen**
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
}

// **Valideringsskjema**
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

  // **Henter unike locations fra API-et**
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente data");

        const data: Course[] = await response.json();
        const uniqueLocations = Array.from(
          new Set(
            data
              .map((course) => course.location)
              .map((loc) => loc.replace(", Ukjent fylke", "")) // Fjerner "Ukjent fylke"
          )
        );
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Feil ved henting av steder:", error);
      }
    };
    fetchLocations();
  }, []);

  // **Søke-funksjon**
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
  
    try {
      const response = await fetch(`/api/courses`);
      if (!response.ok) throw new Error(`API-feil: ${response.statusText}`);
  
      const data: Course[] = await response.json();
  
      // **Filtrerer resultater riktig**
      const filteredData = data.filter((course) => {
        // **Fjerner "Ukjent fylke" for sammenligning**
        const formattedLocation = course.location.replace(", Ukjent fylke", "");
  
        // **Filtrer basert på sted**
        const locationMatches =
          values.location === "Vis alle" || formattedLocation === values.location;
  
        // **Filtrer basert på vanskelighetsgrad**
        const difficultyMatches =
          values.difficulty === "Vis alle" || course.difficulty === values.difficulty;
  
        // **Filtrer basert på minst antall stjerner**
        const starRatingMatches =
  values.starRating === "Vis alle" || (values.starRating && course.averageRating >= parseInt(values.starRating));
  
        return locationMatches && difficultyMatches && starRatingMatches;
      });
  
      // **Formatterer dataen for CourseCard**
      const formattedData = filteredData.map((course) => ({
        ...course,
        location: course.location.replace(", Ukjent fylke", ""), // Fjerner "Ukjent fylke"
        description: course.description ?? "", // Sikrer at beskrivelse ikke er undefined
        baskets: course.baskets || [], // Fallback til tom array
        numHoles: course.baskets?.length ?? 0, // Antall kurver basert på baskets-arrayet
      }));
  
      setSearchResults(formattedData);
    } catch (error) {
      console.error("Feil under søk:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* 📌 Sted (Dynamisk dropdown) */}
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

          {/* 📌 Stjerner */}
          <FormField
            control={form.control}
            name="starRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minst antall stjerner</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg stjerner">{field.value || "Velg stjerner"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vis alle">Vis alle</SelectItem>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {"★".repeat(star)} ({star})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 📌 Vanskelighetsgrad */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vanskelighetsgrad</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
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

          {/* 📌 Søk-knapp */}
          <div className="col-span-full flex justify-center mt-4">
            <Button type="submit" className="w-full max-w-md bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition duration-300">
              Søk
            </Button>
          </div>
        </form>
      </Form>

      {/* 📌 Søkeresultater */}
      <div className="mt-6">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((course) => (
              <CourseCard
              key={course.id}
              course={{ ...course, description: course.description ?? "Ingen beskrivelse tilgjengelig" }} 
              isFavorite={false} 
              onToggleFavorite={() => {}}
            />            
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Ingen baner funnet</p>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
