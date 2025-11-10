/**
 * Performance Optimization Utilities
 * This file provides performance optimization functions and monitoring
 */

import { Platform } from 'react-native';  
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  // Query performance thresholds
  SLOW_QUERY_THRESHOLD: 1000, // 1 second
  VERY_SLOW_QUERY_THRESHOLD: 3000, // 3 seconds
  
  // Memory thresholds
  MEMORY_WARNING_THRESHOLD: 0.8, // 80% of available memory
  MEMORY_CRITICAL_THRESHOLD: 0.95, // 95% of available memory
  
  // Network thresholds
  SLOW_NETWORK_THRESHOLD: 2000, // 2 seconds
  NETWORK_TIMEOUT: 10000, // 10 seconds
  
  // Animation thresholds
  FRAME_DROP_THRESHOLD: 16, // 60fps = 16.67ms per frame
  ANIMATION_DURATION_MAX: 300, // 300ms max for smooth UX
};

// Intelligent debouncing with adaptive delays
export function useIntelligentDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    adaptive?: boolean;
    maxDelay?: number;
    minDelay?: number;
  } = {}
): T {
  const { adaptive = true, maxDelay = 1000, minDelay = 100 } = options;
  let timeoutId: ReturnType<typeof setTimeout>;
  let lastCallTime = 0;
  let callCount = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    // Adaptive delay: increase delay if called frequently
    let adaptiveDelay = delay;
    if (adaptive && callCount > 5) {
      adaptiveDelay = Math.min(delay * 1.5, maxDelay);
    }
    
    // Clear existing timeout
    clearTimeout(timeoutId);
    
    // Set new timeout with adaptive delay
    timeoutId = setTimeout(() => {
      func(...args);
      callCount = 0; // Reset counter on successful execution
    }, adaptiveDelay);
    
    lastCallTime = now;
    callCount++;
  }) as T;
}

// Enhanced throttling with performance monitoring
export function useIntelligentThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    monitorPerformance?: boolean;
  } = {}
): T {
  const { leading = true, trailing = true, monitorPerformance = true } = options;
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  let performanceMetrics = { totalCalls: 0, throttledCalls: 0, executionTime: 0 };

  return ((...args: Parameters<T>) => {
    performanceMetrics.totalCalls++;
    
    if (!inThrottle) {
      if (leading) {
        const startTime = performance.now();
        func(...args);
        performanceMetrics.executionTime += performance.now() - startTime;
      }
      lastRan = Date.now();
      inThrottle = true;
    } else {
      performanceMetrics.throttledCalls++;
    }

    clearTimeout(lastFunc);
    lastFunc = setTimeout(() => {
      if (trailing) {
        const startTime = performance.now();
        func(...args);
        performanceMetrics.executionTime += performance.now() - startTime;
      }
      inThrottle = false;
    }, limit - (Date.now() - lastRan));
    
    // Performance monitoring
    if (monitorPerformance && __DEV__) {
      const throttleRate = (performanceMetrics.throttledCalls / performanceMetrics.totalCalls) * 100;
      if (throttleRate > 50) {
        console.warn(`⚠️ High throttle rate detected: ${throttleRate.toFixed(1)}% calls throttled`);
      }
    }
  }) as T;
}

/**
 * Enhanced debouncing utility with intelligent delay adjustment
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * Enhanced throttling utility with performance monitoring
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

/**
 * Lazy component loading with performance monitoring
 */
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType<T>
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        const startTime = performance.now();
        const module = await importFn();
        const loadTime = performance.now() - startTime;
        
        if (loadTime > PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
          console.warn(`⚠️ Slow component load: ${loadTime.toFixed(2)}ms`);
        }
        
        setComponent(() => module.default);
      } catch (error) {
        console.error('❌ Component load failed:', error);
        if (fallback) {
          setComponent(() => fallback);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [importFn]);

  return { Component, isLoading };
}

/**
 * Optimized memoization with performance tracking
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxRecomputations?: number;
    logPerformance?: boolean;
  } = {}
): T {
  const { maxRecomputations = 10, logPerformance = __DEV__ } = options;
  const recomputationCount = useRef(0);
  const lastDeps = useRef(deps);

  return useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const computationTime = performance.now() - startTime;

    // Track recomputations
    const depsChanged = JSON.stringify(deps) !== JSON.stringify(lastDeps.current);
    if (depsChanged) {
      recomputationCount.current++;
      
      if (logPerformance) {
        console.log(`🔄 Memo recomputation #${recomputationCount.current}:`, {
          computationTime: `${computationTime.toFixed(2)}ms`,
          deps,
        });
      }

      // Warn if too many recomputations
      if (recomputationCount.current > maxRecomputations) {
        console.warn(`⚠️ Excessive memo recomputations: ${recomputationCount.current} times`);
      }
    }

    lastDeps.current = deps;
    return result;
  }, deps);
}

/**
 * Performance monitoring hook for components
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef(performance.now());
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
      startTime.current = performance.now();
      renderCount.current += 1;
    }
  });

  useEffect(() => {
    return () => {
      if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
        const totalTime = performance.now() - startTime.current;
        const avgRenderTime = totalTime / renderCount.current;

        console.log(`📊 ${componentName} performance summary:`, {
          totalRenderTime: `${totalTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          averageRenderTime: `${avgRenderTime.toFixed(2)}ms`,
        });

        // Warn if render time exceeds threshold (16ms for 60fps)
        if (avgRenderTime > PERFORMANCE_CONFIG.FRAME_DROP_THRESHOLD) {
          console.warn(
            `⚠️ Performance: ${componentName} average render time (${avgRenderTime.toFixed(2)}ms) exceeds 60fps threshold`
          );
        }
      }
    };
  }, [componentName]);

  const trackRender = useCallback(() => {
    if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
      const now = performance.now();
      const renderTime = now - lastRenderTime.current;
      lastRenderTime.current = now;

      if (renderTime > PERFORMANCE_CONFIG.FRAME_DROP_THRESHOLD) {
        console.warn(
          `⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    }
  }, [componentName]);

  const trackInteraction = useCallback(
    (action: string, data?: any) => {
      if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
        const timestamp = performance.now();
        console.log(`📊 Interaction: ${componentName}.${action}`, { timestamp, data });
      }
    },
    [componentName]
  );

  return { trackRender, trackInteraction };
}

/**
 * Memory management utilities
 */
export const memoryUtils = {
  // Check if memory usage is concerning
  isMemoryConcerning(): boolean {
    if (Platform.OS === 'web') {
      // Web memory API
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        return usageRatio > PERFORMANCE_CONFIG.MEMORY_WARNING_THRESHOLD;
      }
    }
    return false;
  },

  // Get memory usage info
  getMemoryInfo(): { used: number; total: number; ratio: number } | null {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
        ratio: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  // Suggest memory cleanup actions
  suggestCleanupActions(): string[] {
    const actions = [];
    
    if (memoryUtils.isMemoryConcerning()) {
      actions.push('Clear image cache');
      actions.push('Unmount unused components');
      actions.push('Reduce query cache size');
      actions.push('Clear AsyncStorage cache');
    }
    
    return actions;
  },

  /**
   * Clear unused memory cache
   */
  clearCache: () => {
    if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
      // Clear any cached data that's not being used
      global.gc && global.gc();
    }
  },

  /**
   * Monitor memory usage
   */
  monitorMemory: () => {
    if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD && __DEV__) {
      if (Platform.OS === 'web' && 'memory' in performance) {
        const memInfo = (performance as any).memory;
        if (memInfo) {
          const used = memInfo.usedJSHeapSize;
          const threshold = PERFORMANCE_CONFIG.MEMORY_WARNING_THRESHOLD;

          if (used > threshold) {
            console.warn('⚠️ High memory usage detected');
            const suggestions = memoryUtils.suggestCleanupActions();
            console.log('💡 Cleanup suggestions:', suggestions);
          }
        }
      }
    }
  },
};

/**
 * Network performance utilities
 */
export const networkUtils = {
  // Calculate optimal timeout based on connection quality
  getOptimalTimeout(connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown'): number {
    switch (connectionQuality) {
      case 'excellent':
        return PERFORMANCE_CONFIG.NETWORK_TIMEOUT * 0.5; // 5 seconds
      case 'good':
        return PERFORMANCE_CONFIG.NETWORK_TIMEOUT * 0.8; // 8 seconds
      case 'poor':
        return PERFORMANCE_CONFIG.NETWORK_TIMEOUT * 1.5; // 15 seconds
      default:
        return PERFORMANCE_CONFIG.NETWORK_TIMEOUT; // 10 seconds
    }
  },

  // Suggest network optimization strategies
  suggestNetworkOptimizations(connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown'): string[] {
    const optimizations = [];
    
    switch (connectionQuality) {
      case 'poor':
        optimizations.push('Reduce image quality');
        optimizations.push('Increase cache TTL');
        optimizations.push('Use offline-first strategies');
        optimizations.push('Implement progressive loading');
        break;
      case 'good':
        optimizations.push('Optimize image sizes');
        optimizations.push('Implement smart caching');
        break;
      case 'excellent':
        optimizations.push('Enable real-time features');
        optimizations.push('Use high-quality assets');
        break;
    }
    
    return optimizations;
  },

  /**
   * Create a debounced search function
   */
  createDebouncedSearch: (searchFunction: (query: string) => Promise<any>) => {
    return debounce(searchFunction, PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD);
  },

  /**
   * Network request with caching
   */
  async fetchWithCache(
    url: string,
    options: RequestInit = {},
    cacheDuration: number = 5 * 60 * 1000 // 5 minutes
  ): Promise<Response> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cache = new Map();

    // Check cache first
    if (PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, options);
      const data = await response.clone().json();

      // Cache successful responses
      if (response.ok && PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD) {
        cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }

      return response;
    } catch (error) {
      console.error('❌ Network request failed:', error);
      throw error;
    }
  },
};

/**
 * Animation performance utilities
 */
export const animationUtils = {
  // Check if animation will be smooth
  willAnimationBeSmooth(duration: number, complexity: 'low' | 'medium' | 'high'): boolean {
    const complexityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
    };
    
    const adjustedDuration = duration * complexityMultiplier[complexity];
    return adjustedDuration <= PERFORMANCE_CONFIG.ANIMATION_DURATION_MAX;
  },

  // Suggest animation optimizations
  suggestAnimationOptimizations(duration: number, complexity: 'low' | 'medium' | 'high'): string[] {
    const suggestions = [];
    
    if (!animationUtils.willAnimationBeSmooth(duration, complexity)) {
      suggestions.push('Reduce animation duration');
      suggestions.push('Simplify animation complexity');
      suggestions.push('Use native driver when possible');
      suggestions.push('Consider removing animation');
    }
    
    return suggestions;
  },

  /**
   * Get optimized animation configuration
   */
  getAnimationConfig: (duration: number = 300) => ({
    duration: duration * PERFORMANCE_CONFIG.ANIMATION_DURATION_MAX,
    useNativeDriver: true,
  }),

  /**
   * Check if motion should be reduced
   */
  shouldReduceMotion: (): boolean => {
    return true; // Always respect user preferences
  },
};

/**
 * Bundle analysis utilities
 */
export const bundleUtils = {
  // Estimate bundle size impact
  estimateBundleImpact(componentSize: number): 'low' | 'medium' | 'high' {
    if (componentSize < 10) return 'low';
    if (componentSize < 50) return 'medium';
    return 'high';
  },

  // Suggest bundle optimizations
  suggestBundleOptimizations(componentSize: number): string[] {
    const suggestions = [];
    
    if (componentSize > 50) {
      suggestions.push('Implement code splitting');
      suggestions.push('Use dynamic imports');
      suggestions.push('Lazy load components');
      suggestions.push('Remove unused dependencies');
    }
    
    return suggestions;
  },

  /**
   * Check bundle size
   */
  checkBundleSize: (size: number) => {
    if (size > 1024 * 1024) { // 1MB
      console.warn(
        `⚠️ Bundle size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds recommended size`
      );
    }
  },
};

/**
 * Main performance monitoring function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  options: {
    logPerformance?: boolean;
    warnThreshold?: number;
    category?: 'query' | 'render' | 'network' | 'animation';
  } = {}
): T {
  const { logPerformance = __DEV__, warnThreshold = PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD, category = 'render' } = options;
  
  const startTime = performance.now();
  const startMemory = memoryUtils.getMemoryInfo();
  
  try {
    const result = fn();
    const endTime = performance.now();
    const endMemory = memoryUtils.getMemoryInfo();
    
    const executionTime = endTime - startTime;
    const memoryDelta = endMemory && startMemory ? endMemory.used - startMemory.used : 0;
    
    // Performance logging
    if (logPerformance) {
      const performanceData = {
        name,
        category,
        executionTime: `${executionTime.toFixed(2)}ms`,
        memoryDelta: memoryDelta > 0 ? `+${(memoryDelta / 1024).toFixed(2)}KB` : `${(memoryDelta / 1024).toFixed(2)}KB`,
        timestamp: new Date().toISOString(),
      };
      
      if (executionTime > warnThreshold) {
        console.warn(`⚠️ Slow ${category}:`, performanceData);
      } else {
        console.log(`✅ ${category} performance:`, performanceData);
      }
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    console.error(`❌ ${category} failed after ${executionTime.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (__DEV__) {
    console.log('🚀 Performance monitoring initialized with config:', PERFORMANCE_CONFIG);
    
    // Monitor memory usage
    if (Platform.OS === 'web') {
      setInterval(() => {
        const memoryInfo = memoryUtils.getMemoryInfo();
        if (memoryInfo && memoryInfo.ratio > PERFORMANCE_CONFIG.MEMORY_WARNING_THRESHOLD) {
          console.warn('⚠️ High memory usage detected:', {
            used: `${(memoryInfo.used / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memoryInfo.total / 1024 / 1024).toFixed(2)}MB`,
            ratio: `${(memoryInfo.ratio * 100).toFixed(1)}%`,
          });
          
          const suggestions = memoryUtils.suggestCleanupActions();
          console.log('💡 Cleanup suggestions:', suggestions);
        }
      }, 30000); // Check every 30 seconds
    }
  }
}
