import client from "@/app/lib/prismadb";


export const getTwoFactorConfirmationByUserId = async (
  userId: string
) => {
  try {
    const twoFactorConfirmation = await client.twoFactorConfirmation.findUnique({
      where: { userId }
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};