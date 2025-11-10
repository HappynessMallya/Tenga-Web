// PostCSS configuration
// NativeWind PostCSS plugin is optional - only include if available
// For web builds, Tailwind works directly without NativeWind plugin

// Try to add NativeWind plugin if available (mainly for native builds)
let nativewindPlugin = {};
try {
  require.resolve('nativewind/postcss');
  nativewindPlugin = { 'nativewind/postcss': {} };
} catch (e) {
  // NativeWind PostCSS plugin not available - that's okay for web builds
  // Tailwind will work directly without it
}

module.exports = {
  plugins: {
    // NativeWind plugin first (if available)
    ...nativewindPlugin,

    // ✅ Tailwind core setup (works for both native and web)
    tailwindcss: {},
    autoprefixer: {},

    // ✅ Optional but supported by Expo Web
    'postcss-nested': {},
    'postcss-preset-env': {},
  },
};
