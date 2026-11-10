/**
 * @fileoverview Resend implementation of {@link EmailService}.
 *
 * Uses the HTTP API with `fetch` (no SDK) so the dependency list stays small.
 * Requires `RESEND_API_KEY` and `EMAIL_FROM` in the environment; see HOW-TO
 * "Send email (Resend)". The same Resend domain also feeds Supabase Auth
 * SMTP (confirmation / reset links).
 *
 * Server only.
 */

import type {EmailService} from './email-service';

/** Resend HTTP API. */
const RESEND_API_URL = 'https://api.resend.com/emails';

/** Sends email through Resend. */
export function createResendEmailService(): EmailService {
  return {
    async send(message) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set; email was not sent.');
      }
      const from = process.env.EMAIL_FROM;
      if (!from) {
        throw new Error('EMAIL_FROM is not set; email was not sent.');
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.html ? {html: message.html} : {}),
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Resend failed (${response.status}): ${detail}`);
      }
    },
  };
}
