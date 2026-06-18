import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Heart, X, Star, Clock, Users, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';

export default function MovieSwiper({ session, user, onViewMatches }) {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeStats, setSwipeStats] = useState({});
  const [matches, setMatches] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState(null);

  const currentMovie = movies[currentIndex];

  useEffect(() => {
    loadMovies();

    // Listen for socket events
    socket.on('swipeUpdate', handleSwipeUpdate);
    socket.on('movieMatch', handleMovieMatch);

    return () => {
      socket.off('swipeUpdate');
      socket.off('movieMatch');
    };
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const response = await api.getMovies({ page: 1 });
      setMovies(response.movies);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeUpdate = (data) => {
    setSwipeStats(prev => ({
      ...prev,
      [data.movieId]: {
        count: data.swipeCount,
        total: data.totalUsers
      }
    }));
  };

  const handleMovieMatch = async ({ movieId }) => {
    try {
      const response = await api.getMovieDetails(movieId);
      setLastMatch(response.movie);
      setMatches(prev => [...prev, response.movie]);
      setShowMatch(true);
      
      setTimeout(() => {
        setShowMatch(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to load match details:', error);
    }
  };

  const [{ x, rotate }, springApi] = useSpring(() => ({
    x: 0,
    rotate: 0
  }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) {
        // Swiped!
        const liked = dir === 1;
        handleSwipe(liked);
      }

      springApi.start({
        x: down ? mx : 0,
        rotate: down ? mx / 10 : 0,
        immediate: down
      });
    },
    { axis: 'x' }
  );

  const handleSwipe = (liked) => {
    if (!currentMovie) return;

    // Emit swipe to backend
    socket.emit('swipeMovie', {
      sessionId: session.id,
      userId: user.id,
      movieId: currentMovie.id,
      liked
    });

    // Animate card out
    springApi.start({
      x: liked ? 1000 : -1000,
      rotate: liked ? 45 : -45,
      onRest: () => {
        setCurrentIndex(prev => prev + 1);
        springApi.set({ x: 0, rotate: 0 });
        
        // Load more movies if running low
        if (currentIndex >= movies.length - 3) {
          loadMovies();
        }
      }
    });
  };

  const handleButtonSwipe = (liked) => {
    handleSwipe(liked);
  };

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cinema-purple" />
          <p className="text-xl">Loading amazing movies...</p>
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-4">No more movies!</h2>
          <button onClick={loadMovies} className="btn-primary">
            Load More Movies
          </button>
        </div>
      </div>
    );
  }

  const stats = swipeStats[currentMovie.id] || { count: 0, total: session.users.length };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🍿 MovieNight
            </h1>
            <p className="text-sm text-white/60">Session: {session.id}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{session.users.length} online</span>
            </div>
            <button
              onClick={onViewMatches}
              className="btn-secondary relative"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Matches
              {matches.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-cinema-pink w-6 h-6 rounded-full text-xs flex items-center justify-center">
                  {matches.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main swipe area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg h-[600px]">
          {/* Progress indicator */}
          <div className="absolute -top-12 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {stats.count} of {stats.total} swiped
              </span>
            </div>
          </div>

          {/* Movie card */}
          <animated.div
            {...bind()}
            style={{
              x,
              rotate,
              touchAction: 'none'
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              {/* Movie poster */}
              <img
                src={currentMovie.poster || currentMovie.backdrop || 'https://via.placeholder.com/500x750?text=No+Image'}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              {/* Movie info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-3xl font-bold mb-2">{currentMovie.title}</h2>
                
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{currentMovie.rating?.toFixed(1)}</span>
                  </div>
                  {currentMovie.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(currentMovie.releaseDate).getFullYear()}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-white/80 line-clamp-3 mb-4">
                  {currentMovie.overview}
                </p>
              </div>

              {/* Swipe indicators */}
              <animated.div
                style={{
                  opacity: x.to(x => x > 0 ? x / 100 : 0)
                }}
                className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl rotate-12 shadow-lg"
              >
                LIKE
              </animated.div>
              
              <animated.div
                style={{
                  opacity: x.to(x => x < 0 ? -x / 100 : 0)
                }}
                className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-2xl -rotate-12 shadow-lg"
              >
                PASS
              </animated.div>
            </div>
          </animated.div>

          {/* Action buttons */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={() => handleButtonSwipe(false)}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-red-500 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            
            <button
              onClick={() => handleButtonSwipe(true)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-cinema-purple to-cinema-pink flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Heart className="w-10 h-10 fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Match notification */}
      {showMatch && lastMatch && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-8xl mb-4 animate-float">🎉</div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cinema-purple via-cinema-pink to-cinema-blue bg-clip-text text-transparent">
              It's a Match!
            </h2>
            <p className="text-2xl mb-6">Everyone loves:</p>
            <div className="card max-w-md mx-auto">
              <img
                src={lastMatch.poster}
                alt={lastMatch.title}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <h3 className="text-2xl font-bold">{lastMatch.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
