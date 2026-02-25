/**
 * Custom lint script that runs addons-linter with Chrome MV3 service worker support enabled.
 * This works around the limitation of web-ext not passing enableBackgroundServiceWorker.
 * Run with: node scripts/lint.js (or npm run lint)
 */

const { createInstance } = require('addons-linter');
const path = require('path');
const fs = require('fs');

const sourceDir = path.join(__dirname, '..');

// Build list of paths to ignore (node_modules, build artifacts, etc.)
function shouldScanFile(fileName) {
  const ignorePatterns = [
    /^node_modules\//,
    /^web-ext-artifacts\//,
    /^\.git\//,
    /^scripts\//,
    /\.map$/,
  ];
  return !ignorePatterns.some(p => p.test(fileName));
}

const linter = createInstance({
  config: {
    logLevel: 'fatal',
    output: 'text',
    boring: false,
    selfHosted: false,
    privileged: false,
    warningsAsErrors: false,
    minManifestVersion: 3,
    maxManifestVersion: 3,
    enableBackgroundServiceWorker: true,
    enableDataCollectionPermissions: true,
    shouldScanFile,
    _: [sourceDir],
  },
  runAsBinary: false,
});

linter.run().then(result => {
  const { errors = [], warnings = [], notices = [] } = result;
  const total = errors.length + warnings.length + notices.length;

  if (total > 0) {
    // Print results similar to web-ext output
    if (errors.length) {
      console.error(`\nERRORS (${errors.length}):`);
      errors.forEach(e => console.error(`  [${e.code}] ${e.message} (${e.file || 'manifest.json'})`));
    }
    if (warnings.length) {
      console.warn(`\nWARNINGS (${warnings.length}):`);
      warnings.forEach(w => console.warn(`  [${w.code}] ${w.message} (${w.file || 'manifest.json'})`));
    }
    if (notices.length) {
      console.log(`\nNOTICES (${notices.length}):`);
      notices.forEach(n => console.log(`  [${n.code}] ${n.message}`));
    }
  }

  console.log(`\nValidation Summary: ${errors.length} errors, ${warnings.length} warnings, ${notices.length} notices`);

  if (errors.length > 0) {
    process.exit(1);
  }
}).catch(err => {
  console.error('Lint failed:', err.message);
  process.exit(1);
});
