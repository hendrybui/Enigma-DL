# Test Plan for Enigma-DL Extension

## Overview
This document outlines the manual testing procedures for the Enigma-DL browser extension features.

---

## 1. Theme Toggle Testing

### 1.1 System Preference Detection
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set OS to light mode | Extension popup opens in light mode |
| 2 | Set OS to dark mode | Extension popup opens in dark mode |
| 3 | Change OS theme while popup is closed | Next popup opening reflects new OS theme |

### 1.2 Manual Theme Toggle
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open popup, click theme toggle (🌙/☀️) | Theme switches to opposite mode |
| 2 | Close and reopen popup | Theme persists from previous toggle |
| 3 | Toggle theme multiple times | Icon updates correctly (🌙 for light, ☀️ for dark) |
| 4 | Reload extension | Theme preference is retained |

### 1.3 CSS Variable Verification
| Theme | Check | Expected |
|-------|-------|----------|
| Light | Background colors | White/light gray backgrounds |
| Light | Text colors | Dark text on light backgrounds |
| Dark | Background colors | Dark blue/gray backgrounds |
| Dark | Text colors | Light text on dark backgrounds |

---

## 2. Metadata Extraction Testing

### 2.1 Image Metadata
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page with images | Images are detected and listed |
| 2 | Check image card metadata | Shows resolution (W×H) |
| 3 | Check image card metadata | Shows file size (KB/MB) |
| 4 | Check image card metadata | Shows format (jpeg, png, webp, etc.) |

### 2.2 Video Metadata
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page with videos | Videos are detected and listed |
| 2 | Check video card metadata | Shows resolution (W×H) if available |
| 3 | Check video card metadata | Shows duration (MM:SS) |
| 4 | Check video card metadata | Shows file size (KB/MB) |

### 2.3 Audio Metadata
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page with audio | Audio files are detected and listed |
| 2 | Check audio card metadata | Shows duration (MM:SS) |
| 3 | Check audio card metadata | Shows file size (KB/MB) |

---

## 3. Download All Feature Testing

### 3.1 Basic Download All
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scan page with multiple media items | Items appear in list |
| 2 | Click "Download All" button | All filtered items begin downloading |
| 3 | Check browser downloads | All files appear in download manager |
| 4 | Check download folder | Files saved to `ultimate-downloader/` folder |

### 3.2 Filtered Download All
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scan page with mixed media | Images, videos, audio appear |
| 2 | Uncheck "Images" filter | Only non-image items shown |
| 3 | Click "Download All" | Only visible items are downloaded |
| 4 | Re-enable "Images", uncheck others | Only images shown |
| 5 | Click "Download All" | Only images downloaded |

### 3.3 Minimum Size Filter
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set min size to 100 KB | Items smaller than 100KB hidden |
| 2 | Click "Download All" | Only items ≥100KB downloaded |

---

## 4. Integration Testing

### 4.1 Theme + Metadata
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle to dark mode | All UI elements use dark theme |
| 2 | Scan page with media | Metadata displays correctly in dark theme |
| 3 | Toggle to light mode | Metadata displays correctly in light theme |

### 4.2 Theme + Downloads
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle theme during download | Download continues uninterrupted |
| 2 | Check badge counter | Badge displays correctly in both themes |

---

## 5. Cross-Browser Testing

### 5.1 Firefox
- [ ] Theme toggle works
- [ ] Metadata extraction works
- [ ] Download All works
- [ ] No console errors

### 5.2 Chrome (with browser.* → chrome.* conversion)
- [ ] Theme toggle works
- [ ] Metadata extraction works
- [ ] Download All works
- [ ] No console errors

---

## Test URLs

Use these pages for testing:
- **Images**: Any image gallery or news site
- **Videos**: YouTube (embed detection), direct MP4 links
- **Audio**: Bandcamp, SoundCloud, direct MP3 links
- **Mixed**: Social media sites, news articles

---

## Regression Checklist

After any code changes, verify:
- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Scan function detects all media types
- [ ] Individual downloads work
- [ ] Download All works
- [ ] Theme persists across sessions
- [ ] Metadata displays correctly
- [ ] Filters work as expected
- [ ] Badge counter updates

---

*Last updated: 2026-02-26*
