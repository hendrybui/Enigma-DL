/**
 * Browser API Abstraction Layer
 * Provides a unified interface for Firefox and Chrome APIs
 * 
 * Usage: import { browserAPI } from './libs/browser-api.js';
 *        browserAPI.downloads.download({ url: '...' });
 */

// Detect which API is available (Firefox uses 'browser', Chrome uses 'chrome')
const API = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (!API) {
  throw new Error('Browser API not found. This extension requires Firefox or Chrome.');
}

/**
 * Unified browser API wrapper
 * Exposes common functionality across Firefox and Chrome
 */
export const browserAPI = {
  // Downloads API
  downloads: {
    /**
     * Download a file
     * @param {Object} options - Download options
     * @param {string} options.url - URL to download
     * @param {string} [options.filename] - Suggested filename
     * @param {string} [options.saveAs] - Show save as dialog (Firefox specific)
     * @returns {Promise<number>} Download ID
     */
    download: (options) => {
      return API.downloads.download(options);
    },

    /**
     * Register download change listener
     * @param {Function} callback - Called when download state changes
     */
    onChanged: (callback) => {
      API.downloads.onChanged.addListener(callback);
    },

    /**
     * Remove download change listener
     * @param {Function} callback - Callback to remove
     */
    offChanged: (callback) => {
      API.downloads.onChanged.removeListener(callback);
    },
  },

  // Storage API
  storage: {
    /**
     * Get value from local storage
     * @param {string|Object} keys - Key(s) to retrieve
     * @returns {Promise<Object>} Stored values
     */
    local: {
      get: (keys) => {
        return API.storage.local.get(keys);
      },

      /**
       * Set value in local storage
       * @param {Object} items - Key-value pairs to store
       * @returns {Promise<void>}
       */
      set: (items) => {
        return API.storage.local.set(items);
      },

      /**
       * Remove value from local storage
       * @param {string|Array} keys - Key(s) to remove
       * @returns {Promise<void>}
       */
      remove: (keys) => {
        return API.storage.local.remove(keys);
      },

      /**
       * Clear all local storage
       * @returns {Promise<void>}
       */
      clear: () => {
        return API.storage.local.clear();
      },
    },
  },

  // Tabs API
  tabs: {
    /**
     * Query tabs
     * @param {Object} queryInfo - Query criteria
     * @returns {Promise<Array>} Matching tabs
     */
    query: (queryInfo) => {
      return API.tabs.query(queryInfo);
    },

    /**
     * Get current tab
     * @returns {Promise<Object>} Current tab info
     */
    getCurrent: () => {
      return API.tabs.getCurrent();
    },
  },

  // Scripting API
  scripting: {
    /**
     * Execute script in content
     * @param {Object} options - Execution options
     * @param {number} options.target.tabId - Tab ID
     * @param {string|Function} options.func - Function to execute
     * @param {Array} [options.args] - Function arguments
     * @returns {Promise<Array>} Script results
     */
    executeScript: (options) => {
      return API.scripting.executeScript(options);
    },
  },

  // Extension API
  extension: {
    /**
     * Get extension URL
     * @param {string} path - Relative path
     * @returns {string} Absolute extension URL
     */
    getURL: (path) => {
      return API.runtime.getURL(path);
    },
  },

  // Notifications API (if available)
  notifications: API.notifications ? {
    /**
     * Create notification
     * @param {string} id - Notification ID
     * @param {Object} options - Notification options
     * @returns {Promise<string>} Notification ID
     */
    create: (id, options) => {
      return API.notifications.create(id, options);
    },

    /**
     * Listen for notification click
     * @param {Function} callback - Click handler
     */
    onClicked: (callback) => {
      API.notifications.onClicked.addListener(callback);
    },
  } : null,
};

// Export the raw API for direct access if needed
export { API };

// Default export
export default browserAPI;
