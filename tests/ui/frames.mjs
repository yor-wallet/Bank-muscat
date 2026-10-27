/* Images fixes d'une animation : met en pause les animations de la page et les place à des instants précis (Web Animations API).
   Usage : node tests/ui/frames.mjs <site> <sortie-dossier> <sélecteur-racine> <t1,t2,...> [route|-] [lang] [mode-ouverture:full|short|fade]
   Sert à CONTRÔLER le dessin d'un mouvement (jamais à mesurer sa fluidité : voir tests/perf/motion.mjs). */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, rootSel, times, route = '-', lang = 'en', open = 'full'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: route !== '-' && route !== 'login', lang, extraStorage: open === 'short' ? { sanad_opened: '1' } : {} });
await page.goto(url + '/index.html', { waitUntil: 'commit' });
if (route === '-') await page.waitForSelector(rootSel, { timeout: 4000 });
else { await page.waitForTimeout(3000); await page.evaluate(r => { document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()); R.go(r, { force: true }); }, route); await page.waitForSelector(rootSel, { timeout: 5000 }); }
for (const t of times.split(',').map(Number)) {
  await page.evaluate(([sel, t]) => { const r = document.querySelector(sel); (r ? r.getAnimations({ subtree: true }) : document.getAnimations()).forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, [rootSel, t]);
  await page.waitForTimeout(60);
  await page.screenshot({ path: path.join(out, `t${String(t).padStart(5, '0')}.png`) });
}
await ctx.close(); await b.close(); srv.close();
