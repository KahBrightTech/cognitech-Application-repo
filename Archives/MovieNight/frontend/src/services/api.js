import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default {
  // Session management
  createSession: (hostName, preferences = {}) =>
    api.post('/api/sessions', { hostName, preferences }),

  getSession: (sessionId) =>
    api.get(`/api/sessions/${sessionId}`),

  joinSession: (sessionId, userName) =>
    api.post(`/api/sessions/${sessionId}/join`, { userName }),

  // Movies
  getMovies: (params = {}) =>
    api.get('/api/movies', { params }),

  getMovieDetails: (movieId) =>
    api.get(`/api/movies/${movieId}`),

  getGenres: () =>
    api.get('/api/genres'),
};
