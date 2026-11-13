import { Bell, Search, ChevronDown, Menu } from 'lucide-react';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

export default function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-surface-border/60 bg-surface/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden rounded-lg border border-surface-border p-2 text-slate-300">
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Overview</h1>
            <p className="text-sm text-slate-500">{TODAY} &middot; here's what's happening today</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-surface-border bg-surface-panel/80 px-3 py-2 text-sm text-slate-400 transition-colors focus-within:border-accent/50 focus-within:bg-surface-panel">
            <Search className="h-4 w-4 shrink-0" />
            <input
              className="w-40 bg-transparent outline-none placeholder:text-slate-500"
              placeholder="Search..."
            />
            <kbd className="hidden lg:inline-block rounded-md border border-surface-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              ⌘K
            </kbd>
          </div>

          <button className="relative rounded-xl border border-surface-border bg-surface-panel/80 p-2.5 text-slate-300 transition-colors hover:border-white/10 hover:text-white">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-light ring-2 ring-surface-panel" />
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-panel/80 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-accent/40">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan-400 text-xs font-bold text-white">
              KB
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-200">Brigthain</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
