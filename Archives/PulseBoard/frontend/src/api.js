const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  getStats: () => get('/stats'),
  getChartData: (days = 30) => get(`/chart-data?days=${days}`),
  getTraffic: () => get('/traffic'),
  getActivity: () => get('/activity')
};
