/**
 * Filnavn: LoginModal.tsx
 * Beskrivelse: Modal-komponent for brukerinnlogging, bruker LoginForm.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */
"use client";

import { useCallback } from "react";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from "./Modal";
import LoginForm from "../auth/login-form";
// IMPORTER MED KORREKT FILNAVN-CASING
import useResetPasswordModal from "@/app/hooks/useResetModal"; // <-- Endret til stor M

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const resetPasswordModal = useResetPasswordModal();

  const onToggleToRegister = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const onToggleToReset = useCallback(() => {
    loginModal.onClose();
    resetPasswordModal.onOpen();
  }, [loginModal, resetPasswordModal]);

  const bodyContent = (
    <LoginForm
      onRegister={onToggleToRegister}
      onForgotPassword={onToggleToReset}
      onLoginSuccess={loginModal.onClose}
    />
  );

  return (
    <Modal
      isOpen={loginModal.isOpen}
      onClose={loginModal.onClose}
      onSubmit={() => {}}
      title="Logg inn"
      actionLabel=""
      body={bodyContent}
      footer={undefined}
    />
  );
};

export default LoginModal;