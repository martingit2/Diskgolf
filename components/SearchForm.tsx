// Fil: components/SearchForm.tsx (eller hvor den ligger)
// Formål: Skjema for å søke og filtrere baner basert på ulike kriterier.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og forbedringer.

"use client"; // Kreves for hooks og skjema-interaksjon.

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from 'react-i18next'; // Importer i18n hook
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { CourseCard } from "@/components/CourseCard"; 

// Definerer datastrukturen for en bane.
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

// Definerer konstant for "Vis alle"-verdi for enkel gjenbruk og oversettelse.
const SHOW_ALL_VALUE = "SHOW_ALL"; // Intern verdi

// Valideringsskjema for skjemaet.
const formSchema = z.object({
  location: z.string().optional(), // Bruker SHOW_ALL_VALUE internt for "Vis alle"
  starRating: z.string().optional(), // Lagrer stjerner som string ('1'-'5' eller SHOW_ALL_VALUE)
  difficulty: z.string().optional(), // Bruker 'easy', 'medium', 'hard' eller SHOW_ALL_VALUE internt
});

/**
 * SearchForm-komponenten lar brukere filtrere baner og viser resultater.
 */
const SearchForm = () => {
  const { t } = useTranslation('translation'); // Initialiserer i18n

  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Holder styr på om søk er utført

  // Initialiserer react-hook-form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Setter standardverdier til den interne "Vis alle"-verdien
    defaultValues: {
      location: SHOW_ALL_VALUE,
      starRating: SHOW_ALL_VALUE,
      difficulty: SHOW_ALL_VALUE,
    },
  });

  // Effekt for å hente unike lokasjoner for dropdown-menyen.
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente data");
        const data: Course[] = await response.json();
        // Renser og sorterer lokasjonsdata.
        const uniqueLocations = Array.from(
          new Set(
            data
              .map((course) => course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim())
              .filter(Boolean) // Fjerner tomme strenger
          )
        ).sort();
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Feil ved henting av steder:", error);
      }
    };
    fetchLocations();
  }, []); // Kjøres kun ved mount.

  /**
   * Kjøres når skjemaet sendes inn. Utfører søk mot API og oppdaterer resultater.
   * @param values Verdiene fra skjemaet.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setIsSubmitted(true);
    try {
      const response = await fetch(`/api/courses`); // Henter alle baner for klientfiltrering
      if (!response.ok) throw new Error(`API-feil: ${response.statusText}`);
      const data: Course[] = await response.json();

      // Filtrerer data basert på skjemainput.
      const filteredData = data.filter((course) => {
        const formattedLocation = course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim();
        // Sjekker mot den interne SHOW_ALL_VALUE eller den faktiske verdien for lokasjon.
        const locationMatches = !values.location || values.location === SHOW_ALL_VALUE || formattedLocation === values.location;

        // Sjekker stjernerating
        const starRatingMatches = !values.starRating || values.starRating === SHOW_ALL_VALUE || (course.averageRating >= parseInt(values.starRating));

        // Sjekker vanskelighetsgrad uavhengig av språk
        let difficultyMatches = true; 
        if (values.difficulty && values.difficulty !== SHOW_ALL_VALUE) {
          // Sammenlign den *lagrede* verdien i course.difficulty (f.eks. "Lett")
          // med den forventede verdien basert på den *interne* verdien ('easy', 'medium', 'hard')
          switch (values.difficulty) {
            case 'easy':
              difficultyMatches = course.difficulty === "Lett";
              break;
            case 'medium':
              difficultyMatches = course.difficulty === "Middels";
              break;
            case 'hard':
              difficultyMatches = course.difficulty === "Vanskelig";
              break;
            default:
              difficultyMatches = false; // Ukjent verdi, bør ikke skje
          }
        }

        // Returnerer true kun hvis alle kriterier matcher
        return locationMatches && difficultyMatches && starRatingMatches;
      });

      // Formaterer resultatene før visning.
      const formattedResults = filteredData.map((course) => ({
        ...course,
        location: course.location.replace(/,\s*Ukjent fylke\s*$/, "").trim(),
        description: course.description ?? t('common.no_description', 'Ingen beskrivelse tilgjengelig.'),
        numHoles: course.baskets?.length ?? course.numHoles ?? 0, // Sørger for at numHoles finnes
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Feil under søk:", error);
      setSearchResults([]); // Tøm resultater ved feil
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Sted */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">{t('search_form.location_label')}</FormLabel>
                <FormControl>
                  {/* Bruker onChange for å sikre at verdien settes */}
                  <Select onValueChange={field.onChange} value={field.value ?? SHOW_ALL_VALUE}>
                    <SelectTrigger className="text-gray-800">
                      {/* Viser oversatt placeholder hvis ingen verdi er valgt */}
                      <SelectValue placeholder={t('search_form.location_placeholder')}>
                        {field.value === SHOW_ALL_VALUE ? t('search_form.location_all') : field.value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* Bruker intern verdi, viser oversatt tekst */}
                      <SelectItem value={SHOW_ALL_VALUE}>{t('search_form.location_all')}</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location} {/* Lokasjonsnavn kommer fra data */}
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
                <FormLabel className="text-gray-700 font-medium">{t('search_form.rating_label')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value ?? SHOW_ALL_VALUE}>
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder={t('search_form.rating_placeholder')}>
                        {field.value === SHOW_ALL_VALUE ? t('search_form.rating_all') : `★ ${field.value}+`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SHOW_ALL_VALUE}>{t('search_form.rating_all')}</SelectItem>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {"★".repeat(star)} ({star}+) {/* Holder stjernevisning enkel */}
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
                <FormLabel className="text-gray-700 font-medium">{t('search_form.difficulty_label')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value ?? SHOW_ALL_VALUE}>
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder={t('search_form.difficulty_placeholder')}>
                        {/* Viser den OVERSATTE teksten basert på den INTERNE verdien ('easy', 'medium', 'hard', 'SHOW_ALL') */}
                        {field.value === SHOW_ALL_VALUE ? t('search_form.difficulty_all') : t(`search_form.difficulty_${field.value?.toLowerCase()}`)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SHOW_ALL_VALUE}>{t('search_form.difficulty_all')}</SelectItem>
                      {/* Bruker 'easy', 'medium', 'hard' som INTERN verdi */}
                      <SelectItem value="easy">{t('search_form.difficulty_easy')}</SelectItem>
                      <SelectItem value="medium">{t('search_form.difficulty_medium')}</SelectItem>
                      <SelectItem value="hard">{t('search_form.difficulty_hard')}</SelectItem>
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
              {/* Viser ulik tekst basert på loading state */}
              {loading ? t('search_form.searching_button') : t('search_form.search_button')}
            </Button>
          </div>
        </form>
      </Form>

      {/* Søkeresultater */}
      <div className="mt-6">
        {loading ? (
          <p className="text-center text-gray-500">{t('search_form.loading_results')}</p>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((course) => (
              // Sender props videre til CourseCard.
              <CourseCard
                key={course.id}
                course={course}
                // Favorittlogikk er forenklet her, kan utvides ved behov
                isFavorite={false} // Erstatt med faktisk logikk hvis tilgjengelig
                onToggleFavorite={() => { console.warn("Favoritt-toggling ikke implementert i SearchForm."); }}
                isToggling={false} // Erstatt med faktisk logikk hvis tilgjengelig
              />
            ))}
          </div>
        // Viser melding kun hvis et søk er utført og ingen resultater finnes
        ) : isSubmitted ? (
          <p className="text-center text-gray-500 mt-4">{t('search_form.no_results')}</p>
        ) : null /* Viser ingenting initielt */}
      </div>
    </div>
  );
};

export default SearchForm;