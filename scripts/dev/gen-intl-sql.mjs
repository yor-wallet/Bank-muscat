/* Génère supabase/migrations/20261019_live_x_admin_intl.sql : modèle + liste des pays de js/data/intl-catalog.js (source unique).
   Usage : node scripts/dev/gen-intl-sql.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'js/data/intl-catalog.js'), 'utf8') + '\n;({ INTL_CATALOG, INTL_REGIONS })';
const { INTL_CATALOG, INTL_REGIONS } = vm.runInNewContext(src);
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const rows = INTL_CATALOG.map(c => `  (${q(c.iso)}, ${q(c.region)}, ${q(c.cur)}, array[${c.methods.map(q).join(', ')}], ${q(JSON.stringify(c.providers))}::jsonb)`).join(',\n');
for (const c of INTL_CATALOG) if (!INTL_REGIONS.includes(c.region)) throw new Error('région inconnue : ' + c.iso);
if (new Set(INTL_CATALOG.map(c => c.iso)).size !== INTL_CATALOG.length) throw new Error('pays en double');
const seed = `insert into public.intl_countries (iso, region, currency, methods, providers) values\n${rows}\non conflict (iso) do update set region = excluded.region, currency = excluded.currency, methods = excluded.methods, providers = excluded.providers;`;
const tpl = fs.readFileSync(path.join(ROOT, 'scripts/dev/live_x_admin_intl.sql.tpl'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'supabase/migrations/20261019_live_x_admin_intl.sql'), tpl.replace('-- @@INTL_SEED@@', seed));
const byRegion = {}; for (const c of INTL_CATALOG) byRegion[c.region] = (byRegion[c.region] || 0) + 1;
console.log(INTL_CATALOG.length + ' pays', byRegion);
