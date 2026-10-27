/* Images de la présentation initiale : une par page, en état stable. Usage : node tests/ui/onboarding-shots.mjs <site> <dossier> [lang] [largeur] */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en', w = '390'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: false, lang, viewport: { width: +w, height: +w > 600 ? 900 : 844 } });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForSelector('.ob-slide', { timeout: 8000 }); await page.waitForTimeout(1600);
const n = await page.locator('.ob-slide').count();
for (let i = 0; i < n; i++) {
  await page.waitForTimeout(2300);
  await page.screenshot({ path: path.join(out, `ob-${lang}-${i + 1}.png`) });
  if (i < n - 1) await page.click('#ob-next');
}
console.log('pages', n); await ctx.close(); await b.close(); srv.close();
