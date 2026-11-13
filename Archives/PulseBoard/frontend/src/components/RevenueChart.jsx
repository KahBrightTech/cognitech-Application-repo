import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 }
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white tabular-nums">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function RevenueChart({ data, range, onRangeChange, loading }) {
  return (
    <div className="panel panel-hover p-6 animate-fade-up">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Revenue Trend</h3>
            <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
          <p className="text-sm text-slate-500">Daily revenue over the selected period</p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => onRangeChange?.(r.days)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                range === r.days
                  ? 'bg-accent/20 text-accent-glow'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#242836" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#818cf8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#818cf8"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              activeDot={{ r: 4, fill: '#818cf8', stroke: '#0f1117', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
