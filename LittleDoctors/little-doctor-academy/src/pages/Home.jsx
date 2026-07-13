import { ArrowRight, ShieldCheck, Volume2 } from "lucide-react";
import CharacterCard from "../components/CharacterCard";
import LessonCard from "../components/LessonCard";

export default function Home({ doctors, lessons, onNavigate, onSelectCharacter, onStartLesson }) {
  return (
    <main>
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
          <div className="doctor-portrait">👩🏽‍⚕️</div>
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

      <section className="section">
        <div className="section-heading"><div><span className="eyebrow">Your care team</span><h2>Meet friendly medical guides</h2></div></div>
        <div className="character-grid">
          {doctors.map(character => <CharacterCard key={character.id} character={character} onSelect={onSelectCharacter} />)}
        </div>
      </section>
    </main>
  );
}
