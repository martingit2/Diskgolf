/** 
 * Filnavn: index.ts
 * Beskrivelse: Skjemavalidering for ulike autentiserings- og brukerhandlinger ved hjelp av Zod.
 * Håndterer validering for registrering, innlogging, passordtilbakestilling og brukerinnstillinger.
 * Utvikler: Martin Pettersen
 */



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
    name: z.optional(z.string().min(1, "Navn kan ikke være tomt")),
    email: z.optional(z.string().email({ message: "Ugyldig e-postadresse" })),
    role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.CLUB_LEADER]),
    isTwoFactorEnabled: z.optional(z.boolean()),
    password: z.optional(z.string()), // Ingen forhåndsvalidering her
    newPassword: z.optional(z.string()), // Ingen forhåndsvalidering her
    image: z.string().url().optional(), // <-- Nytt felt
  })
  .superRefine((data, ctx) => {
    // Hvis brukeren forsøker å oppdatere passord, må begge feltene være oppgitt og valide
    if ((data.password && !data.newPassword) || (!data.password && data.newPassword)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"], 
        message: "Både gjeldende og nytt passord må oppgis hvis du vil endre passord.",
      });
    }

    // Validering for nytt passord
    if (data.newPassword && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Gjeldende passord må være minst 6 tegn for å oppdatere passord.",
      });
    }

    // Validering for nytt passord må oppfylle regler bare når det er oppgitt
    if (data.newPassword && data.newPassword.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Nytt passord må være minst 6 tegn.",
      });
    }
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
