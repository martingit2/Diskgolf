/**
 * Filnavn: ResetPasswordModal.tsx
 * Beskrivelse: Modal-komponent for å be om tilbakestilling av passord.
 * Utvikler: Martin Pettersen
 */
"use client";

import useLoginModal from "@/app/hooks/useLoginModal";
import useResetPasswordModal from "@/app/hooks/useResetmodal";
import { useState, useCallback, useTransition } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/schemas";
import { reset as resetPasswordAction } from "@/app/actions/reset";

import Heading from "../Heading";
import Input from "@/components/inputs/Input";
import { FormError } from "../auth/form-error";
import { FormSuccess } from "../form-success";
import Modal from "./Modal";

import { Button as ShadButton } from '@/components/ui/button'; // <-- Endre stien om nødvendig

const ResetPasswordModal = () => {
  const resetPasswordModal = useResetPasswordModal();
  const loginModal = useLoginModal();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetFormFields,
  } = useForm<FieldValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      resetPasswordAction({ email: data.email })
        .then((response) => {
          if (response?.error) setError(response.error);
          if (response?.success) {
            setSuccess(response.success);
            resetFormFields();
          }
        })
        .catch(() => setError("Noe uventet gikk galt."));
    });
  };

  const onToggleToLogin = useCallback(() => {
    resetPasswordModal.onClose();
    loginModal.onOpen();
  }, [resetPasswordModal, loginModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <Heading title="Glemt passord?" subtitle="Skriv inn e-posten din for å få tilsendt en link." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         <Input
            id="email"
            label="E-post"
            type="email"
            disabled={isPending}
            register={register}
            errors={errors}
            required
         />
         <FormError message={error} />
         <FormSuccess message={success} />

         {/* BRUK SHADCN BUTTON HER */}
          <ShadButton type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sender..." : "Send e-post"}
          </ShadButton>
      </form>
    </div>
  );

  const footerContent = (
    <div className="text-neutral-500 text-center mt-4 font-light text-sm">
      <p>Husket passordet?
        {/* Du kan bruke Shadcn Button her også hvis du vil */}
        <ShadButton
           variant="link" // Stil som en lenke
           size="sm" // Liten størrelse
           onClick={onToggleToLogin}
           className="text-neutral-800 font-medium hover:underline ml-1 px-1 h-auto" // Juster padding/høyde
           disabled={isPending}
           type="button" // Viktig for å ikke submitte form
        >
           Gå tilbake til innlogging
        </ShadButton>
      </p>
    </div>
  );

  return (
    <Modal
      disabled={isPending}
      isOpen={resetPasswordModal.isOpen}
      title="Tilbakestill passord"
      actionLabel=""
      onSubmit={() => {}}
      onClose={resetPasswordModal.onClose}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default ResetPasswordModal;