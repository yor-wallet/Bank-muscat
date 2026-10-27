/* Captures d'écran + contrôles de base. Usage : node tests/ui/capture.mjs <dossier-site> <dossier-sortie> [nom]
   Largeurs : iPhone 390, iPhone SE 320, Android 412, tablette 820. Langues : en, fr, ar. Données de test fictives (harness.mjs). */
import fs from 'node:fs';
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';

const [site, outDir, only] = [path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4]];
fs.mkdirSync(outDir, { recursive: true });
const SCREENS = ['login', 'signup', 'home', 'history', 'cards', 'services', 'profile', 'settings', 'notifications', 'country-select', 'tx-amount', 'receive', 'help', 'about', 'privacy', 'devices', 'chat', 'kyc', 'credit', 'vault', 'invest', 'cinema', 'withdraw', 'intl'];
const DEVICES = { iphone: { width: 390, height: 844 }, se: { width: 320, height: 568 }, android: { width: 412, height: 915 }, tablet: { width: 820, height: 1180 } };
const plan = [
  ['iphone', 'en', SCREENS], ['iphone', 'ar', ['login', 'home', 'history', 'cards', 'services', 'profile', 'settings', 'country-select']], ['iphone', 'fr', ['login', 'home', 'history']],
  ['se', 'en', ['login', 'home']], ['android', 'en', ['home', 'history', 'services']], ['tablet', 'en', ['home', 'history']],
];
const { srv, url } = await serve(site);
const browser = await launch();
const report = [];
for (const [dev, lang, screens] of plan) {
  for (const id of screens) {
    if (only && !`${dev}-${lang}-${id}`.includes(only)) continue;
    const pub = ['login', 'signup'].includes(id);
    const { ctx, page } = await newPage(browser, url, { loggedIn: !pub, lang, viewport: DEVICES[dev], deviceScaleFactor: 2 });
    try {
      await page.goto(url + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(pub ? 2600 : 3200);
      // sortir de l'ouverture / verrous éventuels pour atteindre l'écran
      if (!pub) { for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); } await page.waitForTimeout(1500); await page.evaluate(id => { try { document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()); R.go(id); } catch (e) {} }, id); }
      else { await page.evaluate(id => { try { document.querySelectorAll('#lang-picker').forEach(e => e.remove()); R.go(id); } catch (e) {} }, id); }
      await page.waitForTimeout(900);
      const info = await page.evaluate(() => ({ hash: location.hash, dir: document.documentElement.dir, lang: document.documentElement.lang, title: document.title, overflowX: document.documentElement.scrollWidth > innerWidth + 1, text: (document.body.innerText || '').slice(0, 120).replace(/\s+/g, ' ') }));
      await page.screenshot({ path: path.join(outDir, `${dev}-${lang}-${id}.png`) });
      report.push({ dev, lang, id, ...info, errors: page.__errors || [] });
    } catch (e) { report.push({ dev, lang, id, fatal: String(e) }); }
    await ctx.close();
  }
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
console.log(report.map(r => `${r.dev}-${r.lang}-${r.id}: ${r.fatal || (r.hash + ' dir=' + r.dir + (r.overflowX ? ' OVERFLOW-X' : '') + (r.errors.length ? ' ERR=' + r.errors.length : ''))}`).join('\n'));
await browser.close(); srv.close();
