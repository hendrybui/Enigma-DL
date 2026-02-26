/**
 * UI Renderer
 * Handles DOM manipulation and UI rendering
 */

import { formatSize, formatDuration, getFilenameFromUrl } from './utils.js';

/**
 * Create a media card element
 * @param {Object} item - Media item
 * @param {boolean} isSelected - Whether item is selected
 * @param {Function} onCheckboxChange - Checkbox change handler
 * @param {Function} onPreview - Preview button handler
 * @param {Function} onDownload - Download button handler
 * @returns {HTMLElement} Media card element
 */
export function createMediaCard(item, isSelected, onCheckboxChange, onPreview, onDownload) {
  const card = document.createElement('div');
  card.className = 'media-card';
  if (isSelected) {
    card.classList.add('selected');
  }

  // Checkbox for selection
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'media-checkbox';
  checkbox.checked = isSelected;
  checkbox.addEventListener('change', (e) => onCheckboxChange(e.target.checked, item.url));
  card.appendChild(checkbox);

  // Thumbnail
  const thumb = document.createElement('div');
  thumb.className = 'media-thumb';

  if (item.type === 'image') {
    const img = document.createElement('img');
    img.src = item.url;
    img.loading = 'lazy';
    img.alt = item.name || '';
    img.onerror = () => {
      img.style.display = 'none';
      thumb.textContent = '🖼️';
    };
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
  if (item.duration) {
    const dur = document.createElement('span');
    dur.textContent = formatDuration(item.duration);
    meta.appendChild(dur);
  }
  if (item.size) {
    const sz = document.createElement('span');
    sz.textContent = formatSize(item.size);
    meta.appendChild(sz);
  }
  if (item.format) {
    const fmt = document.createElement('span');
    fmt.textContent = item.format.split('/')[1] || item.format;
    fmt.style.opacity = '0.7';
    meta.appendChild(fmt);
  }
  info.appendChild(meta);
  card.appendChild(info);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'media-actions';

  const previewBtn = document.createElement('button');
  previewBtn.title = 'Preview in new tab';
  previewBtn.textContent = '👁️';
  previewBtn.addEventListener('click', () => onPreview(item));
  actions.appendChild(previewBtn);

  const dlBtn = document.createElement('button');
  dlBtn.title = 'Download';
  dlBtn.textContent = '⬇️';
  dlBtn.addEventListener('click', () => onDownload(item));
  actions.appendChild(dlBtn);

  card.appendChild(actions);
  return card;
}

/**
 * Render media list to container
 * @param {HTMLElement} container - Container element
 * @param {Array} items - Media items to render
 * @param {Function} createCard - Card creation function
 * @param {boolean} isEmpty - Whether list is empty
 */
export function renderMediaList(container, items, createCard, isEmpty = false) {
  container.innerHTML = '';

  if (isEmpty || items.length === 0) {
    container.innerHTML = '<div class="empty-state"><span>No media found</span><small>Click "Scan Page" to discover media</small></div>';
    return;
  }

  items.forEach(item => {
    container.appendChild(createCard(item));
  });
}

/**
 * Update stats display
 * @param {Object} statsElements - DOM elements for stats
 * @param {Object} stats - Stats object with counts
 */
export function updateStatsDisplay(statsElements, stats) {
  statsElements.images.textContent = '📷 ' + stats.images;
  statsElements.videos.textContent = '🎬 ' + stats.videos;
  statsElements.audio.textContent = '🎵 ' + stats.audio;
  statsElements.docs.textContent = '📄 ' + stats.documents;
}

/**
 * Set status message
 * @param {HTMLElement} statusElement - Status message element
 * @param {string} message - Message to display
 */
export function setStatusMessage(statusElement, message) {
  statusElement.textContent = message;
}

/**
 * Toggle button disabled state
 * @param {HTMLElement} button - Button element
 * @param {boolean} disabled - Disabled state
 */
export function setButtonDisabled(button, disabled) {
  button.disabled = disabled;
}
