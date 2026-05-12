/**
 * YouthTrend Email Service
 *
 * Wraps nodemailer. In development with no SMTP credentials configured,
 * all emails are logged to the console instead of sent — zero setup needed
 * to run the project locally.
 *
 * For production, configure SMTP_* vars (SMTP2GO, SendGrid, Brevo all have
 * free tiers that cover v1 volumes easily).
 */

import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

// ── Transport ─────────────────────────────────────────────────────────────────

function createTransport(): Transporter {
  // If SMTP credentials are missing, use a console "transport"
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    return nodemailer.createTransport({
      jsonTransport: true,   // serialises to JSON — we log it below
    });
  }

  return nodemailer.createTransport({
    host:   env.SMTP_HOST,
    port:   env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const transporter = createTransport();

// ── Types ─────────────────────────────────────────────────────────────────────

interface SendOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

// ── Core send ─────────────────────────────────────────────────────────────────

async function send(opts: SendOptions): Promise<void> {
  const message = {
    from:    env.EMAIL_FROM,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
    text:    opts.text ?? opts.html.replace(/<[^>]*>/g, ''),
  };

  if (!env.SMTP_HOST || !env.SMTP_USER) {
    // Dev mode — pretty-print to console
    console.log('\n─────────────────── [EMAIL — DEV MODE] ───────────────────');
    console.log(`  To:      ${message.to}`);
    console.log(`  Subject: ${message.subject}`);
    console.log(`  Body:    ${message.text?.substring(0, 300)}...`);
    const firstUrl = message.text?.match(/https?:\/\/\S+/)?.[0];
    if (firstUrl) {
      console.log(`  URL:     ${firstUrl}`);
    }
    console.log('───────────────────────────────────────────────────────────\n');
    return;
  }

  await transporter.sendMail(message);
}

// ── Templates ─────────────────────────────────────────────────────────────────

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #1A6E3C; margin-bottom: 24px; }
    h1 { font-size: 22px; color: #111; margin: 0 0 12px; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #1A6E3C; color: #fff !important;
           text-decoration: none; padding: 12px 28px; border-radius: 8px;
           font-weight: 700; font-size: 15px; margin: 8px 0 20px; }
    .footer { color: #aaa; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
    .code { font-family: monospace; font-size: 28px; font-weight: 800; color: #1A6E3C;
            letter-spacing: 6px; text-align: center; padding: 16px;
            background: #f0faf4; border-radius: 8px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">YouthTrend</div>
    ${content}
    <div class="footer">
      If you did not request this, you can safely ignore this email.<br/>
      &copy; ${new Date().getFullYear()} YouthTrend &mdash; Where Campus Gist Lives 🇨🇲
    </div>
  </div>
</body>
</html>
`;

// ── Public API ─────────────────────────────────────────────────────────────────

export const EmailService = {

  async sendVerificationEmail(opts: {
    to:   string;
    name: string;
    url:  string;
  }): Promise<void> {
    await send({
      to:      opts.to,
      subject: 'Verify your YouthTrend account',
      html: base(`
        <h1>Hi ${opts.name},</h1>
        <p>Welcome to YouthTrend! Click the button below to verify your email address
           and activate your account.</p>
        <a class="btn" href="${opts.url}">Verify My Email</a>
        <p>Or copy this link into your browser:</p>
        <p style="word-break:break-all;color:#1A6E3C;">${opts.url}</p>
        <p>This link expires in <strong>24 hours</strong>.</p>
      `),
    });
  },

  async sendPasswordResetEmail(opts: {
    to:   string;
    name: string;
    url:  string;
  }): Promise<void> {
    await send({
      to:      opts.to,
      subject: 'Reset your YouthTrend password',
      html: base(`
        <h1>Reset your password</h1>
        <p>Hi ${opts.name}, we received a request to reset your YouthTrend password.</p>
        <a class="btn" href="${opts.url}">Reset My Password</a>
        <p>Or copy this link:</p>
        <p style="word-break:break-all;color:#1A6E3C;">${opts.url}</p>
        <p>This link expires in <strong>15 minutes</strong>. If you did not request a
           password reset, your account is safe — just ignore this email.</p>
      `),
    });
  },

  async sendWriterUpgradeApproved(opts: {
    to:         string;
    name:       string;
    campusName: string;
  }): Promise<void> {
    await send({
      to:      opts.to,
      subject: 'You are now a YouthTrend Writer!',
      html: base(`
        <h1>Congratulations, ${opts.name}! 🎉</h1>
        <p>Your writer upgrade request for <strong>${opts.campusName}</strong> has been
           approved. You can now publish stories, articles, and gist directly to your
           campus feed.</p>
        <a class="btn" href="${env.BETTER_AUTH_URL.replace(':4000', ':5173')}/write">
          Write Your First Post
        </a>
      `),
    });
  },

  async sendWriterUpgradeDeclined(opts: {
    to:         string;
    name:       string;
    campusName: string;
    note?:      string;
  }): Promise<void> {
    await send({
      to:      opts.to,
      subject: 'Update on your YouthTrend writer application',
      html: base(`
        <h1>Hi ${opts.name},</h1>
        <p>Thank you for applying to become a writer on the
           <strong>${opts.campusName}</strong> YouthTrend feed.</p>
        <p>After review, your application was not approved at this time.</p>
        ${opts.note ? `<p><strong>Reviewer note:</strong> ${opts.note}</p>` : ''}
        <p>You may reapply after <strong>14 days</strong>.</p>
      `),
    });
  },

  async sendCampusAnnouncement(opts: {
    to:         string;
    name:       string;
    campusName: string;
    title:      string;
    body:       string;
    url:        string;
  }): Promise<void> {
    await send({
      to:      opts.to,
      subject: `[${opts.campusName}] ${opts.title}`,
      html: base(`
        <h1>${opts.title}</h1>
        <p><em>Official announcement from ${opts.campusName}</em></p>
        <p>${opts.body.substring(0, 500)}${opts.body.length > 500 ? '...' : ''}</p>
        <a class="btn" href="${opts.url}">Read Full Announcement</a>
      `),
    });
  },
};
