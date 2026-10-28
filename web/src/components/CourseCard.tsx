/**
 * @fileoverview One course tile in the catalog grid: cover, title, trainer,
 * duration, grades, tags, price and a save (heart) button.
 */

import {formatPrice, gradeLabel, initials} from '@/lib/format';
import type {Course} from '@/lib/types';
import {CourseIllustration} from './CourseIllustration';

interface CourseCardProps {
  course: Course;
  /** Whether the heart is filled. */
  saved: boolean;
  /** Opens the course detail dialog. */
  onOpen: () => void;
  onToggleSave: () => void;
}

/** Catalog tile for a single course. */
export function CourseCard({course, saved, onOpen, onToggleSave}: CourseCardProps) {
  return (
    <article className="course">
      {/* The cover is clickable; role + tabIndex + Enter make it keyboard-accessible. */}
      <div
        className="cover"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label={`View ${course.title}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onOpen();
        }}
      >
        {course.image ? (
          // Plain <img>: the image is a data URL from the browser, which
          // next/image cannot optimise. Switch to next/image in Step 4.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.image} alt={course.title} />
        ) : (
          <CourseIllustration
            type={course.type}
            color={course.color}
            accent={course.accent}
          />
        )}
        <span className="badge">◷ {course.format}</span>
        <button
          className={`bookmark ${saved ? 'on' : ''}`}
          onClick={(event) => {
            // Stop the click from also opening the course via the cover.
            event.stopPropagation();
            onToggleSave();
          }}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${course.title}`}
          aria-pressed={saved}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <div className="body">
        <div className="category">{course.category}</div>
        <h3>
          <button onClick={onOpen}>{course.title}</button>
        </h3>
        <div className="trainer">
          <span className="avatar">{initials(course.trainer)}</span>
          {course.trainer}
        </div>
        <div className="meta">
          <span>◷ {course.hours} hours</span>
          <span>▤ {gradeLabel(course.grades)}</span>
        </div>
        <div className="tags">
          {course.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="card-footer">
          <div className="price">
            <strong>{formatPrice(course.price)}</strong> <small>/ person</small>
          </div>
          <button className="details" onClick={onOpen}>
            View course ↗
          </button>
        </div>
      </div>
    </article>
  );
}
