"use client";

import { admin } from "@/app/actions/admin";
import { RoleGate } from "@/components/auth/role-gate";

import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import toast from "react-hot-toast";

const AdminPage = () => {
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
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess
            message="Du har tilgang til å se dette innholdet!"
          />
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
