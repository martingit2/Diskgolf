/** 
 * Filnavn: form-success.tsx
 * Beskrivelse: Komponent for visning av suksessmeldinger i skjemaer.
 * Viser en bekreftelsesmelding med et ikon dersom en melding er tilgjengelig.
 * Utvikler: Martin Pettersen
 */


import { CheckBadgeIcon } from "@heroicons/react/20/solid";


interface FormSuccessProps {
  message?: string;
};

export const FormSuccess = ({
  message,
}: FormSuccessProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CheckBadgeIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};