"use client";


import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className="mt-8">
      <div>
        Placeholder for RegisterForm
        <button onClick={() => router.push("/auth/login")}>Login</button>
      </div>
    </div>
  );
};

export default RegisterPage;

