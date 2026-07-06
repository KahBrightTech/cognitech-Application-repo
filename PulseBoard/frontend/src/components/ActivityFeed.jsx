const DOT_COLOR = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  info: 'bg-sky-400'
};

export default function ActivityFeed({ items }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-panel/80 p-6">
      <h3 className="text-base font-semibold text-white mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[item.type] ?? 'bg-slate-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">
                <span className="font-semibold text-white">{item.user}</span> {item.action}
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
