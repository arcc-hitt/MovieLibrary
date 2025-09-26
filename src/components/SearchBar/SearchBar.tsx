import React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SearchBarProps } from '@/types/components'

export function SearchBar({
    onSearch,
    placeholder = "Search movies...",
    isLoading = false
}: SearchBarProps) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const handleClear = () => {
        setSearchValue('')
        setDebouncedValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClear()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Immediately trigger search on form submit
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }
        setDebouncedValue(searchValue)
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <div className="relative">
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </div>

                {/* Search Input */}
                <Input
                    type="text"
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        "pl-10 pr-10",
                        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "transition-all duration-200"
                    )}
                    disabled={isLoading}
                    aria-label="Search movies"
                />

                {/* Clear Button */}
                {searchValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Hidden submit button for form submission */}
            <button type="submit" className="sr-only" aria-hidden="true">
                Search
            </button>
        </form>
    )
}