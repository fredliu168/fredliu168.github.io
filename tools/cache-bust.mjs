#!/usr/bin/env node
/**
 * cache-bust.mjs — append a content hash to local asset URLs in the generated pages.
 *
 * Why this exists: the omniagent pages are copied verbatim by Hexo (skip_render),
 * so every deploy reuses the same style.css / app.js URLs. GitHub Pages serves
 * them with `cache-control: max-age=600`, so anyone who loaded the site shortly
 * before a deploy keeps the previous stylesheet — and because the new markup
 * relied on new rules, the page rendered unstyled until a hard refresh.
 *
 * Rewriting `style.css` to `style.css?v=<sha of the file>` gives every changed
 * asset a new URL, which invalidates browser and CDN caches automatically.
 * It runs on public/ only (gitignored), so it adds no churn to the source tree.
 *
 * Usage: node tools/cache-bust.mjs   (after `hexo generate`, before `hexo deploy`)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const PUBLIC_DIR = resolve(process.cwd(), 'public');
const ROOTS = ['omniagent'];
const EXT = 'css|js|mjs|png|ico|svg|webp|avif|jpg|jpeg|gif';

/* local refs only: excludes absolute URLs (no ':' allowed) and fragments */
const ASSET_RE = new RegExp(`(href|src)="([^"?#:]+?\\.(?:${EXT}))(?:\\?[^"]*)?"`, 'g');

const hashCache = new Map();
function hashOf(file) {
  if (!hashCache.has(file)) {
    hashCache.set(file, createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8));
  }
  return hashCache.get(file);
}

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) htmlFiles(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

let scanned = 0;
let rewritten = 0;
let refs = 0;

for (const root of ROOTS) {
  const dir = join(PUBLIC_DIR, root);
  if (!existsSync(dir)) continue;

  for (const file of htmlFiles(dir)) {
    const before = readFileSync(file, 'utf8');
    const after = before.replace(ASSET_RE, (whole, attr, ref) => {
      const asset = resolve(dirname(file), ref);
      if (!existsSync(asset) || !statSync(asset).isFile()) return whole; // leave anything we can't resolve
      refs += 1;
      return `${attr}="${ref}?v=${hashOf(asset)}"`;
    });
    if (after !== before) {
      writeFileSync(file, after);
      rewritten += 1;
    }
    scanned += 1;
  }
}

console.log(`cache-bust: scanned ${scanned} page(s), versioned ${refs} asset ref(s), rewrote ${rewritten} file(s)`);
