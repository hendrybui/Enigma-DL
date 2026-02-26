/**
 * Background Service Worker for Ultimate All-Site Image & Video Downloader
 * Handles context menus, download operations, and inter-component communication
 */

// Create context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'download-image',
    title: 'Download Image',
    contexts: ['image']
  });
  chrome.contextMenus.create({
    id: 'download-video',
    title: 'Download Video',
    contexts: ['video']
  });
  chrome.contextMenus.create({
    id: 'download-audio',
    title: 'Download Audio',
    contexts: ['audio']
  });
  chrome.contextMenus.create({
    id: 'download-link',
    title: 'Download Link',
    contexts: ['link']
  });
  chrome.contextMenus.create({
    id: 'download-all-media',
    title: 'Download All Media',
    contexts: ['page']
  });
  // Add "Don't Download" context menu for unselecting items
  chrome.contextMenus.create({
    id: 'dont-download',
    title: 'Don\'t Download This',
    contexts: ['image', 'video', 'audio', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'download-image' && info.srcUrl) {
    downloadFile(info.srcUrl, true);
  } else if (info.menuItemId === 'download-video' && info.srcUrl) {
    downloadFile(info.srcUrl, true);
  } else if (info.menuItemId === 'download-audio' && info.srcUrl) {
    downloadFile(info.srcUrl, true);
  } else if (info.menuItemId === 'download-link' && info.linkUrl) {
    downloadFile(info.linkUrl, true);
  } else if (info.menuItemId === 'download-all-media' && tab) {
    await downloadAllFromPage(tab);
  } else if (info.menuItemId === 'dont-download') {
    // Get the URL to ignore (could be srcUrl, linkUrl, etc.)
    const urlToIgnore = info.srcUrl || info.linkUrl || info.pageUrl;
    if (urlToIgnore) {
      // Store the ignored URL in chrome storage
      chrome.storage.sync.get({ ignoredUrls: [] }, (result) => {
        const ignoredUrls = result.ignoredUrls || [];
        if (!ignoredUrls.includes(urlToIgnore)) {
          ignoredUrls.push(urlToIgnore);
          chrome.storage.sync.set({ ignoredUrls });
        }
      });
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    handleScanPage(request.tabId).then(sendResponse);
    return true; // Keep channel open for async response
  }
});

// Scan a tab and return media items via the background (used by context menu)
async function handleScanPage(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    return await chrome.tabs.sendMessage(tabId, { action: 'scan' });
  } catch (e) {
    return { items: [] };
  }
}

// Download all media from a page
async function downloadAllFromPage(tab) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scan' });
    if (response && response.items) {
      for (const item of response.items) {
        downloadFile(item.url, false);
      }
    }
  } catch (e) {
    console.error('Download all media failed:', e);
  }
}

// Download a single file
function downloadFile(url, saveAs) {
  const filename = getFilenameFromUrl(url);
  chrome.downloads.download({
    url,
    filename: `ultimate-downloader/${filename}`,
    saveAs,
    conflictAction: 'uniquify'
  });
}

// Monitor downloads and update badge
chrome.downloads.onChanged.addListener(delta => {
  if (delta.state && delta.state.current === 'complete') {
    updateBadge();
  } else if (delta.state && delta.state.current === 'interrupted') {
    updateBadge();
  }
});

// Update action badge with active download count
async function updateBadge() {
  const downloads = await chrome.downloads.search({ state: 'in_progress' });
  const count = downloads.length;
  chrome.action.setBadgeText({ text: count > 0 ? `${count}` : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
}

// Helper: extract filename from URL
function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/');
    const name = parts[parts.length - 1].split('?')[0];
    return name || 'download';
  } catch {
    return 'download';
  }
}

