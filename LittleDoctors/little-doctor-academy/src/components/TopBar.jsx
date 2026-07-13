import { HeartPulse, Star, UserRound } from "lucide-react";

export default function TopBar({ stars, childName, onNavigate }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate("home")} aria-label="Go home">
        <span className="brand-mark"><HeartPulse size={24} /></span>
        <span>Little Doctor Academy</span>
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        <button onClick={() => onNavigate("learn")}>Learn</button>
        <button onClick={() => onNavigate("characters")}>Characters</button>
        <button onClick={() => onNavigate("parent")}>Parent dashboard</button>
      </nav>

      <div className="profile-chip">
        <Star size={18} fill="currentColor" />
        <strong>{stars}</strong>
        <span className="profile-divider" />
        <UserRound size={18} />
        <span>{childName}</span>
      </div>
    </header>
  );
}
