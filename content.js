/**
 * Content Script for Media Downloader Extension
 * Discovers media, renders UI, handles selection and downloads
 */

// Configuration constants
const MAX_DISPLAY_ITEMS = 150; // Limit displayed items for performance
const MIN_IMAGE_SIZE = 50; // Minimum width/height for images in pixels

let mediaList = [];
let selectedIndices = new Set();
let downloadProgress = {}; // url -> {status, received, total}

/**
 * 1. Gather media elements
 */
function collectMedia() {
  const imgs = Array.from(document.querySelectorAll('img'))
    .filter(img => {
      const url = img.currentSrc || img.src;
      return url && url.startsWith('http') && 
             img.naturalWidth > MIN_IMAGE_SIZE && 
             img.naturalHeight > MIN_IMAGE_SIZE;
    })
    .map(img => ({
      url: img.currentSrc || img.src,
      type: 'image',
      title: img.alt || img.title || '',
    }));

  const videos = Array.from(document.querySelectorAll('video'))
    .map(v => {
      const source = v.querySelector('source[src]');
      return {
        element: v,
        url: v.src || (source ? source.src : null)
      };
    })
    .filter(item => item.url)
    .map(item => ({
      url: item.url,
      type: 'video',
      title: item.element.title || '',
    }));

  // Remove duplicates by URL
  const seen = new Set();
  const all = [...imgs, ...videos].filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return all;
}

/**
 * 2. MutationObserver for lazy-loaded media
 */
let observer = null;
let observerTimeout = null;

function startObserver() {
  if (observer) return;
  
  observer = new MutationObserver(() => {
    // Debounce updates
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      const newMedia = collectMedia();
      if (newMedia.length !== mediaList.length) {
        mediaList = newMedia;
        renderGallery();
      }
    }, 500);
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset']
  });
}

/**
 * 3. Create and inject UI container
 */
function createUI() {
  // Check if UI already exists
  if (document.getElementById('media-downloader-root')) return;

  const root = document.createElement('div');
  root.id = 'media-downloader-root';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'md-header';
  
  const title = document.createElement('h3');
  title.textContent = 'Media Downloader';
  header.appendChild(title);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'md-close';
  closeBtn.title = 'Close';
  closeBtn.textContent = '×';
  header.appendChild(closeBtn);
  
  root.appendChild(header);
  
  // Create controls
  const controls = document.createElement('div');
  controls.className = 'md-controls';
  
  const selectAllBtn = document.createElement('button');
  selectAllBtn.className = 'md-select-all';
  selectAllBtn.textContent = 'Select All';
  controls.appendChild(selectAllBtn);
  
  const deselectAllBtn = document.createElement('button');
  deselectAllBtn.className = 'md-deselect-all';
  deselectAllBtn.textContent = 'Deselect All';
  controls.appendChild(deselectAllBtn);
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'md-download';
  downloadBtn.textContent = 'Download Selected (0)';
  downloadBtn.disabled = true;
  controls.appendChild(downloadBtn);
  
  const countSpan = document.createElement('span');
  countSpan.className = 'md-count';
  countSpan.textContent = '0 items found';
  controls.appendChild(countSpan);
  
  root.appendChild(controls);
  
  // Create gallery
  const gallery = document.createElement('div');
  gallery.className = 'md-gallery';
  root.appendChild(gallery);

  document.body.appendChild(root);

  // Add event listeners
  closeBtn.addEventListener('click', () => {
    root.style.display = 'none';
  });

  selectAllBtn.addEventListener('click', () => {
    selectedIndices = new Set(mediaList.map((_, i) => i));
    renderGallery();
  });

  deselectAllBtn.addEventListener('click', () => {
    selectedIndices.clear();
    renderGallery();
  });

  downloadBtn.addEventListener('click', () => {
    initiateDownload();
  });

  // Make draggable
  makeDraggable(root, header);

  return root;
}

/**
 * Make element draggable
 */
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * 4. Render gallery
 */
function renderGallery() {
  const root = document.getElementById('media-downloader-root');
  if (!root) return;

  const gallery = root.querySelector('.md-gallery');
  const countSpan = root.querySelector('.md-count');
  const downloadBtn = root.querySelector('.md-download');

  // Limit items for performance
  const displayList = mediaList.slice(0, MAX_DISPLAY_ITEMS);
  
  countSpan.textContent = `${mediaList.length} items found${mediaList.length > MAX_DISPLAY_ITEMS ? ` (showing ${MAX_DISPLAY_ITEMS})` : ''}`;
  downloadBtn.textContent = `Download Selected (${selectedIndices.size})`;
  downloadBtn.disabled = selectedIndices.size === 0;

  // Clear gallery properly to avoid memory leaks
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }

  displayList.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'md-card';
    if (selectedIndices.has(index)) {
      card.classList.add('md-selected');
    }

    // Check if download in progress
    const progress = downloadProgress[item.url];
    if (progress) {
      card.classList.add(`md-${progress.status}`);
    }

    // Create preview section using DOM methods for security
    const preview = document.createElement('div');
    preview.className = 'md-preview';
    
    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.url;
      img.loading = 'lazy';
      img.alt = item.title;
      preview.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = item.url;
      video.muted = true;
      video.loop = true;
      video.preload = 'metadata';
      preview.appendChild(video);
    }
    card.appendChild(preview);

    // Create info section
    const info = document.createElement('div');
    info.className = 'md-info';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'md-checkbox';
    checkbox.dataset.index = index;
    checkbox.checked = selectedIndices.has(index);
    info.appendChild(checkbox);
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'md-type';
    typeSpan.textContent = item.type;
    info.appendChild(typeSpan);
    
    if (item.title) {
      const titleSpan = document.createElement('span');
      titleSpan.className = 'md-title';
      titleSpan.textContent = item.title;
      info.appendChild(titleSpan);
    }
    card.appendChild(info);

    // Add progress bar if downloading
    if (progress) {
      const progressBar = document.createElement('div');
      progressBar.className = 'md-progress-bar';
      
      const progressFill = document.createElement('div');
      progressFill.className = 'md-progress-fill';
      const percentage = progress.total ? Math.round(progress.received / progress.total * 100) : 0;
      progressFill.style.width = `${percentage}%`;
      progressBar.appendChild(progressFill);
      card.appendChild(progressBar);
      
      const statusDiv = document.createElement('div');
      statusDiv.className = 'md-status';
      statusDiv.textContent = progress.status;
      card.appendChild(statusDiv);
    }

    // Checkbox handler
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        selectedIndices.add(index);
      } else {
        selectedIndices.delete(index);
      }
      renderGallery();
    });

    // Card click to toggle selection
    card.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });

    gallery.appendChild(card);
  });
}

/**
 * 5. Initiate download
 */
function initiateDownload() {
  const selected = Array.from(selectedIndices)
    .filter(i => i < mediaList.length)
    .map(i => mediaList[i]);

  if (selected.length === 0) return;

  // Initialize progress tracking
  selected.forEach(item => {
    downloadProgress[item.url] = { status: 'pending', received: 0, total: 0 };
  });

  renderGallery();

  // Send to background
  browser.runtime.sendMessage({ 
    cmd: 'download', 
    items: selected 
  });
}

/**
 * 6. Receive progress updates from background
 */
browser.runtime.onMessage.addListener(msg => {
  if (msg.cmd === 'progress') {
    updateProgressBar(msg);
  }
});

function updateProgressBar(msg) {
  if (!msg.url) return;

  downloadProgress[msg.url] = {
    status: msg.status,
    received: msg.received || 0,
    total: msg.total || 0,
    error: msg.error
  };

  renderGallery();

  // Remove from progress after completion/error
  if (msg.status === 'complete' || msg.status === 'error') {
    setTimeout(() => {
      delete downloadProgress[msg.url];
      renderGallery();
    }, 3000);
  }
}

/**
 * Initialize extension
 */
function init() {
  // Collect initial media
  mediaList = collectMedia();

  // Create UI
  createUI();
  renderGallery();

  // Start observer for dynamic content
  startObserver();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add keyboard shortcut to toggle UI (Ctrl+Shift+M)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'M') {
    const root = document.getElementById('media-downloader-root');
    if (root) {
      root.style.display = root.style.display === 'none' ? 'block' : 'none';
    }
  }
});
