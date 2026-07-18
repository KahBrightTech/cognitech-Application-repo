import { Award, Gamepad2, HeartPulse, HelpCircle, LayoutDashboard, LogOut, Settings, ShieldCheck, Stethoscope, Users, ChevronRight, BookOpen } from "lucide-react";

const NAV = [
  { key: "home", label: "Dashboard", icon: LayoutDashboard },
  { key: "learn", label: "My Learning", icon: BookOpen },
  { key: "scenarios", label: "All Scenarios", icon: Stethoscope },
  { key: "characters", label: "Characters", icon: Users },
  { key: "game", label: "Games", icon: Gamepad2 },
  { key: "rewards", label: "Rewards", icon: Award },
  { key: "parent", label: "Parents", icon: ShieldCheck },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "help", label: "Help & Safety", icon: HelpCircle },
];

export default function Sidebar({ page, onNavigate, childName, onLogout }) {
  return (
    <aside className="sidebar">
      <button className="sidebar-brand" onClick={() => onNavigate("home")}>
        <span className="sidebar-brand-mark"><HeartPulse size={22} /></span>
        <span className="sidebar-brand-copy"><strong>Little Doctor</strong><small>ACADEMY</small></span>
      </button>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button key={item.key} className={`sidebar-link${active ? " active" : ""}`} onClick={() => onNavigate(item.key)}>
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-user" onClick={() => onNavigate("parent")}>
        <img src="/assets/characters/01-dr-sam.webp" alt="" />
        <span className="sidebar-user-copy"><strong>{childName}</strong><small>Junior Doctor</small></span>
        <ChevronRight size={16} />
      </button>
      <button className="sidebar-logout" onClick={onLogout}><LogOut size={17} /> Log out</button>
    </aside>
  );
}
