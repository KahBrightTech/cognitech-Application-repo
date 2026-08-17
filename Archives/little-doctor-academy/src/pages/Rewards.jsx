import { Star } from "lucide-react";

const BADGE_THRESHOLDS = { kind: 1, listener: 5, helper: 10, pharmacy: 15 };

export default function Rewards({ badges, completedLessons, stars }) {
  const completedCount = completedLessons.length;
  return (
    <main className="page-shell">
      <section className="page-title">
        <span className="eyebrow">Rewards</span>
        <h1>Stars &amp; badges</h1>
        <p>Every completed scenario earns stars. Badges unlock automatically as your young doctor keeps learning.</p>
      </section>

      <section className="dashboard-card overview-card">
        <span className="big-icon"><Star size={30} fill="currentColor" /></span>
        <div>
          <span className="eyebrow">Total points</span>
          <h2>{stars} stars earned</h2>
          <p>{completedCount} scenarios completed so far.</p>
        </div>
      </section>

      <div className="badge-grid">
        {badges.map(b => {
          const need = BADGE_THRESHOLDS[b.id] ?? 0;
          const earned = completedCount >= need;
          return (
            <article key={b.id} className={`badge-card${earned ? " earned" : ""}`}>
              <span className="badge-card-icon">{b.icon}</span>
              <strong>{b.label}</strong>
              <small>{earned ? "Earned!" : `Complete ${need} scenario${need === 1 ? "" : "s"}`}</small>
            </article>
          );
        })}
      </div>
    </main>
  );
}
