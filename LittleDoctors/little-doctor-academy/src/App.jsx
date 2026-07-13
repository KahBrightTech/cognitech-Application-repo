import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Characters from "./pages/Characters";
import ParentDashboard from "./pages/ParentDashboard";
import LessonPlayer from "./components/LessonPlayer";
import CharacterModal from "./components/CharacterModal";
import { doctors, patients, lessons } from "./data/content";

export default function App() {
  const [page, setPage] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [stars, setStars] = useState(() => Number(localStorage.getItem("lda-stars") || 50));
  const [completedLessons, setCompletedLessons] = useState(() => JSON.parse(localStorage.getItem("lda-completed") || "[]"));

  useEffect(() => {
    localStorage.setItem("lda-stars", String(stars));
    localStorage.setItem("lda-completed", JSON.stringify(completedLessons));
  }, [stars, completedLessons]);

  const completeLesson = (lesson) => {
    if (!completedLessons.includes(lesson.id)) {
      setCompletedLessons([...completedLessons, lesson.id]);
      setStars(stars + 25);
    }
  };

  const navigate = (destination) => {
    setPage(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <TopBar stars={stars} childName="Ari" onNavigate={navigate} />
      {page === "home" && <Home doctors={doctors} lessons={lessons} onNavigate={navigate} onSelectCharacter={setSelectedCharacter} onStartLesson={setActiveLesson} />}
      {page === "learn" && <Learn lessons={lessons} onStartLesson={setActiveLesson} />}
      {page === "characters" && <Characters doctors={doctors} patients={patients} onSelectCharacter={setSelectedCharacter} />}
      {page === "parent" && <ParentDashboard completedLessons={completedLessons} totalLessons={lessons.length} stars={stars} />}

      <footer>
        <div><strong>Little Doctor Academy</strong><span>Educational play—not medical advice.</span></div>
        <span>Built for a safe, joyful learning experience.</span>
      </footer>

      {activeLesson && <LessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} onComplete={completeLesson} />}
      {selectedCharacter && <CharacterModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />}
    </div>
  );
}
