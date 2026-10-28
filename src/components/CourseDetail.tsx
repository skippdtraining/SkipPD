/**
 * @fileoverview Full description of one course, shown in a dialog when a
 * card is opened. Leads to the booking form.
 */

import {initials} from '@/lib/filter-courses';
import type {Course} from '@/lib/types';

interface CourseDetailProps {
  course: Course;
  /** Called by the "Request a session" button. */
  onRequest: () => void;
}

/** Course details: trainer, description, outcomes, price and a CTA. */
export function CourseDetail({course, onRequest}: CourseDetailProps) {
  return (
    <>
      <div className="category">
        {course.category} · {course.format}
      </div>
      <h3 className="detail-title">{course.title}</h3>
      <div className="trainer">
        <span className="avatar">{initials(course.trainer)}</span>
        <strong>{course.trainer}</strong>
      </div>
      <p className="small-text">{course.role}</p>
      <p>{course.description}</p>
      <h4>What you’ll take away</h4>
      <ul>
        {course.outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
      <div className="notice">
        {course.hours} hours · {course.grades.join(', ')} · ${course.price} per person
        <br />
        Dates and school group pricing agreed with the trainer.
        <br />
        PD credit eligibility must be confirmed with your school or district.
      </div>
      <button className="btn wide" onClick={onRequest}>
        Request a session →
      </button>
    </>
  );
}
