/**
 * Utility Functions
 * Helper functions used throughout the extension
 */

/**
 * Extract filename from URL
 * @param {string} url - URL to parse
 * @returns {string} Filename
 */
export function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/');
    const name = parts[parts.length - 1].split('?')[0];
    return name || 'download';
  } catch {
    return 'download';
  }
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 0) return ''; // -1 indicates fetch failure
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (MM:SS or HH:MM:SS)
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
