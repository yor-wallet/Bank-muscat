/* Freindi Pay — build de production (15.1.0).  `npm run build`  →  dist/
   Ne change aucune logique : mêmes fichiers, même ordre d'exécution, mais
   - CSS : les 16 feuilles regroupées dans l'ordre d'origine et minifiées (1 requête au lieu de 16)
   - JS  : les ~50 scripts regroupés dans l'ordre d'origine et minifiés (3 requêtes au lieu de ~50 ; yor-chain.js, fichier généré
           sans « use strict », reste à sa place dans l'ordre, seul)
   - noms de fichiers à empreinte (contenu) → cache navigateur « immutable » d'un an, jamais de fichier périmé
   - client Supabase servi par le site (plus de CDN tiers : pas de DNS + TLS en plus avant le démarrage)
   - sw.js : liste et nom de cache régénérés ; _headers : cache long + Link preload (Early Hints) */
import { transform } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const kb = n => (n / 1024).toFixed(1) + ' Ko';

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'js', 'vendor'), { recursive: true });

let html = read('index.html');

/* ---------- CSS ---------- */
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map(m => m[1]);
if (!cssFiles.length) throw new Error('aucune feuille de style trouvée');
const cssRaw = cssFiles.map(f => `/* ${f} */\n` + read(f)).join('\n');
const cssMin = (await transform(cssRaw, { loader: 'css', minify: true, legalComments: 'none' })).code;
const cssName = `css/app.${hash(cssMin)}.css`;
fs.writeFileSync(path.join(DIST, cssName), cssMin);

/* ---------- JS ---------- */
const scriptTags = [...html.matchAll(/<script src="(js\/[^"]+)" defer><\/script>/g)].map(m => m[1]);
const vendorFiles = scriptTags.filter(f => f.startsWith('js/vendor/'));
const appScripts = scriptTags.filter(f => !f.startsWith('js/vendor/'));
const SOLO = 'js/features/yor-chain.js';
const cut = appScripts.indexOf(SOLO);
if (cut < 0) throw new Error(SOLO + ' introuvable dans index.html');
const groups = [appScripts.slice(0, cut), [SOLO], appScripts.slice(cut + 1)];
const jsOut = [];
for (const [i, g] of groups.entries()) {
  const parts = [];
  for (const f of g) {
    const src = read(f);
    const min = f === SOLO ? src : (await transform(src, { loader: 'js', minify: true, legalComments: 'none' })).code;
    if (f !== SOLO && !/^["']use strict["']/.test(src.trimStart())) throw new Error(f + ' ne commence pas par "use strict" : regroupement non sûr');
    parts.push(min.trim().replace(/;$/, ''));
  }
  /* « use strict » est aussi le premier mot du lot : identique au comportement de chaque fichier d'origine */
  const body = parts.join(';\n') + ';\n';
  const name = `js/app${i + 1}.${hash(body)}.js`;
  fs.writeFileSync(path.join(DIST, name), body);
  jsOut.push(name);
}
for (const v of vendorFiles) fs.copyFileSync(path.join(ROOT, v), path.join(DIST, v));
fs.copyFileSync(path.join(ROOT, 'js/vendor/reown-appkit.js'), path.join(DIST, 'js/vendor/reown-appkit.js'));   /* chargé à la demande, hors regroupement */

/* ---------- index.html ---------- */
const fonts = ['assets/fonts/manrope-latin-var.woff2', 'assets/fonts/inter-latin-var.woff2'];
html = html.replace(/<link rel="stylesheet" href="css\/[^"]+">\s*/g, '');
html = html.replace(/<script src="js\/[^"]+" defer><\/script>\s*/g, '');
const head = [
  ...fonts.map(f => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`),
  `<link rel="stylesheet" href="${cssName}">`,
  ...vendorFiles.map(f => `<script src="${f}" defer></script>`),
  ...jsOut.map(f => `<script src="${f}" defer></script>`),
].join('\n');
if (html.split('</head>').length !== 2) throw new Error('</head> introuvable');
html = html.replace('</head>', head + '\n</head>');
fs.writeFileSync(path.join(DIST, 'index.html'), html);

/* ---------- fichiers statiques ---------- */
const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
};
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
for (const f of ['404.html', 'offline.html', 'install.html', 'manifest.webmanifest', 'favicon.ico', 'robots.txt']) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));

/* ---------- service worker : liste de fichiers + nom de cache ---------- */
let sw = read('sw.js');
const shellM = sw.match(/const SHELL = \[([\s\S]*?)\];/);
const oldShell = [...shellM[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const keep = oldShell.filter(u => !u.startsWith('css/') && !u.startsWith('js/'));
const shell = [...keep.slice(0, 5), cssName, ...vendorFiles, ...jsOut, ...keep.slice(5)];
for (const u of shell) if (u !== './' && !fs.existsSync(path.join(DIST, u))) throw new Error('dans sw.js mais absent de dist : ' + u);
const cacheName = `fp-shell-v${pkg.version}-${hash(shell.join() + fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') + cssMin)}`;
sw = sw.replace(/const SHELL = \[[\s\S]*?\];/, 'const SHELL = [\n  ' + shell.map(u => `'${u}'`).join(', ') + '\n];').replace(/const CACHE = '[^']*';/, `const CACHE = '${cacheName}';`);
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

/* ---------- _headers : sécurité d'origine + cache long ---------- */
const srcHeaders = read('_headers');
const secEnd = srcHeaders.indexOf('\n/sw.js');
const security = srcHeaders.slice(0, secEnd).trimEnd();
const SWR = 'Cache-Control: public, max-age=86400, stale-while-revalidate=604800';
const IMM = 'Cache-Control: public, max-age=31536000, immutable';
const assetDirs = fs.readdirSync(path.join(DIST, 'assets'), { withFileTypes: true }).filter(e => e.isDirectory() && e.name !== 'fonts').map(e => e.name);
const link = [
  ...fonts.map(f => `  Link: </${f}>; rel=preload; as=font; type=font/woff2; crossorigin`),
  `  Link: </${cssName}>; rel=preload; as=style`,
  ...vendorFiles.map(f => `  Link: </${f}>; rel=preload; as=script`),
  ...jsOut.map(f => `  Link: </${f}>; rel=preload; as=script`),
].join('\n');
const headers = `${security}
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Service-Worker-Allowed: /
/manifest.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=0, must-revalidate
/
  Cache-Control: no-cache
${link}
/index.html
  Cache-Control: no-cache
${link}
/css/*
  ${IMM}
/js/app*
  ${IMM}
/js/vendor/supabase-*
  ${IMM}
/js/vendor/reown-*
  ${SWR}
/assets/fonts/*
  ${IMM}
${assetDirs.map(d => `/assets/${d}/*\n  ${SWR}`).join('\n')}
/offline.html
  Cache-Control: no-cache
/404.html
  Cache-Control: no-cache
/favicon.ico
  Cache-Control: public, max-age=86400
`;
fs.writeFileSync(path.join(DIST, '_headers'), headers);

/* ---------- vercel.json : les MÊMES règles que _headers, pour un déploiement Vercel (dossier racine = dist) ---------- */
{
  const rules = []; let cur = null;
  for (const raw of headers.split('\n')) {
    if (!raw.trim() || raw.startsWith('#')) continue;
    if (!/^\s/.test(raw)) { cur = { path: raw.trim(), h: [] }; rules.push(cur); continue; }
    const m = raw.trim().match(/^([A-Za-z-]+):\s*(.*)$/); if (m && cur) cur.h.push([m[1], m[2]]);
  }
  const toSource = p => p === '/*' ? '/(.*)' : p.replace(/\*$/, '(.*)');
  const vercel = { cleanUrls: false, trailingSlash: false, headers: rules.map(r => {
    const merged = new Map();
    for (const [k, v] of r.h) merged.set(k, merged.has(k) ? merged.get(k) + ', ' + v : v);     /* plusieurs « Link » -> un seul en-tête */
    return { source: toSource(r.path), headers: [...merged].map(([key, value]) => ({ key, value })) };
  }) };
  fs.writeFileSync(path.join(DIST, 'vercel.json'), JSON.stringify(vercel, null, 2) + '\n');
}

/* ---------- bilan ---------- */
const size = f => fs.statSync(path.join(DIST, f)).size;
console.log(`CSS  ${cssFiles.length} fichiers ${kb(Buffer.byteLength(cssRaw))} -> ${cssName} ${kb(size(cssName))}`);
const jsBefore = appScripts.reduce((n, f) => n + Buffer.byteLength(read(f)), 0);
console.log(`JS   ${appScripts.length} fichiers ${kb(jsBefore)} -> ${jsOut.map(f => `${f} ${kb(size(f))}`).join(' + ')}`);
console.log(`SW   ${cacheName}  (${shell.length} fichiers préchargés)`);
