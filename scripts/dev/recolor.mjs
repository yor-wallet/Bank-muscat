/* Sanad Pay — conversion des verts de MARQUE (héritage Freindi Pay) en bleus ciel, à luminosité comparable.
   Usage : node scripts/dev/recolor.mjs [--dry]
   - hex (#rgb #rrggbb #rrggbbaa) et rgb()/rgba() de teinte verte (120°–185°, saturation > 0,15) -> teinte bleu ciel ;
   - dans les feuilles CSS, les règles dont le sélecteur signifie « succès » (ok, success, done, confirmed, received, up, positive, paid, verified…) gardent leur vert :
     le vert reste réservé à la signification « succès » (jeton --success = #14A879) ;
   - liste de conservation : drapeaux (icons.js), couleurs de jetons tiers (Tether, Solana…), hausse de marché ;
   - jamais : dist/, vendor, yor-chain.js, js/data/*.js (couleurs de jetons / pays), pack de marque. Idempotent (les bleus produits ne sont plus verts). */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const dry = process.argv.includes('--dry');
const walk = (d, acc = []) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const p = path.posix.join(d, e.name); if (e.isDirectory()) { if (!['node_modules', 'dist', '.git', 'vendor', 'data'].includes(e.name)) walk(p, acc); } else acc.push(p); } return acc; };
const files = [...walk('css').filter(f => f.endsWith('.css') && f !== 'css/sanad.css'), ...walk('js').filter(f => f.endsWith('.js') && f !== 'js/features/yor-chain.js'), ...walk('assets').filter(f => f.endsWith('.svg') && !f.startsWith('assets/brand/network')), 'index.html', 'offline.html', '404.html', 'install.html'];
const KEEP = new Set(['008000', '009a44', '007a3d', '007229', '009e49', '009460', '14b53a', '26a17b', '14f195', '16c784', '0e9f6e', '1f9d6e', '9af0c6']);
const SEMANTIC = /(^|[^a-z])(ok|success|succeeded|done|confirmed|confirm|received|positive|paid|verified|valid|up|gain|good|active-ok|is-ok|st-ok|s-ok|check-ok)([^a-z]|$)/i;

function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2rgb(h, s, l) { h /= 360; const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(v => Math.round(v * 255)); }
const isGreen = (h, s) => h >= 120 && h <= 185 && s > .15;
/* noirs « chauds » hérités (0a0a0b, 161412, 1a1815…) -> bleu nuit d'encre de la marque ; le noir pur #000 (ombres) n'est jamais touché */
const isInkBlack = (h, s, l, hex6) => hex6 !== '000000' && l < .16 && (s < .22 || (h >= 20 && h < 75 && s < .5));
function skyOf(r, g, b) {
  const [h, s, l] = rgb2hsl(r, g, b);
  const hex6 = hex([r, g, b]).slice(1);
  if (isInkBlack(h, s, l, hex6)) return hsl2rgb(212, .52, .115 + l * .55);
  if (!isGreen(h, s)) return null;
  const hue = l >= .6 ? 197 : l >= .25 ? 205 : 212;
  let ss = l > .85 ? Math.min(s, .9) : s * .92;
  if (l > .3 && l < .6) ss = Math.max(ss, .72);
  if (l < .25) ss = Math.min(Math.max(ss, .35), .6);
  return hsl2rgb(hue, Math.min(ss, .95), l);
}
const hex = a => '#' + a.map(v => v.toString(16).padStart(2, '0')).join('');
function conv(text) {
  let n = 0;
  text = text.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g, (m, h) => {
    let x = h.toLowerCase(); if (x.length === 3) x = x.split('').map(c => c + c).join('');
    const base = x.slice(0, 6), al = x.slice(6); if (KEEP.has(base)) return m;
    const rgb = skyOf(parseInt(base.slice(0, 2), 16), parseInt(base.slice(2, 4), 16), parseInt(base.slice(4, 6), 16)); if (!rgb) return m;
    n++; return hex(rgb) + al;
  });
  text = text.replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*[\d.]+\s*)?\)/g, (m, r, g, b, a) => {
    const rgb = skyOf(+r, +g, +b); if (!rgb) return m; n++;
    return a ? `rgba(${rgb.join(',')}${a.replace(/\s+/g, '')})` : `rgb(${rgb.join(',')})`;
  });
  return [text, n];
}
/* CSS : conversion règle par règle (corps sans accolade), en sautant les règles au sélecteur « succès » */
function convCss(css) {
  let out = '', i = 0, n = 0, skipped = 0, selStart = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '{') {
      const close = css.indexOf('}', i), nextOpen = css.indexOf('{', i + 1);
      if (close !== -1 && (nextOpen === -1 || close < nextOpen)) {          /* bloc de déclarations */
        const sel = css.slice(selStart, i), body = css.slice(i + 1, close);
        const semantic = SEMANTIC.test(sel.replace(/^[\s\S]*[;}]/, '')) && !/\.(btn|button|nav|logo|brand|tab|chip-primary)/i.test(sel);
        if (semantic && /(#|rgb)/.test(body)) { const [, k] = conv(body); if (k) skipped++; out += css.slice(selStart, close + 1); }
        else { const [b2, k] = conv(body); n += k; out += css.slice(selStart, i + 1) + b2 + '}'; }
        i = close + 1; selStart = i; continue;
      }
      i++; out += css.slice(selStart, i); selStart = i; continue;           /* @media { … : on descend */
    }
    if (c === '}') { i++; out += css.slice(selStart, i); selStart = i; continue; }
    i++;
  }
  out += css.slice(selStart);
  return [out, n, skipped];
}
const report = [];
for (const f of files) {
  if (!fs.existsSync(path.join(ROOT, f))) continue;
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let out, n, sk = 0;
  if (f.endsWith('.css')) [out, n, sk] = convCss(src); else [out, n] = conv(src);
  if (n || sk) report.push(`${String(n).padStart(4)} convertis ${sk ? `(${sk} règles « succès » conservées)` : ''} ${f}`);
  if (n && !dry) fs.writeFileSync(path.join(ROOT, f), out);
}
console.log(report.join('\n')); console.log(`${report.length} fichiers${dry ? ' (simulation)' : ''}`);
