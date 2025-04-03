/**
 * Filnavn: ResetPasswordModal.tsx
 * Beskrivelse: Modal-komponent for å be om tilbakestilling av passord.
 * Utvikler: Martin Pettersen
 */
"use client";


import useLoginModal from "@/app/hooks/useLoginModal";
import { useState, useCallback, useTransition } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/schemas"; // Importer schema
import { reset } from "@/app/actions/reset"; // Importer server action
import { toast } from "react-hot-toast"; // For feedback


import Heading from "../Heading"; // Bruk Heading som i de andre modalene
import Input from "@/components/inputs/Input"; // Bruk Input-komponenten
import { FormError } from "../auth/form-error"; // For feilmeldinger
import useResetPasswordModal from "@/app/hooks/useResetmodal";
import { FormSuccess } from "../form-success";
import Modal from "../modals/Modal";


const ResetPasswordModal = () => {
  const resetPasswordModal = useResetPasswordModal();
  const loginModal = useLoginModal();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition(); // For loading state

  // Sett opp react-hook-form internt i denne modalen
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetFormFields, // For å tømme feltet ved suksess
  } = useForm<FieldValues>({
    resolver: zodResolver(ResetSchema), // Bruk Zod-schema for validering
    defaultValues: {
      email: "",
    },
  });

  // Håndterer innsending av skjemaet
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setError("");
    setSuccess("");
    console.log("[ResetPasswordModal] Submitting email:", data.email);

    startTransition(() => {
      reset({ email: data.email }) // Kall server action
        .then((response) => {
          if (response?.error) {
            console.error("[ResetPasswordModal] Reset failed:", response.error);
            setError(response.error);
            toast.error(response.error);
          }
          if (response?.success) {
            console.log("[ResetPasswordModal] Reset successful:", response.success);
            setSuccess(response.success);
            toast.success(response.success);
            resetFormFields(); // Tøm skjemaet
            // Vurder å lukke modalen eller vise en tydelig melding
            // setTimeout(() => resetPasswordModal.onClose(), 3000); // Lukk etter 3 sek?
          }
        })
        .catch((err) => {
           console.error("[ResetPasswordModal] Unexpected error:", err);
           setError("Noe uventet gikk galt.");
           toast.error("Noe uventet gikk galt.");
        });
    });
  };

  // Bytter tilbake til login-modalen
  const onToggleToLogin = useCallback(() => {
    resetPasswordModal.onClose();
    loginModal.onOpen();
  }, [resetPasswordModal, loginModal]);

  // Innholdet i modalens body
  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Glemt passord?" subtitle="Skriv inn e-posten din for å få tilsendt en link." />
      <Input
        id="email"
        label="E-post"
        type="email"
        disabled={isPending}
        register={register} // Send register-funksjonen fra useForm
        errors={errors}      // Send errors-objektet
        required             // Gjør feltet påkrevd
        // react-hook-form håndterer nå registrering og validering basert på schema
      />
      {/* Vis feil eller suksessmeldinger */}
      <FormError message={error} />
      <FormSuccess message={success} />
    </div>
  );

  // Innholdet i modalens footer
  const footerContent = (
    <div className="text-neutral-500 text-center mt-4 font-light">
      <p>Husket passordet?
        <span
          onClick={onToggleToLogin} // Bruker callback for login
          className="text-neutral-800 cursor-pointer hover:underline"
        > Gå tilbake til innlogging</span>
      </p>
    </div>
  );

  return (
    <Modal
      disabled={isPending} // Deaktiver knapper under sending
      isOpen={resetPasswordModal.isOpen}
      title="Tilbakestill passord" // Tittel i headeren
      actionLabel={isPending ? "Sender..." : "Send e-post"} // Tekst på hovedknapp
      onClose={resetPasswordModal.onClose}
      onSubmit={handleSubmit(onSubmit)} // Koble modalens submit til react-hook-form
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default ResetPasswordModal;