/** 
 * Filnavn: role-gate.tsx
 * Beskrivelse: Komponent for tilgangskontroll basert på brukerrolle. 
 * Viser innhold kun hvis brukeren har nødvendig rolle.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */



"use client";

import { UserRole } from "@prisma/client";

import { FormError } from "@/components/form-error";
import { useCurrentRole } from "@/app/hooks/use-current-role";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({
  children,
  allowedRole,
}: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole) {
    return (
      <FormError message="Du har ikke tillatelse til å se dette innholdet!" />
    );
  }

  return (
    <>
      {children}
    </>
  );
};
