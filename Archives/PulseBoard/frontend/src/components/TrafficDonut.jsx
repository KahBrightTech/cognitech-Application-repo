import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { channel, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-panel px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{channel}</p>
      <p className="text-sm font-semibold text-white">{value}%</p>
    </div>
  );
}

export default function TrafficDonut({ data }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-panel/80 p-6">
      <h3 className="text-base font-semibold text-white">Traffic Sources</h3>
      <p className="text-sm text-slate-400 mb-2">Where your visitors come from</p>

      <div className="flex items-center gap-4">
        <ResponsiveContainer width="55%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="channel"
              innerRadius={55}
              outerRadius={80}
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

        <ul className="flex-1 space-y-2.5">
          {data.map((item, index) => (
            <li key={item.channel} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.channel}
              </span>
              <span className="font-semibold text-white">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
