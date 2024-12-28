import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth"; // Oppdaterer til NextAuthOptions
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

const authConfig: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "text" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          if (!user || !user.hashedPassword) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.hashedPassword
          );

          if (passwordsMatch) {
            return { id: user.id, email: user.email, name: user.name };
          }
        }

        return null;
      },
    }),
  ],
};

export default authConfig;
