/**
 * @fileoverview "Delete account" section of the account page. Hidden behind
 * a button, then asks the user to type DELETE, because deletion cannot be
 * undone.
 */

'use client';

import {useActionState, useState} from 'react';
import {deleteAccountAction} from '@/app/actions/profile';
import {FormError} from './FormError';

/** Danger-zone section with a typed confirmation. */
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, {});

  if (!open) {
    return (
      <button
        className="link-button danger"
        onClick={() => {
          setOpen(true);
        }}
      >
        Delete account
      </button>
    );
  }

  return (
    <form action={formAction} className="danger-zone">
      <h2>Delete your account</h2>
      <p>
        This permanently deletes your account, profile and uploaded files. It cannot be
        undone.
      </p>
      <FormError message={state.error} trigger={state} />
      <label className="field">
        Type DELETE to confirm
        <input name="confirm" autoComplete="off" required />
      </label>
      <button className="btn wide danger" disabled={pending}>
        {pending ? 'Deleting…' : 'Delete my account permanently'}
      </button>
      <button
        type="button"
        className="btn light wide form-cancel"
        onClick={() => {
          setOpen(false);
        }}
      >
        Cancel
      </button>
    </form>
  );
}
