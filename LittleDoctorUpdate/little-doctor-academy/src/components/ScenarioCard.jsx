import { ArrowRight, Clock3 } from "lucide-react";

export default function ScenarioCard({ scenario, onStart }) {
  return (
    <article className="scenario-card">
      <div className="scenario-card-images">
        <img src={scenario.patient.image} alt={scenario.patient.name} />
        <span>{scenario.icon}</span>
      </div>
      <div className="scenario-card-copy">
        <div className="lesson-meta"><Clock3 size={15} /> {scenario.minutes} min · Nurse → Doctor → Pharmacist</div>
        <h3>{scenario.title}</h3>
        <p>{scenario.description}</p>
        <div className="scenario-path"><span>1. Check-in</span><span>2. Diagnose</span><span>3. Pharmacy</span></div>
        <button className="primary small" onClick={() => onStart(scenario)}>Start hospital story <ArrowRight size={16} /></button>
      </div>
    </article>
  );
}
