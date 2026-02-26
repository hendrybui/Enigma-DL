/**
 * Media Manager
 * Handles media items filtering, processing, and downloads
 */

/**
 * Filter media items based on type and size criteria
 * @param {Array} items - Media items to filter
 * @param {Object} filters - Filter criteria
 * @param {boolean} filters.filterImages - Include images
 * @param {boolean} filters.filterVideos - Include videos
 * @param {boolean} filters.filterAudio - Include audio
 * @param {boolean} filters.filterDocuments - Include documents
 * @param {number} filters.minSize - Minimum size in KB (converted to bytes)
 * @returns {Array} Filtered items
 */
export function filterMediaItems(items, filters) {
  const minSize = (parseInt(filters.minSize) || 0) * 1024; // Convert KB to bytes

  return items.filter(item => {
    if (!filters.filterImages && item.type === 'image') return false;
    if (!filters.filterVideos && item.type === 'video') return false;
    if (!filters.filterAudio && item.type === 'audio') return false;
    if (!filters.filterDocuments && item.type === 'document') return false;
    if (minSize > 0 && item.size && item.size < minSize) return false;
    return true;
  });
}

/**
 * Group media items by type with counts
 * @param {Array} items - Media items to analyze
 * @returns {Object} Stats object
 */
export function getMediaStats(items) {
  return {
    images: items.filter(i => i.type === 'image').length,
    videos: items.filter(i => i.type === 'video').length,
    audio: items.filter(i => i.type === 'audio').length,
    documents: items.filter(i => i.type === 'document').length
  };
}

/**
 * Download a media item
 * @param {Object} item - Media item to download
 * @param {string} filename - Filename for download
 * @param {boolean} [saveAs] - Show save-as dialog
 * @returns {Promise<number>} Download ID
 */
export async function downloadMediaItem(item, filename, saveAs = true) {
  return await chrome.downloads.download({
    url: item.url,
    filename: `ultimate-downloader/${filename}`,
    saveAs: saveAs
  });
}

/**
 * Download multiple media items
 * @param {Array} items - Items to download
 * @param {Function} getFilename - Function to generate filename from item
 * @returns {Promise<Array>} Download IDs
 */
export async function downloadMultipleItems(items, getFilename) {
  const downloadIds = [];

  for (const item of items) {
    const filename = getFilename(item);
    const downloadId = await downloadMediaItem(item, filename, false);
    downloadIds.push(downloadId);
  }

  return downloadIds;
}

/**
 * Update media item with new properties
 * @param {Array} items - Items array
 * @param {string} url - Item URL to update
 * @param {Object} updates - Properties to update
 * @returns {Array} Updated items
 */
export function updateMediaItem(items, url, updates) {
  return items.map(item =>
    item.url === url ? { ...item, ...updates } : item
  );
}

/**
 * Remove duplicate items by URL
 * @param {Array} items - Items to deduplicate
 * @returns {Array} Deduplicated items
 */
export function deduplicateByUrl(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
