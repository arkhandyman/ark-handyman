/*
 * Inlines engine.js into index.html to produce a single self-contained file.
 *
 *   node build-artifact.js
 *
 * index.html loads engine.js with a plain <script src>, which keeps one source
 * of truth shared with the Node simulations. That works over file:// and over
 * http, but a published page has to be a single document — hence this step.
 */

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const engine = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const TAG = '<script src="engine.js"></script>';
if (!html.includes(TAG)) {
  console.error('Could not find the engine script tag in index.html — aborting.');
  process.exit(1);
}

const out = html.replace(TAG, '<script>\n' + engine + '\n</script>');
const target = path.join(dir, 'play.html');
fs.writeFileSync(target, out);

console.log('Wrote ' + target + '  (' + (out.length / 1024).toFixed(1) + ' KB)');
