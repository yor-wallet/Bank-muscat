/* Contrôles automatiques sur le build : marque visible, mot interdit, manifeste, débordement, cibles tactiles, requêtes locales en échec, RTL.
   Usage : node tests/ui/checks.mjs <dossier-site> [sortie.json] — serveur simulé, écritures refusées. */
import fs from 'node:fs';
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const site = path.resolve(process.argv[2] || 'dist'); const outFile = process.argv[3];
const { srv, url } = await serve(site);
const browser = await launch();
const results = []; const rec = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
const FORBIDDEN = /sanad|سند|freindi|friendly pay|freindly|live ?x|livex|\byor\b(?![- ]?(?:tx|id)\b)|\btest(s|e|ed|ing)?\b|testnet|bankmct|bank muscat|مسقط/i;
const ROUTES = ['login', 'signup', 'home', 'history', 'cards', 'services', 'profile', 'settings', 'notifications', 'receive', 'help', 'about', 'privacy', 'devices', 'country-select', 'tx-amount', 'kyc', 'credit', 'vault', 'invest', 'cinema', 'withdraw', 'intl', 'chat'];
const failedLocal = new Set();
for (const lang of ['en', 'fr', 'ar']) {
  const { ctx, page } = await newPage(browser, url, { loggedIn: true, lang, deviceScaleFactor: 1 });
  page.on('response', r => { if (r.url().startsWith(url) && r.status() >= 400) failedLocal.add(`${r.status()} ${r.url().replace(url, '')}`); });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) { const k = page.locator('[data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.mb').forEach(e => e.remove()));
  const bad = [], over = [], small = [];
  for (const id of ROUTES) {
    if (lang !== 'en' && !['home', 'history', 'settings', 'cards', 'profile', 'services', 'country-select'].includes(id)) continue;
    await page.evaluate(id => { try { R.go(id); } catch (e) {} }, id); await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const txt = document.body.innerText || '';
      const small = []; for (const el of document.querySelectorAll('button,a[href],[role=button],input:not([type=hidden]),select,[data-action],[data-nav]')) {
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!b.width || !b.height || cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[hidden],[inert]') || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue;
        if (b.width < 40 || b.height < 40) small.push((el.id || el.className || el.tagName).toString().slice(0, 40) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
      }
      return { txt, hash: location.hash, ox: document.documentElement.scrollWidth > innerWidth + 1, dir: document.documentElement.dir, lang: document.documentElement.lang, small, title: document.title };
    });
    const m = r.txt.match(FORBIDDEN); if (m) bad.push(`${id}:"${m[0]}"`);
    if (r.ox) over.push(id); if (r.small.length) small.push(id + ' → ' + r.small.slice(0, 4).join(' | '));
    if (id === 'home') rec(`[${lang}] titre et dir/lang`, /Barq|برق/.test(r.title) && r.dir === (lang === 'ar' ? 'rtl' : 'ltr') && r.lang === lang, `${r.title} / ${r.dir} / ${r.lang}`);
  }
  rec(`[${lang}] aucun mot interdit visible (ancienne marque, « test », banque tierce)`, bad.length === 0, bad.join(', '));
  rec(`[${lang}] aucun défilement horizontal`, over.length === 0, over.join(', '));
  rec(`[${lang}] cibles tactiles ≥ 40 px (information)`, true, small.length ? small.slice(0, 6).join(' ; ') : 'toutes conformes');
  rec(`[${lang}] aucune erreur console`, !(page.__errors || []).length, (page.__errors || []).slice(0, 3).join(' | '));
  await ctx.close();
}
rec('aucune ressource locale en échec (4xx/5xx)', failedLocal.size === 0, [...failedLocal].slice(0, 8).join(', '));
const man = JSON.parse(fs.readFileSync(path.join(site, 'manifest.webmanifest'), 'utf8'));
rec('manifeste : nom, couleurs, icônes', /Barq/.test(man.name) && man.theme_color === '#F3F6FA' && man.background_color === '#F3F6FA' && (man.icons || []).length >= 3 && (man.icons || []).some(i => /maskable/.test(i.purpose || '')), `${man.name} ${man.theme_color} ${man.background_color} icônes=${(man.icons || []).length}`);
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
rec('index.html : aucune requête vers un autre site pour les polices', !/fonts\.(googleapis|gstatic)/.test(html));
rec('index.html : image de démarrage iOS déclarée', /apple-touch-startup-image/.test(html));
await browser.close(); srv.close();
if (outFile) fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
process.exitCode = results.some(r => !r.pass) ? 1 : 0;
