# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- ✨ **Automatic Media Discovery** - Detects images, videos, audio, and documents on any webpage
- ✨ **Live Updates** - Uses MutationObserver to detect lazy-loaded media dynamically
- ✨ **Batch Downloads** - Select and download multiple media files at once
- ✨ **Download All** - One-click download of all detected media files
- ✨ **Progress Tracking** - Real-time download progress with visual feedback and badge counter
- ✨ **Metadata Display** - Shows resolution, file size, format, and duration information
- ✨ **Theme Support** - Light/dark theme toggle with system preference detection
- ✨ **Smart Naming** - Configurable filename patterns with timestamps and page titles
- ✨ **Customizable Settings** - Configure download folders and naming preferences
- ✨ **Keyboard Shortcut** - Press `Alt+Shift+D` to open the downloader popup
- ✨ **Browser Badge** - Shows number of active downloads in the toolbar
- ✨ **Toast Notifications** - Optional notifications when downloads complete
- 📖 **Comprehensive Documentation** - README with features, usage, and installation guide
- ✅ **Test Plan** - Manual testing procedures for all features

### Technical
- Firefox (Manifest V3) support
- Chrome/Edge compatibility guide
- MIT License

---

## [Unreleased]

### Planned Features
- 🔄 **Retry Logic** - Automatic retry for failed downloads
- 🌐 **Cross-Browser Support** - Full Chrome/Edge implementation with abstraction layer
- 📊 **Download History** - View and manage past downloads
- 🔧 **Advanced Filters** - Filter by URL patterns, domains, or custom rules
- 🎨 **Custom Themes** - User-defined color schemes
- 📱 **Mobile Support** - Extend to mobile browsers
- ⚡ **Performance Optimization** - Image lazy-loading, WASM support

---

## Version History

### Initial Development
- Jan 2026: Project kickoff
- Feb 2026: Core features implemented
- Feb 26, 2026: Version 1.0.0 released

---

## Notes for Contributors

When adding features, please update this CHANGELOG with:
1. Unreleased section updates
2. Clear feature descriptions
3. Category tags (Added, Fixed, Changed, Deprecated, Removed, Security)
