/**
 * @fileoverview Email sending service: interface plus factory.
 *
 * Why: approval/rejection notices (and later booking emails) go through one
 * interface so the vendor lives only in `resend-email-service.ts`. Swapping
 * Resend for SendGrid means adding one file and changing this factory.
 *
 * Server only. Secrets (`RESEND_API_KEY`, `EMAIL_FROM`) are read in the
 * vendor file, never here.
 */

import {createResendEmailService} from './resend-email-service';

/** One message to send. */
export interface EmailMessage {
  /** Recipient address. */
  to: string;
  /** Subject line. */
  subject: string;
  /** Plain-text body (always sent). */
  text: string;
  /** Optional HTML body for mail clients that prefer it. */
  html?: string;
}

/** Everything the app needs from an email provider. */
export interface EmailService {
  /**
   * Sends one message. Throws when the provider rejects it or is not
   * configured; callers decide whether that fails the user action.
   */
  send(message: EmailMessage): Promise<void>;
}

/** Returns the email service the app should use. */
export function getEmailService(): EmailService {
  return createResendEmailService();
}
