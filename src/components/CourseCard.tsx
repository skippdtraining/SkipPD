import type { Course } from "@/lib/types";
import { initials } from "@/lib/filter-courses";
import CourseIllustration from "./CourseIllustration";

interface Props {
  course: Course;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}

export default function CourseCard({ course: c, saved, onOpen, onToggleSave }: Props) {
  return (
    <article className="course">
      <div
        className="cover"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label={`View ${c.title}`}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
      >
        {c.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads; switch to next/image with Supabase Storage in Step 4
          <img src={c.image} alt={c.title} />
        ) : (
          <CourseIllustration type={c.type} color={c.color} accent={c.accent} />
        )}
        <span className="badge">◷ {c.format}</span>
        <button
          className={`bookmark ${saved ? "on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={`${saved ? "Unsave" : "Save"} ${c.title}`}
          aria-pressed={saved}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="body">
        <div className="category">{c.category}</div>
        <h3>
          <button onClick={onOpen}>{c.title}</button>
        </h3>
        <div className="trainer">
          <span className="avatar">{initials(c.trainer)}</span>
          {c.trainer}
        </div>
        <div className="meta">
          <span>◷ {c.hours} hours</span>
          <span>▤ {c.grades.length === 3 ? "All grades" : c.grades.join(", ")}</span>
        </div>
        <div className="tags">
          {c.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <div className="card-footer">
          <div className="price">
            <strong>${c.price}</strong> <small>/ person</small>
          </div>
          <button className="details" onClick={onOpen}>
            View course ↗
          </button>
        </div>
      </div>
    </article>
  );
}
