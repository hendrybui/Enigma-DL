/**
 * Popup Script for Media Downloader Settings
 */

// Default settings
const defaults = {
  downloadFolder: 'media-downloads',
  namingPattern: '{timestamp}_{title}_{random}',
  showNotifications: true
};

// Load current settings
async function loadSettings() {
  const settings = await browser.storage.sync.get(defaults);
  
  document.getElementById('downloadFolder').value = settings.downloadFolder;
  document.getElementById('namingPattern').value = settings.namingPattern;
  document.getElementById('showNotifications').checked = settings.showNotifications;
}

// Save settings
async function saveSettings() {
  const downloadFolder = document.getElementById('downloadFolder').value.trim();
  const namingPattern = document.getElementById('namingPattern').value.trim();
  
  const settings = {
    downloadFolder: downloadFolder !== '' ? downloadFolder : defaults.downloadFolder,
    namingPattern: namingPattern !== '' ? namingPattern : defaults.namingPattern,
    showNotifications: document.getElementById('showNotifications').checked
  };

  try {
    await browser.storage.sync.set(settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Reset to defaults
async function resetSettings() {
  try {
    await browser.storage.sync.set(defaults);
    await loadSettings();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    showStatus('Error resetting settings: ' + error.message, 'error');
  }
}

// Open media panel on the active tab
async function openMediaPanel() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      await browser.tabs.sendMessage(tabs[0].id, { cmd: 'toggle' });
      window.close();
    }
  } catch (error) {
    showStatus('Could not open panel on this page', 'error');
  }
}

// Show status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';

  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Event listeners
document.getElementById('openPanelBtn').addEventListener('click', openMediaPanel);
document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('resetBtn').addEventListener('click', resetSettings);

// Load settings on popup open
loadSettings();
