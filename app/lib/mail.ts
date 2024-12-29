import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
  throw new Error("RESEND_API_KEY mangler. Sjekk .env-filen.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: "konto@epost.diskgolf.app",
      to: email,
      subject: "Din sikkerhetskode for tofaktorautentisering",
      html: `
        <p>Hei,</p>
        <p>Din sikkerhetskode for å logge inn er:</p>
        <h2 style="color: #2ecc71;">${token}</h2>
        <p>Vennligst skriv inn denne koden i innloggingsskjemaet for å fullføre innloggingen.</p>
        <p>Hvis du ikke har forespurt denne koden, kan du se bort fra denne e-posten.</p>
        <p>Vennlig hilsen,<br />DiscGolf-teamet</p>
      `,
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
      from: "konto@epost.diskgolf.app",
      to: email,
      subject: "Tilbakestill passordet ditt",
      html: `
        <p>Hei,</p>
        <p>Vi har mottatt en forespørsel om å tilbakestille passordet ditt.</p>
        <p>Klikk på lenken nedenfor for å tilbakestille passordet:</p>
        <p><a href="${resetLink}" style="color: #2ecc71; text-decoration: none;">Tilbakestill passordet ditt</a></p>
        <p>Lenken er gyldig i 24 timer. Hvis du ikke har bedt om dette, kan du se bort fra denne e-posten.</p>
        <p>Vennlig hilsen,<br />DiscGolf-teamet</p>
      `,
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
      from: "konto@epost.diskgolf.app",
      to: email,
      subject: "Bekreft e-postadressen din",
      html: `
        <p>Hei,</p>
        <p>Takk for at du registrerte deg hos DiscGolf!</p>
        <p>Klikk på lenken nedenfor for å bekrefte e-postadressen din:</p>
        <p><a href="${confirmLink}" style="color: #2ecc71; text-decoration: none;">Bekreft e-postadressen</a></p>
        <p>Hvis du ikke har registrert deg hos oss, kan du se bort fra denne e-posten.</p>
        <p>Vennlig hilsen,<br />DiscGolf-teamet</p>
      `,
    });
    console.log("Bekreftelses-e-post sendt til:", email);
  } catch (error) {
    console.error("Feil ved sending av bekreftelses-e-post:", error);
    throw new Error("Kunne ikke sende bekreftelseslenke. Prøv igjen senere.");
  }
};
