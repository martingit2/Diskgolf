/** 
 * Filnavn: form-error.tsx
 * Beskrivelse: Komponent for å vise feilmeldinger i skjemaer. 
 * Viser en advarsel til brukeren med en tilhørende melding.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */


import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";


interface FormErrorProps {
  message?: string;
};

export const FormError = ({
  message,
}: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};