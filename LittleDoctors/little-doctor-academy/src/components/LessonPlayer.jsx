import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, X } from "lucide-react";

export default function LessonPlayer({ lesson, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);
  const isQuiz = step >= lesson.steps.length;
  const correct = answer === lesson.quiz.answer;
  const progress = useMemo(() => Math.min(100, Math.round((step / (lesson.steps.length + 1)) * 100)), [step, lesson]);

  const next = () => {
    if (step < lesson.steps.length) setStep(step + 1);
  };

  const submit = () => {
    if (!answer) return;
    if (correct) {
      setFinished(true);
      onComplete(lesson);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div className="lesson-player">
        <div className="player-top">
          <button className="icon-button" onClick={onClose} aria-label="Close lesson"><X /></button>
          <div className="player-progress"><span style={{ width: `${progress}%` }} /></div>
          <span>{Math.min(step + 1, lesson.steps.length + 1)} / {lesson.steps.length + 1}</span>
        </div>

        {!isQuiz ? (
          <div className="player-body">
            <div className="activity-stage">
              <div className="patient-avatar">👧🏻</div>
              <div className="tool-float">{lesson.icon}</div>
              <div className="pulse-ring" />
            </div>
            <span className="eyebrow">Guided step {step + 1}</span>
            <h2>{lesson.steps[step]}</h2>
            <p>Listen to the guide, observe the patient, and choose the caring action.</p>
            <div className="player-actions">
              <button className="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={17} /> Back</button>
              <button className="primary" onClick={next}>I did it <ArrowRight size={17} /></button>
            </div>
          </div>
        ) : (
          <div className="player-body quiz-body">
            {!finished ? (
              <>
                <div className="lesson-icon large">{lesson.icon}</div>
                <span className="eyebrow">Knowledge check</span>
                <h2>{lesson.quiz.question}</h2>
                <div className="answer-list">
                  {lesson.quiz.options.map(option => (
                    <button key={option} className={answer === option ? "answer selected" : "answer"} onClick={() => setAnswer(option)}>{option}</button>
                  ))}
                </div>
                {answer && !correct && <p className="gentle-error">Good try. Think about the tool used in this lesson.</p>}
                <button className="primary" disabled={!answer} onClick={submit}>Check answer</button>
              </>
            ) : (
              <div className="finish-card">
                <CheckCircle2 size={62} />
                <h2>Mission complete!</h2>
                <p>You helped the patient and earned 25 stars.</p>
                <div className="reward-badge">⭐ +25</div>
                <button className="primary" onClick={onClose}>Return to academy</button>
                <button className="text-button" onClick={() => { setStep(0); setAnswer(""); setFinished(false); }}><RotateCcw size={16} /> Play again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
