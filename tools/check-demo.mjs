#!/usr/bin/env node
/**
 * Fails the production build while demo/placeholder content is still in the data files.
 * Flags: `"demo": true`, any `"todo"` field, and strings containing "DEMO".
 * Usage: node tools/check-demo.mjs [--warn]   (--warn prints the report but exits 0)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = [join(root, 'web/src/app/data'), join(root, 'web/src/assets/media')];
const warnOnly = process.argv.includes('--warn');
const findings = [];

function walk(node, path, file) {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, file));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const p = path ? `${path}.${k}` : k;
      if (k === 'demo' && v === true) findings.push({ file, path: p, reason: 'demo: true' });
      else if (k === 'todo' && v && (!Array.isArray(v) || v.length)) findings.push({ file, path: p, reason: 'todo' });
      else walk(v, p, file);
    }
    return;
  }
  if (typeof node === 'string' && /\bDEMO\b/.test(node)) findings.push({ file, path, reason: 'DEMO text' });
}

for (const dir of dirs) {
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    continue;
  }
  for (const f of files) {
    const full = join(dir, f);
    walk(JSON.parse(readFileSync(full, 'utf8')), '', relative(root, full));
  }
}

if (!findings.length) {
  console.log('check-demo: no demo/TODO content found.');
  process.exit(0);
}

const byFile = Object.groupBy(findings, (f) => f.file);
console.error(`check-demo: ${findings.length} demo/TODO item(s) must be replaced before a production build:`);
for (const [file, items] of Object.entries(byFile)) {
  console.error(`\n  ${file}`);
  const seen = new Set();
  for (const it of items) {
    const top = it.path.split('.')[0];
    const key = `${top}:${it.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`    - ${it.path} (${it.reason})`);
  }
}
console.error('\nSee docs/CONTENT_TODO.md.');
process.exit(warnOnly ? 0 : 1);
