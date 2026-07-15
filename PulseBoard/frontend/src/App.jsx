import { useEffect, useState } from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import StatCard from './components/StatCard.jsx';
import RevenueChart from './components/RevenueChart.jsx';
import TrafficDonut from './components/TrafficDonut.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import { api } from './api.js';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-surface-border bg-surface-panel/50 p-6">
        <div className="skeleton mb-8 h-9 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="px-4 py-5 lg:px-8">
          <div className="skeleton mb-2 h-6 w-40" />
          <div className="skeleton h-4 w-64" />
        </div>
        <main className="px-4 pb-10 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="skeleton h-80 xl:col-span-2" />
            <div className="skeleton h-80" />
          </div>
          <div className="skeleton h-64" />
        </main>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex h-screen items-center justify-center bg-surface px-6">
      <div className="max-w-sm rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-400/10">
          <AlertOctagon className="h-5 w-5 text-rose-400" />
        </div>
        <p className="text-sm font-semibold text-white">Couldn't load dashboard data</p>
        <p className="mt-1.5 text-sm text-slate-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-panel px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-accent/40 hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(30);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    Promise.all([api.getStats(), api.getChartData(range), api.getTraffic(), api.getActivity()])
      .then(([statsRes, chartRes, trafficRes, activityRes]) => {
        if (cancelled) return;
        setStats(statsRes);
        setChartData(chartRes);
        setTraffic(trafficRes);
        setActivity(activityRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  function handleRangeChange(days) {
    if (days === range) return;
    setRange(days);
    setRangeLoading(true);
    api
      .getChartData(days)
      .then((res) => setChartData(res))
      .catch((err) => setError(err.message))
      .finally(() => setRangeLoading(false));
  }

  if (error) return <ErrorScreen message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (!stats || !chartData || !traffic || !activity) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

        <main className="px-4 pb-10 lg:px-8 space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(stats).map(([id, stat]) => (
              <StatCard key={id} id={id} {...stat} trend={chartData[id]} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart
                data={chartData.revenue}
                range={range}
                onRangeChange={handleRangeChange}
                loading={rangeLoading}
              />
            </div>
            <TrafficDonut data={traffic} />
          </div>

          <ActivityFeed items={activity} />
        </main>

        <footer className="px-4 pb-6 lg:px-8">
          <p className="text-center text-xs text-slate-600">
            PulseBoard &middot; containerized for Amazon EKS
          </p>
        </footer>
      </div>
    </div>
  );
}
