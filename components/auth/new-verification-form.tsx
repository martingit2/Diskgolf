"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { newVerification } from "@/app/actions/new-verification";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? ""; // Fallback til en tom streng hvis searchParams er null

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Mangler token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Noe gikk galt");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="mt-20 justify-center flex">
    <CardWrapper
      headerLabel="Bekrefter din verifisering"
      backButtonLabel="Tilbake til innlogging"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
    </div>
  );
};
