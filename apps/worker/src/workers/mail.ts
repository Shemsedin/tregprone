import type { Job } from 'bullmq';
import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

interface ContactMailJob {
  contactRequestId: string;
  agentEmail: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  listingTitle: string;
  listingUrl: string;
}

function getTransport() {
  const config: SMTPTransport.Options = {
    host: process.env['SMTP_HOST'] ?? 'localhost',
    port: Number(process.env['SMTP_PORT'] ?? 1025),
    secure: false,
    auth:
      process.env['SMTP_USER']
        ? { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASS'] ?? '' }
        : undefined,
  };
  return createTransport(config);
}

const FROM = process.env['MAIL_FROM'] ?? 'Treg Prone <noreply@tregprone.dev>';

export async function mailWorker(job: Job<ContactMailJob>) {
  const data = job.data;
  const transport = getTransport();

  await transport.sendMail({
    from: FROM,
    to: data.agentEmail,
    replyTo: data.senderEmail,
    subject: `Kërkesë kontakti: ${data.listingTitle}`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
  <h2 style="color:#2e7d5b">Kërkesë e re kontakti</h2>
  <p><strong>Pronë:</strong> <a href="${data.listingUrl}">${data.listingTitle}</a></p>
  <hr/>
  <p><strong>Emri:</strong> ${data.senderName}</p>
  <p><strong>Email:</strong> ${data.senderEmail}</p>
  ${data.senderPhone ? `<p><strong>Telefon:</strong> ${data.senderPhone}</p>` : ''}
  <p><strong>Mesazhi:</strong></p>
  <p style="white-space:pre-line">${data.message}</p>
  <hr/>
  <p style="font-size:12px;color:#888">Treg Prone — platforma e pronave shqiptare</p>
</div>`,
    text: `Kërkesë kontakti për: ${data.listingTitle}\n\nEmri: ${data.senderName}\nEmail: ${data.senderEmail}${data.senderPhone ? `\nTelefon: ${data.senderPhone}` : ''}\n\nMesazhi:\n${data.message}`,
  });
}
