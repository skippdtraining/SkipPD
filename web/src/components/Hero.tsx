/**
 * @fileoverview Landing section at the top of the home page: headline,
 * search box, "Popular" quick searches and decorative artwork. Also exports
 * the {@link TrustBar} strip shown right below it.
 */

import {POPULAR_SEARCHES} from '@/config/catalog';
import type {Course} from '@/lib/types';
import {CourseIllustration} from './CourseIllustration';

interface HeroProps {
  query: string;
  onQueryChange: (query: string) => void;
  /** Called on Enter / Search button; scrolls to the results. */
  onSearch: () => void;
  /** Called by the "Popular" shortcuts; resets filters and searches. */
  onQuickSearch: (query: string) => void;
  /** Course whose illustration decorates the artwork card. */
  artCourse?: Course;
}

/** Headline, search box and artwork. */
export function Hero({
  query,
  onQueryChange,
  onSearch,
  onQuickSearch,
  artCourse,
}: HeroProps) {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">By educators. For educators.</div>
        <h1>
          Great teachers never
          <br />
          stop <span>learning.</span>
        </h1>
        <p>
          Find professional development from people who know the classroom. Your next
          great idea starts here.
        </p>
        <form
          className="search"
          onSubmit={(event) => {
            // Stop the browser from reloading the page on submit.
            event.preventDefault();
            onSearch();
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
            }}
            placeholder="What would you like to learn?"
            aria-label="Search training, trainer, or keyword"
          />
          <button className="btn" type="submit">
            Search
          </button>
        </form>
        <div className="popular">
          Popular:{' '}
          {POPULAR_SEARCHES.map(({label, query: search}) => (
            <button
              key={label}
              onClick={() => {
                onQuickSearch(search);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Purely decorative, so hidden from screen readers. */}
      <div className="hero-art" aria-hidden="true">
        <div className="art-back" />
        <div className="art-card">
          <div className="art-scene">
            {artCourse && <CourseIllustration {...artCourse} />}
          </div>
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
  );
}

/** Selling points shown in the strip under the hero: [icon, text]. */
const TRUST_POINTS: Array<[string, string]> = [
  ['◇', 'Teacher-led expertise'],
  ['◷', 'Live online or in person'],
  ['◎', 'Individual & school bookings'],
  ['↗', 'Practical classroom strategies'],
];

/** Thin strip of selling points under the hero. */
export function TrustBar() {
  return (
    <div className="trust">
      {TRUST_POINTS.map(([icon, text]) => (
        <span key={text}>
          <i>{icon}</i> {text}
        </span>
      ))}
    </div>
  );
}
