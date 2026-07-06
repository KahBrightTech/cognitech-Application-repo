import { Bell, Search, ChevronDown } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400">Welcome back — here's what's happening today.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-surface-border bg-surface-panel px-3 py-2 text-sm text-slate-400 focus-within:border-accent/50">
          <Search className="h-4 w-4" />
          <input
            className="bg-transparent outline-none placeholder:text-slate-500 w-40"
            placeholder="Search..."
          />
        </div>

        <button className="relative rounded-xl border border-surface-border bg-surface-panel p-2.5 text-slate-300 hover:text-white transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-panel py-1.5 pl-1.5 pr-2.5 hover:border-accent/40 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
            KB
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-200">Brigthain</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
