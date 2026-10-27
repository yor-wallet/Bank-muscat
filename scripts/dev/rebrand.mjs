/* Sanad Pay — changement de marque des TEXTES VISIBLES (idempotent, jamais de remplacement aveugle).
   Usage : node scripts/dev/rebrand.mjs [--dry]
   Remplace uniquement des chaînes de marque exactes, dans une liste blanche de fichiers.
   Ne touche pas aux feuilles CSS (ne contiennent que des commentaires d'historique), ni à walletconnect/ (sources du bundle). Ne touche jamais : clés de stockage, noms de tables / RPC / fonctions, identifiants YOR-…, migrations SQL, dist/, CHANGELOG.md, ARCHITECTURE.md (historique),
   js/vendor/*, js/features/yor-chain.js (fichier généré). « Bank Muscat » (banque externe de reference-data.js) n'est pas concerné. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const dry = process.argv.includes('--dry');
const walk = (d, acc = []) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const p = path.posix.join(d, e.name); if (e.isDirectory()) { if (!['node_modules', 'dist', '.git', 'vendor', 'migrations', 'tests', 'docs'].includes(e.name)) walk(p, acc); } else acc.push(p); } return acc; };
const files = [
  ...walk('js').filter(f => f.endsWith('.js') && f !== 'js/features/yor-chain.js'),
  ...walk('assets').filter(f => f.endsWith('.svg')),
  ...walk('supabase/functions'),
  ...['index.html', 'offline.html', '404.html', 'install.html', 'manifest.webmanifest', 'sw.js', 'package.json', 'netlify.toml', 'scripts/build.mjs', 'DEPLOIEMENT-VERCEL.md'],
].filter(f => fs.existsSync(path.join(ROOT, f)));

/* [motif, remplacement, description] — ordre significatif */
const RULES = [
  [/Freindi Pay ID/g, 'Sanad Pay ID'],
  [/FREINDI PAY/g, 'SANAD PAY'],
  [/Freindi Pay/g, 'Sanad Pay'],
  [/فريندي باي/g, 'سند باي'],
  /* mot-symbole composé (logoLockup, maquettes de téléphone) : nom + sous-titre dans deux éléments */
  [/<span class="logo-name logo-name-ar">فريندي<\/span>/g, '<span class="logo-name logo-name-ar">سند</span>'],
  [/<span class="logo-name">FREINDI<\/span>/g, '<span class="logo-name">SANAD</span>'],
  [/<b>FREINDI<\/b><small>PAY<\/small>/g, '<b>SANAD</b><small>PAY</small>'],
  [/Live X Digitale/g, 'Sanad Pay'],
  [/ID Live X/g, 'ID Sanad Pay'],
  [/Live X ID/g, 'Sanad Pay ID'],
  [/Friendly Pay — /g, 'Sanad Pay — '],
  [/Friendly Pay/g, 'Sanad Pay'],
];
const changed = [];
for (const f of files) {
  let s = fs.readFileSync(path.join(ROOT, f), 'utf8'), n = 0;
  for (const [re, to] of RULES) s = s.replace(re, () => { n++; return to; });
  if (n) { changed.push([f, n]); if (!dry) fs.writeFileSync(path.join(ROOT, f), s); }
}
console.log(changed.map(([f, n]) => `${String(n).padStart(4)}  ${f}`).join('\n'));
console.log(`${changed.length} fichiers, ${changed.reduce((a, [, n]) => a + n, 0)} remplacements${dry ? ' (simulation)' : ''}`);
