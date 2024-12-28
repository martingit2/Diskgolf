"use client";

import { ResetForm } from "@/components/auth/reset-form";
import { useRouter } from "next/navigation";

const ResetPage = () => {
  const router = useRouter();

  return (
    <ResetForm
      onBackToLogin={() => {
        router.push("/auth/login");
      }}
    />
  );
};

export default ResetPage;
