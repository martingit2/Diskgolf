import { Resend } from 'resend';



if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
  throw new Error("RESEND_API_KEY mangler. Sjekk .env-filen.");
}
// Sjekk at RESEND_API_KEY er definert
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY mangler. Sjekk .env-filen.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: 'konto@epost.diskgolf.app',
      to: email,
      subject: '2FA-kode',
      html: `<p>Din 2FA-kode: ${token}</p>`,
    });
    console.log("2FA-kode sendt til:", email);
  } catch (error) {
    console.error("Feil ved sending av 2FA-kode:", error);
    throw new Error("Kunne ikke sende 2FA-kode. Prøv igjen senere.");
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  console.log("Generert tilbakestillingslenke:", resetLink);

  try {
    await resend.emails.send({
      from: 'konto@epost.diskgolf.app',
      to: email,
      subject: 'Tilbakestill passordet ditt',
      html: `<p>Klikk <a href="${resetLink}">her</a> for å tilbakestille passordet.</p>`,
    });
    console.log("Tilbakestillings-e-post sendt til:", email);
  } catch (error) {
    console.error("Feil ved sending av tilbakestillings-e-post:", error);
    throw new Error("Kunne ikke sende tilbakestillingslenke. Prøv igjen senere.");
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  try {
    await resend.emails.send({
      from: 'konto@epost.diskgolf.app',
      to: email,
      subject: 'Bekreft e-posten din',
      html: `<p>Klikk <a href="${confirmLink}">her</a> for å bekrefte e-posten din.</p>`,
    });
    console.log("Bekreftelses-e-post sendt til:", email);
  } catch (error) {
    console.error("Feil ved sending av bekreftelses-e-post:", error);
    throw new Error("Kunne ikke sende bekreftelseslenke. Prøv igjen senere.");
  }
};
