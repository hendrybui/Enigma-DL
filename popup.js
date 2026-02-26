/**
 * Popup Script for Ultimate All-Site Image & Video Downloader
 * Refactored with modular architecture
 */

import {
  getSystemTheme,
  applyTheme,
  getCurrentTheme,
  toggleTheme as toggleThemeLib,
  watchSystemThemeChanges
} from './libs/theme-manager.js';
import {
  loadSettings,
  saveSettings,
  loadThemePreference,
  saveThemePreference
} from './libs/storage-manager.js';
import {
  filterMediaItems,
  getMediaStats,
  downloadMediaItem,
  downloadMultipleItems
} from './libs/media-manager.js';
import {
  createMediaCard,
  renderMediaList,
  updateStatsDisplay,
  setStatusMessage,
  setButtonDisabled
} from './libs/ui-renderer.js';
import {
  getFilenameFromUrl
} from './libs/utils.js';

// ============ State Management ============
let mediaItems = [];
let filteredItems = [];
let selectedItems = new Set();
let currentFilters = {};
let scanInProgress = false;

// ============ DOM References ============
const domElements = {
  scanBtn: document.getElementById('scanBtn'),
  downloadAllBtn: document.getElementById('downloadAllBtn'),
  filterImages: document.getElementById('filterImages'),
  filterVideos: document.getElementById('filterVideos'),
  filterAudio: document.getElementById('filterAudio'),
  filterDocuments: document.getElementById('filterDocuments'),
  minSizeInput: document.getElementById('minSize'),
  mediaListEl: document.getElementById('mediaList'),
  statsImages: document.getElementById('statsImages'),
  statsVideos: document.getElementById('statsVideos'),
  statsAudio: document.getElementById('statsAudio'),
  statsDocs: document.getElementById('statsDocs'),
  statusMsg: document.getElementById('statusMsg'),
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.querySelector('.theme-icon'),
  clearBtn: document.getElementById('clearBtn'),
  selectAllBtn: document.getElementById('selectAllBtn'),
  deselectAllBtn: document.getElementById('deselectAllBtn')
};

// ============ Initialization ============
async function init() {
  await initTheme();
  await initSettings();
  setupEventListeners();
  renderUI();
}

/**
 * Initialize theme
 */
async function initTheme() {
  const themePreference = await loadThemePreference();
  const theme = themePreference === 'system'
    ? getSystemTheme()
    : themePreference;
  applyTheme(theme, domElements.themeIcon);

  // Watch for system theme changes
  watchSystemThemeChanges(async (systemTheme) => {
    const preference = await loadThemePreference();
    if (preference === 'system') {
      applyTheme(systemTheme, domElements.themeIcon);
    }
  });
}

/**
 * Initialize settings from storage
 */
async function initSettings() {
  const settings = await loadSettings();
  domElements.filterImages.checked = settings.filterImages;
  domElements.filterVideos.checked = settings.filterVideos;
  domElements.filterAudio.checked = settings.filterAudio;
  domElements.filterDocuments.checked = settings.filterDocuments;
  domElements.minSizeInput.value = settings.minSize;

  currentFilters = {
    filterImages: settings.filterImages,
    filterVideos: settings.filterVideos,
    filterAudio: settings.filterAudio,
    filterDocuments: settings.filterDocuments,
    minSize: settings.minSize
  };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  domElements.scanBtn.addEventListener('click', scanPage);
  domElements.downloadAllBtn.addEventListener('click', downloadAll);
  domElements.filterImages.addEventListener('change', applyFilters);
  domElements.filterVideos.addEventListener('change', applyFilters);
  domElements.filterAudio.addEventListener('change', applyFilters);
  domElements.filterDocuments.addEventListener('change', applyFilters);
  domElements.minSizeInput.addEventListener('input', applyFilters);
  domElements.themeToggle.addEventListener('click', toggleTheme);
  domElements.clearBtn.addEventListener('click', clearAll);
  domElements.selectAllBtn.addEventListener('click', selectAll);
  domElements.deselectAllBtn.addEventListener('click', deselectAll);
}

// ============ Theme Management ============
async function toggleTheme() {
  const newTheme = toggleThemeLib(domElements.themeIcon);
  await saveThemePreference(newTheme);
}

// ============ Scanning ============
async function scanPage() {
  if (scanInProgress) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  scanInProgress = true;
  domElements.scanBtn.disabled = true;
  domElements.scanBtn.textContent = '🔄 Scanning...';
  setStatusMessage(domElements.statusMsg, 'Scanning page...');

  try {
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Request scan results
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scan' });

    if (response && response.items) {
      mediaItems = response.items;
      applyFilters();
      setStatusMessage(domElements.statusMsg, `Found ${mediaItems.length} media item${mediaItems.length !== 1 ? 's' : ''}`);
    } else {
      setStatusMessage(domElements.statusMsg, 'No media found on this page');
    }
  } catch (e) {
    console.error('Scan error:', e);
    setStatusMessage(domElements.statusMsg, 'Scan failed: ' + (e.message || 'unknown error'));
  } finally {
    scanInProgress = false;
    domElements.scanBtn.disabled = false;
    domElements.scanBtn.textContent = '🔍 Scan Page';
  }
}

// ============ Filtering ============
function applyFilters() {
  // Update current filters
  currentFilters = {
    filterImages: domElements.filterImages.checked,
    filterVideos: domElements.filterVideos.checked,
    filterAudio: domElements.filterAudio.checked,
    filterDocuments: domElements.filterDocuments.checked,
    minSize: parseInt(domElements.minSizeInput.value) || 0
  };

  // Apply filters
  filteredItems = filterMediaItems(mediaItems, currentFilters);

  // Update UI
  renderUI();

  // Save settings
  saveSettings(currentFilters);
}

// ============ UI Rendering ============
function renderUI() {
  renderMediaList();
  updateStats();
}

function renderMediaList() {
  const isEmpty = mediaItems.length === 0;
  setButtonDisabled(domElements.downloadAllBtn, isEmpty);

  if (isEmpty) {
    domElements.mediaListEl.innerHTML = '<div class="empty-state"><span>No media found</span><small>Click "Scan Page" to discover media</small></div>';
    return;
  }

  domElements.mediaListEl.innerHTML = '';
  filteredItems.forEach(item => {
    const card = createMediaCard(
      item,
      selectedItems.has(item.url),
      handleCheckboxChange,
      handlePreview,
      downloadItem
    );
    domElements.mediaListEl.appendChild(card);
  });
}

function updateStats() {
  const stats = getMediaStats(mediaItems);
  updateStatsDisplay({
    images: domElements.statsImages,
    videos: domElements.statsVideos,
    audio: domElements.statsAudio,
    docs: domElements.statsDocs
  }, stats);
}

// ============ Selection Management ============
function handleCheckboxChange(checked, url) {
  if (checked) {
    selectedItems.add(url);
  } else {
    selectedItems.delete(url);
  }
  updateSelectionCount();
  renderMediaList();
}

function updateSelectionCount() {
  const count = selectedItems.size;
  if (count > 0) {
    setStatusMessage(domElements.statusMsg, `${count} item${count !== 1 ? 's' : ''} selected`);
  }
}

function selectAll() {
  filteredItems.forEach(item => selectedItems.add(item.url));
  renderMediaList();
  updateSelectionCount();
}

function deselectAll() {
  selectedItems.clear();
  renderMediaList();
  updateSelectionCount();
}

// ============ Downloads ============
async function downloadItem(item) {
  const filename = getFilenameFromUrl(item.url);
  await downloadMediaItem(item, filename, true);
}

async function downloadAll() {
  // Determine which items to download
  const itemsToDownload = selectedItems.size > 0
    ? filteredItems.filter(item => selectedItems.has(item.url))
    : filteredItems;

  if (itemsToDownload.length === 0) return;

  setStatusMessage(domElements.statusMsg, `Downloading ${itemsToDownload.length} file${itemsToDownload.length !== 1 ? 's' : ''}...`);

  await downloadMultipleItems(itemsToDownload, getFilenameFromUrl);

  // Clear selection after download
  selectedItems.clear();
  renderMediaList();
}

// ============ Utility Functions ============
function handlePreview(item) {
  chrome.tabs.create({ url: item.url });
}

function clearAll() {
  mediaItems = [];
  filteredItems = [];
  selectedItems.clear();
  renderUI();
  setStatusMessage(domElements.statusMsg, '');
}

// ============ Start Application ============
init();

