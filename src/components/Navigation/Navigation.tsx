import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Home, Heart, Clapperboard } from 'lucide-react'
import { Button, Badge, ThemeToggle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useWatchlistStore } from '@/stores/watchlistStore'



interface NavigationItem {
    path: string
    label: string
    icon: React.ReactNode
}

const navigationItems: NavigationItem[] = [
    {
        path: '/',
        label: 'Home',
        icon: <Home className="h-4 w-4" />
    },
    {
        path: '/watchlist',
        label: 'Watchlist',
        icon: <Heart className="h-4 w-4" />
    }
]

export const Navigation = React.memo(function Navigation() {
    const location = useLocation()
    const watchlist = useWatchlistStore((state) => state.watchlist)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const toggleMobileMenu = React.useCallback(() => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }, [isMobileMenuOpen])

    const closeMobileMenu = React.useCallback(() => {
        setIsMobileMenuOpen(false)
    }, [])

    const isActivePath = React.useCallback((path: string) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }, [location.pathname])

    const watchlistCount = React.useMemo(() => watchlist.length, [watchlist.length])

    return (
        <nav 
            className="bg-background border-b border-border sticky top-0 z-50"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link 
                            to="/" 
                            className={cn(
                                "text-xl font-bold text-foreground gap-2 flex items-center",
                                "rounded-md px-2 py-1",
                                "hover:text-primary transition-colors"
                            )}
                            aria-label="Movie Library - Go to home page"
                        >
                            <Clapperboard className="h-6 w-6 inline-block" aria-label="Clapperboard" />
                            Movie Library
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <ul className="ml-10 flex items-baseline space-x-4" role="menubar">
                            {navigationItems.map((item) => (
                                <li key={item.path} role="none">
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:hover:ring-0 focus:hover:ring-offset-0",
                                            "touch-manipulation min-h-[44px]",
                                            isActivePath(item.path)
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground"
                                        )}
                                        aria-current={isActivePath(item.path) ? 'page' : undefined}
                                        role="menuitem"
                                    >
                                        <span aria-hidden="true">{item.icon}</span>
                                        <span>{item.label}</span>
                                        {item.path === '/watchlist' && watchlistCount > 0 && (
                                            <Badge 
                                                variant="secondary" 
                                                className="ml-1 h-5 min-w-5 text-xs"
                                                aria-label={`${watchlistCount} movies in watchlist`}
                                            >
                                                {watchlistCount}
                                            </Badge>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        
                        {/* Theme Toggle */}
                        <div className="ml-4 pl-4 border-l border-border">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile controls - Theme toggle and menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileMenu}
                            className={cn(
                                "p-2 touch-manipulation min-h-[44px] min-w-[44px]",
                                "focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            )}
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                            aria-controls="mobile-menu"
                            aria-haspopup="true"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div 
                        className="md:hidden"
                        id="mobile-menu"
                        role="menu"
                        aria-labelledby="mobile-menu-button"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={cn(
                                        "flex items-center justify-between w-full px-3 py-3 rounded-md text-base font-medium transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        "touch-manipulation min-h-[48px]",
                                        isActivePath(item.path)
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground"
                                    )}
                                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                                    role="menuitem"
                                >
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.path === '/watchlist' && watchlistCount > 0 && (
                                        <Badge 
                                            variant="secondary" 
                                            className="h-5 min-w-5 text-xs"
                                            aria-label={`${watchlistCount} movies in watchlist`}
                                        >
                                            {watchlistCount}
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Skip link for keyboard navigation */}
            <a 
                href="#main-content" 
                className={cn(
                    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
                    "bg-primary text-primary-foreground px-4 py-2 rounded-md z-50",
                    "focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
            >
                Skip to main content
            </a>
        </nav>
    )
})