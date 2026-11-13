import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const TYPE_META = {
  success: { icon: CheckCircle2, text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  warning: { icon: AlertTriangle, text: 'text-amber-400', bg: 'bg-amber-400/10' },
  error: { icon: XCircle, text: 'text-rose-400', bg: 'bg-rose-400/10' },
  info: { icon: Info, text: 'text-sky-400', bg: 'bg-sky-400/10' }
};

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ActivityFeed({ items }) {
  return (
    <div className="panel panel-hover p-6 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Recent Activity</h3>
        <a href="#" className="text-xs font-semibold text-accent-glow hover:text-accent-light">
          View all
        </a>
      </div>

      <ul className="divide-y divide-surface-border">
        {items.map((item) => {
          const meta = TYPE_META[item.type] ?? TYPE_META.info;
          const Icon = meta.icon;
          const isSystem = item.user === 'System';

          return (
            <li
              key={item.id}
              className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-white/[0.03] first:pt-0 last:pb-0"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isSystem
                    ? 'bg-white/[0.06] text-slate-300'
                    : 'bg-gradient-to-br from-accent/70 to-cyan-400/70 text-white'
                }`}
              >
                {initials(item.user)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">
                  <span className="font-semibold text-white">{item.user}</span>{' '}
                  <span className="text-slate-400">{item.action}</span>
                </p>
              </div>

              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${meta.text}`} strokeWidth={2} />
              </span>

              <span className="w-14 shrink-0 text-right text-xs text-slate-500">{item.time}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
