/**
 * @fileoverview {@link AuthService} backed by Supabase Auth.
 *
 * The only file that calls `supabase.auth`. Sessions live in cookies
 * (handled by @supabase/ssr in lib/supabase/clients.ts).
 *
 * Server only.
 */

import {getRequestClient} from '@/lib/supabase/clients';
import type {AuthResult, AuthService} from './auth-service';

/** Turns a Supabase error (or none) into an {@link AuthResult}. */
function toResult(error: {message: string} | null): AuthResult {
  return error ? {ok: false, message: error.message} : {ok: true};
}

/** Auth service using the current request's Supabase session. */
export function createSupabaseAuthService(): AuthService {
  return {
    async getCurrentUser() {
      const supabase = await getRequestClient();
      // getUser() asks the Auth server, so a forged cookie is rejected.
      const {data} = await supabase.auth.getUser();
      if (!data.user) return null;
      return {id: data.user.id, email: data.user.email ?? ''};
    },

    async signInWithPassword(email, password) {
      const supabase = await getRequestClient();
      const {error} = await supabase.auth.signInWithPassword({email, password});
      return toResult(error);
    },

    async signUpWithPassword(email, password, confirmUrl) {
      const supabase = await getRequestClient();
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {emailRedirectTo: confirmUrl},
      });
      if (error) return toResult(error);
      // Supabase hides whether an email is taken: it returns a user with no
      // identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        return {ok: false, message: 'An account with this email already exists.'};
      }
      return {ok: true};
    },

    async getGoogleSignInUrl(callbackUrl) {
      const supabase = await getRequestClient();
      const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {redirectTo: callbackUrl},
      });
      if (error) throw new Error(`Google sign-in failed: ${error.message}`);
      return data.url;
    },

    async completeSignIn(code) {
      const supabase = await getRequestClient();
      const {error} = await supabase.auth.exchangeCodeForSession(code);
      return toResult(error);
    },

    async verifyEmailToken(tokenHash, type) {
      const supabase = await getRequestClient();
      const {error} = await supabase.auth.verifyOtp({token_hash: tokenHash, type});
      return toResult(error);
    },

    async sendPasswordReset(email, resetUrl) {
      const supabase = await getRequestClient();
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      return toResult(error);
    },

    async updatePassword(password) {
      const supabase = await getRequestClient();
      const {error} = await supabase.auth.updateUser({password});
      return toResult(error);
    },

    async signOut() {
      const supabase = await getRequestClient();
      await supabase.auth.signOut();
    },
  };
}

/** See {@link refreshSession} in auth-service.ts. */
export {refreshSessionCookies as refreshSupabaseSession} from '@/lib/supabase/clients';
