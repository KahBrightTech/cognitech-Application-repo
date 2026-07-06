import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import StatCard from './components/StatCard.jsx';
import RevenueChart from './components/RevenueChart.jsx';
import TrafficDonut from './components/TrafficDonut.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import { api } from './api.js';

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="text-sm text-slate-400">Loading PulseBoard...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex h-screen items-center justify-center bg-surface px-6">
      <div className="max-w-sm rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6 text-center">
        <p className="text-sm font-semibold text-rose-400">Couldn't load dashboard data</p>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
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

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getStats(), api.getChartData(30), api.getTraffic(), api.getActivity()])
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
  }, []);

  if (error) return <ErrorScreen message={error} />;
  if (!stats || !chartData || !traffic || !activity) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

        <main className="px-4 pb-10 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(stats).map(([id, stat]) => (
              <StatCard key={id} id={id} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart data={chartData.revenue} />
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
