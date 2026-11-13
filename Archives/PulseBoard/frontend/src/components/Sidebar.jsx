import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
  Zap,
  LifeBuoy
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Customers', icon: Users },
  { label: 'Orders', icon: ShoppingCart }
];

const NAV_FOOTER_ITEMS = [
  { label: 'Settings', icon: Settings },
  { label: 'Help & Support', icon: LifeBuoy }
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-surface-border bg-surface-panel/50 backdrop-blur-xl px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 mb-9">
        <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-glow">
          <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight text-white">PulseBoard</span>
          <span className="block text-[11px] font-medium text-slate-500">Analytics Suite</span>
        </div>
      </div>

      <p className="eyebrow px-3 mb-2">Workspace</p>
      <nav className="space-y-0.5 mb-6">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            aria-current={active ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              active
                ? 'bg-accent/12 text-white'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent-light" />
            )}
            <Icon
              className={`h-[18px] w-[18px] transition-colors ${
                active ? 'text-accent-glow' : 'text-slate-500 group-hover:text-slate-300'
              }`}
              strokeWidth={2}
            />
            {label}
          </a>
        ))}
      </nav>

      <p className="eyebrow px-3 mb-2">General</p>
      <nav className="flex-1 space-y-0.5">
        {NAV_FOOTER_ITEMS.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href="#"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.04] hover:text-slate-100"
          >
            <Icon className="h-[18px] w-[18px] text-slate-500 group-hover:text-slate-300" strokeWidth={2} />
            {label}
          </a>
        ))}
      </nav>

      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-gradient-to-br from-accent/12 via-surface-panel to-cyan-400/5 p-4">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
        <p className="relative text-xs font-semibold text-slate-100">Running on Amazon EKS</p>
        <p className="relative mt-1.5 text-xs leading-relaxed text-slate-400">
          Containerized front and back ends, deployed and autoscaled on Kubernetes.
        </p>
      </div>
    </aside>
  );
}
