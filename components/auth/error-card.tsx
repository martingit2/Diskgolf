import { CardWrapper } from "@/components/auth/card-wrapper";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export const ErrorCard = () => {
  return (
    <div className="w-full flex justify-center mt-20">
    <CardWrapper
      headerLabel="Oops! Noe gikk galt!"
      backButtonHref="/auth/login"
      backButtonLabel="Tilbake til innlogging"
    >
      <div className="w-full flex flex-col justify-center items-center text-center space-y-4">
        <ExclamationTriangleIcon className="text-destructive h-12 w-12" />
        <p className="text-lg font-semibold text-gray-800">
          Vi opplever et problem. Vennligst prøv igjen senere.
        </p>
      </div>
    </CardWrapper>
    </div>
  );
};
