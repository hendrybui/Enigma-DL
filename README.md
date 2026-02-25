# All-Site Media Downloader

Ultimate "All-Site Image & Video Downloader" - A powerful browser extension for downloading images and videos from any website.

## Features

- **Automatic Media Discovery**: Automatically finds all images and videos on any webpage
- **Live Updates**: Uses MutationObserver to detect lazy-loaded media
- **Batch Downloads**: Select and download multiple media files at once
- **Progress Tracking**: Real-time download progress with visual feedback
- **Smart Naming**: Configurable filename patterns with timestamps and page titles
- **Customizable Settings**: Configure download folders and naming patterns
- **Keyboard Shortcut**: Press `Ctrl+Shift+M` to toggle the media panel
- **Badge Counter**: Shows number of active downloads in the browser toolbar
- **Notifications**: Optional toast notifications when downloads complete

## Installation

### Firefox

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" (or "This Nightly/Developer Edition")
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

### For Permanent Installation

1. Install `web-ext` tool: `npm install -g web-ext`
2. Build the extension: `web-ext build`
3. Submit the generated `.zip` file to Firefox Add-ons

## Usage

### Opening the Media Panel

- **Keyboard**: Press `Ctrl+Shift+M` on any webpage
- **Automatic**: The panel appears automatically when the extension detects media

### Downloading Media

1. The extension automatically scans the page for images and videos
2. Select the media items you want to download using checkboxes
3. Use "Select All" or "Deselect All" for bulk selection
4. Click "Download Selected" to start downloads
5. Monitor progress in the panel and browser badge

### Configuring Settings

1. Click the extension icon in the toolbar
2. Configure:
   - **Download Folder**: Subfolder within your default downloads (e.g., `media-downloads`)
   - **Naming Pattern**: Use `{timestamp}`, `{title}`, and `{random}` placeholders
   - **Notifications**: Enable/disable completion notifications
3. Click "Save Settings"

## Files Structure

```
.
├── manifest.json          # Extension manifest
├── background.js          # Background script (download management)
├── content.js            # Content script (media discovery & UI)
├── content.css           # Styles for content script UI
├── popup.html            # Settings popup HTML
├── popup.js              # Settings popup logic
├── popup.css             # Settings popup styles
└── icons/                # Extension icons
    ├── icon-48.png
    ├── icon-96.png
    └── icon.svg
```

## Technical Details

### Background Script

- Receives download requests from content scripts
- Manages `browser.downloads.download()` API calls
- Tracks active downloads and updates badge counter
- Forwards progress updates to content scripts
- Sends optional notifications on completion

### Content Script

- Discovers media using `querySelectorAll` for images and videos
- Uses `MutationObserver` to detect dynamically loaded content
- Renders a floating, draggable UI panel
- Generates thumbnails (canvas for images, video elements for videos)
- Handles user selection and batch operations
- Displays real-time download progress

### Storage

Settings are stored in `browser.storage.sync` and include:
- `downloadFolder`: Target download directory
- `namingPattern`: Filename template
- `showNotifications`: Whether to show completion toasts

## Browser Compatibility

- **Firefox**: 57+
- **Chrome/Edge**: Requires minor modifications (use `chrome.*` APIs instead of `browser.*`)

## Development

### Testing Locally

```bash
web-ext run
```

### Linting

```bash
web-ext lint
```

## Permissions

This extension requires the following permissions:

- `downloads`: To download media files
- `notifications`: To show completion notifications
- `storage`: To save user preferences
- `tabs`: To access page information for filenames
- `<all_urls>`: To inject content script on all websites

## License

MIT License - Feel free to use and modify

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.
