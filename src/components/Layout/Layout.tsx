import { Outlet } from 'react-router-dom';
import { Navigation } from '../Navigation/Navigation';
import { cn } from '@/lib/utils';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main 
        id="main-content"
        className={cn(
          "container mx-auto px-4 py-6 sm:py-8",
          // Enhanced responsive padding
          "px-4 sm:px-6 lg:px-8",
          // Better focus management
          "focus:outline-none"
        )}
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;