"use client"


import RegisterForm from "@/components/auth/register-form";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className="mt-8">
      <RegisterForm
        onAlreadyHaveAccount={() => router.push("/auth/login")}
      />
    </div>
  );
};

export default RegisterPage;
