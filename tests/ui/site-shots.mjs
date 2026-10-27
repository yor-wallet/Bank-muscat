/* Page de présentation (site.html) : mobile et ordinateur, arabe (RTL) / anglais / français, défilement complet, débordement, contenu visible sans animation.
   Usage : node tests/ui/site-shots.mjs <site> <dossier> */
import fs from 'node:fs'; import path from 'node:path';
import { serve, launch } from './harness.mjs';
const [site, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch(); const res = [];
const ok = (n, c, d = '') => { res.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
for (const [name, vp, lang, reduced] of [['mobile-ar', { width: 390, height: 844 }, 'ar', 'no-preference'], ['desktop-ar', { width: 1280, height: 860 }, 'ar', 'no-preference'], ['desktop-en', { width: 1280, height: 860 }, 'en', 'no-preference'], ['mobile-fr', { width: 390, height: 844 }, 'fr', 'no-preference'], ['mobile-ar-rm', { width: 390, height: 844 }, 'ar', 'reduce']]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: reduced, isMobile: vp.width < 600, hasTouch: vp.width < 600 });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const bad = []; page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(url, '')); });
  await page.goto(url + '/site.html', { waitUntil: 'load' });
  if (lang !== 'ar') { await page.click(`.lang button[data-lang="${lang}"]`); await page.waitForTimeout(200); }
  const h = await page.evaluate(() => document.documentElement.scrollHeight); let n = 0;
  for (let y = 0; y < h; y += vp.height * 0.9) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(650); if (n < 4) await page.screenshot({ path: path.join(out, `site-${name}-${n + 1}.png`) }); n++; }
  const info = await page.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, overflowX: document.documentElement.scrollWidth > innerWidth + 1, hidden: [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity < 0.99).length, emoji: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText) }));
  ok(`[${name}] sens ${info.dir}/${info.lang}, pas de défilement horizontal, tout visible après défilement, aucun emoji`, !info.overflowX && info.hidden === 0 && !info.emoji && info.dir === (lang === 'ar' ? 'rtl' : 'ltr'), JSON.stringify(info));
  ok(`[${name}] aucune erreur ni ressource manquante`, !errs.length && !bad.length, JSON.stringify({ errs, bad }));
  await ctx.close();
}
await b.close(); srv.close(); process.exitCode = res.every(Boolean) ? 0 : 1;
