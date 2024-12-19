"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";

// Zod-skjema for validering
export const formSchema = z.object({
  location: z.string().min(2, "Område må inneholde minst 2 tegn.").max(50, "Område kan ikke være lengre enn 50 tegn."),
  difficulty: z.enum(["1", "2", "3", "4", "5"]).optional(), // Vanskelighetsgrad (1-5)
  sortBy: z.enum(["popularity", "difficulty", "rating"]).optional(), // Sortering (Popularitet, Vanskelighetsgrad, Rating, vi trenger vel noe mer?)
  dates: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(), // Valgfri bookingdato
});

function SearchForm() {
  const [dates] = useState<{ from?: Date; to?: Date }>(); // Fjernet setDates

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      difficulty: undefined,
      sortBy: undefined,
      dates: undefined,
    },
  });

  // Håndtering av skjema innsending
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          {/* Område */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Område</FormLabel>
                <FormControl>
                  <Input placeholder="Skriv inn område (f.eks. Bø, Telemark)" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg vanskelighetsgrad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Enklest</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3 - Middels</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 - Vanskeligst</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sortering */}
          <FormField
            control={form.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sorter etter</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg sortering" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularitet</SelectItem>
                      <SelectItem value="difficulty">Vanskelighetsgrad</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bookingdato */}
          <FormField
            control={form.control}
            name="dates"
            render={() => (
              <FormItem>
                <FormLabel>Sjekk tilgjengelighet</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {dates?.from ? (
                          dates.to ? (
                            `${format(dates.from, "dd.MM.yyyy")} - ${format(dates.to, "dd.MM.yyyy")}`
                          ) : (
                            format(dates.from, "dd.MM.yyyy")
                          )
                        ) : (
                          "Velg dato"
                        )}
                      </Button>
                    </PopoverTrigger>

                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Søk-knappen midtstilt uavhengig av skjermstørrelse */}
      <div className="flex justify-center mt-4">
        <Button
          type="submit"
          className="w-full max-w-xs bg-[#292C3D] text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition duration-300"
        >
          Søk
        </Button>
      </div>
    </div>
  );
}

export default SearchForm;
