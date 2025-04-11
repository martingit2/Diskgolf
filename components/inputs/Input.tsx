/**
 * Filnavn: Input.tsx
 * Beskrivelse: Gjenbrukbar Input-komponent for skjemaer med støtte for validering, etiketter og feilmeldinger ved bruk av react-hook-form.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */

"use client"; // Nødvendig da den interagerer med react-hook-form state

import React from 'react'; // Importer React
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form"; // Importerer typer for skjemaer fra react-hook-form.

interface InputProps {
  id: string; // Unik identifikator for input-feltet (f.eks. "name", "email").
  label: string; // Teksten som vises som etikett for input-feltet.
  type?: string; // Typen input-felt (f.eks. "text", "email", "password"). Valgfritt.
  disabled?: boolean; // Om feltet er deaktivert (f.eks. under lasting). Valgfritt.
  required?: boolean; // Om feltet er obligatorisk (brukes av react-hook-form). Valgfritt.
  register: UseFormRegister<FieldValues>; // Funksjon fra react-hook-form for å koble input til skjemaet.
  errors: FieldErrors; // Valideringsfeil fra react-hook-form.
  // Legg til 'validation' hvis du trenger mer avanserte regler enn bare 'required'
  validation?: object;
  placeholder?: string; // Valgfri placeholder (kan brukes i tillegg til label)
}

/**
 * Gjenbrukbar Input-komponent:
 * - Brukes til å lage input-felt med tilhørende flytende etikett.
 * - Håndterer validering, feilvisning og deaktivert tilstand via react-hook-form.
 */
const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text", // Standard type er "text" hvis ingen type er spesifisert.
  disabled,
  required, // Brukes i register
  register,
  errors,
  validation = {}, // Standard tom objekt for validation
  placeholder // Mottar placeholder
}) => {
  const hasError = !!errors[id]; // Sjekk om det finnes en feil for dette feltet

  return (
    <div className="w-full relative">
      {/* Input-felt */}
      <input
        id={id} // Kobler input til etiketten via `id`.
        disabled={disabled} // Deaktiverer feltet hvis `disabled` er true.
        // Registrerer feltet med react-hook-form, inkluderer required og eventuelle andre valideringer
        {...register(id, { required: required ? `${label} er påkrevd` : false, ...validation })}
        placeholder={placeholder || " "} // Bruk mottatt placeholder, eller " " for floating label effekt
        type={type} // Setter typen input (f.eks. "text", "email").
        className={`
          peer block w-full p-3 pt-6 font-light bg-white border-2 rounded-md outline-none transition
          disabled:opacity-70 disabled:cursor-not-allowed
          ${hasError
            ? "border-rose-500 focus:border-rose-500" // Feilstil
            : "border-neutral-300 focus:border-black" // Normal stil (endre focus til ønsket farge, f.eks. focus:border-green-500)
          }
        `}
        aria-invalid={hasError ? "true" : "false"} // For tilgjengelighet
        aria-describedby={hasError ? `${id}-error` : undefined} // Koble til feilmelding for skjermlesere
      />

      {/* Flytende Etikett */}
      <label
        htmlFor={id} // Knytter etiketten til input-feltet via `htmlFor`.
        className={`
          absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-4
          ${hasError ? "text-rose-500" : "text-zinc-400 peer-focus:text-black"} // Fargeendring ved feil og fokus
        `}
      >
        {label} {/* Viser etiketten */}
      </label>

      {/* Feilmelding */}
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-rose-500 mt-1" role="alert">
          {/* Prøver å hente feilmeldingen, ellers vis en generell melding */}
          {errors[id]?.message?.toString() || 'Dette feltet er påkrevd'}
        </p>
      )}
    </div>
  );
};

export default Input;