import { Clock3, Play } from "lucide-react";

export default function LessonCard({ lesson, onStart }) {
  return (
    <article className="lesson-card">
      <div className="lesson-icon">{lesson.icon}</div>
      <div className="lesson-content">
        <div className="lesson-meta"><Clock3 size={15} /> {lesson.minutes} min</div>
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
        {lesson.system && <span className="lesson-system">{lesson.system}</span>}
        <button className="primary small" onClick={() => onStart(lesson)}>
          <Play size={16} fill="currentColor" /> Start lesson
        </button>
      </div>
    </article>
  );
}
