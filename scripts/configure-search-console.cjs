// Render the optional Search Console token into source HTML, not client-side JavaScript.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'seo-config.json'), 'utf8'));
const token = config.searchConsoleVerification;
if (token && !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('Invalid Search Console verification token');
const slot = '<!-- search-console-verification -->';
const tag = token ? slot + '\n<meta name="google-site-verification" content="' + token + '">' : slot;
const files = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
for (const file of files) {
  if (file === 'index.html' && fs.existsSync(path.join(root, 'gospel-advance-website.html'))) continue;
  const target = path.join(root, file);
  const source = fs.readFileSync(target, 'utf8');
  if (!source.includes(slot)) continue;
  const next = source.replace(/<!-- search-console-verification -->(?:\s*<meta name="google-site-verification" content="[^"]*">)?/, tag);
  if (next !== source) fs.writeFileSync(target, next);
}
if (fs.existsSync(path.join(root, 'gospel-advance-website.html'))) {
  fs.copyFileSync(path.join(root, 'gospel-advance-website.html'), path.join(root, 'index.html'));
}
