import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

 const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'konto@epost.diskgolf.app',
    to: email,
    subject: '2FA-kode',
    html: `<p>Din 2FA-kode: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`;
    console.log("Generert tilbakestillingslenke:", resetLink);

  await resend.emails.send({
    from: 'konto@epost.diskgolf.app',
    to: email,
    subject: 'Tilbakestill passordet ditt',
    html: `<p>Klikk <a href="${resetLink}">her</a> for å tilbakestille passordet.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: 'konto@epost.diskgolf.app',
    to: email,
    subject: 'Bekreft e-posten din',
    html: `<p>Klikk <a href="${confirmLink}">her</a> for å bekrefte e-posten din.</p>`,
  });
};
