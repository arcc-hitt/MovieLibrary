import React from 'react'
import { Menu, X, Home, Heart } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { NavigationProps } from '@/types/components'

interface ExtendedNavigationProps extends NavigationProps {
    watchlistCount?: number
    onNavigate?: (path: string) => void
}

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

export function Navigation({
    currentPath,
    watchlistCount = 0,
    onNavigate
}: ExtendedNavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    const isActivePath = (path: string) => {
        if (path === '/') {
            return currentPath === '/'
        }
        return currentPath.startsWith(path)
    }

    const handleNavClick = (path: string) => {
        closeMobileMenu()

        if (onNavigate) {
            onNavigate(path)
        } else {
            // Fallback for testing purposes
            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', path)
            }
        }
    }

    return (
        <nav className="bg-background border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold text-foreground">
                            🎬 Movie Library
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        isActivePath(item.path)
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground"
                                    )}
                                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {item.path === '/watchlist' && watchlistCount > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                                            {watchlistCount}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileMenu}
                            className="p-2"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={cn(
                                        "flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        isActivePath(item.path)
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground"
                                    )}
                                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.path === '/watchlist' && watchlistCount > 0 && (
                                        <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                                            {watchlistCount}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}