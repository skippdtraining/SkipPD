"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Native <dialog> modal. Rendered only while open; closes on Esc, × and backdrop click. */
export default function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target !== ref.current) return;
        const r = ref.current.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          ref.current.close();
        }
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="close" onClick={() => ref.current?.close()} aria-label="Close dialog">
          ×
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
