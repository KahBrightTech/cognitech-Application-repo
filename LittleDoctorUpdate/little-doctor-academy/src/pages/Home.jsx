import { ArrowRight, ShieldCheck, Volume2 } from "lucide-react";
import CharacterCard from "../components/CharacterCard";
import LessonCard from "../components/LessonCard";
import ScenarioCard from "../components/ScenarioCard";

export default function Home({ doctors, lessons, scenarios, onNavigate, onSelectCharacter, onStartLesson, onStartScenario }) {
  return (
    <main>
      <div className="build-banner">
        UPDATED HOSPITAL STORIES EDITION · Build 2026-07-14-v2
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A safe learning adventure for young doctors</span>
          <h1>Learn, play, and care for every patient.</h1>
          <p>Explore the human body, meet friendly patients, practice medical tools, and earn rewards through guided interactive sessions.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onStartLesson(lessons[0])}>
              Begin today’s mission <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => onNavigate("characters")}>Meet the team</button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={18} /> Kid-safe</span>
            <span><Volume2 size={18} /> Voice-friendly</span>
            <span>⭐ Positive rewards</span>
          </div>
        </div>
        <div className="hero-stage">
          <div className="hero-orbit orbit-one">🩺</div>
          <div className="hero-orbit orbit-two">🩹</div>
          <div className="hero-orbit orbit-three">🌡️</div>
          <img className="doctor-portrait-image" src="/assets/characters-hd/dr-mia.webp" alt="Dr. Mia" />
          <div className="speech-bubble">Welcome, Doctor! Ready to help a patient?</div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">Today’s choices</span><h2>Pick a learning mission</h2></div>
          <button className="text-button" onClick={() => onNavigate("learn")}>See all lessons <ArrowRight size={16} /></button>
        </div>
        <div className="lesson-grid">
          {lessons.slice(0, 3).map(lesson => <LessonCard key={lesson.id} lesson={lesson} onStart={onStartLesson} />)}
        </div>
      </section>


      <section className="section scenario-section">
        <div className="section-heading">
          <div><span className="eyebrow">New hospital stories</span><h2>Care for a patient from check-in to pharmacy</h2></div>
        </div>
        <p className="section-intro">Meet the nurse first, collect symptoms and vital signs, help the doctor choose a diagnosis, then visit the pharmacist to learn safe medicine instructions.</p>
        <div className="scenario-grid">
          {scenarios.map(scenario => <ScenarioCard key={scenario.id} scenario={scenario} onStart={onStartScenario} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><span className="eyebrow">Your care team</span><h2>Meet friendly medical guides</h2></div></div>
        <div className="character-grid">
          {doctors.map(character => <CharacterCard key={character.id} character={character} onSelect={onSelectCharacter} />)}
        </div>
      </section>
    </main>
  );
}
