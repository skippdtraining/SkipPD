/**
 * @fileoverview Landing section at the top of the home page: headline,
 * search box and decorative artwork.
 */

import type {Course} from '@/lib/types';
import type {Ref} from 'react';
import {CourseIllustration} from './CourseIllustration';
import {SearchBox} from './SearchBox';

interface HeroProps {
  query: string;
  onQueryChange: (query: string) => void;
  /** Called on Enter / Search button; scrolls to the results. */
  onSearch: () => void;
  /** Attached to the search box so the page can tell when it is off-screen. */
  searchRef?: Ref<HTMLDivElement>;
  /** Course whose illustration decorates the artwork card. */
  artCourse?: Course;
}

/** Headline, search box and artwork. */
export function Hero({query, onQueryChange, onSearch, searchRef, artCourse}: HeroProps) {
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
        {/* Wrapper is watched by HomePage to know when to show the header search. */}
        <div ref={searchRef}>
          <SearchBox
            variant="hero"
            query={query}
            onQueryChange={onQueryChange}
            onSearch={onSearch}
          />
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
