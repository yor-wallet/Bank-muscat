/* Cartes dans leurs états (actif, gelé, en attente) et thèmes. Usage : node tests/ui/cards-shots.mjs <site> <dossier> [lang] [theme] */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en', theme = 'light'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, theme });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(1000);
await page.evaluate(() => {
  document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove());
  const base = { label: 'Daily card', number: '4532018800004821', holderName: 'AISHA AL BALUSHI', currency: 'OMR', createdAt: Date.now() - 864e5 * 9 };
  Runtime.cards.length = 0;
  Runtime.cards.push(Object.assign({}, base, { id: 'C1', theme: 'midnight', issued: true, frozen: false }), Object.assign({}, base, { id: 'C2', label: 'Travel', theme: 'aurora', issued: true, frozen: true }), Object.assign({}, base, { id: 'C3', label: 'Online', theme: 'obsidian', issued: false, frozen: false }), Object.assign({}, base, { id: 'C4', label: 'Gold', theme: 'gold', issued: true, frozen: false }));
  R.go('cards', { force: true });
});
await page.waitForTimeout(1400);
await page.screenshot({ path: path.join(out, `cards-${lang}-${theme}-1.png`) });
for (let i = 2; i <= 4; i++) { await page.evaluate(n => { const car = document.querySelector('.rv-car'); const sl = car.querySelectorAll('.rv-slide')[n - 1]; car.scrollTo({ left: sl.offsetLeft - (car.clientWidth - sl.clientWidth) / 2 * (document.dir === 'rtl' ? -1 : 1), behavior: 'instant' }); }, i); await page.waitForTimeout(500); await page.screenshot({ path: path.join(out, `cards-${lang}-${theme}-${i}.png`) }); }
console.log((page.__errors || []).join('|') || 'ok'); await ctx.close(); await b.close(); srv.close();
