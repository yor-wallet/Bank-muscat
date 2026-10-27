/* Audit des couleurs rendues : repère, écran par écran, les éléments encore noirs, verts ou dorés (reliquats de l'ancienne identité).
   Usage : node tests/ui/audit-colors.mjs <dossier-site> [lang] */
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const site = path.resolve(process.argv[2]), lang = process.argv[3] || 'en';
const SCREENS = ['login', 'home', 'history', 'cards', 'services', 'profile', 'settings', 'notifications', 'country-select', 'receive', 'help', 'about', 'devices', 'kyc', 'credit', 'vault', 'invest', 'withdraw', 'chat'];
const { srv, url } = await serve(site); const browser = await launch();
const out = {};
for (const id of SCREENS) {
  const pub = id === 'login';
  const { ctx, page } = await newPage(browser, url, { loggedIn: !pub, lang });
  await page.goto(url + '/index.html'); await page.waitForTimeout(pub ? 2400 : 3000);
  if (!pub) { for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); } await page.waitForTimeout(1400); }
  await page.evaluate(id => { document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()); R.go(id); }, id); await page.waitForTimeout(900);
  out[id] = await page.evaluate(() => {
    const hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
    const res = { dark: [], green: [], gold: [] };
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      for (const [prop, val] of [['bg', cs.backgroundColor], ['color', cs.color], ['border', cs.borderTopColor]]) {
        const m = val.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/); if (!m) continue; const a = m[4] === undefined ? 1 : +m[4]; if (a < .35) continue;
        if (prop === 'border' && cs.borderTopWidth === '0px') continue;
        const [h, s, l] = hsl(+m[1], +m[2], +m[3]); const key = `${tag} ${prop}:${val}`;
        if (prop === 'bg' && l < .1 && r.width * r.height > 1500) res.dark.push(key);
        else if (h >= 95 && h <= 185 && s > .25 && l > .12 && l < .92) res.green.push(key);
        else if (h >= 30 && h <= 62 && s > .45 && l > .2 && l < .85) res.gold.push(key);
      }
    }
    for (const k in res) res[k] = [...new Set(res[k])].slice(0, 14);
    return res;
  });
  await ctx.close();
}
for (const [id, r] of Object.entries(out)) { const any = r.dark.length + r.green.length + r.gold.length; if (!any) continue; console.log(`## ${id}`); for (const k of ['dark', 'green', 'gold']) if (r[k].length) console.log(`  ${k}: ${r[k].join(' | ')}`); }
await browser.close(); srv.close();
