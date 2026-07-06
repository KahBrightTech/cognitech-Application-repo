import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Percent } from 'lucide-react';

const ICONS = {
  revenue: DollarSign,
  users: Users,
  orders: ShoppingBag,
  conversion: Percent
};

function formatValue(value, unit) {
  if (unit === 'currency') {
    return `$${value.toLocaleString()}`;
  }
  if (unit === 'percent') {
    return `${value}%`;
  }
  return value.toLocaleString();
}

export default function StatCard({ id, label, value, change, unit }) {
  const Icon = ICONS[id] ?? DollarSign;
  const isPositive = change >= 0;

  return (
    <div className="group rounded-2xl border border-surface-border bg-surface-panel/80 p-5 transition-all hover:border-accent/40 hover:shadow-glow">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent-glow group-hover:bg-accent/20 transition-colors">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
        {formatValue(value, unit)}
      </p>

      <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
        <span
          className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
            isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
          }`}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </span>
        <span className="text-slate-500 font-normal">vs last period</span>
      </div>
    </div>
  );
}
