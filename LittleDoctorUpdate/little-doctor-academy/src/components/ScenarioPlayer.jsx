import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Pill, Stethoscope, UserRound, X } from "lucide-react";

const roleIcons = {
  nurse: <UserRound size={23} />,
  doctor: <Stethoscope size={23} />,
  pharmacist: <Pill size={23} />
};

export default function ScenarioPlayer({ scenario, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const scene = scenario.scenes[step];
  const progress = useMemo(() => Math.round(((step + 1) / scenario.scenes.length) * 100), [step, scenario]);

  const choose = (option) => {
    setChoice(option.label);
    setFeedback(option.feedback);
  };

  const next = () => {
    if (!choice) return;
    if (step === scenario.scenes.length - 1) {
      setFinished(true);
      onComplete(scenario);
      return;
    }
    setStep(step + 1);
    setChoice("");
    setFeedback("");
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={scenario.title}>
      <div className="lesson-player scenario-player">
        <div className="player-top">
          <button className="icon-button" onClick={onClose} aria-label="Close scenario"><X /></button>
          <div className="player-progress"><span style={{ width: `${finished ? 100 : progress}%` }} /></div>
          <span>{finished ? scenario.scenes.length : step + 1} / {scenario.scenes.length}</span>
        </div>

        {!finished ? (
          <div className="player-body">
            <div className="scenario-stage">
              <img src={scene.characterImage} alt={scene.characterName} />
              <div className="scenario-role-badge">{roleIcons[scene.role]} {scene.characterName}</div>
              <div className="patient-mini-card">
                <img src={scenario.patient.image} alt={scenario.patient.name} />
                <div><strong>{scenario.patient.name}</strong><span>{scenario.patient.symptom}</span></div>
              </div>
            </div>
            <span className="eyebrow">{scene.location}</span>
            <h2>{scene.title}</h2>
            <p>{scene.prompt}</p>
            <div className="answer-list scenario-options">
              {scene.options.map(option => (
                <button key={option.label} className={choice === option.label ? "answer selected" : "answer"} onClick={() => choose(option)}>
                  {option.label}
                </button>
              ))}
            </div>
            {feedback && <p className="scenario-feedback">{feedback}</p>}
            <div className="player-actions">
              <button className="secondary" onClick={() => { setStep(Math.max(0, step - 1)); setChoice(""); setFeedback(""); }} disabled={step === 0}><ArrowLeft size={17} /> Back</button>
              <button className="primary" onClick={next} disabled={!choice}>{step === scenario.scenes.length - 1 ? "Finish visit" : "Continue"} <ArrowRight size={17} /></button>
            </div>
          </div>
        ) : (
          <div className="player-body finish-card">
            <CheckCircle2 size={66} />
            <h2>Patient visit complete!</h2>
            <p>You helped the nurse gather information, supported the doctor’s diagnosis, and learned how the pharmacist explains medicine safely.</p>
            <div className="reward-badge">⭐ +40 Hospital Helper stars</div>
            <button className="primary" onClick={onClose}>Return to academy</button>
          </div>
        )}
      </div>
    </div>
  );
}
