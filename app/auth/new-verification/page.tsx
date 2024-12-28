"use client";

import { Suspense } from "react";
import { NewVerificationForm } from "@/components/auth/new-verification-form";

export const dynamic = "force-dynamic";

const NewVerificationPage = () => {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
