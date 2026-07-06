import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Customers', icon: Users },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Settings', icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-surface-border bg-surface-panel/60 backdrop-blur-xl px-5 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-glow">
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">PulseBoard</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent/15 text-accent-glow border border-accent/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {label}
          </a>
        ))}
      </nav>

      <div className="rounded-xl border border-surface-border bg-gradient-to-br from-accent/10 to-cyan-400/5 p-4">
        <p className="text-xs font-semibold text-slate-200">Running on EKS</p>
        <p className="mt-1 text-xs text-slate-400">
          This dashboard is containerized and ready to deploy to Amazon EKS.
        </p>
      </div>
    </aside>
  );
}
