/* Sanad Pay — génère js/features/amal-triage.js (script classique du navigateur) à partir de la source unique
   supabase/functions/sanad-agents/core.mjs : le TRI (urgence, donnée sensible, textes fixes, contrôle de sortie) est donc identique
   côté application et côté serveur. Usage : node scripts/dev/sync-triage.mjs [--check]  (--check échoue si le fichier est périmé) */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'supabase/functions/sanad-agents/core.mjs'), 'utf8');
const a = src.indexOf('/* ---------- texte : nettoyage'), b = src.indexOf('/* ---------- métriques agrégées');
if (a < 0 || b < 0) throw new Error('marqueurs introuvables dans core.mjs');
const body = src.slice(a, b).replace(/^export /gm, '').trimEnd();
const out = `'use strict';

/* ============================================================
   AMAL TRIAGE — GÉNÉRÉ, NE PAS MODIFIER À LA MAIN.
   Source : supabase/functions/sanad-agents/core.mjs  ·  Régénérer : node scripts/dev/sync-triage.mjs
   Rôle : avant tout envoi à l'assistance IA, l'application repère sur l'appareil les messages URGENTS (réponse fixe + passage à une personne)
   et les messages contenant une donnée SENSIBLE (mot de passe, code, carte, IBAN, téléphone, e-mail) : ceux-là ne quittent jamais l'appareil.
   ============================================================ */
const AmalTriage = (() => {
${body.split('\n').map(l => l ? '  ' + l : l).join('\n')}
  return { detectUrgent, isSensitive, triage, guardOutput, CANNED };
})();
`;
const file = path.join(ROOT, 'js/features/amal-triage.js');
if (process.argv.includes('--check')) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== out) { console.error('amal-triage.js est périmé : node scripts/dev/sync-triage.mjs'); process.exit(1); } console.log('amal-triage.js à jour'); }
else { fs.writeFileSync(file, out); console.log('écrit', path.relative(ROOT, file), out.length, 'o'); }
