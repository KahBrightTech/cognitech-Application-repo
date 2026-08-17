import { ArrowRight, Bell, ChevronRight, Gamepad2, Heart, Play, Star } from "lucide-react";
import CharacterCard from "../components/CharacterCard";
import ProgressRing from "../components/ProgressRing";

var BADGE_THRESHOLDS = { kind: 1, listener: 5, helper: 10, pharmacy: 15 };
var CARD_COLORS = ["lavender", "mint", "peach", "sky", "rose"];

export default function Home(props) {
  var doctors = props.doctors;
  var patients = props.patients;
  var lessons = props.lessons;
  var completedLessons = props.completedLessons;
  var badges = props.badges;
  var stars = props.stars;
  var childName = props.childName;
  var onNavigate = props.onNavigate;
  var onSelectCharacter = props.onSelectCharacter;
  var onStartLesson = props.onStartLesson;

  var completedCount = completedLessons.length;
  var totalCount = lessons.length;
  var notStarted = lessons.filter(function (l) { return completedLessons.indexOf(l.id) === -1; });
  var continueList = (notStarted.length ? notStarted : lessons).slice(0, 5);
  var nextMilestone = Math.max(100, Math.ceil((stars + 1) / 100) * 100);
  var earnedBadges = badges.filter(function (b) { return completedCount >= (BADGE_THRESHOLDS[b.id] || 0); });
  function patientFor(name) { return patients.find(function (p) { return p.name === name; }); }

  return (
    <main className="dashboard-page">
      <header className="dash-topline">
        <div>
          <h1>Welcome back, {childName}! 👋</h1>
          <p>Ready to learn and help today?</p>
        </div>
        <div className="dash-topline-actions">
          <span className="pill-stat"><Star size={17} fill="currentColor" /> {stars} <small>Points</small></span>
          <span className="pill-stat"><Heart size={17} fill="currentColor" /> {earnedBadges.length} <small>Hearts</small></span>
          <button className="icon-pill" aria-label="Notifications"><Bell size={18} /><em>{Math.min(notStarted.length, 9)}</em></button>
          <img className="dash-avatar" src="/assets/characters/01-dr-sam.webp" alt={childName} />
        </div>
      </header>

      <section className="dash-hero">
        <div className="dash-hero-copy">
          <h2>You're doing great!</h2>
          <p>Keep learning, keep helping, and become an amazing doctor!</p>
          <div className="hero-actions">
            <button className="primary" onClick={function () { onStartLesson(continueList[0]); }}><Play size={17} fill="currentColor" /> Continue Learning</button>
            <button className="secondary" onClick={function () { onNavigate("parent"); }}>View Progress</button>
          </div>
        </div>
        <div className="dash-hero-art">
          <span className="dash-hero-blob" aria-hidden="true" />
          <img src="/assets/characters/01-dr-sam.webp" alt="Dr. Sam, your Little Doctor Academy guide" />
        </div>
      </section>

      <section className="dash-section">
        <div className="section-heading">
          <h2>Continue Learning</h2>
          <button className="text-button" onClick={function () { onNavigate("learn"); }}>View all ({totalCount}) <ArrowRight size={16} /></button>
        </div>
        <div className="continue-row">
          {continueList.map(function (lesson, i) {
            var patient = patientFor(lesson.patient);
            var done = completedLessons.indexOf(lesson.id) !== -1;
            var step = (lesson.system || "").split("→")[0].trim() || ("Step " + (i + 1));
            var tint = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <button key={lesson.id} className={"continue-card continue-card-" + tint} onClick={function () { onStartLesson(lesson); }}>
                {patient ? <img src={patient.image} alt={patient.name} /> : null}
                <div className="continue-card-copy">
                  <strong>{lesson.title}</strong>
                  <small>{i + 1}. {step}</small>
                  <div className="mini-progress"><span style={{ width: done ? "100%" : "0%" }} /></div>
                </div>
                <span className="continue-card-go"><ChevronRight size={16} /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dash-stats-row">
        <article className="dash-card dash-card-lavender">
          <h3>Your Progress</h3>
          <div className="dash-progress-body">
            <ProgressRing value={Math.round((completedCount / totalCount) * 100)} />
            <ul className="progress-legend">
              <li><span className="dot done" /> Completed <b>{completedCount}</b></li>
              <li><span className="dot going" /> In Progress <b>{Math.min(3, totalCount - completedCount)}</b></li>
              <li><span className="dot todo" /> Not Started <b>{Math.max(0, totalCount - completedCount - Math.min(3, totalCount - completedCount))}</b></li>
            </ul>
          </div>
          <small className="dash-card-foot">of {totalCount} Scenarios</small>
        </article>

        <article className="dash-card dash-card-peach">
          <h3>Points &amp; Rewards</h3>
          <div className="points-total"><Star size={22} fill="currentColor" /> {stars}</div>
          <small>Total Points</small>
          <button className="text-button" onClick={function () { onNavigate("rewards"); }}>Next Reward <ArrowRight size={14} /></button>
          <div className="mini-progress big"><span style={{ width: Math.min(100, (stars / nextMilestone) * 100) + "%" }} /></div>
          <small className="dash-card-foot">{nextMilestone - stars} pts to go</small>
        </article>

        <article className="dash-card dash-card-sky">
          <div className="section-heading tight"><h3>Badges Earned</h3><button className="text-button" onClick={function () { onNavigate("rewards"); }}>View all</button></div>
          <div className="badge-row">
            {badges.map(function (b) {
              var earned = earnedBadges.indexOf(b) !== -1;
              return <span key={b.id} className={"badge-chip" + (earned ? "" : " locked")} title={b.label}>{b.icon}</span>;
            })}
          </div>
        </article>

        <article className="dash-card promo-card">
          <span className="promo-eyebrow">✨ Take a Quick Break</span>
          <strong>Medical Match Dash</strong>
          <p>Match the medical items and earn stars!</p>
          <button className="primary small" onClick={function () { onNavigate("game"); }}><Gamepad2 size={16} /> Play Game</button>
          <img src="/assets/characters/29-healthy-helper.webp" alt="" className="promo-art" />
        </article>
      </section>

      <section className="dash-section">
        <div className="section-heading">
          <h2>Meet the Team</h2>
          <button className="text-button" onClick={function () { onNavigate("characters"); }}>View all <ArrowRight size={16} /></button>
        </div>
        <div className="character-grid">
          {doctors.map(function (c) { return <CharacterCard key={c.id} character={c} onSelect={onSelectCharacter} />; })}
        </div>
      </section>
    </main>
  );
}
