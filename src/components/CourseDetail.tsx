import type { Course } from "@/lib/types";

interface Props {
  course: Course;
  onRequest: () => void;
}

export default function CourseDetail({ course: c, onRequest }: Props) {
  return (
    <>
      <div className="category">
        {c.category} · {c.format}
      </div>
      <h3 style={{ marginTop: 10 }}>{c.title}</h3>
      <div className="trainer">
        <span className="avatar">{c.trainer[0]}</span>
        <strong>{c.trainer}</strong>
      </div>
      <p style={{ fontSize: 12 }}>{c.role}</p>
      <p>{c.description}</p>
      <h4>What you’ll take away</h4>
      <ul>
        {c.outcomes.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <div className="notice">
        {c.hours} hours · {c.grades.join(", ")} · ${c.price} per person
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
