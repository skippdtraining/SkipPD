/**
 * @fileoverview Error message at the top of a form that scrolls itself into
 * view and takes focus whenever a submit fails.
 *
 * Why: errors are shown above long forms, so on phones the user stayed at
 * the submit button and never saw what went wrong.
 */

'use client';

import {useEffect, useRef} from 'react';

interface FormErrorProps {
  /** Message to show; nothing is rendered when empty. */
  message?: string;
  /**
   * Changes on every submit (e.g. the action's state object), so the same
   * message shown twice in a row still scrolls into view again.
   */
  trigger: unknown;
}

/** Form error that brings itself into view after each failed submit. */
export function FormError({message, trigger}: FormErrorProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!message || !ref.current) return;
    ref.current.scrollIntoView({behavior: 'smooth', block: 'center'});
    // Focus so screen readers and keyboard users land on the message too.
    ref.current.focus({preventScroll: true});
  }, [message, trigger]);

  if (!message) return null;
  return (
    <p ref={ref} className="form-error" role="alert" tabIndex={-1}>
      {message}
    </p>
  );
}
