"use server";

import { signOut } from "@/auth";

export const logout = async () => {

    // kan legge til Server ting her før brukeren logger ut, kan kleare ting om brukeren før han logger ut etc. Finnner utav det later.
  await signOut();
};