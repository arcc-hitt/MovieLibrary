import React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SearchBarProps } from '@/types/components'

export const SearchBar = React.memo<SearchBarProps>(function SearchBar({
    onSearch,
    placeholder = "Search movies...",
    isLoading = false
}) {
    const [searchValue, setSearchValue] = React.useState('')
    const [debouncedValue, setDebouncedValue] = React.useState('')
    const debounceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    // Debounce the search value
    React.useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedValue(searchValue)
        }, 300) // 300ms debounce delay

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [searchValue])

    // Call onSearch when debounced value changes
    React.useEffect(() => {
        onSearch(debouncedValue)
    }, [debouncedValue, onSearch])

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }, [])

    const handleClear = React.useCallback(() => {
        setSearchValue('')
        setDebouncedValue('')
    }, [])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClear()
        }
    }, [handleClear])

    const handleSubmit = React.useCallback((e: React.FormEvent) => {
        e.preventDefault()
        // Immediately trigger search on form submit
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }
        setDebouncedValue(searchValue)
    }, [searchValue])

    return (
        <div className="w-full max-w-md" role="search" aria-label="Movie search">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    {/* Search Icon */}
                    <div 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </div>

                    {/* Search Input - Enhanced for accessibility */}
                    <Input
                        type="search"
                        value={searchValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={cn(
                            "pl-10 pr-10 w-full",
                            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            "transition-all duration-200",
                            // Enhanced mobile styling
                            "h-10 sm:h-9 text-base sm:text-sm",
                            // Better touch targets
                            "touch-manipulation"
                        )}
                        disabled={isLoading}
                        aria-label="Search for movies by title"
                        aria-describedby={searchValue ? "search-clear-hint" : undefined}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        role="searchbox"

                    />

                    {/* Clear Button - Enhanced accessibility */}
                    {searchValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className={cn(
                                "absolute right-1 top-1/2 transform -translate-y-1/2",
                                "h-8 w-8 p-0 hover:bg-muted focus:bg-muted",
                                "focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                "touch-manipulation min-h-[32px] min-w-[32px]"
                            )}
                            aria-label={`Clear search query: ${searchValue}`}
                            tabIndex={0}
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    )}

                    {/* Screen reader hint for clear functionality */}
                    {searchValue && (
                        <div id="search-clear-hint" className="sr-only">
                            Press Escape key or click the X button to clear search
                        </div>
                    )}
                </div>

                {/* Hidden submit button for form submission */}
                <button type="submit" className="sr-only" tabIndex={-1}>
                    Search
                </button>
            </form>

            {/* Search status for screen readers */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {isLoading && searchValue && `Searching for ${searchValue}...`}
                {!isLoading && searchValue && `Search completed for ${searchValue}`}
            </div>
        </div>
    )
})