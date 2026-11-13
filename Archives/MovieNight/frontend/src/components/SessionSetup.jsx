import { useState, useEffect } from 'react';
import { Copy, Check, Users, Loader2 } from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';

export default function SessionSetup({ onSessionReady }) {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdSession, setCreatedSession] = useState(null);
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for user updates
    socket.on('userJoined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    socket.on('usersUpdated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      socket.off('userJoined');
      socket.off('usersUpdated');
    };
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.createSession(name);
      const session = response.session;
      
      // Auto-join as host
      const joinResponse = await api.joinSession(session.id, name);
      
      setCreatedSession(session);
      setUsers(session.users);
      
      // Connect socket
      socket.connect();
      socket.emit('joinSession', { 
        sessionId: session.id, 
        userId: joinResponse.userId 
      });

      // Store user data for later
      sessionStorage.setItem('movienight_user', JSON.stringify({
        userId: joinResponse.userId,
        sessionId: session.id,
        name
      }));

    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sessionId.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.joinSession(sessionId.toUpperCase(), name);
      
      // Connect socket
      socket.connect();
      socket.emit('joinSession', { 
        sessionId: response.session.id, 
        userId: response.userId 
      });

      // Store user data
      sessionStorage.setItem('movienight_user', JSON.stringify({
        userId: response.userId,
        sessionId: response.session.id,
        name
      }));

      onSessionReady(response.session, { 
        id: response.userId, 
        name 
      });

    } catch (err) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const copySessionId = () => {
    if (createdSession) {
      navigator.clipboard.writeText(createdSession.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startSession = () => {
    if (createdSession && users.length > 0) {
      const userData = JSON.parse(sessionStorage.getItem('movienight_user'));
      onSessionReady(createdSession, {
        id: userData.userId,
        name: userData.name
      });
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold mb-2">Let's Get Started!</h2>
            <p className="text-white/60">Choose how you want to begin</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full card hover:bg-white/10 transition-all p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cinema-purple to-cinema-pink flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create New Session</h3>
                  <p className="text-sm text-white/60">Start a movie night with friends</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full card hover:bg-white/10 transition-all p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cinema-blue to-cinema-purple flex items-center justify-center">
                  <span className="text-2xl">🎫</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Join Existing Session</h3>
                  <p className="text-sm text-white/60">Enter a session code</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create' && !createdSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-slide-up">
          <button
            onClick={() => setMode(null)}
            className="mb-6 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>

          <div className="card">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎬</div>
              <h2 className="text-2xl font-bold mb-2">Create Movie Night</h2>
              <p className="text-white/60">Start your movie selection session</p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Session'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create' && createdSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-slide-up">
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Session Created!</h2>
              <p className="text-white/60">Share this code with your friends</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 p-4 bg-white/10 rounded-xl border-2 border-cinema-purple/50">
                <div className="flex-1 text-center">
                  <div className="text-sm text-white/60 mb-1">Session Code</div>
                  <div className="text-3xl font-bold tracking-wider">{createdSession.id}</div>
                </div>
                <button
                  onClick={copySessionId}
                  className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                <Users className="w-4 h-4" />
                <span>Participants ({users.length})</span>
              </div>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cinema-purple to-cinema-pink flex items-center justify-center font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      {index === 0 && <div className="text-xs text-cinema-purple">Host</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={users.length === 0}
              className="btn-primary w-full"
            >
              Start Swiping! 🎬
            </button>

            <p className="text-center text-sm text-white/40 mt-4">
              Waiting for friends to join...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-slide-up">
          <button
            onClick={() => setMode(null)}
            className="mb-6 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>

          <div className="card">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎫</div>
              <h2 className="text-2xl font-bold mb-2">Join Movie Night</h2>
              <p className="text-white/60">Enter the session code to join</p>
            </div>

            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session Code</label>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="input text-center text-2xl tracking-wider"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim() || !sessionId.trim()}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </span>
                ) : (
                  'Join Session'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
