import { cn } from "@/app/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-2 items-center justify-center text-center p-4 animate-fadeIn">
    <h1
      className={cn(
        "text-4xl font-bold text-primary",
        font.className
      )}
    >
      Autentisering 🔐
    </h1>
    <p className="text-muted-foreground text-base">{label}</p>
  </div>
  );
};
