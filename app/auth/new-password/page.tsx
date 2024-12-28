"use client";

import { Suspense } from "react";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export const dynamic = "force-dynamic";

const NewPasswordPage = () => {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
};

export default NewPasswordPage;
