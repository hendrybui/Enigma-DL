/**
 * Theme Manager
 * Handles theme detection, switching, and persistence
 */

/**
 * Detect system color scheme preference
 * @returns {string} 'dark' or 'light'
 */
export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 * @param {string} theme - Theme to apply ('light' or 'dark')
 * @param {HTMLElement} [themeIcon] - Optional icon element to update
 */
export function applyTheme(theme, themeIcon = null) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);

  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/**
 * Get current applied theme
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Toggle between light and dark theme
 * @param {HTMLElement} [themeIcon] - Optional icon element to update
 * @returns {string} New theme
 */
export function toggleTheme(themeIcon = null) {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme, themeIcon);
  return newTheme;
}

/**
 * Set up system theme change listener
 * @param {Function} callback - Callback when theme changes
 */
export function watchSystemThemeChanges(callback) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    callback(e.matches ? 'dark' : 'light');
  });
}
