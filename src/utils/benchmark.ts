/**
 * Benchmarking utilities for performance testing
 */

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  minTime?: number; // Minimum time to run in milliseconds
}

/**
 * Benchmark a synchronous function
 */
export async function benchmark(
  name: string,
  fn: () => void,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const {
    iterations = 1000,
    warmupIterations = 100,
    minTime = 1000
  } = options;

  // Warmup phase
  for (let i = 0; i < warmupIterations; i++) {
    fn();
  }

  const times: number[] = [];
  const startTime = performance.now();
  let iterationCount = 0;

  // Run benchmark until minimum time is reached or max iterations
  while (iterationCount < iterations && (performance.now() - startTime) < minTime) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
    iterationCount++;
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / times.length;
  const minTime_result = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    name,
    iterations: times.length,
    totalTime,
    averageTime,
    minTime: minTime_result,
    maxTime,
    opsPerSecond
  };
}

/**
 * Benchmark an asynchronous function
 */
export async function benchmarkAsync(
  name: string,
  fn: () => Promise<void>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const {
    iterations = 100,
    warmupIterations = 10,
    minTime = 1000
  } = options;

  // Warmup phase
  for (let i = 0; i < warmupIterations; i++) {
    await fn();
  }

  const times: number[] = [];
  const startTime = performance.now();
  let iterationCount = 0;

  // Run benchmark until minimum time is reached or max iterations
  while (iterationCount < iterations && (performance.now() - startTime) < minTime) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
    iterationCount++;
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / times.length;
  const minTime_result = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    name,
    iterations: times.length,
    totalTime,
    averageTime,
    minTime: minTime_result,
    maxTime,
    opsPerSecond
  };
}

/**
 * Compare multiple benchmark results
 */
export function compareBenchmarks(results: BenchmarkResult[]): void {
  console.group('Benchmark Comparison');
  
  // Sort by average time (fastest first)
  const sorted = [...results].sort((a, b) => a.averageTime - b.averageTime);
  const fastest = sorted[0];

  sorted.forEach((result, index) => {
    const slowdownFactor = result.averageTime / fastest.averageTime;
    const status = index === 0 ? '🏆 FASTEST' : `${slowdownFactor.toFixed(2)}x slower`;
    
    console.log(`${index + 1}. ${result.name} - ${status}`);
    console.log(`   Average: ${result.averageTime.toFixed(3)}ms`);
    console.log(`   Ops/sec: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Range: ${result.minTime.toFixed(3)}ms - ${result.maxTime.toFixed(3)}ms`);
    console.log('');
  });

  console.groupEnd();
}

/**
 * Benchmark React component rendering
 */
export async function benchmarkComponentRender(
  name: string,
  renderFn: () => void,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  return benchmark(`${name}-render`, renderFn, options);
}

/**
 * Benchmark data processing functions
 */
export class DataBenchmark {
  private data: any[];

  constructor(data: any[]) {
    this.data = data;
  }

  async benchmarkFilter(
    name: string,
    filterFn: (item: any) => boolean,
    options?: BenchmarkOptions
  ): Promise<BenchmarkResult> {
    return benchmark(
      `${name}-filter`,
      () => this.data.filter(filterFn),
      options
    );
  }

  async benchmarkMap(
    name: string,
    mapFn: (item: any) => any,
    options?: BenchmarkOptions
  ): Promise<BenchmarkResult> {
    return benchmark(
      `${name}-map`,
      () => this.data.map(mapFn),
      options
    );
  }

  async benchmarkSort(
    name: string,
    sortFn: (a: any, b: any) => number,
    options?: BenchmarkOptions
  ): Promise<BenchmarkResult> {
    return benchmark(
      `${name}-sort`,
      () => [...this.data].sort(sortFn),
      options
    );
  }

  async benchmarkReduce(
    name: string,
    reduceFn: (acc: any, item: any) => any,
    initialValue: any,
    options?: BenchmarkOptions
  ): Promise<BenchmarkResult> {
    return benchmark(
      `${name}-reduce`,
      () => this.data.reduce(reduceFn, initialValue),
      options
    );
  }
}

/**
 * Memory usage benchmark
 */
export function benchmarkMemoryUsage(name: string, fn: () => void): {
  name: string;
  beforeMemory: any;
  afterMemory: any;
  memoryDelta: number;
} | null {
  if (!('memory' in performance)) {
    console.warn('Memory benchmarking not supported in this environment');
    return null;
  }

  const beforeMemory = (performance as any).memory.usedJSHeapSize;
  fn();
  
  // Force garbage collection if available (Chrome DevTools)
  if ('gc' in window) {
    (window as any).gc();
  }
  
  const afterMemory = (performance as any).memory.usedJSHeapSize;
  const memoryDelta = afterMemory - beforeMemory;

  return {
    name,
    beforeMemory,
    afterMemory,
    memoryDelta
  };
}

/**
 * Bundle size impact benchmark
 */
export function benchmarkBundleImpact(): {
  domContentLoaded: number;
  loadComplete: number;
  totalPageLoad: number;
} | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    totalPageLoad: navigation.loadEventEnd - navigation.fetchStart
  };
}

/**
 * Image loading benchmark
 */
export async function benchmarkImageLoading(
  images: string[],
  concurrent = false
): Promise<{
  totalTime: number;
  averageTime: number;
  successCount: number;
  errorCount: number;
}> {
  const startTime = performance.now();
  let successCount = 0;
  let errorCount = 0;

  const loadImage = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        successCount++;
        resolve();
      };
      img.onerror = () => {
        errorCount++;
        resolve();
      };
      img.src = src;
    });
  };

  if (concurrent) {
    await Promise.all(images.map(loadImage));
  } else {
    for (const src of images) {
      await loadImage(src);
    }
  }

  const totalTime = performance.now() - startTime;
  const averageTime = totalTime / images.length;

  return {
    totalTime,
    averageTime,
    successCount,
    errorCount
  };
}

/**
 * API call benchmark
 */
export async function benchmarkApiCall(
  name: string,
  apiCall: () => Promise<any>,
  iterations = 10
): Promise<BenchmarkResult> {
  return benchmarkAsync(name, apiCall, { iterations });
}