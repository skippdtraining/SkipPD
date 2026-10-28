"use client";

import { useMemo, useRef, useState } from "react";
import { filterCourses } from "@/lib/filter-courses";
import { toggleSaved, useSaved } from "@/lib/saved-store";
import { CATEGORIES, DEFAULT_FILTERS, FORMATS, GRADES, type CatalogFilters, type Course } from "@/lib/types";
import BookingForm from "./BookingForm";
import CourseCard from "./CourseCard";
import CourseDetail from "./CourseDetail";
import CourseIllustration from "./CourseIllustration";
import ListingForm from "./ListingForm";
import Modal from "./Modal";

type Dialog =
  | { kind: "detail"; course: Course }
  | { kind: "booking"; course: Course }
  | { kind: "listing" }
  | { kind: "requests" }
  | null;

const DIALOG_TITLES = {
  detail: "Explore this training",
  booking: "Request training",
  listing: "Share your expertise",
  requests: "My booking requests",
} as const;

export default function HomeClient({ courses }: { courses: Course[] }) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const saved = useSaved();

  const list = useMemo(() => filterCourses(courses, filters, saved), [courses, filters, saved]);
  const update = (patch: Partial<CatalogFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const scrollToCatalog = () => titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  function showToast(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  function quickSearch(query: string) {
    setFilters({ ...DEFAULT_FILTERS, query });
    scrollToCatalog();
  }

  const heroCourse = courses.find((c) => c.type === "classroom") ?? courses[0];

  return (
    <>
      <header>
        <a className="brand" href="./" aria-label="SkipPD home">
          <span className="logo">✧</span>Skip<b>PD</b>
          <span className="demo">Preview</span>
        </a>
        <nav>
          <button
            className={filters.savedOnly ? "" : "nav-active"}
            onClick={() => {
              update({ savedOnly: false });
              scrollToCatalog();
            }}
          >
            Explore training
          </button>
          <button
            className={filters.savedOnly ? "nav-active" : ""}
            onClick={() => {
              update({ savedOnly: true });
              scrollToCatalog();
            }}
          >
            Saved <span className="saved-count">{saved.length}</span>
          </button>
          <button onClick={() => setDialog({ kind: "requests" })}>My requests</button>
          <button className="btn small" onClick={() => setDialog({ kind: "listing" })}>
            + List your training
          </button>
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">By educators. For educators.</div>
          <h1>
            Great teachers never
            <br />
            stop <span>learning.</span>
          </h1>
          <p>Find professional development from people who know the classroom. Your next great idea starts here.</p>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              scrollToCatalog();
            }}
          >
            <span aria-hidden="true">⌕</span>
            <input
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="What would you like to learn?"
              aria-label="Search training, trainer, or keyword"
            />
            <button className="btn" type="submit">
              Search
            </button>
          </form>
          <div className="popular">
            Popular: <button onClick={() => quickSearch("Literacy")}>Literacy</button>
            <button onClick={() => quickSearch("AI")}>AI in education</button>
            <button onClick={() => quickSearch("ESL")}>ESL & ELL</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-back" />
          <div className="art-card">
            <div className="art-scene">{heroCourse && <CourseIllustration {...heroCourse} />}</div>
            <h3>Small ideas. Big classroom impact.</h3>
            <small>Real educators. Practical learning.</small>
          </div>
          <div className="float-label top">
            <strong>✦ Learn from experience</strong>
            <span>Classroom expertise, shared.</span>
          </div>
          <div className="float-label bottom">
            <strong className="green">✓ Made for your next PD day</strong>
            <span>One teacher or your whole team.</span>
          </div>
        </div>
      </section>

      <div className="trust">
        <span>
          <i>◇</i> Teacher-led expertise
        </span>
        <span>
          <i>◷</i> Live online or in person
        </span>
        <span>
          <i>◎</i> Individual & school bookings
        </span>
        <span>
          <i>↗</i> Practical classroom strategies
        </span>
      </div>

      <main className="main">
        <div className="title-row">
          <div>
            <h2 ref={titleRef}>{filters.savedOnly ? "Your saved training" : "Find your next lightbulb moment"}</h2>
            <p>Explore workshops, courses, and coaching for every stage of your teaching journey.</p>
          </div>
        </div>

        <div className="chips">
          {(["All topics", ...CATEGORIES] as const).map((x) => (
            <button
              key={x}
              className={`chip ${x === filters.category ? "active" : ""}`}
              onClick={() => update({ category: x })}
            >
              {x}
            </button>
          ))}
        </div>

        <div className="catalog">
          <aside className="filters">
            <h3>
              Filters{" "}
              <button onClick={() => setFilters((f) => ({ ...DEFAULT_FILTERS, savedOnly: f.savedOnly }))}>
                Clear all
              </button>
            </h3>
            <div className="filter-group">
              <h4>Learning format</h4>
              {FORMATS.map((fmt) => (
                <label key={fmt} className="check">
                  <input
                    type="checkbox"
                    checked={filters.formats.includes(fmt)}
                    onChange={(e) =>
                      update({
                        formats: e.target.checked
                          ? [...filters.formats, fmt]
                          : filters.formats.filter((x) => x !== fmt),
                      })
                    }
                  />
                  {fmt}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Grade level</h4>
              <select
                aria-label="Grade level"
                value={filters.grade}
                onChange={(e) => update({ grade: e.target.value as CatalogFilters["grade"] })}
              >
                <option value="">All grades</option>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <h4>Duration</h4>
              <select
                aria-label="Course duration"
                value={filters.duration}
                onChange={(e) => update({ duration: e.target.value as CatalogFilters["duration"] })}
              >
                <option value="">Any duration</option>
                <option value="short">Up to 2 hours</option>
                <option value="long">More than 2 hours</option>
              </select>
            </div>
            <div className="filter-group">
              <h4>Price</h4>
              <select
                aria-label="Maximum price"
                value={filters.maxPrice ?? ""}
                onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Any price</option>
                <option value="75">Under $75</option>
                <option value="150">Under $150</option>
                <option value="300">Under $300</option>
              </select>
            </div>
            <div className="filter-note">
              <b>Planning a school PD day?</b>Open a course to request a team session and discuss your needs.
            </div>
          </aside>

          <section>
            <div className="catalog-top">
              <span>
                {list.length} training {list.length === 1 ? "opportunity" : "opportunities"}
                {filters.savedOnly ? " saved" : ""}
              </span>
              <label>
                Sort by{" "}
                <select
                  aria-label="Sort courses"
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as CatalogFilters["sort"] })}
                >
                  <option value="recommended">Recommended</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="duration">Duration</option>
                </select>
              </label>
            </div>
            <div className="grid">
              {list.length ? (
                list.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    saved={saved.includes(c.id)}
                    onOpen={() => setDialog({ kind: "detail", course: c })}
                    onToggleSave={() => toggleSaved(c.id)}
                  />
                ))
              ) : (
                <div className="empty">
                  No training matches your selection.
                  <br />
                  <br />
                  <button className="btn light small" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="bottom-banner">
          <div>
            <div className="eyebrow" style={{ marginBottom: 9 }}>
              Your experience has value
            </div>
            <h2>Good at what you do? Share it.</h2>
            <p>Turn your classroom expertise into meaningful learning for other educators.</p>
          </div>
          <button className="btn" onClick={() => setDialog({ kind: "listing" })}>
            Become a PD trainer ↗
          </button>
        </section>
      </main>

      <footer>
        <span className="brand" style={{ fontSize: 19 }}>
          Skip<b>PD</b>
        </span>
        <span>A place for educators to grow, together.</span>
        <span>Preview · Sample listings</span>
      </footer>

      {dialog && (
        // key forces a fresh <dialog> when switching from detail to booking
        <Modal key={dialog.kind} title={DIALOG_TITLES[dialog.kind]} onClose={() => setDialog(null)}>
          {dialog.kind === "detail" && (
            <CourseDetail course={dialog.course} onRequest={() => setDialog({ kind: "booking", course: dialog.course })} />
          )}
          {dialog.kind === "booking" && (
            <BookingForm
              course={dialog.course}
              onSubmitted={() => {
                setDialog(null);
                showToast("Thanks! Sending requests to trainers is coming soon.");
              }}
            />
          )}
          {dialog.kind === "listing" && (
            <ListingForm
              onSubmitted={() => {
                setDialog(null);
                showToast("Thanks! Publishing listings is coming soon.");
              }}
              onError={showToast}
            />
          )}
          {dialog.kind === "requests" && (
            <>
              <div className="notice">Booking requests will appear here once accounts are available.</div>
              <p>No requests yet. Explore a course and request a session to start planning your PD.</p>
            </>
          )}
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
