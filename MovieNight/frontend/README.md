# MovieNight Frontend

React frontend for MovieNight with beautiful UI and real-time features.

## Features

- Modern, responsive UI with TailwindCSS
- Real-time updates with Socket.io
- Swipeable movie cards with React Spring
- TMDB movie data integration
- Session management

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Socket.io Client
- React Spring (animations)
- Axios

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output in `dist/` directory.

## Environment Variables

Build-time variables (`.env`):

```env
VITE_API_URL=http://localhost:3001
```

## Docker

```bash
docker build -t movienight-frontend .
docker run -p 80:80 movienight-frontend
```

## Project Structure

```
src/
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── components/
│   ├── WelcomeScreen.jsx     # Landing page
│   ├── SessionSetup.jsx      # Create/join session
│   ├── MovieSwiper.jsx       # Swipe interface
│   └── MatchesScreen.jsx     # Matched movies
└── services/
    ├── api.js                # API service
    └── socket.js             # Socket.io service
```
