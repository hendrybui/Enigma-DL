/**
 * Background Script for Media Downloader Extension
 * Manages download operations, progress tracking, and notifications
 */

let activeDownloads = {}; // id -> {url, status, startTime, tabId}

/**
 * Listener from content script
 */
browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.cmd !== 'download') return;

  for (const item of msg.items) {
    const filename = await buildFilename(item, sender.tab);
    try {
      const dlId = await browser.downloads.download({
        url: item.url,
        filename,
        conflictAction: 'uniquify',
        saveAs: false,
      });
      activeDownloads[dlId] = { 
        url: item.url, 
        start: Date.now(),
        tabId: sender.tab.id 
      };
      updateBadge();
    } catch (e) {
      // notify content about failure immediately
      browser.tabs.sendMessage(sender.tab.id, {
        cmd: 'progress',
        id: null,
        url: item.url,
        status: 'error',
        error: e.message,
      }).catch(() => {
        // Tab might be closed, ignore error
      });
    }
  }
});

/**
 * Filename builder – timestamp + page title + index
 */
async function buildFilename(item, tab) {
  // Get user preferences
  let prefs = await browser.storage.sync.get({
    downloadFolder: 'media-downloads',
    namingPattern: '{timestamp}_{title}_{random}'
  });

  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  const pageTitle = (tab.title || 'page')
    .replace(/[^\w\-]/g, '_')
    .substring(0, 30);
  
  // Extract extension from URL or use default based on type
  const urlParts = item.url.split('?')[0].split('#')[0];
  const urlExt = urlParts.split('.').pop();
  let ext;
  
  // Validate extension or use type-based default
  if (urlExt && urlExt.length <= 5 && /^[a-z0-9]+$/i.test(urlExt)) {
    ext = urlExt;
  } else {
    // Default based on media type
    ext = item.type === 'video' ? 'mp4' : 'jpg';
  }
  
  const idx = Math.random().toString(36).substring(2, 6); // short random suffix

  // Build filename based on pattern
  let filename = prefs.namingPattern
    .replace('{timestamp}', ts)
    .replace('{title}', pageTitle)
    .replace('{random}', idx);

  // Sanitize filename to remove illegal characters
  filename = sanitizeFilename(filename);

  // Add folder and extension
  return `${prefs.downloadFolder}/${filename}.${ext}`;
}

/**
 * Sanitize filename to remove illegal characters
 */
function sanitizeFilename(filename) {
  // Remove or replace characters that are illegal on most file systems
  return filename
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Track download progress
 */
browser.downloads.onChanged.addListener(change => {
  const info = activeDownloads[change.id];
  if (!info) return;

  if (change.state && change.state.current === 'complete') {
    // notify content
    browser.tabs.sendMessage(info.tabId, {
      cmd: 'progress',
      id: change.id,
      url: info.url,
      status: 'complete',
    }).catch(() => {
      // Tab might be closed, ignore error
    });
    
    delete activeDownloads[change.id];
    updateBadge();
    
    // Optional notification
    browser.storage.sync.get({ showNotifications: true }).then(prefs => {
      if (prefs.showNotifications) {
        browser.notifications.create({
          type: 'basic',
          title: 'Download finished',
          message: `Media file saved successfully`,
          iconUrl: browser.runtime.getURL('icons/icon-48.png')
        });
      }
    });
  } else if (change.state && change.state.current === 'interrupted') {
    // failure case
    browser.tabs.sendMessage(info.tabId, {
      cmd: 'progress',
      id: change.id,
      url: info.url,
      status: 'error',
      error: change.error ? change.error.current : 'interrupted',
    }).catch(() => {
      // Tab might be closed, ignore error
    });
    
    delete activeDownloads[change.id];
    updateBadge();
  } else if (change.bytesReceived) {
    // optional: send progress percentages using change.bytesReceived
    browser.tabs.sendMessage(info.tabId, {
      cmd: 'progress',
      id: change.id,
      url: info.url,
      status: 'downloading',
      received: change.bytesReceived.current,
      total: change.totalBytes ? change.totalBytes.current : undefined,
    }).catch(() => {
      // Tab might be closed, ignore error
    });
  }
});

/**
 * Update badge number
 */
function updateBadge() {
  const count = Object.keys(activeDownloads).length;
  browser.browserAction.setBadgeText({ text: count ? `${count}` : '' });
  browser.browserAction.setBadgeBackgroundColor({ color: '#0a84ff' });
}

// Initialize badge on startup
updateBadge();
