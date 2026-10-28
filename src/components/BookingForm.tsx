"use client";

import { useState } from "react";
import type { Course } from "@/lib/types";

interface Props {
  course: Course;
  onSubmitted: () => void;
}

/** Booking request form. UI only until Step 6 (booking requests stored in the database). */
export default function BookingForm({ course: c, onSubmitted }: Props) {
  // Computed once on mount so the min date does not change between renders.
  const [today] = useState(() => new Date().toLocaleDateString("en-CA"));

  return (
    <>
      <strong>{c.title}</strong>
      <p style={{ fontSize: 12 }}>
        With {c.trainer} · ${c.price} / person
      </p>
      <div className="notice">
        Preview: requests are not sent yet. Booking requests arrive in a later release.
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitted();
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
        <button className="btn wide">Send booking request</button>
      </form>
    </>
  );
}
