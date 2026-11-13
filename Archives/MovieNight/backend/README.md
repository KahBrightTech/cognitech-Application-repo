# MovieNight Backend

Node.js backend server for MovieNight with Express, Socket.io, and TMDB API integration.

## Features

- RESTful API endpoints for session and movie management
- Real-time WebSocket communication with Socket.io
- TMDB API integration for movie data
- In-memory session storage (use Redis in production for multi-instance setups)

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Sessions
- `POST /api/sessions` - Create a new movie night session
- `GET /api/sessions/:sessionId` - Get session details
- `POST /api/sessions/:sessionId/join` - Join an existing session

### Movies
- `GET /api/movies` - Get movie list (with filters)
- `GET /api/movies/:movieId` - Get movie details
- `GET /api/genres` - Get genre list

## Socket.io Events

### Client → Server
- `joinSession` - Join a session room
- `swipeMovie` - Record a movie swipe
- `leaveSession` - Leave a session

### Server → Client
- `sessionData` - Session data update
- `usersUpdated` - User list update
- `userJoined` - New user joined
- `userLeft` - User left
- `swipeUpdate` - Swipe progress update
- `movieMatch` - Movie match found

## Environment Variables

```env
PORT=3001
NODE_ENV=development
TMDB_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm install --production
npm start
```

## Docker

```bash
docker build -t movienight-backend .
docker run -p 3001:3001 --env-file .env movienight-backend
```
