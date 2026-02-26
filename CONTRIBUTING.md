# Contributing to Enigma-DL

Thank you for your interest in contributing to Enigma-DL! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Enigma-DL.git
   cd Enigma-DL
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Setup

### Running the Extension in Firefox

```bash
npm run start
```

This will open a temporary Firefox instance with the extension loaded.

### Building the Extension

```bash
npm run build
```

This creates a `.zip` package in the `web-ext-artifacts/` directory.

### Running Linter

```bash
npm run lint
```

Ensure all code passes linting before submitting a PR.

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'string'`)
- **Semicolons**: Always required
- **Variables**: Use `const` by default, `let` if reassignment is needed, never use `var`
- **Comments**: Use meaningful comments for complex logic

## File Structure

```
Enigma-DL/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script for page injection
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── icons/                # Extension icons
├── scripts/              # Build and utility scripts
└── libs/                 # Reusable modules (new)
```

## Adding Features

1. **Create a descriptive branch**:
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make your changes** with clear commit messages:
   ```bash
   git commit -m "feat: add new feature description"
   ```

3. **Test thoroughly**:
   - Test in both Firefox and Chrome (if supported)
   - Test with the TEST_PLAN.md scenarios
   - Check browser console for errors

4. **Submit a Pull Request** with:
   - Clear description of changes
   - Reference to any related issues
   - Screenshots for UI changes

## Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes (not CSS)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process, dependencies, etc.

Example: `feat: add retry logic for failed downloads`

## Testing

Refer to [TEST_PLAN.md](TEST_PLAN.md) for manual testing procedures.

## Reporting Bugs

When reporting bugs, please include:
- Browser and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)

## Questions?

Feel free to open an issue for questions or discussions.

Happy coding! 🚀
