import LessonCard from "../components/LessonCard";
import ScenarioCard from "../components/ScenarioCard";

export default function Learn({ lessons, scenarios, onStartLesson, onStartScenario }) {
  return (
    <main className="page-shell">
      <section className="page-title">
        <span className="eyebrow">Learning library</span>
        <h1>Choose your next doctor mission</h1>
        <p>Each mission includes guided steps, an activity, and a short knowledge check.</p>
      </section>
      <section className="scenario-library">
        <h2>Interactive hospital stories</h2>
        <div className="scenario-grid">
          {scenarios.map(scenario => <ScenarioCard key={scenario.id} scenario={scenario} onStart={onStartScenario} />)}
        </div>
      </section>
      <section className="lesson-library">
        <h2>Skill lessons</h2>
        <div className="lesson-grid">
        {lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} onStart={onStartLesson} />)}
        </div>
      </section>
    </main>
  );
}
