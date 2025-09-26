/**
 * Performance utilities for measuring and optimizing app performance
 */
import * as React from 'react'

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  /**
   * End measuring a performance metric
   */
  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure.duration;
    
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    });

    // Clean up marks and measures
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    this.startMeasure(name);
    const result = fn();
    this.endMeasure(name);
    return result;
  }

  /**
   * Measure an async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    const result = await fn();
    this.endMeasure(name);
    return result;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific measurement name
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average duration for a specific measurement
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Start observing specific performance entry types
   */
  startObserving(entryTypes: string[] = ['measure', 'navigation', 'paint']): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
      });
    });

    try {
      observer.observe({ entryTypes });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to start performance observer:', error);
    }
  }

  /**
   * Stop all performance observers
   */
  stopObserving(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get Core Web Vitals metrics
   */
  getCoreWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        vitals.FCP = fcpEntry.startTime;
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.LCP = lastEntry.startTime;
            lcpObserver.disconnect();
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP observation failed:', error);
        }

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              vitals.FID = entry.processingStart - entry.startTime;
            });
            fidObserver.disconnect();
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID observation failed:', error);
        }

        // Cumulative Layout Shift
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.CLS = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS observation failed:', error);
        }
      }

      // Return current vitals after a short delay
      setTimeout(() => resolve(vitals), 1000);
    });
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    console.group('Performance Summary');
    
    const uniqueNames = Array.from(new Set(this.metrics.map(m => m.name)));
    uniqueNames.forEach(name => {
      const average = this.getAverageDuration(name);
      const count = this.getMetricsByName(name).length;
      console.log(`${name}: ${average.toFixed(2)}ms (${count} measurements)`);
    });

    console.groupEnd();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  name?: string
): React.ComponentType<P> {
  const componentName = name || Component.displayName || Component.name || 'Component';
  
  return React.memo((props: P) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(`${componentName}-render`);
      return () => {
        performanceMonitor.endMeasure(`${componentName}-render`);
      };
    });

    return React.createElement(Component, props);
  });
}

/**
 * Hook for measuring component lifecycle performance
 */
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    performanceMonitor.startMeasure(`${componentName}-mount`);
    
    return () => {
      performanceMonitor.endMeasure(`${componentName}-mount`);
    };
  }, [componentName]);

  const measureRender = React.useCallback(() => {
    performanceMonitor.startMeasure(`${componentName}-render`);
    
    // End measurement on next tick
    setTimeout(() => {
      performanceMonitor.endMeasure(`${componentName}-render`);
    }, 0);
  }, [componentName]);

  return { measureRender };
}

/**
 * Utility to measure bundle size impact
 */
export function logBundleInfo() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    console.group('Bundle Performance');
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
    console.log('Total Page Load:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
    console.groupEnd();
  }
}

/**
 * Memory usage tracking
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
}

/**
 * Image loading performance tracker
 */
export function trackImageLoading(src: string, onLoad?: () => void, onError?: () => void) {
  const startTime = performance.now();
  
  return {
    onLoad: () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor['metrics'].push({
        name: 'image-load',
        duration: loadTime,
        timestamp: Date.now()
      });
      console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
      onLoad?.();
    },
    onError: () => {
      const errorTime = performance.now() - startTime;
      console.warn(`Image failed to load: ${src} after ${errorTime.toFixed(2)}ms`);
      onError?.();
    }
  };
}