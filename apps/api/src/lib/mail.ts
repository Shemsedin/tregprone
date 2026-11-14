import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createMailTransport() {
  const config: SMTPTransport.Options = {
    host: process.env['SMTP_HOST'] ?? 'localhost',
    port: Number(process.env['SMTP_PORT'] ?? 1025),
    secure: false,
    auth:
      process.env['SMTP_USER']
        ? {
            user: process.env['SMTP_USER'],
            pass: process.env['SMTP_PASS'] ?? '',
          }
        : undefined,
  };
  return createTransport(config);
}

const transport = createMailTransport();
const FROM = process.env['MAIL_FROM'] ?? 'Treg Prone <noreply@tregprone.dev>';

export async function sendMail(opts: MailOptions) {
  await transport.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.subject,
  });
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const url = `${baseUrl}/sq/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: 'Verifikoni emailin tuaj — Treg Prone',
    html: `<p>Klikoni linkun e mëposhtëm për të verifikuar emailin tuaj:</p>
<p><a href="${url}">${url}</a></p>
<p>Linku skadon pas 24 orësh.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string) {
  const url = `${baseUrl}/sq/auth/reset?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: 'Rivendosni fjalëkalimin — Treg Prone',
    html: `<p>Klikoni linkun e mëposhtëm për të rivendosur fjalëkalimin tuaj:</p>
<p><a href="${url}">${url}</a></p>
<p>Linku skadon pas 15 minutash.</p>
<p>Nëse nuk e keni kërkuar këtë, injoroni emailin.</p>`,
  });
}

export async function sendContactEmail(opts: {
  agentEmail: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  listingTitle: string;
  listingUrl: string;
}) {
  await sendMail({
    to: opts.agentEmail,
    subject: `Kërkesë kontakti për: ${opts.listingTitle}`,
    html: `<p><strong>Emri:</strong> ${opts.senderName}</p>
<p><strong>Email:</strong> ${opts.senderEmail}</p>
${opts.senderPhone ? `<p><strong>Telefon:</strong> ${opts.senderPhone}</p>` : ''}
<p><strong>Mesazhi:</strong></p>
<p>${opts.message}</p>
<p><a href="${opts.listingUrl}">Shiko listimin</a></p>`,
  });
}
