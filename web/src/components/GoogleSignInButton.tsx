/**
 * @fileoverview "Continue with Google" button for the sign-in and sign-up
 * pages. A plain form posting to a server action, so it works without
 * client-side JavaScript.
 */

import {googleSignInAction} from '@/app/actions/auth';

interface GoogleSignInButtonProps {
  /** Page to open after signing in. */
  next: string;
}

/** Starts Google sign-in, then returns to `next`. */
export function GoogleSignInButton({next}: GoogleSignInButtonProps) {
  return (
    <form action={googleSignInAction}>
      <input type="hidden" name="next" value={next} />
      <button className="btn light wide">Continue with Google</button>
      <div className="divider">
        <span>or</span>
      </div>
    </form>
  );
}
