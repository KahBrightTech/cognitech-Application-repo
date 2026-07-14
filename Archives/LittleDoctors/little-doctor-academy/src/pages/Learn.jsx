import LessonCard from "../components/LessonCard";

export default function Learn({ lessons, onStartLesson }) {
  return (
    <main className="page-shell">
      <section className="page-title">
        <span className="eyebrow">Learning library</span>
        <h1>Choose your next doctor mission</h1>
        <p>Each mission includes guided steps, an activity, and a short knowledge check.</p>
      </section>
      <div className="lesson-grid">
        {lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} onStart={onStartLesson} />)}
      </div>
    </main>
  );
}
