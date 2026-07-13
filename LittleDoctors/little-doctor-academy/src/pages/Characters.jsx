import CharacterCard from "../components/CharacterCard";

export default function Characters({ doctors, patients, onSelectCharacter }) {
  return (
    <main className="page-shell">
      <section className="page-title">
        <span className="eyebrow">Character collection</span>
        <h1>Doctors, helpers, and patients</h1>
        <p>Every character has a role in the clinic and can appear in interactive stories.</p>
      </section>

      <section className="section compact">
        <h2>Medical team</h2>
        <div className="character-grid">
          {doctors.map(c => <CharacterCard key={c.id} character={c} onSelect={onSelectCharacter} />)}
        </div>
      </section>

      <section className="section compact">
        <h2>Patients</h2>
        <div className="character-grid">
          {patients.map(c => <CharacterCard key={c.id} character={c} onSelect={onSelectCharacter} />)}
        </div>
      </section>
    </main>
  );
}
