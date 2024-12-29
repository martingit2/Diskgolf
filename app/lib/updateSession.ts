import { signIn } from "next-auth/react";

/**
 * Oppdaterer klientens økt etter at brukeren har endret innstillingene.
 * 
 * @param updatedUser - De oppdaterte brukerdataene.
 */
export const updateSession = async (updatedUser: {
  email: string;
  name: string;
  role: string;
  isTwoFactorEnable: boolean;
}) => {
  await signIn("credentials", {
    redirect: false,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    isTwoFactorEnable: updatedUser.isTwoFactorEnable,
  });
};
