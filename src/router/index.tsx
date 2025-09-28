import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import Layout from '../components/Layout/Layout';

// Lazy load page components for code splitting
const Home = lazy(() => import('../pages/Home/Home'));
const Watchlist = lazy(() => import('../pages/Watchlist/Watchlist'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Wrapper component for lazy-loaded pages with error boundary
const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary><div>An error occurred</div></ErrorBoundary>,
    children: [
      {
        index: true,
        element: (
          <LazyPageWrapper>
            <Home />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'watchlist',
        element: (
          <LazyPageWrapper>
            <Watchlist />
          </LazyPageWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
