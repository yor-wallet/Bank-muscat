/* Barq — bascule de marque : palette (bleus Sanad → bleu électrique Barq) et nom visible (Sanad Pay → Barq, سند باي → برق).
   Usage : node scripts/dev/barq-rebrand.mjs [--dry]. Idempotent. NE TOUCHE PAS aux identifiants techniques : clés de stockage (sanad_*), noms de fichiers/fonctions
   serveur (sanad-agents), classes CSS, objets JS (SanadEngine), colonnes et tables. Seuls les textes visibles et les couleurs changent. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DRY = process.argv.includes('--dry');
const COLORS = [
  ['#17609F', '#2B5FE0'], ['#134F91', '#1B44BB'], ['#0F3F77', '#14308C'], ['#0F4378', '#173FB0'], ['#1E7FC4', '#2559E0'], ['#1E86CF', '#2559E0'], ['#1673BC', '#2559E0'],
  ['#2596DE', '#2F6BFF'], ['#102C4C', '#0B1B3A'], ['#122439', '#0B1B3A'], ['#7ED8F6', '#38D4FF'], ['#EAF8FF', '#EAF1FF'], ['#79DEFF', '#5B8CFF'], ['#238CDF', '#2F6BFF'],
  ['#38B9BE', '#22C3E6'], ['#DFF3FF', '#E3ECFF'], ['#C4EEFF', '#9EE6FF'], ['#BFE9FB', '#C9DAFF'], ['#1B4A7C', '#1B3A8A'], ['#2F6FB5', '#3A66C8'],
  ['#B5D9EE', '#C3D2EE'], ['#CFE6F5', '#D3DEF3'], ['#D5E3F0', '#D9E3F4'], ['#9ED3EE', '#B7C8EE'], ['#73c3e2', '#4FC3FF'], ['#aadcf0', '#9EE6FF'], ['#2081c7', '#2F6BFF'], ['#3a9adf', '#2F6BFF'],
  ['#1E4F8F', '#1B44BB'], ['#2B77C6', '#2B5FE0'],
];
const RGBA = [[[37, 150, 222], [47, 107, 255]], [[19, 79, 145], [27, 68, 187]], [[126, 216, 246], [56, 212, 255]], [[16, 44, 76], [11, 27, 58]], [[14, 52, 96], [11, 27, 58]], [[15, 63, 119], [20, 48, 140]]];
const NAMES = [['SANAD PAY', 'BARQ'], ['Sanad Pay', 'Barq'], ['SANAD-PAY-', 'BARQ-'], ['سند باي', 'برق']];
const FILE_RE = /\.(css|js|mjs|html|svg|webmanifest|json|ts)$/;
const SKIP_DIR = new Set(['node_modules', 'dist', 'android', 'ios', '.git', 'docs', 'deliverables', 'tests', 'vendor']);
const SKIP_FILE = /(^|\/)(package-lock\.json|capacitor\.config\.json|scripts\/dev\/(barq-|rebrand|recolor|brand-report|sanad-|logo-assets|compare-sheets|text2svg|splash|inventory|android-assets))/;
let changed = 0, files = 0;
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walk(p); } else if (FILE_RE.test(e.name)) one(p); } };
function one(p) {
  const rel = path.relative(ROOT, p);
  if (SKIP_FILE.test(rel) || /^js\/vendor\//.test(rel) || /^design\//.test(rel)) return;
  const s0 = fs.readFileSync(p, 'utf8'); let s = s0; files++;
  for (const [a, b] of COLORS) s = s.replace(new RegExp(a, 'gi'), b);
  for (const [[r, g, b2], [r2, g2, b3]] of RGBA) s = s.replace(new RegExp(`rgba\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b2}\\s*,`, 'g'), `rgba(${r2},${g2},${b3},`);
  for (const [a, b] of NAMES) s = s.split(a).join(b);
  if (s !== s0) { changed++; if (!DRY) fs.writeFileSync(p, s); }
}
walk(ROOT);
for (const f of ['manifest.webmanifest', 'index.html', 'sw.js', 'offline.html', '404.html', 'install.html', 'site.html']) { const p = path.join(ROOT, f); if (fs.existsSync(p)) one(p); }
console.log((DRY ? '[simulation] ' : '') + changed + ' fichiers modifiés sur ' + files);
