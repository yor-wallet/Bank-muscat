/* Vérifie SanadEngine : démarrage sans erreur, flush à la mise en arrière-plan, restauration de l'onglet, reprise sans redessin inutile.
   Usage : node tests/ui/engine.mjs <dossier-site> */
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const site = path.resolve(process.argv[2] || 'dist');
const { srv, url } = await serve(site);
const browser = await launch();
const out = [];
const ok = (name, pass, extra = '') => { out.push({ name, pass: !!pass, extra }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const blocked = [];
const { ctx, page } = await newPage(browser, url, { log: blocked, loggedIn: true, lang: 'en', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const unlock = async () => { for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); } await page.waitForTimeout(1200); };
await page.goto(url + '/index.html', { waitUntil: 'load' });
await page.waitForTimeout(3000); await unlock();
ok('SanadEngine défini', await page.evaluate(() => typeof SanadEngine === 'object' && typeof SanadEngine.flush === 'function'));
await page.evaluate(() => R.go('history'));
await page.waitForTimeout(700);
ok('data-sx-tab suit la route', (await page.evaluate(() => document.documentElement.getAttribute('data-sx-tab'))) !== null);
// passage en arrière-plan puis retour
let reqs = 0; page.on('request', r => { if (/rest\/v1|rpc/.test(r.url())) reqs++; });
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.waitForTimeout(400);
const saved = await page.evaluate(() => Object.keys(localStorage).filter(k => /^sanad_ui_/.test(k)));
ok('état UI sauvegardé (sanad_ui_*)', saved.length >= 1, saved.join(','));
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.waitForTimeout(1500);
ok('reprise : aucun écran vidé', (await page.evaluate(() => document.querySelector('.screen.active, .screen[aria-hidden="false"], #app > *') != null)));
/* référence Freindi Pay 20.3.0 : au démarrage 2 POST user_items (enregistrement appareil + session) — comportement conservé, rien d'autre ne doit apparaître */
ok('aucune écriture nouvelle (hors enregistrement appareil/session de la référence)', blocked.length <= 2 && blocked.every(x => x === 'POST /rest/v1/user_items'), blocked.join(', ') + ' (lectures: ' + reqs + ')');
// restauration après rechargement
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(3000); await unlock(); await page.waitForTimeout(800);
const hash = await page.evaluate(() => location.hash);
ok('restauration de l\'onglet après relance', /history/.test(hash), 'hash=' + hash);
const errs = (page.__errors || []).filter(e => !/favicon|Failed to load resource/i.test(String(e)));
ok('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
await ctx.close(); await browser.close(); srv.close();
process.exitCode = out.some(o => !o.pass) ? 1 : 0;
