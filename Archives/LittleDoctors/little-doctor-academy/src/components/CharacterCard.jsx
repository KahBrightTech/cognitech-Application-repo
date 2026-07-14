export default function CharacterCard({ character, onSelect }) {
  return (
    <button className={`character-card ${character.color || ""}`} onClick={() => onSelect(character)}>
      <img className="character-image" src={character.image} alt={character.name} />
      <span className="character-copy">
        <strong>{character.name}</strong>
        <small>{character.role || `Age ${character.age}`}</small>
      </span>
    </button>
  );
}
