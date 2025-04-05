// src/components/ui/loading-spinner.tsx
import { cn } from "@/app/lib/utils";
import { Loader2 } from "lucide-react"; // Importer loader-ikonet


// Definer props interfacet (valgfritt, for fremtidig utvidelse eller styling)
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"; // Eksempel på prop for størrelse
  className?: string;        // For ekstra CSS-klasser
  text?: string;             // Valgfri tekst ved siden av spinneren
}

// LoadingSpinner komponenten
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md", // Standardstørrelse
  className,
  text,
}) => {
  // Bestem størrelse basert på prop
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    // Sentre spinneren og evt. tekst
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn(
        "animate-spin text-gray-500", // Standard styling og animasjon
        sizeClasses[size]               // Størrelsesklasse
      )} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

// --- Viktig: Husk å importere 'cn' fra riktig sted ---
// Hvis du IKKE bruker shadcn/ui's utils/cn-funksjon,
// kan du fjerne importen og bruken av cn():
/*
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className, text }) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}>
      <Loader2 className={`animate-spin text-gray-500 ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};
*/