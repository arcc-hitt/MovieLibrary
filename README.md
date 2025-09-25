# Movie Library

A modern React application for browsing popular movies and managing a personal watchlist using the TMDB API.

## Features

- Browse popular movies
- Search for movies by title
- Add/remove movies from personal watchlist
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Comprehensive testing setup

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **API**: TMDB (The Movie Database) API v3

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── MovieCard/       # Movie display component
│   ├── SearchBar/       # Search input component
│   ├── Navigation/      # App navigation
│   └── Layout/          # Page layout wrapper
├── pages/               # Route components
│   ├── Home/           # Popular movies + search
│   └── Watchlist/      # User's watchlist
├── hooks/              # Custom React hooks
├── services/           # External service integrations
│   ├── tmdb/          # TMDB API client
│   └── storage/       # localStorage utilities
├── stores/            # Zustand state stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── __tests__/         # Test files
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Get your TMDB API key from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - Update the `VITE_TMDB_API_KEY` in your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## Development

This project follows modern React development practices:

- TypeScript for type safety
- Component-based architecture
- Custom hooks for business logic
- Zustand for state management
- Comprehensive testing with Vitest
- Path aliases for clean imports (@/components, @/hooks, etc.)

## Testing

The project includes a comprehensive testing setup:

- Unit tests for components and hooks
- Integration tests for user workflows
- Mock service worker for API testing
- Test coverage reporting

Run tests with:
```bash
npm run test:run
```