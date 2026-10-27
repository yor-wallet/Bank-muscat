/* Mesure de performance reproductible (Chromium, émulation iPhone 390x844 @2x, CPU ralentie x4, réseau « 4G lente »).
   Usage : node tests/perf/measure.mjs <dossier-site> <sortie.json> [passes=3]
   Ce sont des OBJECTIFS de test : LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Les chiffres ci-dessous sont des mesures de ce banc,
   pas des promesses sur des appareils réels. Données et réseau fictifs (harness.mjs). */
import fs from 'node:fs';
import path from 'node:path';
import { serve, newPage, launch } from './../ui/harness.mjs';

const [site, out, passes = '3'] = [path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4]];
const { srv, url } = await serve(site);
const browser = await launch();
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const results = {};
for (const scenario of ['login-cold', 'home-unlocked']) {
  const runs = [];
  for (let i = 0; i < Number(passes); i++) {
    const { ctx, page } = await newPage(browser, url, { loggedIn: scenario !== 'login-cold', lang: 'en' });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const bytes = { js: 0, css: 0, png: 0, jpg: 0, svg: 0, font: 0, other: 0, requests: 0 };
    const urls = new Map();
    cdp.on('Network.responseReceived', e => urls.set(e.requestId, e.response.url));
    cdp.on('Network.loadingFinished', e => { bytes.requests++; const u = urls.get(e.requestId); if (!u || !u.startsWith('http://127.0.0.1')) return; const ext = path.extname(new URL(u).pathname).slice(1); const k = ext === 'js' ? 'js' : ext === 'css' ? 'css' : ext === 'png' ? 'png' : (ext === 'jpg' || ext === 'webp') ? 'jpg' : ext === 'svg' ? 'svg' : ext === 'woff2' ? 'font' : 'other'; bytes[k] += e.encodedDataLength; });
    await page.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0, fcp: 0, tbt: 0, inp: 0 };
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.interactionId) window.__m.inp = Math.max(window.__m.inp, e.duration); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
    });
    await page.goto(url + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(scenario === 'login-cold' ? 4500 : 5500);
    if (scenario !== 'login-cold') { for (let k = 0; k < 6; k++) { const key = page.locator('.yl [data-k="1"]').first(); if (await key.count()) await key.click({ delay: 20 }).catch(() => {}); } await page.waitForTimeout(2500); }
    /* interaction : un toucher sur un élément de la page, pour l'INP */
    try { await page.mouse.click(195, 420); await page.waitForTimeout(400); await page.mouse.click(60, 800); await page.waitForTimeout(600); } catch (e) {}
    const m = await page.evaluate(() => window.__m);
    runs.push({ ...m, bytes });
    await ctx.close();
  }
  results[scenario] = { lcpMs: Math.round(med(runs.map(r => r.lcp))), fcpMs: Math.round(med(runs.map(r => r.fcp))), cls: +med(runs.map(r => r.cls)).toFixed(4), tbtMs: Math.round(med(runs.map(r => r.tbt))), inpMs: Math.round(med(runs.map(r => r.inp))), kb: Object.fromEntries(Object.entries(runs[0].bytes).filter(([k]) => k !== 'requests').map(([k, v]) => [k, +(v / 1024).toFixed(1)])), runs: runs.length };
}
const sizes = {};
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { const x = path.extname(e.name).slice(1); sizes[x] = (sizes[x] || 0) + fs.statSync(p).size; } } };
walk(site);
results.siteBytesByType = Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, +(v / 1024).toFixed(1)]));
results.conditions = { emulation: 'iPhone-like 390x844 @2x, Chromium', cpu: '4x slowdown', network: '1.6 Mbit/s down, 150 ms RTT, gzip comme un CDN (octets = transférés compressés)', passes: Number(passes), note: 'service worker bloqué, Supabase simulé' };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
await browser.close(); srv.close();
