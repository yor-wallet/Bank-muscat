/* Non-régression : compare l'inventaire actuel (scripts/dev/inventory.mjs) à celui de Freindi Pay 20.3.0 (inventory.baseline.json).
   Règle : on peut AJOUTER (nouveaux fichiers, fonctions de présentation) ; on ne doit RIEN retirer — écrans, RPC, tables, fonctions serveur,
   clés de stockage, événements, paramètres — sauf la liste d'exceptions documentées ci-dessous (CHANGELOG_SANAD_PAY.md).
   Usage : node tests/characterization/compare.mjs */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const tmp = path.join(os.tmpdir(), 'sanad-inventory.json');
execFileSync('node', [path.join(ROOT, 'scripts/dev/inventory.mjs'), tmp], { stdio: 'ignore' });
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/characterization/inventory.baseline.json'), 'utf8'));
const now = JSON.parse(fs.readFileSync(tmp, 'utf8'));
/* exceptions documentées : le bouton d'envoi d'une notification de démonstration est retiré (le mot « test » ne doit plus apparaître) */
const ALLOWED_I18N_REMOVALS = new Set(['push.test', 'push.toast.testFail', 'push.toast.testNone', 'push.toast.testSent']);
/* exceptions documentées (SANAD_ANIMATIONS.md §Écarts) :
   - chGid / yGid : compteurs d'identifiants de dégradés du logo vectoriel d'Amal ; le logo est maintenant une image officielle, ils n'ont plus d'usage ;
   - friendly_pin_vault_v1 : la clé reste utilisée par js/features/pin.js (code de verrouillage) ; seule la lecture faite par le nettoyage automatique a été retirée,
     parce que ce coffre n'est pas un cache (voir l'en-tête de Janitor dans js/core/store19.js). */
const ALLOWED_FN_REMOVALS = { 'js/features/chat.js': new Set(['chGid', 'yGid']) };
const ALLOWED_KEY_REMOVALS = new Set(['friendly_pin_vault_v1']);
const SETS = ['jsFiles', 'screens', 'dataNavTargets', 'storageKeys', 'rpc', 'edgeFunctionsInvoked', 'tables', 'customEvents', 'domEventListeners', 'literalFetches'];
let fail = 0; const say = (ok, m) => { console.log((ok ? 'PASS ' : 'FAIL ') + m); if (!ok) fail++; };
for (const k of SETS) {
  const a = new Set((base[k] || []).map(x => JSON.stringify(x))), b = new Set((now[k] || []).map(x => JSON.stringify(x)));
  const removed = [...a].filter(x => !b.has(x) && !(k === 'storageKeys' && ALLOWED_KEY_REMOVALS.has(JSON.parse(x)))), added = [...b].filter(x => !a.has(x));
  say(removed.length === 0, `${k} : ${a.size} → ${b.size} (retirés ${removed.length}${removed.length ? ': ' + removed.slice(0, 5).join(',') : ''}; ajoutés ${added.length})`);
}
for (const [f, fns] of Object.entries(base.functionsByFile || {})) {
  const miss = fns.filter(x => !(now.functionsByFile[f] || []).includes(x) && !(ALLOWED_FN_REMOVALS[f] && ALLOWED_FN_REMOVALS[f].has(x)));
  if (miss.length) say(false, `fonctions retirées dans ${f} : ${miss.join(', ')}`);
}
say(true, `fonctions de premier niveau : aucune retirée dans les ${Object.keys(base.functionsByFile).length} fichiers d'origine`);
for (const f of Object.keys(base.i18nKeys || {})) {
  const miss = base.i18nKeys[f].filter(x => !(now.i18nKeys[f] || []).includes(x) && !ALLOWED_I18N_REMOVALS.has(x));
  say(miss.length === 0, `clés de traduction ${f} : aucune retirée hors exceptions${miss.length ? ' → ' + miss.slice(0, 6).join(',') : ''}`);
}
/* le dossier supabase peut recevoir de NOUVEAUX fichiers (migrations, fonctions) ; aucun existant ne doit disparaître */
{ const bm = new Set((base.supabase && base.supabase.migrations) || []), bf = new Set((base.supabase && base.supabase.functions) || []);
  const nm = new Set((now.supabase && now.supabase.migrations) || []), nf = new Set((now.supabase && now.supabase.functions) || []);
  const lost = [...bm].filter(x => !nm.has(x)).concat([...bf].filter(x => !nf.has(x)));
  say(lost.length === 0, `supabase : aucun fichier retiré (migrations ${bm.size} → ${nm.size}, fonctions ${bf.size} → ${nf.size})${lost.length ? ' → ' + lost.join(',') : ''}`); }
for (const k of ['config']) {
  /* seul le numéro de version de l'application change (20.3.0 → 21.0.0) */
  const strip = o => JSON.stringify(o || {}).replace(/version:\s*'\d+\.\d+\.\d+'/g, "version:'*'").replace(/name:\s*'(Freindi Pay|Barq|Barq)'/g, "name:'*'").replace(/"name":"(Freindi Pay|Barq|Barq)"/g, '"name":"*"');
  const same = strip(base[k]) === strip(now[k]);
  say(same, `${k} identique${same ? '' : ' (différences : ' + JSON.stringify(now[k]).slice(0, 200) + ')'}`);
}
process.exitCode = fail ? 1 : 0;
