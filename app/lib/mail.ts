/**
 * Filnavn: mail.ts
 * Beskrivelse: Hjelpefunksjoner for å sende e-poster til brukere for tofaktorautentisering,
 * passordtilbakestilling og e-postbekreftelse. Bruker Resend API for e-postutsending
 * og inline margin på <p>-tags for pålitelig linjeavstand.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("FATAL ERROR: RESEND_API_KEY mangler. Sjekk .env-filen.");
  throw new Error("RESEND_API_KEY er ikke satt. Kan ikke sende e-poster.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Base URL setup (samme som før)
const protocol =
  process.env.NODE_ENV === "production" ||
  (process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.startsWith("http://localhost"))
    ? "https"
    : "http";
const domain = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")
  : "localhost:3000";
const baseUrl = `${protocol}://${domain}`;
const fromEmail = `konto@epost.diskgolf.app`; // Beholdt din originale from-adresse
const appName = "DiskGolf App";

// Stil for <p>-tagger for å sikre avstand (inline)
const pStyle = 'style="margin: 0 0 1em 0; padding: 0; font-size: 16px; line-height: 1.5;"'; // 1em bunnmarg, nullstiller andre
const linkStyle = 'style="color: #2ecc71; text-decoration: underline; font-weight: bold;"'; // Stil for lenker
const codeStyle = 'style="font-size: 1.3em; color: #2ecc71; font-weight: bold;"'; // Stil for 2FA kode

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[${appName}] Din sikkerhetskode`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <p ${pStyle}>Hei,</p>
          <p ${pStyle}>Din sikkerhetskode for å logge inn på ${appName} er:</p>
          <p ${pStyle}><strong ${codeStyle}>${token}</strong></p>
          <p ${pStyle}>Vennligst skriv inn denne koden i innloggingsskjemaet for å fullføre innloggingen. Koden er gyldig i 5 minutter.</p>
          <p ${pStyle}>Hvis du ikke har forespurt denne koden, kan du se bort fra denne e-posten.</p>
          <p ${pStyle}>Vennlig hilsen,<br />${appName} Team</p>
        </div>
      `,
    });
    console.log(`INFO: 2FA-kode sendt til ${email}`);
  } catch (error) {
    console.error(`ERROR: Kunne ikke sende 2FA-kode til ${email}:`, error);
    throw new Error("Kunne ikke sende 2FA-kode. Prøv igjen senere.");
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/auth/new-password?token=${token}`;
  console.log("DEBUG: Generert tilbakestillingslenke:", resetLink);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[${appName}] Tilbakestill passordet ditt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <p ${pStyle}>Hei,</p>
          <p ${pStyle}>Vi har mottatt en forespørsel om å tilbakestille passordet for din konto hos ${appName}.</p>
          <p ${pStyle}>Klikk på lenken nedenfor for å tilbakestille passordet:</p>
          <p ${pStyle}><a href="${resetLink}" ${linkStyle}>Tilbakestill passordet ditt</a></p>
          <p ${pStyle}>Lenken er gyldig i 1 time.</p>
          <p ${pStyle}>Hvis du ikke har bedt om dette, kan du trygt se bort fra denne e-posten.</p>
          <p ${pStyle}>Vennlig hilsen,<br />${appName} Team</p>
        </div>
      `,
    });
    console.log(`INFO: Passordtilbakestilling sendt til ${email}`);
  } catch (error) {
    console.error(`ERROR: Kunne ikke sende tilbakestilling til ${email}:`, error);
    throw new Error("Kunne ikke sende tilbakestillingslenke. Prøv igjen senere.");
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;
  console.log("DEBUG: Generert bekreftelseslenke:", confirmLink);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[${appName}] Bekreft din e-postadresse`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <p ${pStyle}>Hei,</p>
          <p ${pStyle}>Takk for at du registrerte deg hos ${appName}!</p>
          <p ${pStyle}>Klikk på lenken nedenfor for å bekrefte e-postadressen din og aktivere kontoen:</p>
          <p ${pStyle}><a href="${confirmLink}" ${linkStyle}>Bekreft e-postadressen</a></p>
          <p ${pStyle}>Hvis du ikke har registrert deg hos oss, kan du se bort fra denne e-posten.</p>
          <p ${pStyle}>Vennlig hilsen,<br />${appName} Team</p>
        </div>
      `,
    });
    console.log(`INFO: E-postbekreftelse sendt til ${email}`);
  } catch (error) {
    console.error(`ERROR: Kunne ikke sende bekreftelse til ${email}:`, error);
    throw new Error("Kunne ikke sende bekreftelseslenke. Prøv igjen senere.");
  }
};