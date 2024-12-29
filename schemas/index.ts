import { UserRole } from "@prisma/client";
import * as z from "zod";

export const sanitizeInput = (input: string): string => {
  return input.replace(/['"\\;()=]/g, ""); // Fjerner potensielt skadelige tegn som ', ", \, ;, (, ), =
};


// Valideringsregler for passord (gjenbrukes for konsistens)
const passwordValidation = z
  .string()
  .min(6, { message: "Passord må være minst 6 tegn" })
  .regex(/[A-Z]/, { message: "Passord må inneholde minst én stor bokstav" })
  .regex(/[a-z]/, { message: "Passord må inneholde minst én liten bokstav" })
  .regex(/[0-9]/, { message: "Passord må inneholde minst ett tall" })
  .refine((password) => !password.includes("'"), {
    message: "Passord kan ikke inneholde apostrofer",
  });

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnable: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.CLUB_LEADER]),
    email: z.optional(z.string().email()),
    password: z.optional(passwordValidation),
    newPassword: z.optional(passwordValidation),
  })
  .refine((data) => {
    if (data.password && !data.newPassword) {
      return false;
    }

    return true;
  }, {
    message: "Nytt passord er påkrevd!",
    path: ["newPassword"],
  })
  .refine((data) => {
    if (data.newPassword && !data.password) {
      return false;
    }

    return true;
  }, {
    message: "Passord er påkrevd!",
    path: ["password"],
  });

export const NewPasswordSchema = z.object({
  password: passwordValidation,
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "E-post er påkrevd",
  }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email({
      message: "E-post må være en gyldig adresse",
    })
    .refine((email) => !email.includes("'"), {
      message: "E-post kan ikke inneholde apostrofer",
    }),
  password: passwordValidation,
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email({
      message: "E-post må være en gyldig adresse",
    })
    .refine((email) => !email.includes("'"), {
      message: "E-post kan ikke inneholde apostrofer",
    }),
  password: passwordValidation,
  name: z
    .string()
    .min(2, { message: "Navn er påkrevd" })
    .refine((name) => !name.includes("'"), {
      message: "Navn kan ikke inneholde apostrofer",
    }),
});
