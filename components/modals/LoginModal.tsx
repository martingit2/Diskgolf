"use client"; // Indikerer at denne komponenten skal rendres på klientsiden.

import { useState, useCallback } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Input from "@/components/inputs/Input";
import { FaGithub } from "react-icons/fa";
import Heading from "../Heading";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("Du er logget inn!");
        router.refresh();
        loginModal.onClose();
      }

      if (callback?.error) {
        toast.error(callback.error);
      }
    });
  };

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Velkommen tilbake" subtitle="Logg inn på din konto" />

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
        onClick={() => signIn("google")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <img src="/google.svg" alt="Google Icon" className="w-5 h-5" />
        Logg inn med Google
      </button>

      {/* GitHub-knapp */}
      <button
        onClick={() => signIn("github")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-black hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FaGithub size={18} />
        Logg inn med GitHub
      </button>
    </div>
  );

  const footerContent = (
    <div className="text-center mt-4 text-sm text-gray-500">
      Har du ikke en konto?{" "}
      <span
        onClick={onToggle}
        className="cursor-pointer text-blue-500 hover:underline"
      >
        Opprett en her
      </span>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Logg inn"
      actionLabel="Fortsett"
      onClose={loginModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;
