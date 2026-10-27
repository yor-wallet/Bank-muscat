/* Captures des écrans du parcours d'envoi pilotés par l'état (montant, confirmation, traitement, reçu, détail d'opération).
   Le harnais refuse toute écriture : l'écran « traitement » montre donc l'état RÉEL d'un refus serveur (échec), jamais une réussite simulée.
   Usage : node tests/ui/flow.mjs <dossier-site> <dossier-sortie> [langue] */
import fs from 'node:fs';
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, outDir, lang = 'en'] = [path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4]];
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve(site);
const browser = await launch();
const blocked = [];
const { ctx, page } = await newPage(browser, url, { loggedIn: true, lang, log: blocked, deviceScaleFactor: 2 });
await page.goto(url + '/index.html', { waitUntil: 'load' });
await page.waitForTimeout(3000);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()));
const shot = async name => { await page.waitForTimeout(900); await page.screenshot({ path: path.join(outDir, `${lang}-${name}.png`) }); console.log('shot', name, await page.evaluate(() => location.hash)); };
await page.evaluate(() => R.go('country-select')); await page.fill('#sp-num', '91234567').catch(() => {}); await shot('send-recipient');
await page.evaluate(() => { TX_STATE.beneficiary = { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' }; R.go('tx-amount'); }); await shot('send-amount');
await page.fill('#amt-input', '25').catch(() => {}); await shot('send-amount-filled');
await page.evaluate(() => { TX_STATE.amount = 25; TX_STATE.breakdown = { amount: 25, fee: 0, vat: 0, total: 25 }; R.go('tx-review'); }); await shot('send-review');
await page.evaluate(() => R.go('receipt')); await shot('receipt');
await page.evaluate(() => { const r = document.querySelector('[data-action="view-tx"]'); R.go('history'); }); await page.waitForTimeout(600);
await page.evaluate(() => document.querySelector('[data-action="view-tx"]')?.click()); await shot('tx-detail');
/* envoi : confirmation clavier -> code (mock) -> le serveur local REFUSE l'écriture : on observe l'état d'échec réel, sans succès simulé */
await page.evaluate(() => { TX_STATE.beneficiary = { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' }; TX_STATE.amount = 25; TX_STATE.breakdown = { amount: 25, fee: 0, vat: 0, total: 25 }; R.go('tx-review'); });
await page.waitForTimeout(800);
{ const th = await page.locator('#swipe-thumb').boundingBox(), tr = await page.locator('#swipe').boundingBox();
  if (th && tr) { await page.mouse.move(th.x + th.width / 2, th.y + th.height / 2); await page.mouse.down(); for (let i = 1; i <= 12; i++) await page.mouse.move(th.x + th.width / 2 + (tr.width - th.width) * i / 12, th.y + th.height / 2); await page.mouse.up(); } }
await shot('send-auth');
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"], .ps [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(700); await page.screenshot({ path: path.join(outDir, `${lang}-send-processing-a.png`) });
await page.waitForTimeout(1500); await page.screenshot({ path: path.join(outDir, `${lang}-send-processing-b.png`) });
await page.waitForTimeout(4000); await shot('send-outcome');
console.log('écritures refusées par le harnais:', blocked.join(', ') || 'aucune');
console.log('erreurs:', (page.__errors || []).join(' | ') || 'aucune');
await browser.close(); srv.close();
