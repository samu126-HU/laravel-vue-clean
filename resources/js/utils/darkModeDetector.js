/**
 * Check if dark mode is currently enabled
 * @returns {boolean} True if dark mode is enabled, false otherwise
 */
export function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

/**
 * Watch for dark mode changes
 * @param {Function} callback - Function to call when dark mode changes
 * @returns {Function} Cleanup function to stop watching
 */
export function watchDarkMode(callback) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        callback(isDarkMode());
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Return cleanup function
  return () => observer.disconnect();
}
