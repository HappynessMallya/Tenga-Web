/**
 * Performance Optimization Configuration
 * This file contains all performance-related settings for the Tenga Customer App
 */

module.exports = {
  // Bundle optimization settings
  bundle: {
    // Enable code splitting
    enableCodeSplitting: true,
    // Maximum bundle size in bytes (2MB)
    maxBundleSize: 2 * 1024 * 1024,
    // Enable tree shaking
    enableTreeShaking: true,
    // Remove dead code
    removeDeadCode: true,
    // Minify in production
    minifyInProduction: true,
  },

  // Asset optimization
  assets: {
    // Compress images
    compressImages: true,
    // Image quality for compression (0-100)
    imageQuality: 80,
    // Enable lazy loading for images
    enableLazyLoading: true,
    // Preload critical assets
    preloadCriticalAssets: ['icon.png', 'splash-icon.png'],
  },

  // Network optimization
  network: {
    // Enable request caching
    enableCaching: true,
    // Cache duration in milliseconds (24 hours)
    cacheDuration: 24 * 60 * 60 * 1000,
    // Enable request debouncing
    enableDebouncing: true,
    // Debounce delay in milliseconds
    debounceDelay: 300,
    // Enable request compression
    enableCompression: true,
  },

  // Memory optimization
  memory: {
    // Enable memory profiling in development
    enableProfiling: process.env.NODE_ENV === 'development',
    // Maximum memory usage warning threshold (50MB)
    memoryThreshold: 50 * 1024 * 1024,
    // Enable automatic garbage collection
    enableGC: true,
    // Clear unused components cache
    clearUnusedCache: true,
  },

  // Animation optimization
  animations: {
    // Use native driver for animations
    useNativeDriver: true,
    // Reduce motion for accessibility
    respectReduceMotion: true,
    // Animation duration scale
    durationScale: 1.0,
    // Enable 60fps animations
    enable60FPS: true,
  },

  // Database optimization
  database: {
    // Enable query caching
    enableQueryCaching: true,
    // Connection pool size
    connectionPoolSize: 5,
    // Query timeout in milliseconds
    queryTimeout: 10000,
    // Enable connection reuse
    reuseConnections: true,
  },

  // Development optimizations
  development: {
    // Enable fast refresh
    enableFastRefresh: true,
    // Hot reload delay
    hotReloadDelay: 200,
    // Enable source maps
    enableSourceMaps: true,
    // Development server port
    devServerPort: 8081,
  },

  // Production optimizations
  production: {
    // Remove console logs
    removeConsoleLogs: true,
    // Enable advanced minification
    enableAdvancedMinification: true,
    // Enable compression
    enableCompression: true,
    // Enable bundle analysis
    enableBundleAnalysis: false,
  },

  // Platform-specific optimizations
  platforms: {
    ios: {
      // Enable Hermes engine
      enableHermes: true,
      // Enable metal rendering
      enableMetal: true,
      // Memory management mode
      memoryMode: 'balanced',
    },
    android: {
      // Enable Hermes engine
      enableHermes: true,
      // Enable R8 optimization
      enableR8: true,
      // Proguard optimization level
      proguardLevel: 'optimize',
    },
    web: {
      // Enable service worker
      enableServiceWorker: true,
      // Enable PWA features
      enablePWA: false,
      // Code splitting strategy
      codeSplittingStrategy: 'route-based',
    },
  },

  // Monitoring and analytics
  monitoring: {
    // Enable performance monitoring
    enablePerformanceMonitoring: true,
    // Enable crash reporting
    enableCrashReporting: true,
    // Sample rate for performance metrics
    performanceSampleRate: 0.1,
    // Enable user interaction tracking
    enableInteractionTracking: false,
  },
};
