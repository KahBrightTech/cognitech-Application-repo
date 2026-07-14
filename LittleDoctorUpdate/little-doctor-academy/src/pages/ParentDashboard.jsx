import ProgressRing from "../components/ProgressRing";
import { ShieldCheck, Clock3, BookOpenCheck } from "lucide-react";

export default function ParentDashboard({ completedLessons, totalLessons, stars }) {
  const progress = Math.round((completedLessons.length / totalLessons) * 100);
  return (
    <main className="page-shell">
      <section className="page-title">
        <span className="eyebrow">Grown-up area</span>
        <h1>Parent dashboard</h1>
        <p>Review progress, learning time, completed activities, and safety settings.</p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card overview-card">
          <ProgressRing value={progress} />
          <div>
            <span className="eyebrow">Learning progress</span>
            <h2>{completedLessons.length} of {totalLessons} missions completed</h2>
            <p>Your young doctor is building confidence through short, positive learning activities.</p>
          </div>
        </article>

        <article className="dashboard-card stat-card">
          <Clock3 />
          <strong>{completedLessons.length * 5} min</strong>
          <span>Estimated learning time</span>
        </article>
        <article className="dashboard-card stat-card">
          <BookOpenCheck />
          <strong>{completedLessons.length}</strong>
          <span>Completed missions</span>
        </article>
        <article className="dashboard-card stat-card">
          <span className="big-icon">⭐</span>
          <strong>{stars}</strong>
          <span>Stars earned</span>
        </article>
      </section>

      <section className="dashboard-card safety-panel">
        <ShieldCheck size={32} />
        <div>
          <h2>Safety by design</h2>
          <p>No public chat, no targeted advertising, no precise location tracking, and no medical diagnosis. Parent controls should protect purchases, profile changes, and external links.</p>
        </div>
      </section>
    </main>
  );
}
