/**
 * Popup Script for Ultimate All-Site Image & Video Downloader
 */

let mediaItems = [];
let filteredItems = [];

// DOM references
const scanBtn = document.getElementById('scanBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const filterImages = document.getElementById('filterImages');
const filterVideos = document.getElementById('filterVideos');
const filterAudio = document.getElementById('filterAudio');
const filterDocuments = document.getElementById('filterDocuments');
const minSizeInput = document.getElementById('minSize');
const mediaListEl = document.getElementById('mediaList');
const statsImages = document.getElementById('statsImages');
const statsVideos = document.getElementById('statsVideos');
const statsAudio = document.getElementById('statsAudio');
const statsDocs = document.getElementById('statsDocs');
const statusMsg = document.getElementById('statusMsg');

// Load saved filter settings
async function loadSettings() {
  const settings = await chrome.storage.local.get({
    filterImages: true,
    filterVideos: true,
    filterAudio: true,
    filterDocuments: true,
    minSize: 0
  });
  filterImages.checked = settings.filterImages;
  filterVideos.checked = settings.filterVideos;
  filterAudio.checked = settings.filterAudio;
  filterDocuments.checked = settings.filterDocuments;
  minSizeInput.value = settings.minSize;
}

// Save filter settings
function saveSettings() {
  chrome.storage.local.set({
    filterImages: filterImages.checked,
    filterVideos: filterVideos.checked,
    filterAudio: filterAudio.checked,
    filterDocuments: filterDocuments.checked,
    minSize: parseInt(minSizeInput.value) || 0
  });
}

// Scan current page
async function scanPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  scanBtn.disabled = true;
  scanBtn.textContent = '🔄 Scanning...';
  setStatus('Scanning page...');

  try {
    // Inject content script into the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Ask content script to scan and return results
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scan' });

    if (response && response.items) {
      mediaItems = response.items;
      applyFilters();
      updateStats();
      setStatus(`Found ${mediaItems.length} media item${mediaItems.length !== 1 ? 's' : ''}`);
    } else {
      setStatus('No media found on this page');
    }
  } catch (e) {
    setStatus('Scan failed: ' + (e.message || 'unknown error'));
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = '🔍 Scan Page';
  }
}

// Apply filters and re-render
function applyFilters() {
  const minSize = (parseInt(minSizeInput.value) || 0) * 1024; // convert KB to bytes

  filteredItems = mediaItems.filter(item => {
    if (!filterImages.checked && item.type === 'image') return false;
    if (!filterVideos.checked && item.type === 'video') return false;
    if (!filterAudio.checked && item.type === 'audio') return false;
    if (!filterDocuments.checked && item.type === 'document') return false;
    if (minSize > 0 && item.size && item.size < minSize) return false;
    return true;
  });

  renderList();
  saveSettings();
}

// Update statistics display
function updateStats() {
  statsImages.textContent = mediaItems.filter(i => i.type === 'image').length + ' images';
  statsVideos.textContent = mediaItems.filter(i => i.type === 'video').length + ' videos';
  statsAudio.textContent = mediaItems.filter(i => i.type === 'audio').length + ' audio';
  statsDocs.textContent = mediaItems.filter(i => i.type === 'document').length + ' docs';
}

// Render media list
function renderList() {
  mediaListEl.innerHTML = '';

  if (filteredItems.length === 0) {
    mediaListEl.innerHTML = '<div class="empty-state">No media found. Click "Scan Page" to discover media.</div>';
    downloadAllBtn.disabled = true;
    return;
  }

  filteredItems.forEach(item => {
    const card = createMediaCard(item);
    mediaListEl.appendChild(card);
  });

  downloadAllBtn.disabled = false;
}

// Create a media card element
function createMediaCard(item) {
  const card = document.createElement('div');
  card.className = 'media-card';

  // Thumbnail
  const thumb = document.createElement('div');
  thumb.className = 'media-thumb';

  if (item.type === 'image') {
    const img = document.createElement('img');
    img.src = item.url;
    img.loading = 'lazy';
    img.alt = item.name || '';
    img.onerror = () => { img.style.display = 'none'; thumb.textContent = '🖼️'; };
    thumb.appendChild(img);
  } else {
    const icon = document.createElement('span');
    icon.className = 'media-icon';
    icon.textContent = item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📄';
    thumb.appendChild(icon);
  }
  card.appendChild(thumb);

  // Info
  const info = document.createElement('div');
  info.className = 'media-info';

  const name = document.createElement('div');
  name.className = 'media-name';
  name.textContent = item.name || getFilenameFromUrl(item.url);
  name.title = item.url;
  info.appendChild(name);

  const meta = document.createElement('div');
  meta.className = 'media-meta';

  const typeTag = document.createElement('span');
  typeTag.className = 'meta-type';
  typeTag.textContent = item.type;
  meta.appendChild(typeTag);

  if (item.width && item.height) {
    const dim = document.createElement('span');
    dim.textContent = `${item.width}×${item.height}`;
    meta.appendChild(dim);
  }
  if (item.size) {
    const sz = document.createElement('span');
    sz.textContent = formatSize(item.size);
    meta.appendChild(sz);
  }
  info.appendChild(meta);
  card.appendChild(info);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'media-actions';

  const previewBtn = document.createElement('button');
  previewBtn.title = 'Preview in new tab';
  previewBtn.textContent = '👁️';
  previewBtn.addEventListener('click', () => chrome.tabs.create({ url: item.url }));
  actions.appendChild(previewBtn);

  const dlBtn = document.createElement('button');
  dlBtn.title = 'Download';
  dlBtn.textContent = '⬇️';
  dlBtn.addEventListener('click', () => downloadItem(item));
  actions.appendChild(dlBtn);

  card.appendChild(actions);
  return card;
}

// Download a single item
function downloadItem(item) {
  const filename = getFilenameFromUrl(item.url);
  chrome.downloads.download({
    url: item.url,
    filename: `ultimate-downloader/${filename}`,
    saveAs: true
  });
}

// Download all filtered items
function downloadAll() {
  if (filteredItems.length === 0) return;
  filteredItems.forEach(item => {
    const filename = getFilenameFromUrl(item.url);
    chrome.downloads.download({
      url: item.url,
      filename: `ultimate-downloader/${filename}`,
      saveAs: false
    });
  });
  setStatus(`Downloading ${filteredItems.length} file${filteredItems.length !== 1 ? 's' : ''}...`);
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

// Helper: format bytes to human-readable size
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Show status message
function setStatus(msg) {
  statusMsg.textContent = msg;
}

// Event listeners
scanBtn.addEventListener('click', scanPage);
downloadAllBtn.addEventListener('click', downloadAll);
filterImages.addEventListener('change', applyFilters);
filterVideos.addEventListener('change', applyFilters);
filterAudio.addEventListener('change', applyFilters);
filterDocuments.addEventListener('change', applyFilters);
minSizeInput.addEventListener('input', applyFilters);

document.getElementById('clearBtn').addEventListener('click', () => {
  mediaItems = [];
  filteredItems = [];
  renderList();
  updateStats();
  setStatus('');
});

// Initialize
loadSettings();
renderList();
updateStats();

