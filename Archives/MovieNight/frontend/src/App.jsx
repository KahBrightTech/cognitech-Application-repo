import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SessionSetup from './components/SessionSetup';
import MovieSwiper from './components/MovieSwiper';
import MatchesScreen from './components/MatchesScreen';

function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, setup, swipe, matches
  const [sessionData, setSessionData] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleCreateSession = () => {
    setScreen('setup');
  };

  const handleJoinSession = () => {
    setScreen('setup');
  };

  const handleSessionReady = (session, user) => {
    setSessionData(session);
    setUserData(user);
    setScreen('swipe');
  };

  const handleViewMatches = () => {
    setScreen('matches');
  };

  const handleBackToSwipe = () => {
    setScreen('swipe');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinema-darker via-cinema-dark to-cinema-darker">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cinema-purple/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cinema-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cinema-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {screen === 'welcome' && (
          <WelcomeScreen 
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
          />
        )}
        
        {screen === 'setup' && (
          <SessionSetup 
            onSessionReady={handleSessionReady}
          />
        )}
        
        {screen === 'swipe' && sessionData && userData && (
          <MovieSwiper 
            session={sessionData}
            user={userData}
            onViewMatches={handleViewMatches}
          />
        )}
        
        {screen === 'matches' && sessionData && userData && (
          <MatchesScreen 
            session={sessionData}
            user={userData}
            onBackToSwipe={handleBackToSwipe}
          />
        )}
      </div>
    </div>
  );
}

export default App;
