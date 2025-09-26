import '@testing-library/jest-dom'

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    // Immediately trigger callback with mock entry
    setTimeout(() => {
      callback([{
        isIntersecting: true,
        target: {} as Element,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: {} as DOMRectReadOnly,
        time: Date.now()
      }], this as any)
    }, 0)
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Mock performance API for tests
Object.defineProperty(globalThis, 'performance', {
  value: {
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [{ duration: 50 }],
    clearMarks: () => {},
    clearMeasures: () => {},
    now: () => Date.now(),
    getEntriesByType: () => [],
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  },
  writable: true
})