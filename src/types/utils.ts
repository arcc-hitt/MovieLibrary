/**
 * Utility types for common patterns
 */

/**
 * Make all properties optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Pick specific properties from a type
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omit specific properties from a type
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Generic async function type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Generic event handler type
 */
export type EventHandler<T = void> = (event: React.SyntheticEvent) => T;

/**
 * Generic callback function type
 */
export type Callback<T = void, P = void> = (param: P) => T;

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Image size options for TMDB API
 */
export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';