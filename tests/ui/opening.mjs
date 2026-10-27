/* Pellicule de la séquence d'ouverture (premier lancement, lancement suivant, mouvement réduit). Usage : node tests/ui/opening.mjs <site> <sortie.png> */
import path from 'node:path';
import fs from 'node:fs';
import { serve, newPage, launch } from './harness.mjs';
const [site, out] = [path.resolve(process.argv[2]), path.resolve(process.argv[3])];
const { srv, url } = await serve(site); const browser = await launch();
const frames = [];
async function film(label, { opened, reduced }) {
  const { ctx, page } = await newPage(browser, url, { loggedIn: false, lang: 'en', reducedMotion: reduced ? 'reduce' : 'no-preference', extraStorage: opened ? { sanad_opened: '1' } : {} });
  const t0 = Date.now();
  await page.goto(url + '/index.html', { waitUntil: 'commit' });
  const times = opened ? [80, 200, 330, 450, 580, 900] : [150, 400, 600, 800, 1000, 1250, 1750];
  for (const t of times) {
    const wait = t - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
    const f = `/tmp/claude-0/op-${label}-${t}.png`; await page.screenshot({ path: f, scale: 'css' }); frames.push([label, t, f]);
  }
  await ctx.close();
}
await film('first', { opened: false, reduced: false });
await film('next', { opened: true, reduced: false });
await film('reduced', { opened: false, reduced: true });
fs.writeFileSync(out + '.json', JSON.stringify(frames));
await browser.close(); srv.close();
