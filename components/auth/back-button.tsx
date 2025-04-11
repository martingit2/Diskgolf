/** 
 * Filnavn: back-button.tsx
 * Beskrivelse: Tilpasset tilbakeknapp-komponent som gir fleksibilitet med valgfri klikkhendelse.
 * Kombinerer Next.js Link med en knapp for å støtte navigasjon og eventuelle egendefinerte handlinger.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */


"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const BackButton = ({ href, label, onClick }: BackButtonProps) => {
  return (
    <Button
      variant="link"
      className="font-normal w-full"
      size="sm"
      asChild
    >
      <Link
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault(); // Hindrer standard navigasjon hvis onClick er definert
            onClick(e);
          }
        }}
      >
        {label}
      </Link>
    </Button>
  );
};
