/* Sanad Pay — inventaire de non-régression.
   Usage : node scripts/dev/inventory.mjs [sortie.json]
   Lit les sources (jamais dist/) et produit un instantané JSON : écrans (routes), fonctions de premier niveau,
   clés de stockage, RPC / fonctions serveur / tables, événements, paramètres critiques, liste du service worker.
   Le même script, relancé après la refonte, doit donner les MÊMES ensembles (voir tests/characterization/compare.mjs). */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const out = process.argv[2] || path.join(ROOT, 'tests', 'characterization', 'inventory.json');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = read('index.html');
const jsFiles = [...html.matchAll(/<script src="(js\/[^"]+)" defer>/g)].map(m => m[1]).filter(f => !f.startsWith('js/vendor/') && f !== 'js/features/yor-chain.js');
const files = jsFiles;
const uniq = a => [...new Set(a)].sort();

const funcs = {}, storage = new Set(), rpcs = new Set(), fnInvoke = new Set(), tables = new Set(), events = new Set(), listeners = new Set(), fetches = new Set(), navTargets = new Set();
for (const f of files) {
  const s = read(f);
  funcs[f] = uniq([
    ...[...s.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]),
    ...[...s.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm)].map(m => m[1]),
  ]);
  for (const m of s.matchAll(/(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*['"`]([^'"`]+)['"`]/g)) storage.add(m[1]);
  for (const m of s.matchAll(/\.rpc\(\s*['"`]([^'"`]+)['"`]/g)) rpcs.add(m[1]);
  for (const m of s.matchAll(/functions\.invoke\(\s*['"`]([^'"`]+)['"`]/g)) fnInvoke.add(m[1]);
  for (const m of s.matchAll(/\.from\(\s*['"`]([^'"`]+)['"`]/g)) tables.add(m[1]);
  for (const m of s.matchAll(/(?:new CustomEvent|dispatchEvent\(new Event)\(\s*['"`]([^'"`]+)['"`]/g)) events.add(m[1]);
  for (const m of s.matchAll(/addEventListener\(\s*['"`]([^'"`]+)['"`]/g)) listeners.add(m[1]);
  for (const m of s.matchAll(/\bfetch\(\s*['"`]([^'"`]+)['"`]/g)) fetches.add(m[1]);
  for (const m of s.matchAll(/data-nav=\\?["']([a-z0-9-]+)\\?["']/g)) navTargets.add(m[1]);
}
for (const m of html.matchAll(/data-nav="([a-z0-9-]+)"/g)) navTargets.add(m[1]);

const reg = read('js/screens/register.js');
const routes = new Set();
for (const m of reg.matchAll(/(?:^|[\s,{])'?([a-z][a-z0-9-]*)'?\s*:\s*[\w.]+\s*(?=[,}\n])/gm)) routes.add(m[1]);
const metaRoutes = new Set();
for (const f of files) for (const m of read(f).matchAll(/R\.(?:register|meta)\(\s*\{([\s\S]*?)\}\s*\)/g)) for (const k of m[1].matchAll(/(?:^|[\s,{])'?([a-z][a-z0-9-]*)'?\s*:/gm)) metaRoutes.add(k[1]);

const ref = read('js/data/reference-data.js');
const config = {};
const cfgBlock = ref.match(/const CONFIG = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
if (cfgBlock) config.CONFIG = cfgBlock[1].replace(/\s+/g, ' ').replace(/name:'[^']*'/, "name:'<brand>'");
const feat = ref.match(/const FEATURES = Object\.freeze\(([^)]*)\)/); if (feat) config.FEATURES = feat[1];

const sw = read('sw.js');
const shell = [...(sw.match(/const SHELL = \[([\s\S]*?)\];/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const migrations = fs.existsSync(path.join(ROOT, 'supabase/migrations')) ? fs.readdirSync(path.join(ROOT, 'supabase/migrations')).sort() : [];
const edgeFns = fs.existsSync(path.join(ROOT, 'supabase/functions')) ? fs.readdirSync(path.join(ROOT, 'supabase/functions')).sort() : [];
const i18nKeys = {};
for (const f of ['js/i18n/translations.js', 'js/i18n/livex.js']) {
  const s = read(f);
  i18nKeys[f] = uniq([...s.matchAll(/(?:^|[\s,{])'?([A-Za-z][\w]*(?:\.[\w-]+)+)'?\s*:/gm)].map(m => m[1]));
}

const snap = {
  generatedFrom: 'sources (hors dist/)',
  jsFiles: files,
  screens: uniq([...routes, ...metaRoutes]),
  dataNavTargets: uniq(navTargets),
  functionsByFile: funcs,
  storageKeys: uniq(storage),
  rpc: uniq(rpcs), edgeFunctionsInvoked: uniq(fnInvoke), tables: uniq(tables),
  customEvents: uniq(events), domEventListeners: uniq(listeners), literalFetches: uniq(fetches),
  config, swShellCount: shell.length,
  supabase: { migrations, functions: edgeFns },
  i18nKeyCounts: Object.fromEntries(Object.entries(i18nKeys).map(([k, v]) => [k, v.length])),
  i18nKeys,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(snap, null, 1) + '\n');
console.log(`inventaire -> ${path.relative(ROOT, out)} : ${snap.screens.length} écrans, ${Object.values(funcs).flat().length} symboles, ${snap.storageKeys.length} clés de stockage, ${snap.rpc.length} RPC, ${snap.edgeFunctionsInvoked.length} fonctions serveur, ${snap.tables.length} tables, ${snap.customEvents.length} événements`);
