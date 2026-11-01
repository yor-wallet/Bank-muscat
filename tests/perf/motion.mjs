/* Mesure de FLUIDITÉ des animations Barq (Chromium, serveur et données simulés, écritures refusées).
   Usage : node tests/perf/motion.mjs <dossier-site> <sortie.json> [passes=3]
   Méthode : un échantillonneur requestAnimationFrame enregistre l'intervalle entre images pendant chaque scénario ;
   on rapporte le nombre d'images, la médiane, le 95e centile, la pire image et la part d'images > 20 ms / > 34 ms.
   Limites assumées : c'est Chromium sans écran physique, avec CPU ralenti pour émuler un téléphone modeste. Ces chiffres
   décrivent CE banc ; ils ne prouvent rien sur un vrai appareil (iOS, Android bas de gamme) qui reste à mesurer. */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from '../ui/harness.mjs';
const [site, out, passes = '3'] = [path.resolve(process.argv[2] || 'dist'), path.resolve(process.argv[3] || 'tests/perf/motion.json'), process.argv[4]];
const { srv, url } = await serve(site); const b = await launch();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const PROFILES = [
  { id: 'mobile-390-cpu4x', lang: 'en', viewport: { width: 390, height: 844 }, cpu: 4, mobile: true },
  { id: 'mobile-390-ar-cpu4x', lang: 'ar', viewport: { width: 390, height: 844 }, cpu: 4, mobile: true },
  { id: 'desktop-1280', lang: 'en', viewport: { width: 1280, height: 800 }, cpu: 1, mobile: false },
  /* même bureau, niveau d'effets « lite » choisi, puis niveau laissé en automatique (le rendu logiciel du banc doit le faire passer en « lite » tout seul) */
  { id: 'desktop-1280-lite', lang: 'en', viewport: { width: 1280, height: 800 }, cpu: 1, mobile: false, fx: 'lite' },
  { id: 'desktop-1280-auto', lang: 'en', viewport: { width: 1280, height: 800 }, cpu: 1, mobile: false, fx: 'auto' },
].filter(p => !process.env.ONLY || p.id.includes(process.env.ONLY));
const fxStore = p => p.fx === 'auto' ? { sanad_fx: 'auto' } : p.fx ? { sanad_fx: p.fx } : {};
const SAMPLER = () => {
  window.__fr = { on: false, t: [], last: 0, tag: '' };
  const tick = ts => { const f = window.__fr; if (f.on) { if (f.last) f.t.push(+(ts - f.last).toFixed(2)); f.last = ts; } else f.last = 0; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
};
const stats = t => ({ frames: t.length, medianMs: +med(t).toFixed(1), p95Ms: +pct(t, .95).toFixed(1), worstMs: +Math.max(0, ...t).toFixed(1), over20: +(100 * t.filter(x => x > 20).length / Math.max(1, t.length)).toFixed(1), over34: +(100 * t.filter(x => x > 34).length / Math.max(1, t.length)).toFixed(1) });
async function record(page, fn, settle) {
  await page.evaluate(() => { window.__fr.t = []; window.__fr.on = true; });
  await fn(); await page.waitForTimeout(settle);
  return page.evaluate(() => { window.__fr.on = false; return window.__fr.t.slice(); });
}
async function session(p, scenario) {
  const { ctx, page } = await newPage(b, url, { loggedIn: scenario !== 'opening', lang: p.lang, viewport: p.viewport, isMobile: p.mobile, hasTouch: p.mobile, deviceScaleFactor: p.mobile ? 2 : 1, extraStorage: fxStore(p) });
  const cdp = await ctx.newCDPSession(page);
  if (p.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
  await page.addInitScript(SAMPLER);
  return { ctx, page };
}
const results = {};
for (const p of PROFILES) {
  const r = results[p.id] = {};
  { const { ctx, page } = await session(p, 'nav'); await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(800);
    r.tier = await page.evaluate(() => document.documentElement.getAttribute('data-fx')); await ctx.close(); }
  /* 1. ouverture : de la navigation jusqu'à la stabilisation (l'échantillonneur est lancé dès le départ) */
  { const runs = [];
    for (let i = 0; i < +passes; i++) {
      const { ctx, page } = await session(p, 'opening');
      await page.addInitScript(() => { const iv = setInterval(() => { if (window.__fr) { window.__fr.on = true; clearInterval(iv); } }, 0); });
      await page.goto(url + '/index.html', { waitUntil: 'commit' });
      await page.waitForTimeout(4200);
      const t = await page.evaluate(() => { window.__fr.on = false; return window.__fr.t.slice(); });
      runs.push(stats(t)); await ctx.close();
    }
    r.opening = { median: runs.map(x => x.medianMs), p95: runs.map(x => x.p95Ms), worst: runs.map(x => x.worstMs), over20pct: runs.map(x => x.over20), over34pct: runs.map(x => x.over34), frames: runs.map(x => x.frames) }; }
  /* 2. transitions d'écran + 3. panneau : session ouverte, écran d'accueil déverrouillé */
  { const sc = [], pn = [];
    for (let i = 0; i < +passes; i++) {
      const { ctx, page } = await session(p, 'nav');
      await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
      for (let k = 0; k < 6; k++) { const key = page.locator('.yl [data-k="1"]').first(); if (await key.count()) await key.click({ delay: 20 }).catch(() => {}); }
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()));
      const route = ['history', 'cards', 'settings', 'home'];
      const frames = [];
      for (let n = 0; n < 2; n++) for (const id of route) frames.push(...await record(page, () => page.evaluate(r => R.go(r, { force: true }), id), 700));
      sc.push(stats(frames));
      const pf = [];
      for (let n = 0; n < 3; n++) {
        pf.push(...await record(page, () => page.evaluate(() => { window.__c = R.overlay.open('<div style="padding:24px"><h3>Sanad</h3><p>Panel</p><button class="btn">OK</button></div>', { kind: 'sheet' }); }), 700));
        pf.push(...await record(page, () => page.evaluate(() => { try { R.overlay.close(); } catch (e) { /* rien */ } }), 700));
      }
      pn.push(stats(pf)); await ctx.close();
    }
    const agg = a => ({ median: a.map(x => x.medianMs), p95: a.map(x => x.p95Ms), worst: a.map(x => x.worstMs), over20pct: a.map(x => x.over20), over34pct: a.map(x => x.over34), frames: a.map(x => x.frames) });
    r.screenTransitions = agg(sc); r.panel = agg(pn); }
  console.log(p.id, JSON.stringify(r));
}
/* 4. réduire les animations : rien ne tourne en boucle, 5. rendu léger, 6. écouteurs : pas de fuite après 30 navigations */
const checks = {};
{ const { ctx, page } = await newPage(b, url, { loggedIn: true, lang: 'en', reducedMotion: 'reduce' });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
  for (let k = 0; k < 6; k++) { const key = page.locator('.yl [data-k="1"]').first(); if (await key.count()) await key.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()));
  checks.reducedMotion = await page.evaluate(() => {
    const as = document.getAnimations(); const inf = as.filter(a => { const t = a.effect && a.effect.getComputedTiming(); return t && t.iterations === Infinity; });
    return { running: as.filter(a => a.playState === 'running').length, infiniteLoops: inf.length, names: [...new Set(inf.map(a => a.animationName || a.transitionProperty || 'js'))].slice(0, 8) };
  });
  await ctx.close(); }
{ const { ctx, page } = await newPage(b, url, { loggedIn: true, lang: 'en' });
  await page.addInitScript(() => {
    const live = new Map(); const wrap = (T) => { const a = T.prototype.addEventListener, r = T.prototype.removeEventListener;
      T.prototype.addEventListener = function (t, f, o) { const k = (this === window ? 'window' : this === document ? 'document' : 'node') + ':' + t; if (this === window || this === document) live.set(k, (live.get(k) || 0) + 1); return a.call(this, t, f, o); };
      T.prototype.removeEventListener = function (t, f, o) { const k = (this === window ? 'window' : this === document ? 'document' : 'node') + ':' + t; if (this === window || this === document) live.set(k, Math.max(0, (live.get(k) || 0) - 1)); return r.call(this, t, f, o); }; };
    wrap(EventTarget); window.__live = live; });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
  for (let k = 0; k < 6; k++) { const key = page.locator('.yl [data-k="1"]').first(); if (await key.count()) await key.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()));
  const snap = () => page.evaluate(() => ({ listeners: Object.fromEntries([...window.__live].filter(([k]) => /^(window|document)/.test(k))), animations: document.getAnimations().length, nodes: document.getElementsByTagName('*').length, heap: performance.memory ? performance.memory.usedJSHeapSize : 0 }));
  for (const id of ['history', 'cards', 'settings', 'home']) { await page.evaluate(r => R.go(r, { force: true }), id); await page.waitForTimeout(450); }
  const before = await snap();
  for (let n = 0; n < 30; n++) { for (const id of ['history', 'cards', 'settings', 'home']) { await page.evaluate(r => R.go(r, { force: true }), id); await page.waitForTimeout(60); } }
  await page.waitForTimeout(800);
  const after = await snap();
  const grow = {}; for (const k of new Set([...Object.keys(before.listeners), ...Object.keys(after.listeners)])) { const d = (after.listeners[k] || 0) - (before.listeners[k] || 0); if (d) grow[k] = d; }
  checks.navigationLeak = { navigations: 120, listenerGrowth: grow, animationsBefore: before.animations, animationsAfter: after.animations, nodesBefore: before.nodes, nodesAfter: after.nodes };
  /* hors écran : un élément surveillé hors de la vue reçoit .mo-off */
  checks.offscreen = await page.evaluate(async () => {
    const el = document.createElement('div'); el.className = 'mo-watch'; el.style.cssText = 'position:fixed;left:0;top:3000px;width:50px;height:50px'; document.body.appendChild(el); Motion.watch(el);
    await new Promise(r => setTimeout(r, 400)); const off = el.classList.contains('mo-off'); el.style.top = '10px'; await new Promise(r => setTimeout(r, 400)); const on = !el.classList.contains('mo-off'); el.remove(); return { pausedWhenOffscreen: off, resumedWhenVisible: on };
  });
  await ctx.close(); }
{ const { ctx, page } = await newPage(b, url, { loggedIn: true, lang: 'en', extraStorage: { sanad_fx: 'lite' } });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  checks.liteTier = await page.evaluate(() => ({ attr: document.documentElement.getAttribute('data-fx'), key: (window.Motion && Motion.tier && Motion.tier()) || null }));
  await ctx.close(); }
const result = { generated: new Date().toISOString(), method: 'requestAnimationFrame intervals, Chromium headless, simulated backend', profiles: PROFILES.map(p => ({ id: p.id, viewport: p.viewport, cpuThrottle: p.cpu })), passes: +passes, results, checks, caveat: 'Banc Chromium. Non mesuré sur appareil réel (iOS Safari, Android bas de gamme).' };
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify({ results, checks }, null, 1)); await b.close(); srv.close();
