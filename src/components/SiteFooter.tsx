/**
 * @fileoverview Bottom of the home page: the "Become a PD trainer" banner
 * and the site footer.
 */

interface TrainerBannerProps {
  onListTraining: () => void;
}

/** Call-to-action banner inviting teachers to list a training. */
export function TrainerBanner({onListTraining}: TrainerBannerProps) {
  return (
    <section className="bottom-banner">
      <div>
        <div className="eyebrow banner-eyebrow">Your experience has value</div>
        <h2>Good at what you do? Share it.</h2>
        <p>Turn your classroom expertise into meaningful learning for other educators.</p>
      </div>
      <button className="btn" onClick={onListTraining}>
        Become a PD trainer ↗
      </button>
    </section>
  );
}

/** Page footer. */
export function SiteFooter() {
  return (
    <footer>
      <span className="brand footer-brand">
        Skip<b>PD</b>
      </span>
      <span>A place for educators to grow, together.</span>
      <span>Preview · Sample listings</span>
    </footer>
  );
}
