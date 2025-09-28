# Movie Library

A modern, responsive web application built with React and TypeScript that allows users to discover popular movies, search for specific titles, and curate a personal watchlist. Leveraging the TMDB API for real-time movie data, this app provides a seamless browsing experience with client-side persistence.

**Live Demo**: [https://movie-library-two-zeta.vercel.app/](https://movie-library-two-zeta.vercel.app/)

## Features

- Browse trending popular movies on load
- Real-time search functionality for movie discovery
- Add and remove movies from a personal watchlist
- Persistent watchlist storage using localStorage
- Responsive design optimized for all devices
- Comprehensive error handling and loading states
- Accessibility-focused UI components

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **State Management**: Zustand for predictable state handling
- **HTTP Client**: Axios for reliable API communication
- **Icons**: Lucide React for consistent iconography
- **Testing Framework**: Vitest with React Testing Library
- **API Integration**: TMDB (The Movie Database) API v3
- **Routing**: React Router DOM for client-side navigation

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

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- A TMDB API key (sign up at [https://www.themoviedb.org/](https://www.themoviedb.org/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arcc-hitt/MovieLibrary.git
   cd MovieLibrary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add your TMDB API key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Running Tests

The project includes a comprehensive test suite using Vitest and React Testing Library.

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests in UI mode
```bash
npm run test:ui
```

## Assumptions and Design Choices

### Assumptions
- Users have a stable internet connection for API calls to TMDB
- TMDB API will remain available and maintain its current response structure
- Users prefer a clean, minimal interface focused on movie discovery

### Design Choices
- **State Management**: Chose Zustand over Redux for its simplicity and minimal boilerplate, providing efficient state updates without unnecessary complexity
- **Component Architecture**: Implemented reusable components (MovieCard, SearchBar) to ensure consistency and maintainability across the application
- **API Security**: Environment variables are used for API keys to prevent accidental exposure, following security best practices
- **Persistence Strategy**: localStorage was selected for watchlist persistence to keep data client-side without requiring backend infrastructure
- **Routing**: Client-side routing with React Router enables smooth navigation and supports future feature expansion
- **Styling Approach**: Tailwind CSS with shadcn/ui provides a design system that ensures visual consistency and accessibility
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages improve the overall user experience
- **Performance**: Lazy loading for routes and optimized re-renders ensure the app remains responsive even with large movie lists
- **Testing Strategy**: Unit tests for components and hooks, integration tests for stores, ensuring reliability and preventing regressions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests in UI mode