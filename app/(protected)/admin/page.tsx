/**
 * Filnavn: AdminPage.tsx
 * Beskrivelse: Administrasjonspanel med tilgangskontroll for administratorer.
 * Gir funksjonalitet for å teste API-tilgang og serverhandlinger.
 * Utvikler: Martin Pettersen
 */

"use client";

import { admin } from "@/app/actions/admin";
import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import toast from "react-hot-toast";

/**
 * AdminPage-komponenten gir en grensesnitt for administratorer.
 * Inkluderer tilgangskontroll og funksjoner for å teste API-ruter og serverhandlinger.
 * 
 * @component
 * @author Martin Pettersen
 */
const AdminPage = () => {
  /**
   * Håndterer serverhandling ved å kalle admin-funksjonen.
   * Viser toast-melding basert på suksess eller feil.
   */
  const onServerActionClick = () => {
    admin()
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      });
  };
  
  /**
   * Tester tilgang til API-ruten ved å sende en forespørsel.
   * Viser toast-melding basert på HTTP-respons.
   */
  const onApiRouteClick = () => {
    fetch("/api/admin")
      .then((response) => {
        if (response.ok) {
          toast.success("Tilgang til API Route tillatt!");
        } else {
          toast.error("Ingen tilgang til API Route!");
        }
      });
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">
          🔑 Adminpanel
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sjekker tilgang basert på rolle */}
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message="Du har tilgang til å se dette innholdet!" />
        </RoleGate>

        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">
            Admin-kun API Route
          </p>
          <Button onClick={onApiRouteClick}>
            Klikk for å teste
          </Button>
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">
            Admin-kun serverhandling
          </p>
          <Button onClick={onServerActionClick}>
            Klikk for å teste
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
