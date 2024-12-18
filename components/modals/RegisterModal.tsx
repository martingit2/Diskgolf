"use client";

import axios from "axios";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/register", data)
      .then(() => {
        registerModal.onClose();
        loginModal.onOpen();
        toast.success("Du har registrert deg!");
      })
      .catch(() => {
        toast.error("Noe gikk galt. Prøv igjen.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      {/* Navn */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Navn
        </label>
        <input
          id="name"
          {...register("name", { required: "Navn er påkrevd" })}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.name ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {String(errors.name.message)}
          </p>
        )}
      </div>

      {/* E-post */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="email"
          type="email"
          {...register("email", { required: "E-post er påkrevd" })}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.email ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {String(errors.email.message)}
          </p>
        )}
      </div>

      {/* Passord */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Passord
        </label>
        <input
          id="password"
          type="password"
          {...register("password", { required: "Passord er påkrevd" })}
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.password ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {String(errors.password.message)}
          </p>
        )}
      </div>
    </div>
  );

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

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Registrer"
      actionLabel="Fortsett"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent} // Legger til body-innholdet
      footer={footerContent} // Legger til footer-innholdet
    />
  );
};

export default RegisterModal;
