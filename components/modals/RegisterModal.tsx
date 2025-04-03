/**
 * Filnavn: RegisterModal.tsx
 * Beskrivelse: Modal-komponent for brukerregistrering, bruker RegisterForm.
 * Utvikler: Martin Pettersen
 */
"use client";

import { useCallback } from "react";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from "./Modal";
import RegisterForm from "../auth/register-form"; // Importer den refaktoriserte formen
import { toast } from "react-hot-toast"; // Kan brukes for ekstra feedback hvis ønskelig

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  // Callback for å bytte til LoginModal
  const onToggleToLogin = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  // Callback for hva som skjer etter vellykket registrering
  const handleRegisterSuccess = useCallback(() => {
    // Viser en generell melding (RegisterForm viser også en melding)
    toast.success("Bruker opprettet! Sjekk e-post for verifisering.");
    // Bytter til login-modalen slik at brukeren kan logge inn
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);


  // Hovedinnholdet er nå RegisterForm-komponenten
  const bodyContent = (
    <RegisterForm
      onAlreadyHaveAccount={onToggleToLogin} // Send funksjon for å bytte til login
      onRegisterSuccess={handleRegisterSuccess} // Send funksjon for hva som skjer etter suksess
    />
  );

  // Siden CardWrapper i RegisterForm håndterer "back button" (bytt til login),
  // trenger vi ikke en egen footer i Modal her.
  // onSubmit og actionLabel på Modal er heller ikke nødvendig.

  return (
    <Modal
      isOpen={registerModal.isOpen}
      onClose={registerModal.onClose}
      // onSubmit er ikke nødvendig her
      onSubmit={() => {}} // Tom funksjon
      title="Opprett ny bruker" // Tittel for modal-headeren
      // actionLabel er ikke nødvendig her
      actionLabel="" // Tom streng
      body={bodyContent}
      // Footer er ikke nødvendig her
      footer={undefined}
    />
  );
};

export default RegisterModal;