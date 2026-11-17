import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    replyTo: opts.replyTo,
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
  const name = escapeHtml(opts.senderName);
  const email = escapeHtml(opts.senderEmail);
  const phone = opts.senderPhone ? escapeHtml(opts.senderPhone) : null;
  const title = escapeHtml(opts.listingTitle);

  await sendMail({
    to: opts.agentEmail,
    replyTo: opts.senderEmail,
    subject: `Kërkesë kontakti: ${opts.listingTitle}`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
  <h2 style="color:#2e7d5b">Kërkesë e re kontakti</h2>
  <p><strong>Pronë:</strong> <a href="${opts.listingUrl}">${title}</a></p>
  <hr/>
  <p><strong>Emri:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
  <p><strong>Mesazhi:</strong></p>
  <p style="white-space:pre-line">${escapeHtml(opts.message)}</p>
  <hr/>
  <p style="font-size:12px;color:#888">Treg Prone — platforma e pronave shqiptare</p>
</div>`,
    text: `Kërkesë kontakti për: ${opts.listingTitle}\n\nEmri: ${opts.senderName}\nEmail: ${opts.senderEmail}${opts.senderPhone ? `\nTelefon: ${opts.senderPhone}` : ''}\n\nMesazhi:\n${opts.message}`,
  });
}
