import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Play, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function MatchesScreen({ session, user, onBackToSwipe }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Load details for all matched movies
      const matchedMovieIds = session.matches || [];
      const moviePromises = matchedMovieIds.map(id => api.getMovieDetails(id));
      const responses = await Promise.all(moviePromises);
      setMatches(responses.map(r => r.movie));
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🍿</div>
          <p className="text-xl">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-4 glass border-b border-white/10">
          <button
            onClick={onBackToSwipe}
            className="flex items-center gap-2 hover:text-cinema-purple transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Swiping
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold mb-4">No Matches Yet</h2>
            <p className="text-white/60 mb-6">
              Keep swiping! When everyone likes the same movie, it'll appear here.
            </p>
            <button onClick={onBackToSwipe} className="btn-primary">
              Continue Swiping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToSwipe}
            className="flex items-center gap-2 hover:text-cinema-purple transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Swiping
          </button>
          
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎉 Your Matches ({matches.length})
          </h1>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Matches grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">Movies Everyone Loved!</h2>
            <p className="text-white/60">Click on any movie to see more details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="card hover:scale-105 transition-transform cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <div className="text-sm font-semibold">Click for details</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{movie.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{movie.rating?.toFixed(1)}</span>
                  </div>
                  {movie.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    </div>
                  )}
                  {movie.runtime && (
                    <span>{movie.runtime} min</span>
                  )}
                </div>
                
                <p className="text-sm text-white/60 line-clamp-2 mb-4">
                  {movie.overview}
                </p>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <div
          onClick={() => setSelectedMovie(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto card animate-slide-up"
          >
            <div className="relative">
              {selectedMovie.backdrop && (
                <div className="relative h-64 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedMovie.backdrop}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker to-transparent"></div>
                </div>
              )}
              
              <div className="flex gap-6">
                <img
                  src={selectedMovie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={selectedMovie.title}
                  className="w-48 h-72 object-cover rounded-xl shadow-lg flex-shrink-0"
                />
                
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-3">{selectedMovie.title}</h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-semibold">{selectedMovie.rating?.toFixed(1)}</span>
                    </div>
                    {selectedMovie.releaseDate && (
                      <span className="text-white/60">
                        {new Date(selectedMovie.releaseDate).getFullYear()}
                      </span>
                    )}
                    {selectedMovie.runtime && (
                      <span className="text-white/60">{selectedMovie.runtime} min</span>
                    )}
                  </div>
                  
                  {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedMovie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-cinema-purple/30 border border-cinema-purple/50 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {selectedMovie.overview}
                  </p>
                  
                  <div className="flex gap-3">
                    {selectedMovie.trailer && (
                      <a
                        href={selectedMovie.trailer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Watch Trailer
                      </a>
                    )}
                    <a
                      href={`https://www.themoviedb.org/movie/${selectedMovie.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      More Info
                    </a>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
