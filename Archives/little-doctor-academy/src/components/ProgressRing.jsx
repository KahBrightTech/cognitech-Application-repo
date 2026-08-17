export default function ProgressRing({ value = 0 }) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-ring" style={{ "--progress": `${bounded * 3.6}deg` }}>
      <div><strong>{bounded}%</strong><span>complete</span></div>
    </div>
  );
}
