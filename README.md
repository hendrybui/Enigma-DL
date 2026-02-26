# All-Site Media Downloader

[![Firefox](https://img.shields.io/badge/Firefox-57%2B-orange?logo=firefox-browser)](https://www.mozilla.org/firefox/)
[![Chrome](https://img.shields.io/badge/Chrome-Compatible-brightgreen?logo=google-chrome)](https://www.google.com/chrome/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Ultimate "All-Site Image & Video Downloader"** - A powerful browser extension for downloading images and videos from any website with a single click.

## Store Description

All-Site Media Downloader lets you grab every image and video from any webpage with a single click. Auto-detects lazy-loaded media, supports batch downloads, and offers customizable naming and folder options. Perfect for researchers, designers, and anyone who needs offline media quickly.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Automatic Media Discovery** | Automatically finds all images and videos on any webpage |
| 🔄 **Live Updates** | Uses MutationObserver to detect lazy-loaded media |
| 📦 **Batch Downloads** | Select and download multiple media files at once |
| 📊 **Progress Tracking** | Real-time download progress with visual feedback |
| 🏷️ **Smart Naming** | Configurable filename patterns with timestamps and page titles |
| ⚙️ **Customizable Settings** | Configure download folders and naming patterns |
| ⌨️ **Keyboard Shortcut** | Press `Ctrl+Shift+M` to toggle the media panel |
| 🔢 **Badge Counter** | Shows number of active downloads in the browser toolbar |
| 🔔 **Notifications** | Optional toast notifications when downloads complete |

---

## Installation

### Firefox (Temporary)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" (or "This Nightly/Developer Edition")
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

### Firefox (Permanent)

1. Install `web-ext` tool: `npm install -g web-ext`
2. Build the extension: `web-ext build`
3. Submit the generated `.zip` file to [Firefox Add-ons](https://addons.mozilla.org/)

### Chrome / Edge

> **Note:** This extension uses the `browser.*` API (Firefox standard). For Chrome/Edge, you'll need to replace `browser.*` with `chrome.*` in all JavaScript files.

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extension directory

---

## Usage

### Opening the Media Panel

| Method | Action |
|--------|--------|
| ⌨️ **Keyboard** | Press `Ctrl+Shift+M` on any webpage |
| 🖱️ **Toolbar** | Click the extension icon in the browser toolbar |
| 🤖 **Automatic** | Panel appears automatically when media is detected |

### Downloading Media

1. The extension automatically scans the page for images and videos
2. Select the media items you want to download using checkboxes
3. Use **"Select All"** or **"Deselect All"** for bulk selection
4. Click **"Download Selected"** to start downloads
5. Monitor progress in the panel and browser badge

![Media Panel Screenshot](assets/media-panel.png)
> 📸 *Screenshot placeholder - replace with actual screenshot*

### Detailed Example

#### Sample Webpage

```html
<!DOCTYPE html>
<html>
  <body>
    <img src="https://example.com/photo.jpg" alt="Sample Image" />
    <video src="https://example.com/video.mp4" controls></video>
  </body>
</html>
```

When this page loads, the extension automatically detects the image and video and displays them in the floating panel.

#### Programmatic Trigger (Advanced)

You can trigger downloads programmatically from the browser console or another extension:

```javascript
browser.runtime.sendMessage({
  action: "download",
  urls: [
    "https://example.com/photo.jpg",
    "https://example.com/video.mp4"
  ]
});
```

### Configuring Settings

1. Click the extension icon in the toolbar
2. Configure the following options:

| Setting | Description | Example |
|---------|-------------|---------|
| **Download Folder** | Subfolder within your default downloads | `media-downloads` |
| **Naming Pattern** | Filename template with placeholders | `{title}_{timestamp}` |
| **Notifications** | Enable/disable completion toasts | ✅ Enabled |

#### Naming Pattern Placeholders

| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{timestamp}` | Current date/time | `2024-01-15_14-30-22` |
| `{title}` | Page title (sanitized) | `My_Webpage` |
| `{random}` | Random 6-character string | `x7k9m2` |

3. Click **"Save Settings"**

#### Example Configuration (via `browser.storage.sync`)

```javascript
browser.storage.sync.set({
  downloadFolder: "my-downloads",
  namingPattern: "{title}_{timestamp}",
  showNotifications: true
});
```

---

## File Structure

```
.
├── manifest.json          # Extension manifest (Manifest V2/V3)
├── background.js          # Background script (download management)
├── content.js             # Content script (media discovery & UI)
├── content.css            # Styles for content script UI
├── popup.html             # Settings popup HTML
├── popup.js               # Settings popup logic
├── popup.css              # Settings popup styles
└── icons/                 # Extension icons
    ├── icon-48.png
    ├── icon-96.png
    └── icon.svg
```

---

## Technical Details

### Background Script (`background.js`)

- Receives download requests from content scripts
- Manages `browser.downloads.download()` API calls
- Tracks active downloads and updates badge counter
- Forwards progress updates to content scripts
- Sends optional notifications on completion

### Content Script (`content.js`)

- Discovers media using `querySelectorAll` for images and videos
- Uses `MutationObserver` to detect dynamically loaded content
- Renders a floating, draggable UI panel
- Generates thumbnails (canvas for images, video elements for videos)
- Handles user selection and batch operations
- Displays real-time download progress

### Storage

Settings are stored in `browser.storage.sync` and include:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `downloadFolder` | `string` | `media-downloads` | Target download directory |
| `namingPattern` | `string` | `{timestamp}_{random}` | Filename template |
| `showNotifications` | `boolean` | `true` | Show completion toasts |

---

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Firefox | 57+ | ✅ Full Support | Primary target |
| Chrome | 88+ | ⚠️ Partial | Replace `browser.*` with `chrome.*` |
| Edge | 88+ | ⚠️ Partial | Same as Chrome |

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) CLI tool

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/enigma-dl.git
cd enigma-dl/Enigma-DL

# Install dependencies (if any)
npm install
```

### Testing Locally

```bash
# Launch Firefox with the extension loaded
web-ext run

# Launch with auto-reload on file changes
web-ext run --verbose --firefox=firefoxdeveloperedition
```

### Linting

```bash
# Run web-ext linter
web-ext lint

# Run custom lint script (if available)
npm run lint
```

### Building

```bash
# Build the extension (.zip)
web-ext build

# Output will be in web-ext-artifacts/
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

### Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Branch naming**: Use descriptive names like `feature/add-gif-support` or `fix/download-bug`
3. **Make changes** and ensure code follows existing style
4. **Test thoroughly** using `web-ext run`
5. **Run linting**: `web-ext lint` must pass with no errors
6. **Update documentation** if adding new features
7. **Commit messages**: Use clear, descriptive messages
   - ✅ `feat: add GIF animation support`
   - ✅ `fix: resolve duplicate download issue`
   - ❌ `update code`
8. **Open a Pull Request** against `main` with a clear description

### Code Style

- Use 2-space indentation
- Use `const` and `let` (no `var`)
- Add JSDoc comments for functions
- Keep functions small and focused

### Reporting Issues

When reporting bugs, please include:

- Browser version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)

---

## Permissions

This extension requires the following permissions:

| Permission | Reason |
|------------|--------|
| `downloads` | To download media files |
| `notifications` | To show completion notifications |
| `storage` | To save user preferences |
| `tabs` | To access page information for filenames |
| `<all_urls>` | To inject content script on all websites |

---

## Changelog

### v1.0.0 (Initial Release)

- Automatic media discovery
- Batch download support
- Customizable naming patterns
- Progress tracking
- Keyboard shortcut (`Ctrl+Shift+M`)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- Icons from [Feather Icons](https://feathericons.com/) (if applicable)

---

## Bahasa Malaysia / Malay Translation

> **Muat Turun Media All-Site** membolehkan anda merakam setiap gambar dan video dari mana-mana laman web dengan satu klik. Mengesan media yang dimuatkan secara automatik, menyokong muat turun berkumpulan, dan menawarkan pilihan penamaan dan folder yang boleh disesuaikan. Sesuai untuk penyelidik, pereka bentuk, dan sesiapa sahaja yang memerlukan media luar talian dengan cepat.

---

*Made with ❤️ by the Enigma-DL Team*
