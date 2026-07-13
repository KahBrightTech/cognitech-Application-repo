export default function CharacterCard({ character, onSelect }) {
  return (
    <button className={`character-card ${character.color || ""}`} onClick={() => onSelect(character)}>
      <span className="character-emoji" aria-hidden="true">{character.emoji}</span>
      <span className="character-copy">
        <strong>{character.name}</strong>
        <small>{character.role || `Age ${character.age}`}</small>
      </span>
    </button>
  );
}
