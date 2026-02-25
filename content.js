/**
 * Content Script for Ultimate All-Site Image & Video Downloader
 * Scans the page DOM to detect and extract all media elements
 */

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|bmp|ico|tiff?|heic|heif|avif|jxl|apng|jp2|j2k)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|og[gv]|mov|avi|mkv|flv|wmv|m4v|3gp|mpg|mpeg|mts?|m2ts|rm|rmvb|asf|divx|xvid)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|wav|flac|aac|ogg|m4a|wma|opus|aiff?|au|ra|amr|ac3|dts)(\?.*)?$/i;
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|csv|json|xml|html?)(\?.*)?$/i;

/**
 * Scan the page for all media elements and linked files
 */
function scanPage() {
  const seen = new Set();
  const items = [];

  function add(item) {
    if (!item.url || !item.url.startsWith('http') || seen.has(item.url)) return;
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
        height: img.naturalHeight || img.height || 0
      });
    }
    // srcset candidates
    if (img.srcset) {
      img.srcset.split(',').forEach(entry => {
        const u = entry.trim().split(/\s+/)[0];
        if (u) add({ url: u, type: 'image', name: '' });
      });
    }
  });

  // CSS background-image
  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const match = el.style.backgroundImage.match(/url\(\s*['"]?(https?[^'")\s]+)['"]?\s*\)/);
    if (match) add({ url: match[1], type: 'image', name: '' });
  });

  // <picture> <source> srcset
  document.querySelectorAll('picture source[srcset]').forEach(source => {
    const url = source.srcset.split(',')[0].trim().split(/\s+/)[0];
    if (url) add({ url, type: 'image', name: '' });
  });

  // <video> elements
  document.querySelectorAll('video').forEach(video => {
    const url = video.src || video.currentSrc;
    if (url) add({ url, type: 'video', name: video.title || '' });
    video.querySelectorAll('source[src]').forEach(s => {
      add({ url: s.src, type: 'video', name: '' });
    });
  });

  // <audio> elements
  document.querySelectorAll('audio').forEach(audio => {
    const url = audio.src || audio.currentSrc;
    if (url) add({ url, type: 'audio', name: '' });
    audio.querySelectorAll('source[src]').forEach(s => {
      add({ url: s.src, type: 'audio', name: '' });
    });
  });

  // YouTube / Vimeo iframes
  document.querySelectorAll('iframe[src]').forEach(iframe => {
    const src = iframe.src;
    if (/youtube\.com\/embed\//.test(src)) {
      const watchUrl = src.replace(/youtube\.com\/embed\/([^?&]+).*/, 'youtube.com/watch?v=$1');
      add({ url: 'https://www.' + watchUrl.replace(/^https?:\/\/(?:www\.)?/, ''), type: 'video', name: 'YouTube Video' });
    } else if (/vimeo\.com\/video\//.test(src)) {
      const id = src.match(/vimeo\.com\/video\/(\d+)/);
      if (id) add({ url: `https://vimeo.com/${id[1]}`, type: 'video', name: 'Vimeo Video' });
    }
  });

  // <a href> links to media files
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.href;
    if (!href || !href.startsWith('http')) return;
    const label = link.textContent.trim() || '';
    if (IMAGE_EXT.test(href)) {
      add({ url: href, type: 'image', name: label });
    } else if (VIDEO_EXT.test(href)) {
      add({ url: href, type: 'video', name: label });
    } else if (AUDIO_EXT.test(href)) {
      add({ url: href, type: 'audio', name: label });
    } else if (DOCUMENT_EXT.test(href)) {
      add({ url: href, type: 'document', name: label });
    }
  });

  return items;
}

// Listen for scan messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'scan') {
    const items = scanPage();
    sendResponse({ items });
    return true;
  }
});

