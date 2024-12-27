"use server";

import { UserRole } from "@prisma/client";
import { currentRole } from "../lib/auth";

export const admin = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Tilgang til serverhandling gitt!" };
  }

  return { error: "Ingen tilgang til denne serverhandlingen!" };
};
