/**
 * CLEAR CACHE CONSOLE SCRIPT
 * 
 * Copy and paste this entire script into your browser console (F12 -> Console tab)
 * to manually clear all cached data.
 * 
 * This will:
 * 1. Clear localStorage
 * 2. Clear sessionStorage
 * 3. Reload the page
 */

(function() {
  console.log('🧹 Starting cache clear...');
  
  // Show what's currently stored
  console.log('📦 Current localStorage keys:', Object.keys(localStorage));
  
  // Clear everything
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('✅ Cache cleared successfully!');
  console.log('🔄 Reloading page in 2 seconds...');
  
  // Wait 2 seconds then reload
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})();

