/**
 * @fileoverview Sign-in contract: what the app can ask about sessions,
 * independent of the auth vendor.
 *
 * Why this exists: routes and server actions only call {@link AuthService}.
 * Supabase Auth lives in supabase-auth-service.ts. Switching auth vendor
 * means writing one new file and changing {@link getAuthService}.
 *
 * Server only.
 */

import type {NextRequest, NextResponse} from 'next/server';
import {createSupabaseAuthService, refreshSupabaseSession} from './supabase-auth-service';

/** The signed-in account, as far as sign-in is concerned. */
export interface AuthUser {
  id: string;
  email: string;
}

/** Outcome of an auth call: success, or a message to show the user. */
export type AuthResult = {ok: true} | {ok: false; message: string};

/** Everything the app can do with sign-in. */
export interface AuthService {
  /** The user of the current request, or null for guests. */
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  /**
   * Creates an account and emails a confirmation link.
   * @param confirmUrl Where the confirmation link sends the user back to.
   */
  signUpWithPassword(
    email: string,
    password: string,
    confirmUrl: string,
  ): Promise<AuthResult>;
  /** Returns the Google page to redirect to; Google then returns to `callbackUrl`. */
  getGoogleSignInUrl(callbackUrl: string): Promise<string>;
  /** Finishes a sign-in that came back with a one-time code (email link, Google). */
  completeSignIn(code: string): Promise<AuthResult>;
  /** Emails a password-reset link that returns to `resetUrl`. */
  sendPasswordReset(email: string, resetUrl: string): Promise<AuthResult>;
  /** Sets a new password for the signed-in user. */
  updatePassword(password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}

/**
 * Returns the auth service the app should use.
 * The single place to change when the auth vendor changes.
 */
export function getAuthService(): AuthService {
  return createSupabaseAuthService();
}

/**
 * Refreshes the session cookie of an incoming request so sessions do not
 * expire mid-visit. Called by `src/proxy.ts` before every page.
 *
 * @param makeResponse Builds the response to send on; may be called again
 *     when cookies change.
 */
export function refreshSession(
  request: NextRequest,
  makeResponse: () => NextResponse,
): Promise<NextResponse> {
  return refreshSupabaseSession(request, makeResponse);
}
