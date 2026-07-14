import { X } from "lucide-react";
export default function CharacterModal({ character, onClose }) {
  if (!character) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="character-modal">
        <button className="icon-button modal-close" onClick={onClose}><X /></button>
        <div className={`character-detail-visual ${character.color || "lavender"}`}><img src={character.image} alt={character.name} /></div>
        <span className="eyebrow">{character.role || `Patient, age ${character.age}`}</span>
        <h2>{character.name}</h2>
        <p>{character.message || `${character.name} is visiting the clinic because of: ${character.symptom}.`}</p>
        <button className="primary" onClick={onClose}>Nice to meet you!</button>
      </div>
    </div>
  );
}
