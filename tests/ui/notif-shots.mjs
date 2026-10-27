/* Bandeaux de notification dans l'application (affichage seulement : on appelle InAppNotif comme le font les modules ; rien n'est envoyé ni livré). */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en', theme = 'light'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, theme });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(900);
await page.evaluate(() => { document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()); R.go('home', { force: true }); });
await page.waitForTimeout(900);
await page.evaluate(() => { InAppNotif.show({ icon: 'download', title: 'Money received', message: 'From Fatma Al Rawahi', amount: 'OMR 100.000', status: 'success', durationMs: 20000 }); InAppNotif.show({ icon: 'clock', title: 'Transfer in progress', message: 'To Salim Al Harthy', status: 'warning', durationMs: 20000 }); });
await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, `notif-${lang}-${theme}-banner.png`) });
await page.evaluate(() => { document.querySelectorAll('.notif-ios').forEach(e => InAppNotif.dismiss(e)); InAppNotif.showCall({ title: 'Transfer sent', message: 'Salim Al Harthy', amount: 'OMR 25.000', durationMs: 20000 }); });
await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, `notif-${lang}-${theme}-call.png`) });
console.log((page.__errors || []).join('|') || 'ok'); await ctx.close(); await b.close(); srv.close();
