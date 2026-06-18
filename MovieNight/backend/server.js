require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// In-memory storage (use Redis in production)
const sessions = new Map();
const users = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create a new movie night session
app.post('/api/sessions', (req, res) => {
  const { hostName, preferences } = req.body;
  const sessionId = uuidv4().substring(0, 6).toUpperCase();
  
  const session = {
    id: sessionId,
    hostName,
    preferences: preferences || {},
    users: [],
    movies: [],
    swipes: {},
    matches: [],
    createdAt: new Date().toISOString()
  };
  
  sessions.set(sessionId, session);
  
  res.json({ 
    success: true, 
    sessionId,
    session 
  });
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  res.json({ 
    success: true, 
    session 
  });
});

// Join a session
app.post('/api/sessions/:sessionId/join', (req, res) => {
  const { sessionId } = req.params;
  const { userName } = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  const userId = uuidv4();
  const user = {
    id: userId,
    name: userName,
    joinedAt: new Date().toISOString()
  };
  
  session.users.push(user);
  users.set(userId, { ...user, sessionId });
  
  // Notify other users in the session
  io.to(sessionId).emit('userJoined', user);
  
  res.json({ 
    success: true, 
    userId,
    session 
  });
});

// Fetch movies from TMDB
app.get('/api/movies', async (req, res) => {
  const { 
    genre, 
    page = 1, 
    year,
    minRating = 6 
  } = req.query;
  
  if (!TMDB_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      message: 'TMDB API key not configured' 
    });
  }
  
  try {
    const params = {
      api_key: TMDB_API_KEY,
      page,
      'vote_average.gte': minRating,
      sort_by: 'popularity.desc',
      include_adult: false
    };
    
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
    
    const movies = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids
    }));
    
    res.json({ 
      success: true, 
      movies,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch movies' 
    });
  }
});

// Get movie details
app.get('/api/movies/:movieId', async (req, res) => {
  const { movieId } = req.params;
  
  if (!TMDB_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      message: 'TMDB API key not configured' 
    });
  }
  
  try {
    const [detailsRes, videosRes] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);
    
    const movie = detailsRes.data;
    const trailer = videosRes.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    
    res.json({
      success: true,
      movie: {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
        rating: movie.vote_average,
        releaseDate: movie.release_date,
        runtime: movie.runtime,
        genres: movie.genres,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
      }
    });
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch movie details' 
    });
  }
});

// Get genre list
app.get('/api/genres', async (req, res) => {
  if (!TMDB_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      message: 'TMDB API key not configured' 
    });
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY }
    });
    
    res.json({ 
      success: true, 
      genres: response.data.genres 
    });
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch genres' 
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join a session room
  socket.on('joinSession', ({ sessionId, userId }) => {
    socket.join(sessionId);
    const session = sessions.get(sessionId);
    
    if (session) {
      socket.emit('sessionData', session);
      io.to(sessionId).emit('usersUpdated', session.users);
    }
  });
  
  // Handle movie swipe
  socket.on('swipeMovie', ({ sessionId, userId, movieId, liked }) => {
    const session = sessions.get(sessionId);
    
    if (!session) return;
    
    // Initialize swipes for this movie if not exists
    if (!session.swipes[movieId]) {
      session.swipes[movieId] = {};
    }
    
    // Record the swipe
    session.swipes[movieId][userId] = liked;
    
    // Check if all users have swiped on this movie
    const allUserIds = session.users.map(u => u.id);
    const swipedUserIds = Object.keys(session.swipes[movieId]);
    const allSwiped = allUserIds.every(id => swipedUserIds.includes(id));
    
    if (allSwiped) {
      // Check if everyone liked it
      const allLiked = Object.values(session.swipes[movieId]).every(like => like === true);
      
      if (allLiked) {
        // It's a match!
        session.matches.push(movieId);
        io.to(sessionId).emit('movieMatch', { movieId });
      }
    }
    
    // Emit swipe update to all users in session
    io.to(sessionId).emit('swipeUpdate', {
      movieId,
      userId,
      liked,
      swipeCount: Object.keys(session.swipes[movieId]).length,
      totalUsers: session.users.length
    });
  });
  
  // Handle user leaving
  socket.on('leaveSession', ({ sessionId, userId }) => {
    const session = sessions.get(sessionId);
    
    if (session) {
      session.users = session.users.filter(u => u.id !== userId);
      users.delete(userId);
      io.to(sessionId).emit('userLeft', { userId });
      io.to(sessionId).emit('usersUpdated', session.users);
    }
    
    socket.leave(sessionId);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🎬 MovieNight server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!TMDB_API_KEY) {
    console.warn('⚠️  TMDB_API_KEY not set! Movie fetching will not work.');
  }
});
