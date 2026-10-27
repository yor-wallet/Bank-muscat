/* Images de la scène de traitement dans chacun de ses états. Les états sont posés par SendAnim.setPhase pour CONTRÔLER LE DESSIN (aucune opération n'est lancée,
   aucune écriture n'est possible) ; en usage réel seuls ProcessingEngine.run et la réponse du serveur les posent.
   Usage : node tests/ui/proc-frames.mjs <site> <dossier> [lang] */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(1200);
await page.evaluate(() => { document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()); TX_STATE.beneficiary = { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' }; TX_STATE.amount = 25; TX_STATE.breakdown = { amount: 25, fee: 0, vat: 0, total: 25 }; R.go('processing', { force: true }); });
await page.waitForSelector('.proc-view'); await page.waitForTimeout(1300);
const shot = async n => { await page.waitForTimeout(250); await page.screenshot({ path: path.join(out, `${lang}-proc-${n}.png`) }); };
await shot('1-secure');
await page.evaluate(() => SendAnim.setPhase('send')); await page.waitForTimeout(500); await shot('2-send-a'); await page.waitForTimeout(500); await shot('3-send-b');
await page.evaluate(() => document.querySelector('.proc-view').setAttribute('data-wait', '1')); await shot('4-send-wait');
await page.evaluate(() => SendAnim.setPhase('success')); await page.waitForTimeout(900); await shot('5-success');
await page.evaluate(() => { document.querySelector('.proc-view').removeAttribute('data-wait'); SendAnim.setPhase('fail'); }); await page.waitForTimeout(700); await shot('6-fail');
await page.evaluate(() => SendAnim.setPhase('uncertain')); await page.waitForTimeout(700); await shot('7-uncertain');
console.log('ok', await page.evaluate(() => document.querySelector('.proc-view').getAttribute('data-phase')), (page.__errors || []).join('|') || 'aucune erreur');
await ctx.close(); await b.close(); srv.close();
