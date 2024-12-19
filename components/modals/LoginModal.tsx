"use client"; // Indikerer at denne komponenten skal rendres på klientsiden.

import axios from "axios"; // Axios brukes for å sende HTTP-forespørsler til backend.
import { useState } from "react"; // React Hook for å administrere tilstand.
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; // Verktøy for å håndtere skjemaer.
import useRegisterModal from "@/app/hooks/useRegisterModal"; // Egendefinert hook for registreringsmodalen.
import useLoginModal from "@/app/hooks/useLoginModal"; // Egendefinert hook for innloggingsmodalen.
import { toast } from "react-hot-toast"; // For å vise notifikasjoner.
import Modal from "./Modal"; // Gjenbrukbar Modal-komponent.
import Input from "@/components/inputs/Input"; // Gjenbrukbar Input-komponent.
import { FaGithub } from "react-icons/fa"; // Ikon for GitHub fra react-icons.

const LoginModal = () => {
  // Hooks for å kontrollere modalens visningstilstand.
  const registerModal = useRegisterModal(); // Kontroll for registreringsmodalen.
  const loginModal = useLoginModal(); // Kontroll for innloggingsmodalen.

  // Lokal state for å indikere om en handling pågår (brukes for å deaktivere knapper).
  const [isLoading, setIsLoading] = useState(false);

  /**
   * React Hook Form:
   * - `register`: Binder input-felter til skjemaet.
   * - `handleSubmit`: Håndterer skjemaets innsending.
   * - `formState.errors`: Holder oversikt over valideringsfeil.
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  /**
   * Funksjon for å håndtere innsending av skjemaet.
   * - Sender data til backend via Axios.
   * - Viser en suksessmelding hvis registreringen er vellykket.
   * - Åpner innloggingsmodalen etterpå.
   */
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // Indikerer at en handling pågår.

    axios
      .post("/api/register", data) // Sender data til backend.
      .then(() => {
        registerModal.onClose(); // Lukker registreringsmodalen.
        loginModal.onOpen(); // Åpner innloggingsmodalen.
        toast.success("Du har registrert deg!"); // Viser suksessmelding.
      })
      .catch(() => {
        toast.error("Noe gikk galt. Prøv igjen."); // Viser feilmelding ved feil.
      })
      .finally(() => {
        setIsLoading(false); // Tilbakestiller loading-tilstanden.
      });
  };

  /**
   * Innholdet i modalens hoveddel (body):
   * - Input-felter for navn, e-post og passord.
   * - Knapper for å registrere med Google og GitHub.
   */
  const bodyContent = (
    <div className="flex flex-col gap-4">
      {/* Navn */}
      <Input
        id="name"
        label="Navn"
        type="text"
        disabled={isLoading} // Deaktiveres under lasting.
        register={register}
        errors={errors}
        required
        {...register("name", {
          required: "Navn er påkrevd", // Påkrev navn
          minLength: {
            value: 2,
            message: "Navn må være minst 2 tegn",
          },
          maxLength: {
            value: 50,
            message: "Navn kan ikke være lengre enn 50 tegn",
          },
        })}
      />

      {/* E-post */}
      <Input
        id="email"
        label="E-post"
        type="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        {...register("email", {
          required: "E-post er påkrevd",
          pattern: {
            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
            message: "E-postadressen er ugyldig",
          },
        })}
      />

      {/* Passord */}
      <Input
        id="password"
        label="Passord"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        {...register("password", {
          required: "Passord er påkrevd",
          minLength: {
            value: 6,
            message: "Passord må være minst 6 tegn",
          },
        })}
      />

      {/* Google-knapp */}
      <button
        onClick={() => console.log("Registrer med Google")}
        className="flex items-center justify-center gap-2 bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {/* Bruker SVG-ikonet fra public-mappen */}
        <img
          src="/google.svg"
          alt="Google Icon"
          className="w-5 h-5"
        />
        Registrer deg med din Google-konto
      </button>

      {/* GitHub-knapp */}
      <button
        onClick={() => console.log("Registrer med GitHub")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FaGithub size={18} />
        Registrer deg med din GitHub-konto
      </button>
    </div>
  );

  /**
   * Innholdet i modalens footer:
   * - Lenke til innloggingsmodalen hvis brukeren allerede har en konto.
   */
  const footerContent = (
    <div className="text-center mt-4 text-sm text-gray-500">
      Har du allerede en bruker?{" "}
      <span
        onClick={() => {
          registerModal.onClose();
          loginModal.onOpen();
        }}
        className="cursor-pointer text-blue-500 hover:underline"
      >
        Logg inn her
      </span>
    </div>
  );

  /**
   * Returnerer modal-komponenten med riktig innhold og handlinger.
   */
  return (
    <Modal
      disabled={isLoading} // Deaktiverer handlinger mens modalen laster.
      isOpen={loginModal.isOpen} // Styrer om modalen vises.
      title="Opprett bruker" // Tittel på modalen.
      actionLabel="Fortsett" // Tekst på hovedknappen.
      onClose={loginModal.onClose} // Callback for å lukke modalen.
      onSubmit={handleSubmit(onSubmit)} // Håndterer innsending av skjema.
      body={bodyContent} // Modalens hovedinnhold.
      footer={footerContent} // Modalens bunninnhold.
    />
  );
};

export default LoginModal;
