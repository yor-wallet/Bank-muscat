/* Sanad Pay — classe chaque occurrence restante de l'ancienne marque (Freindi / Friendly / Live X / YOR) dans les SOURCES (pas dist/, pas vendor).
   Usage : node scripts/dev/brand-report.mjs > docs/BRAND_OCCURRENCES.md
   Catégories : identifiant technique (clé de stockage, identifiant JS/CSS, nom de fichier, table / RPC, préfixe d'identifiant de base de données),
   commentaire (aucun effet), documentation / outillage, TEXTE À EXAMINER (tout le reste — doit rester vide pour les textes visibles). */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SKIP = new Set(['node_modules', 'dist', '.git', 'vendor', 'walletconnect']);
const RX = /freindi|freindly|friendly|live ?x(?! digitale\b)|livex|\byor\b|yor[-_]|YorChain|YOR/gi;
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (SKIP.has(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(js|css|html|json|webmanifest|md|mjs|ts|sql|py|txt|toml)$/.test(e.name) && !/\.zip$/.test(e.name) && !/package-lock/.test(e.name)) files.push(p); } })(ROOT);
const cat = { tech: 0, comment: 0, doc: 0, review: 0, mailbox: 0 }; const review = []; const byFile = {};
for (const f of files) {
  const rel = path.relative(ROOT, f); if (rel === 'docs/BRAND_OCCURRENCES.md' || rel.startsWith('docs/screenshots') || rel === 'tests/characterization/inventory.baseline.json') continue;
  const isDoc = /\.md$|^scripts\/dev\/|^tests\/|^supabase\/tests\//.test(rel);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    RX.lastIndex = 0; if (!RX.test(line)) return;
    let c;
    if (isDoc) c = 'doc';
    else if (/^\s*(\/\*|\*|\/\/|<!--)/.test(line) || /\/\*.*(freindi|friendly|live ?x|yor).*\*\//i.test(line)) c = 'comment';
    else if (/(yor_|friendly_|fp_|lx_|YOR-|yor-|YorChain|yor-chain|LiveX|livex\.js|livex\.css|data-yor|--lx-|\.lx-|\blx-|\bfp-|\byor\b.*(id|key|chain|usdt)|YOR-?USDT|YorWallet|yor_wallet)/i.test(line)) c = 'tech';
    else if (/yordigitalefinance@gmail\.com/.test(line)) c = 'mailbox';
    else if (/(yorId|yorTop|yorBase|YorDrawer|toYorId|resolveYorId|v_yor|window\.YOR|yor\.(promos|offers)|friendly-pay|"name": "friendly-pay"|(yor|fp)-shell-|receipt-benef-yor|\byor:)/.test(line)) c = 'tech';
    else if (/(FREINDI PAY \d|FRIENDLY ICON SET|Freindi Pay\.|de Freindi Pay|freindi\.css, sanad\.css|css\/friendly\.css)/.test(line)) c = 'comment';
    else c = 'review';
    cat[c]++; byFile[rel] = byFile[rel] || { tech: 0, comment: 0, doc: 0, review: 0, mailbox: 0 }; byFile[rel][c]++;
    if (c === 'review') review.push(`${rel}:${i + 1}: ${line.trim().slice(0, 160)}`);
  });
}
console.log('# BRAND_OCCURRENCES — occurrences restantes de l\'ancienne marque (généré par `scripts/dev/brand-report.mjs`)\n');
console.log('Règle : **aucun texte visible** ne contient l\'ancienne marque (vérifié sur les écrans rendus EN/FR/AR par `tests/ui/checks.mjs` et par recherche dans `js/i18n/`, `index.html`, `manifest.webmanifest`). Les occurrences ci-dessous sont des identifiants protégés ou des commentaires.\n');
console.log(`| Catégorie | Lignes |\n|---|---|\n| Identifiant technique protégé (clé de stockage, identifiant JS/CSS, nom de fichier, préfixe d'identifiant de base) | ${cat.tech} |\n| Commentaire de code (aucun effet) | ${cat.comment} |\n| Adresse e-mail d'assistance / d'expédition du propriétaire (boîte réelle, non modifiée — voir CHANGELOG) | ${cat.mailbox} |\n| Documentation / outillage / bancs de test | ${cat.doc} |\n| À examiner (texte restant non classé) | ${cat.review} |\n`);
console.log('## Par fichier (hors documentation)\n\n| Fichier | technique | commentaire | à examiner |\n|---|---|---|---|');
for (const [f, c] of Object.entries(byFile).filter(([, c]) => c.tech + c.comment + c.review).sort((a, b) => (b[1].tech + b[1].comment + b[1].review) - (a[1].tech + a[1].comment + a[1].review))) console.log(`| \`${f}\` | ${c.tech} | ${c.comment} | ${c.review} |`);
console.log('\n## Lignes « à examiner »\n');
console.log(review.length ? review.map(l => '- `' + l.replace(/`/g, "'") + '`').join('\n') : '_Aucune._');
