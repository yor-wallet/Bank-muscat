/* Inventaire visuel : ouvre CHAQUE écran enregistré (R.ids()) dans une seule session déverrouillée et le capture.
   Usage : node tests/ui/all-screens.mjs <site> <dossier> [langue=en] [theme=light] [largeur=390]
   Écrit <dossier>/<id>.png et screens.json (id, titre, hash, débordement, erreurs). Aucune écriture serveur (banc isolé). */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en', theme = 'light', width = '390'] = [path.resolve(process.argv[2] || 'dist'), path.resolve(process.argv[3] || 'all-screens'), process.argv[4], process.argv[5], process.argv[6]];
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(site); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, theme, viewport: { width: +width, height: 844 }, role: process.env.ROLE || 'user' });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(3000); await page.evaluate(th => { try { applyTheme(th); } catch (e) {} }, theme);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(1500);
const ids = await page.evaluate(() => R.ids());
const rep = [];
for (const id of ids) {
  try {
    await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()));
    await page.evaluate(id => { try { R.go(id, { force: true }); } catch (e) { window.__e = String(e); } }, id);
    await page.waitForTimeout(650);
    const info = await page.evaluate(() => { const a = document.querySelector('.screen.active'); return { active: a && a.id, h: location.hash, ox: document.documentElement.scrollWidth > innerWidth + 1, text: a ? a.innerText.replace(/\s+/g, ' ').slice(0, 80) : '' }; });
    await page.screenshot({ path: path.join(out, id.replace(/[^\w-]/g, '_') + '.png') });
    rep.push({ id, ...info, errors: (page.__errors || []).splice(0) });
  } catch (e) { rep.push({ id, fatal: String(e).slice(0, 120) }); }
}
fs.writeFileSync(path.join(out, 'screens.json'), JSON.stringify(rep, null, 1));
console.log(rep.length + ' écrans; différents de la route demandée: ' + rep.filter(r => r.active !== r.id).map(r => r.id + '→' + r.active).join(', '));
await ctx.close(); await b.close(); srv.close();
