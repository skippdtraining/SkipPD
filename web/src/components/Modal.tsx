/**
 * @fileoverview Reusable pop-up dialog used for course details and forms.
 *
 * Uses the browser's built-in `<dialog>` element instead of a library: it
 * already handles focus trapping, the Esc key and the dark backdrop.
 */

'use client';

import {useEffect, useRef, type ReactNode} from 'react';

interface ModalProps {
  title: string;
  /** Called whenever the dialog closes (Esc, × button or backdrop click). */
  onClose: () => void;
  children: ReactNode;
}

/**
 * Dialog that opens as soon as it is rendered. The parent shows it by
 * rendering it and hides it by not rendering it.
 */
export function Modal({title, onClose, children}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() must be called on the real DOM element, which only exists
  // after the first render; hence the effect.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  /** Closes the dialog when the click landed on the backdrop, outside the box. */
  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    // Clicks on the backdrop report the <dialog> itself as the target.
    if (!dialog || event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    if (outside) dialog.close();
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={handleBackdropClick}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="close"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
