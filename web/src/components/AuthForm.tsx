/**
 * @fileoverview Generic form for the auth pages: runs a server action and
 * shows its error or success note.
 *
 * Why generic: sign-in, sign-up, forgot-password and reset-password differ
 * only in their fields and action. The fields are passed as children.
 */

'use client';

import {useActionState} from 'react';
import type {AuthFormState} from '@/app/actions/auth';

interface AuthFormProps {
  action: (previous: AuthFormState, data: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  /** The form's inputs. */
  children: React.ReactNode;
}

/** Form wired to an auth server action, with pending and message states. */
export function AuthForm({action, submitLabel, children}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  // After success (e.g. "check your email") the form is no longer needed.
  if (state.notice) {
    return (
      <p className="notice" role="status">
        {state.notice}
      </p>
    );
  }

  return (
    <form action={formAction}>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {children}
      <button className="btn wide" disabled={pending}>
        {pending ? 'Please wait…' : submitLabel}
      </button>
    </form>
  );
}
