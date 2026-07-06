const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check (used by Docker HEALTHCHECK + Kubernetes probes)
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ---------------------------------------------------------------------------
// Helpers to generate deterministic-ish mock analytics data
// ---------------------------------------------------------------------------
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildSeries(days, base, variance, seed) {
  const rand = seededRandom(seed);
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const value = Math.round(base + rand() * variance - variance / 2 + i * (variance / days));
    out.push({
      date: d.toISOString().slice(0, 10),
      value: Math.max(0, value)
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Top-level summary stats for the stat cards
// ---------------------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  res.json({
    revenue: { label: 'Total Revenue', value: 128430, change: 12.4, unit: 'currency' },
    users: { label: 'Active Users', value: 8921, change: 6.8, unit: 'number' },
    orders: { label: 'Orders', value: 1542, change: -2.1, unit: 'number' },
    conversion: { label: 'Conversion Rate', value: 3.42, change: 0.6, unit: 'percent' }
  });
});

// ---------------------------------------------------------------------------
// Time-series chart data
// ---------------------------------------------------------------------------
app.get('/api/chart-data', (req, res) => {
  const range = parseInt(req.query.days, 10) || 30;
  res.json({
    revenue: buildSeries(range, 3200, 1400, 17),
    users: buildSeries(range, 260, 120, 42),
    orders: buildSeries(range, 48, 30, 91)
  });
});

// ---------------------------------------------------------------------------
// Traffic breakdown by channel (for the donut chart)
// ---------------------------------------------------------------------------
app.get('/api/traffic', (req, res) => {
  res.json([
    { channel: 'Organic Search', value: 42 },
    { channel: 'Direct', value: 23 },
    { channel: 'Social', value: 18 },
    { channel: 'Referral', value: 11 },
    { channel: 'Email', value: 6 }
  ]);
});

// ---------------------------------------------------------------------------
// Recent activity feed
// ---------------------------------------------------------------------------
app.get('/api/activity', (req, res) => {
  const activities = [
    { id: 1, user: 'Ava Chen', action: 'upgraded to Pro plan', time: '2m ago', type: 'success' },
    { id: 2, user: 'Marcus Lee', action: 'submitted a support ticket', time: '14m ago', type: 'warning' },
    { id: 3, user: 'Priya Patel', action: 'completed onboarding', time: '38m ago', type: 'success' },
    { id: 4, user: 'System', action: 'nightly backup completed', time: '1h ago', type: 'info' },
    { id: 5, user: 'Diego Ramirez', action: 'payment failed', time: '2h ago', type: 'error' },
    { id: 6, user: 'Sophie Turner', action: 'invited 3 teammates', time: '5h ago', type: 'info' }
  ];
  res.json(activities);
});

app.listen(PORT, () => {
  console.log(`PulseBoard backend listening on port ${PORT}`);
});
