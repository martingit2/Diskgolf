"use client"; // Indikerer at denne komponenten skal rendres på klientsiden.

import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form"; // Importerer typer for skjemaer fra react-hook-form.

interface InputProps {
  id: string; // Unik identifikator for input-feltet (f.eks. "name", "email").
  label: string; // Teksten som vises som etikett for input-feltet.
  type?: string; // Typen input-felt (f.eks. "text", "email", "password"). Valgfritt.
  disabled?: boolean; // Om feltet er deaktivert (f.eks. under lasting). Valgfritt.
  required?: boolean; // Om feltet er obligatorisk (validering). Valgfritt.
  register: UseFormRegister<FieldValues>; // Funksjon fra react-hook-form for å koble input til skjemaet.
  errors: FieldErrors; // Valideringsfeil fra react-hook-form.
}

/**
 * Gjenbrukbar Input-komponent:
 * - Brukes til å lage input-felt med tilhørende etikett.
 * - Håndterer validering, feilvisning og deaktivert tilstand.
 */
const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text", // Standard type er "text" hvis ingen type er spesifisert.
  disabled,
  required,
  register,
  errors,
}) => {
  return (
    <div className="w-full relative">
      {/* Input-felt */}
      <input
        id={id} // Kobler input til etiketten via `id`.
        disabled={disabled} // Deaktiverer feltet hvis `disabled` er true.
        {...register(id, { required })} // Binder feltet til react-hook-form med validering.
        placeholder=" " // Brukes sammen med CSS for å flytte etiketten ved fokus.
        type={type} // Setter typen input (f.eks. "text", "email").
        className={`peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed pl-4 ${
          errors[id]
            ? "bg-white border-rose-500 focus:border-rose-500" // Feilstil hvis det er valideringsfeil.
            : "border-neutral-300 focus:border-neutral-800" // Normal stil.
        }`}
      />

      {/* Etikett */}
      <label
        htmlFor={id} // Knytter etiketten til input-feltet via `htmlFor`.
        className={`absolute text-md duration-150 transform -translate-y-3 top-6 z-10 origin-[0] text-neutral-400 left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-neutral-700 ${
          errors[id] ? "text-rose-500" : "text-zinc-400" // Endrer tekstfarge ved feil.
        }`}
      >
        {label} {/* Viser etiketten */}
      </label>

      {/* Feilmelding */}
      {errors[id] && (
        <p className="text-sm text-rose-500 mt-1">
          {errors[id]?.message?.toString()} {/* Viser feilmeldingen */}
        </p>
      )}
    </div>
  );
};

export default Input;
