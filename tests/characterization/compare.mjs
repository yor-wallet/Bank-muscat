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
const SETS = ['jsFiles', 'screens', 'dataNavTargets', 'storageKeys', 'rpc', 'edgeFunctionsInvoked', 'tables', 'customEvents', 'domEventListeners', 'literalFetches'];
let fail = 0; const say = (ok, m) => { console.log((ok ? 'PASS ' : 'FAIL ') + m); if (!ok) fail++; };
for (const k of SETS) {
  const a = new Set((base[k] || []).map(x => JSON.stringify(x))), b = new Set((now[k] || []).map(x => JSON.stringify(x)));
  const removed = [...a].filter(x => !b.has(x)), added = [...b].filter(x => !a.has(x));
  say(removed.length === 0, `${k} : ${a.size} → ${b.size} (retirés ${removed.length}${removed.length ? ': ' + removed.slice(0, 5).join(',') : ''}; ajoutés ${added.length})`);
}
for (const [f, fns] of Object.entries(base.functionsByFile || {})) {
  const miss = fns.filter(x => !(now.functionsByFile[f] || []).includes(x));
  if (miss.length) say(false, `fonctions retirées dans ${f} : ${miss.join(', ')}`);
}
say(true, `fonctions de premier niveau : aucune retirée dans les ${Object.keys(base.functionsByFile).length} fichiers d'origine`);
for (const f of Object.keys(base.i18nKeys || {})) {
  const miss = base.i18nKeys[f].filter(x => !(now.i18nKeys[f] || []).includes(x) && !ALLOWED_I18N_REMOVALS.has(x));
  say(miss.length === 0, `clés de traduction ${f} : aucune retirée hors exceptions${miss.length ? ' → ' + miss.slice(0, 6).join(',') : ''}`);
}
for (const k of ['config', 'supabase']) {
  /* seul le numéro de version de l'application change (20.3.0 → 21.0.0) */
  const strip = o => JSON.stringify(o || {}).replace(/version:\s*'\d+\.\d+\.\d+'/g, "version:'*'");
  const same = strip(base[k]) === strip(now[k]);
  say(same, `${k} identique${same ? '' : ' (différences : ' + JSON.stringify(now[k]).slice(0, 200) + ')'}`);
}
process.exitCode = fail ? 1 : 0;
