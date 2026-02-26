/**
 * Storage Manager
 * Handles all storage operations for settings and preferences
 */

/**
 * Load filter settings from local storage
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
  return await chrome.storage.local.get({
    filterImages: true,
    filterVideos: true,
    filterAudio: true,
    filterDocuments: true,
    minSize: 0
  });
}

/**
 * Save filter settings to local storage
 * @param {Object} filters - Filter preferences
 * @returns {Promise<void>}
 */
export async function saveSettings(filters) {
  return await chrome.storage.local.set(filters);
}

/**
 * Load theme preference from storage
 * @returns {Promise<string>} Theme ('light', 'dark', or 'system')
 */
export async function loadThemePreference() {
  const settings = await chrome.storage.sync.get({ theme: 'system' });
  return settings.theme;
}

/**
 * Save theme preference to storage
 * @param {string} theme - Theme to save
 * @returns {Promise<void>}
 */
export async function saveThemePreference(theme) {
  return await chrome.storage.sync.set({ theme });
}

/**
 * Load download history
 * @returns {Promise<Array>} Download history
 */
export async function loadDownloadHistory() {
  const data = await chrome.storage.local.get({ downloadHistory: [] });
  return data.downloadHistory;
}

/**
 * Save download history
 * @param {Array} history - Download history to save
 * @returns {Promise<void>}
 */
export async function saveDownloadHistory(history) {
  return await chrome.storage.local.set({ downloadHistory: history });
}

/**
 * Add download to history
 * @param {Object} download - Download object
 * @returns {Promise<void>}
 */
export async function addToDownloadHistory(download) {
  const history = await loadDownloadHistory();
  history.unshift({
    ...download,
    timestamp: new Date().toISOString()
  });
  // Keep only last 100 downloads
  if (history.length > 100) {
    history.pop();
  }
  await saveDownloadHistory(history);
}
