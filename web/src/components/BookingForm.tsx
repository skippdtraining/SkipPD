/**
 * @fileoverview "Request training" form shown in a dialog after clicking
 * "Request a session" on a course.
 *
 * Currently saves the request in the browser (same as the POC). In Step 6 it
 * creates a booking in the database and emails the trainer; in Step 3 the
 * name / email fields are pre-filled from the logged-in account.
 */

'use client';

import {useState} from 'react';
import {addRequest} from '@/lib/browser-storage';
import {formatPrice} from '@/lib/format';
import {readNumber, readText} from '@/lib/form-helpers';
import type {BookingRequest, Course} from '@/lib/types';

interface BookingFormProps {
  course: Course;
  /** Called after the request was saved. */
  onSubmitted: () => void;
  /** Called with a user-facing message when saving failed. */
  onError: (message: string) => void;
}

/** Booking request form for one course. */
export function BookingForm({course, onSubmitted, onError}: BookingFormProps) {
  // Today's date as YYYY-MM-DD ("en-CA" locale uses that format), so the date
  // picker cannot select past days. Computed once so it is stable on re-render.
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const request: BookingRequest = {
      id: Date.now(),
      courseId: course.id,
      course: course.title,
      trainer: course.trainer,
      name: readText(data, 'name'),
      email: readText(data, 'email'),
      audience: readText(data, 'audience'),
      participants: readNumber(data, 'participants', 1),
      school: readText(data, 'school'),
      date: readText(data, 'date'),
      message: readText(data, 'message'),
    };
    if (addRequest(request)) {
      onSubmitted();
    } else {
      onError('Browser storage is full. Remove some requests and try again.');
    }
  }

  return (
    <>
      <strong>{course.title}</strong>
      <p className="small-text">
        With {course.trainer} · {formatPrice(course.price)} / person
      </p>
      <div className="notice">
        Preview: this saves the request on this device only. The trainer is not contacted,
        no date is reserved and no payment is taken.
      </div>

      {/* Field limits (maxLength, min, max) match the POC. */}
      <form onSubmit={handleSubmit}>
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
            <input
              name="participants"
              type="number"
              min={1}
              max={10000}
              defaultValue={1}
              required
            />
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
