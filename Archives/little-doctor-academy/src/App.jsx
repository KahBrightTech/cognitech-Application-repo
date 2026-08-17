import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Characters from "./pages/Characters";
import Rewards from "./pages/Rewards";
import ParentDashboard from "./pages/ParentDashboard";
import Game from "./pages/Game";
import LoginScreen from "./components/LoginScreen";
import LessonPlayer from "./components/LessonPlayer";
import CharacterModal from "./components/CharacterModal";
import { doctors, patients, lessons, badges } from "./data/content";
import { getCurrentSession, signOut } from "./auth/cognito";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [page, setPage] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [stars, setStars] = useState(() => Number(localStorage.getItem("lda-stars") || 50));
  const [completedLessons, setCompletedLessons] = useState(() => JSON.parse(localStorage.getItem("lda-completed") || "[]"));

  useEffect(() => {
    localStorage.setItem("lda-stars", String(stars));
    localStorage.setItem("lda-completed", JSON.stringify(completedLessons));
  }, [stars, completedLessons]);

  // Restore a Cognito session (with automatic token refresh) on page load,
  // so a signed-in parent isn't bounced back to the login screen on reload.
  useEffect(() => {
    getCurrentSession()
      .then(setUser)
      .finally(function () { setCheckingSession(false); });
  }, []);

  function completeLesson(l) {
    if (!completedLessons.includes(l.id)) {
      setCompletedLessons([...completedLessons, l.id]);
      setStars(function (s) { return s + 25; });
    }
  }
  function navigate(d) { setPage(d); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (checkingSession) return null;
  if (!user) return <LoginScreen onLogin={setUser} />;

  const childName = user.name || "Ari";
  function onLogout() { signOut(); setUser(null); }
  function addStars(n) { setStars(function (s) { return s + n; }); }

  return (
    <div className="app app-shell">
      <Sidebar page={page} onNavigate={navigate} childName={childName} onLogout={onLogout} />
      <div className="app-main">
        {page === "home" && <Home doctors={doctors} patients={patients} lessons={lessons} completedLessons={completedLessons} badges={badges} stars={stars} childName={childName} onNavigate={navigate} onSelectCharacter={setSelectedCharacter} onStartLesson={setActiveLesson} />}
        {(page === "learn" || page === "scenarios") && <Learn lessons={lessons} onStartLesson={setActiveLesson} />}
        {page === "characters" && <Characters doctors={doctors} patients={patients} onSelectCharacter={setSelectedCharacter} />}
        {page === "game" && <Game onReward={addStars} />}
        {page === "rewards" && <Rewards badges={badges} completedLessons={completedLessons} stars={stars} />}
        {(page === "parent" || page === "settings" || page === "help") && <ParentDashboard completedLessons={completedLessons} totalLessons={lessons.length} stars={stars} />}
        <footer className="app-footer"><span>Little Doctor Academy - Educational play, not medical advice.</span></footer>
      </div>
      {activeLesson && <LessonPlayer lesson={activeLesson} onClose={function () { setActiveLesson(null); }} onComplete={completeLesson} />}
      {selectedCharacter && <CharacterModal character={selectedCharacter} onClose={function () { setSelectedCharacter(null); }} />}
    </div>
  );
}
