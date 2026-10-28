"use client";

import { useState } from "react";
import { addRequest } from "@/lib/saved-store";
import type { Course } from "@/lib/types";

interface Props {
  course: Course;
  onSubmitted: () => void;
  onError: (message: string) => void;
}

/** Booking request form. Saves to this browser until Step 6 (booking requests stored in the database). */
export default function BookingForm({ course: c, onSubmitted, onError }: Props) {
  // Computed once on mount so the min date does not change between renders.
  const [today] = useState(() => new Date().toLocaleDateString("en-CA"));

  return (
    <>
      <strong>{c.title}</strong>
      <p style={{ fontSize: 12 }}>
        With {c.trainer} · ${c.price} / person
      </p>
      <div className="notice">
        Preview: this saves the request on this device only. The trainer is not contacted, no date is reserved and no payment is taken.
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const str = (k: string) => String(d.get(k) ?? "").trim();
          const ok = addRequest({
            id: Date.now(),
            courseId: c.id,
            course: c.title,
            trainer: c.trainer,
            name: str("name"),
            email: str("email"),
            audience: str("audience"),
            participants: Number(d.get("participants")) || 1,
            school: str("school"),
            date: str("date"),
            message: str("message"),
          });
          if (ok) onSubmitted();
          else onError("Browser storage is full. Remove some requests and try again.");
        }}
      >
        <div className="two">
          <label className="field">
            Your name
            <input name="name" required maxLength={90} />
          </label>
          <label className="field">
            Email
            <input type="email" name="email" required maxLength={150} />
          </label>
        </div>
        <div className="two">
          <label className="field">
            Booking for
            <select name="audience">
              <option>Myself</option>
              <option>School / district team</option>
              <option>Teacher group</option>
            </select>
          </label>
          <label className="field">
            Participants
            <input name="participants" type="number" min={1} max={10000} defaultValue={1} required />
          </label>
        </div>
        <div className="two">
          <label className="field">
            School / organization
            <input name="school" maxLength={150} />
          </label>
          <label className="field">
            Preferred session date
            <input type="date" name="date" min={today} required />
          </label>
        </div>
        <label className="field">
          What would you like to focus on?
          <textarea
            name="message"
            maxLength={2000}
            placeholder="Share your goals, grade levels, or team requirements."
          />
        </label>
        <button className="btn wide">Save booking request</button>
      </form>
    </>
  );
}
