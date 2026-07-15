import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Percent } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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

export default function StatCard({ id, label, value, change, unit, trend }) {
  const Icon = ICONS[id] ?? DollarSign;
  const isPositive = change >= 0;
  const gradientId = `spark-${id}`;

  return (
    <div className="panel panel-hover group relative overflow-hidden p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent-glow transition-colors group-hover:bg-accent/20">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>

      <p className="mt-4 text-[28px] font-extrabold leading-none tracking-tight text-white tabular-nums">
        {formatValue(value, unit)}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
              isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
          <span className="font-normal text-slate-500">vs last period</span>
        </div>

        {trend && trend.length > 1 && (
          <div className="h-8 w-16 shrink-0 opacity-80 transition-opacity group-hover:opacity-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? '#34d399' : '#fb7185'}
                      stopOpacity={0.4}
                    />
                    <stop offset="100%" stopColor={isPositive ? '#34d399' : '#fb7185'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#34d399' : '#fb7185'}
                  strokeWidth={1.75}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
