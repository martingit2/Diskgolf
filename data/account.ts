import client from "@/app/lib/prismadb";


export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await client.account.findFirst({
      where: { userId }
    });

    return account;
  } catch {
    return null;
  }
};