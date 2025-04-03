/**
 * Filnavn: LoginModal.tsx
 * Beskrivelse: Modal-komponent for brukerinnlogging, bruker LoginForm.
 * Utvikler: Martin Pettersen
 */
"use client";

import { useCallback } from "react";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useResetPasswordModal from "@/app/hooks/useResetmodal"; // Endret importnavn
import Modal from "./Modal";
import LoginForm from "../auth/login-form"; // Importer den refaktoriserte formen

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const resetPasswordModal = useResetPasswordModal(); // Bruker riktig hook

  // Callback for å bytte til RegisterModal
  const onToggleToRegister = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  // Callback for å bytte til ResetPasswordModal
  const onToggleToReset = useCallback(() => {
    loginModal.onClose();
    resetPasswordModal.onOpen(); // Åpne reset modal
  }, [loginModal, resetPasswordModal]);

  // Hovedinnholdet er nå LoginForm-komponenten
  const bodyContent = (
    <LoginForm
      onRegister={onToggleToRegister}
      onForgotPassword={onToggleToReset}
      onLoginSuccess={loginModal.onClose} // Lukk modalen ved suksess
    />
  );

  // Siden CardWrapper i LoginForm håndterer "back button" (bytt til register),
  // trenger vi ikke en egen footer i Modal her.
  // onSubmit og actionLabel på Modal er heller ikke nødvendig,
  // da LoginForm har sin egen submit-knapp.

  return (
    <Modal
      isOpen={loginModal.isOpen}
      onClose={loginModal.onClose}
      // onSubmit er ikke nødvendig her siden LoginForm håndterer sin egen submit
      onSubmit={() => {}} // Tom funksjon
      title="Logg inn" // Tittel for modal-headeren
      // actionLabel er ikke nødvendig her
      actionLabel="" // Tom streng
      body={bodyContent}
      // Footer er ikke nødvendig her, håndteres av CardWrapper/BackButton i LoginForm
      footer={undefined}
    />
  );
};

export default LoginModal;