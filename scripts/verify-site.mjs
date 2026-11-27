import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const html = read('index.html');
const importMatch = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
check(Boolean(importMatch), 'index.html is missing the import map');

if (importMatch) {
  const map = importMatch[1];
  const hash = createHash('sha256').update(map, 'utf8').digest('base64');
  check(html.includes(`sha256-${hash}`), `CSP hash does not match the import map (expected ${hash})`);
  check(/three@\d+\.\d+\.\d+\/build\/three\.module\.js/.test(map), 'Three.js CDN URL must be version pinned');
}

check(html.includes('http-equiv="Content-Security-Policy"'), 'index.html is missing the Content Security Policy');
check(!/\son[a-z]+\s*=/i.test(html), 'inline event handlers are not allowed in index.html');

for (const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
  const ref = match[1];
  if (/^(https?:|data:|mailto:)/.test(ref)) continue;
  check(existsSync(join(root, ref)), `missing local asset referenced by index.html: ${ref}`);
}

const mainCss = read('css/main.css');
for (const match of mainCss.matchAll(/@import url\('([^']+)'\)/g)) {
  check(existsSync(join(root, 'css', match[1])), `missing stylesheet: css/${match[1]}`);
}

const sourceFiles = readdirSync(join(root, 'src')).filter((name) => name.endsWith('.js'));
for (const file of sourceFiles) {
  const source = read(`src/${file}`);
  check(!/\.innerHTML\s*=/.test(source), `${file} writes to innerHTML`);
}

if (failures.length > 0) {
  console.error('Site verification failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Site verification passed (${sourceFiles.length} JS modules checked).`);
