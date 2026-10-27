/* Contrôle statique : chaque animation CSS citée doit avoir son @keyframes (une suppression malheureuse rendait muet un tracé de coche). Usage : node tests/static/css-keyframes.mjs */
import fs from 'node:fs'; import path from 'node:path';
const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'css');
const css = fs.readdirSync(dir).filter(f => f.endsWith('.css')).map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8')]);
const defined = new Set(); css.forEach(([, s]) => { for (const m of s.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) defined.add(m[1]); });
const KEYWORDS = new Set(['none', 'infinite', 'alternate', 'alternate-reverse', 'reverse', 'normal', 'forwards', 'backwards', 'both', 'running', 'paused', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'initial', 'inherit', 'unset', 'revert']);
const missing = new Map();
css.forEach(([f, s]) => {
  const plain = s.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of plain.matchAll(/animation(?:-name)?\s*:\s*([^;}{]+)/g)) {
    m[1].split(',').forEach(part => {
      const tokens = part.replace(/cubic-bezier\([^)]*\)|steps\([^)]*\)|var\([^)]*\)|calc\([^)]*\)|!important/g, ' ').trim().split(/\s+/).filter(Boolean);
      tokens.forEach(t => { if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(t) && !KEYWORDS.has(t) && !/^\d/.test(t) && !defined.has(t) && !/^(ms|s)$/.test(t)) { (missing.get(t) || missing.set(t, new Set()).get(t)).add(f); } });
    });
  }
});
if (missing.size) { console.error('animations sans @keyframes :'); missing.forEach((fs_, n) => console.error('  ' + n + '  <- ' + [...fs_].join(', '))); process.exit(1); }
console.log('OK : ' + defined.size + ' @keyframes, aucune animation orpheline');
