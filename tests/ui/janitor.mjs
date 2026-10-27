/* Nettoyage automatique : seuls les caches temporaires identifiés disparaissent ; session, coffre de code, réglages et données du compte connecté restent.
   Usage : node tests/ui/janitor.mjs <site> */
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const { srv, url } = await serve(path.resolve(process.argv[2] || 'dist')); const b = await launch(); const res = [];
const ok = (n, c, d = '') => { res.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang: 'en' });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(900);
const r = await page.evaluate(async () => {
  const me = Runtime.ctx.uid, other = '99999999-0000-4000-8000-000000000000';
  const seed = { [`sb-gebjmguoauvutiqvoswl-auth-token`]: localStorage.getItem('sb-gebjmguoauvutiqvoswl-auth-token'), friendly_pin_vault_v1: JSON.stringify({ [me]: { v: 1 }, [other]: { v: 1 } }), yor_onboarded: '1', fp_theme: 'dark', yor_device_lang: 'fr', sanad_opened: '1',
    ['amal_ai_' + me]: 'yes', ['chat_draft_' + me]: 'hello', ['fp_cache_' + me]: '{}', ['sanad_ui_' + me]: '{}',
    lx_tmp_a: '1', gq_done_1: '1', ['fp_cache_' + other]: '{}', ['chat_draft_' + other]: 'x', ['amal_ai_' + other]: 'yes', ['sanad_ui_' + other]: '{}' };
  Object.keys(seed).forEach(k => { if (seed[k] != null) localStorage.setItem(k, seed[k]); });
  /* copies chiffrées de démarrage rapide : une pour le compte connecté, une pour un autre */
  await new Promise(res => { const q = indexedDB.open('lx_snap', 1); q.onupgradeneeded = () => { if (!q.result.objectStoreNames.contains('snap')) q.result.createObjectStore('snap'); }; q.onsuccess = () => { const tx = q.result.transaction('snap', 'readwrite'); tx.objectStore('snap').put({ x: 1 }, me); tx.objectStore('snap').put({ x: 1 }, other); tx.oncomplete = () => { q.result.close(); res(); }; }; });
  const before = Object.keys(seed).filter(k => localStorage.getItem(k) != null);
  Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  await Janitor.run();
  const keys = Object.keys(seed).filter(k => localStorage.getItem(k) != null);
  const snaps = await new Promise(res => { const q = indexedDB.open('lx_snap', 1); q.onsuccess = () => { const g = q.result.transaction('snap').objectStore('snap').getAllKeys(); g.onsuccess = () => { q.result.close(); res(g.result); }; }; });
  const vault = JSON.parse(localStorage.getItem('friendly_pin_vault_v1') || '{}');
  return { me, other, before, keys, snaps, vaultUsers: Object.keys(vault) };
});
const gone = r.before.filter(k => !r.keys.includes(k));
const must = ['sb-gebjmguoauvutiqvoswl-auth-token', 'friendly_pin_vault_v1', 'yor_onboarded', 'fp_theme', 'yor_device_lang', 'sanad_opened', 'amal_ai_' + r.me, 'chat_draft_' + r.me, 'fp_cache_' + r.me, 'sanad_ui_' + r.me];
ok('rien de protégé n\'est supprimé (session, coffre de code, réglages, langue, thème, données du compte connecté)', must.every(k => r.keys.includes(k)), JSON.stringify(must.filter(k => !r.keys.includes(k))));
ok('le coffre de code garde les deux comptes (il n\'est plus nettoyé)', r.vaultUsers.length === 2, JSON.stringify(r.vaultUsers));
ok('sont supprimés exactement : clés temporaires et clés de confort d\'un AUTRE compte', JSON.stringify(gone.sort()) === JSON.stringify(['lx_tmp_a', 'gq_done_1', 'fp_cache_' + r.other, 'chat_draft_' + r.other, 'amal_ai_' + r.other, 'sanad_ui_' + r.other].sort()), JSON.stringify(gone));
ok('copie de démarrage rapide : celle du compte connecté reste, celle d\'un autre compte est supprimée', r.snaps.includes(r.me) && !r.snaps.includes(r.other), JSON.stringify(r.snaps));
await b.close(); srv.close(); console.log(`\n${res.filter(Boolean).length}/${res.length} réussis`); process.exitCode = res.every(Boolean) ? 0 : 1;
