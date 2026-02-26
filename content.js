/**
 * Content Script for Ultimate All-Site Image & Video Downloader
 * Scans the page DOM to detect and extract all media elements
 */

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|ico|tiff?|heic|heif|avif|jxl|apng|jp2|j2k|svg)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|og[gv]|mov|avi|mkv|flv|wmv|m4v|3gp|mpg|mpeg|mts?|m2ts|rm|rmvb|asf|divx|xvid)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|wav|flac|aac|ogg|m4a|wma|opus|aiff?|au|ra|amr|ac3|dts)(\?.*)?$/i;
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|csv|json|xml|html?)(\?.*)?$/i;

/**
 * Extract format/MIME type from URL or element
 */
function getFormatFromUrl(url) {
  const match = url.match(/\.(jpe?g|png|gif|webp|bmp|ico|tiff?|heic|heif|avif|jxl|apng|jp2|j2k|svg|mp4|webm|og[gv]|mov|avi|mkv|flv|wmv|m4v|3gp|mpg|mpeg|mp3|wav|flac|aac|ogg|m4a|wma|opus|aiff?|au|ra|amr|ac3|dts|pdf|docx?|xlsx?|pptx?|txt|rtf|csv|json|xml|html?)(\?.*)?$/i);
  if (match) {
    const ext = match[1].toLowerCase();
    // Map common extensions to MIME types
    const mimeMap = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
      'webp': 'image/webp', 'svg': 'image/svg+xml', 'bmp': 'image/bmp', 'ico': 'image/x-icon',
      'mp4': 'video/mp4', 'webm': 'video/webm', 'ogg': 'video/ogg', 'ogv': 'video/ogg',
      'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac', 'aac': 'audio/aac',
      'm4a': 'audio/mp4', 'opus': 'audio/opus', 'pdf': 'application/pdf'
    };
    return mimeMap[ext] || `${ext}`;
  }
  return 'unknown';
}

/**
 * Scan the page for all media elements and linked files
 * @param {Set} ignoredUrls - Set of URLs to exclude from results
 */
function scanPage(ignoredUrls = new Set()) {
  const seen = new Set();
  const items = [];

  function add(item) {
    if (!item.url || !item.url.startsWith('http') || seen.has(item.url)) return;
    if (ignoredUrls.has(item.url)) return; // Skip ignored URLs
    seen.add(item.url);
    items.push(item);
  }

  // <img> elements
  document.querySelectorAll('img').forEach(img => {
    const url = img.currentSrc || img.src;
    if (url) {
      add({
        url,
        type: 'image',
        name: img.alt || img.title || '',
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0,
        format: getFormatFromUrl(url)
      });
    }
    // srcset candidates
    if (img.srcset) {
      img.srcset.split(',').forEach(entry => {
        const u = entry.trim().split(/\s+/)[0];
        if (u) add({ url: u, type: 'image', name: '', format: getFormatFromUrl(u) });
      });
    }
  });

  // CSS background-image
  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const match = el.style.backgroundImage.match(/url\(\s*['"]?(https?[^'")\s]+)['"]?\s*\)/);
    if (match) add({ url: match[1], type: 'image', name: '', format: getFormatFromUrl(match[1]) });
  });

  // <picture> <source> srcset
  document.querySelectorAll('picture source[srcset]').forEach(source => {
    const url = source.srcset.split(',')[0].trim().split(/\s+/)[0];
    if (url) add({ url, type: 'image', name: '', format: getFormatFromUrl(url) });
  });

  // <video> elements
  document.querySelectorAll('video').forEach(video => {
    const url = video.src || video.currentSrc;
    const duration = video.duration || 0;
    if (url) {
      add({
        url,
        type: 'video',
        name: video.title || '',
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
        duration: duration > 0 ? duration : 0,
        format: getFormatFromUrl(url)
      });
    }
    video.querySelectorAll('source[src]').forEach(s => {
      add({ url: s.src, type: 'video', name: '', format: s.type || getFormatFromUrl(s.src) });
    });
  });

  // <audio> elements
  document.querySelectorAll('audio').forEach(audio => {
    const url = audio.src || audio.currentSrc;
    const duration = audio.duration || 0;
    if (url) {
      add({
        url,
        type: 'audio',
        name: '',
        duration: duration > 0 ? duration : 0,
        format: getFormatFromUrl(url)
      });
    }
    audio.querySelectorAll('source[src]').forEach(s => {
      add({ url: s.src, type: 'audio', name: '', format: s.type || getFormatFromUrl(s.src) });
    });
  });

  // YouTube / Vimeo iframes
  document.querySelectorAll('iframe[src]').forEach(iframe => {
    const src = iframe.src;
    if (/youtube\.com\/embed\//.test(src)) {
      const watchUrl = src.replace(/youtube\.com\/embed\/([^?&]+).*/, 'youtube.com/watch?v=$1');
      add({ url: 'https://www.' + watchUrl.replace(/^https?:\/\/(?:www\.)?/, ''), type: 'video', name: 'YouTube Video', format: 'video/youtube' });
    } else if (/vimeo\.com\/video\//.test(src)) {
      const id = src.match(/vimeo\.com\/video\/(\d+)/);
      if (id) add({ url: `https://vimeo.com/${id[1]}`, type: 'video', name: 'Vimeo Video', format: 'video/vimeo' });
    }
  });

  // <a href> links to media files
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.href;
    if (!href || !href.startsWith('http')) return;
    const label = link.textContent.trim() || '';
    if (IMAGE_EXT.test(href)) {
      add({ url: href, type: 'image', name: label, format: getFormatFromUrl(href) });
    } else if (VIDEO_EXT.test(href)) {
      add({ url: href, type: 'video', name: label, format: getFormatFromUrl(href) });
    } else if (AUDIO_EXT.test(href)) {
      add({ url: href, type: 'audio', name: label, format: getFormatFromUrl(href) });
    } else if (DOCUMENT_EXT.test(href)) {
      add({ url: href, type: 'document', name: label, format: getFormatFromUrl(href) });
    }
  });

  return items;
}

// Listen for scan messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'scan') {
    // Get ignored URLs from storage, then scan
    chrome.storage.sync.get({ ignoredUrls: [] }, (result) => {
      const ignoredUrls = new Set(result.ignoredUrls || []);
      const items = scanPage(ignoredUrls);
      sendResponse({ items });
    });
    return true; // Keep channel open for async response
  }
});

