import { Film, Users, Sparkles } from 'lucide-react';

export default function WelcomeScreen({ onCreateSession, onJoinSession }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="inline-block mb-6 text-8xl animate-float">
            🍿
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cinema-purple via-cinema-pink to-cinema-blue bg-clip-text text-transparent">
            MovieNight
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-2">
            Swipe together, watch together
          </p>
          <p className="text-lg text-white/60">
            The fun way to decide what movie to watch with friends!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="card hover:scale-105 transition-transform">
            <Film className="w-12 h-12 mx-auto mb-3 text-cinema-purple" />
            <h3 className="font-semibold mb-2">Swipe Movies</h3>
            <p className="text-sm text-white/60">Browse and swipe on movie suggestions</p>
          </div>
          <div className="card hover:scale-105 transition-transform">
            <Users className="w-12 h-12 mx-auto mb-3 text-cinema-pink" />
            <h3 className="font-semibold mb-2">With Friends</h3>
            <p className="text-sm text-white/60">Create a session and invite friends</p>
          </div>
          <div className="card hover:scale-105 transition-transform">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-cinema-blue" />
            <h3 className="font-semibold mb-2">Find Matches</h3>
            <p className="text-sm text-white/60">Discover movies everyone will love</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onCreateSession}
            className="btn-primary text-lg px-8 py-4"
          >
            🎬 Create Movie Night
          </button>
          <button 
            onClick={onJoinSession}
            className="btn-secondary text-lg px-8 py-4"
          >
            👋 Join Session
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-white/40 text-sm">
          <p>Perfect for movie nights with friends, family, or your partner! 💕</p>
        </div>
      </div>
    </div>
  );
}
