import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { channel, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{channel}</p>
      <p className="text-sm font-semibold text-white">{value}%</p>
    </div>
  );
}

export default function TrafficDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="panel panel-hover p-6 animate-fade-up">
      <h3 className="text-base font-semibold text-white">Traffic Sources</h3>
      <p className="mb-4 text-sm text-slate-500">Where your visitors come from</p>

      <div className="flex items-center gap-5">
        <div className="relative h-[170px] w-[45%] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="channel"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold tabular-nums text-white">{total}%</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Total</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {data.map((item, index) => (
            <li
              key={item.channel}
              className="flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.channel}
              </span>
              <span className="font-semibold text-white tabular-nums">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
