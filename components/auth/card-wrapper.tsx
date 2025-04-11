/**
 * Filnavn: card-wrapper.tsx
 * Beskrivelse: Wrapper-komponent for kortlayout for autentiseringsskjemaer.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"; // Importer CardHeader
import { BackButton } from "./back-button";
import { Header as CardAuthHeader } from "./header"; // Gi nytt navn for å unngå konflikt med Header fra ../Header.tsx
import { Social } from "./social"; // Antar denne finnes og fungerer

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string; // Trengs kanskje ikke hvis onClick brukes
  showSocial?: boolean;
  // Sørg for at typen her matcher den som sendes fra LoginForm etc.
  onBackButtonClick?: (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void; // Gjør event valgfritt, kan være button
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref, // Kan fjernes hvis onBackButtonClick alltid brukes
  showSocial,
  onBackButtonClick, // Motta funksjonen her
}: CardWrapperProps) => {
  return (
    // Fjerner max-width her, lar modalen styre bredden
    <Card className="w-full shadow-none border-0 rounded-none"> {/* Fjerner skygge/border/runding hvis den er inni modal */}
      <CardHeader> {/* Bruk CardHeader for tittel */}
        <CardAuthHeader label={headerLabel} />
      </CardHeader>
      <CardContent className="p-4 md:p-5">{children}</CardContent> {/* Standard padding */}
      {showSocial && (
        <CardFooter className="flex flex-col gap-4 p-4 md:p-5 "> {/* Styling for social */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Eller fortsett med
              </span>
            </div>
          </div>
          <Social /> {/* Sørg for at denne komponenten eksisterer */}
        </CardFooter>
      )}
      <CardFooter className="p-4 md:p-5 justify-center "> {/* Styling for back button */}
        <BackButton
          label={backButtonLabel}
          href={backButtonHref} // Kan være '#' hvis onClick brukes
          onClick={onBackButtonClick} // Send funksjonen videre til BackButton
        />
      </CardFooter>
    </Card>
  );
};