/* Écran des assistants (administrateurs) : l'état affiché est l'état annoncé par le serveur ; la fonction est SIMULÉE par le test (aucune requête réelle).
   Usage : node tests/ui/agents.mjs <site> <dossier> */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch(); const res = [];
const ok = (n, c, d = '') => { res.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
async function open(handler, lang = 'en') {
  const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, role: 'admin' });
  await ctx.route(/\/functions\/v1\/sanad-agents/, async route => { const req = route.request(); if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } }); return handler(route, JSON.parse(req.postData() || '{}')); });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
  for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()); R.go('admin-agents', { force: true }); });
  await page.waitForSelector('.ag-card', { timeout: 6000 }); await page.waitForTimeout(900);
  return { ctx, page };
}
const states = page => page.evaluate(() => [...document.querySelectorAll('.ag-card')].map(c => c.getAttribute('data-state')));
const why = page => page.evaluate(() => (document.querySelector('.ag-why') || {}).textContent || '');
/* 1. fonction non déployée (404) */
{ const { ctx, page } = await open(route => route.fulfill({ status: 404, headers: CORS, body: JSON.stringify({ code: 'NOT_FOUND' }) }));
  const st = await states(page); ok('fonction absente : les cinq rôles sont « non configuré », raison affichée, revue impossible', st.length === 5 && st.every(x => x === 'off') && /not deployed/i.test(await why(page)) && await page.evaluate(() => document.querySelector('[data-ag="run"]').disabled), JSON.stringify({ st, why: await why(page) }));
  await page.screenshot({ path: path.join(out, 'agents-off.png') }); await ctx.close(); }
/* 2. fonction déployée mais clé IA absente */
{ const { ctx, page } = await open((route, body) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, configured: false, roles: [] }) }));
  const st = await states(page); ok('clé absente : « non configuré » + raison « clé ou modèle manquant »', st.every(x => x === 'off') && /key or model/i.test(await why(page)), JSON.stringify({ st, why: await why(page) })); await ctx.close(); }
/* 3. configurée : disponible -> occupé pendant une revue réelle -> rapport texte, rien d'appliqué */
{ let seen = []; const { ctx, page } = await open(async (route, body) => { seen.push(body.mode); if (body.mode === 'status') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, configured: true, roles: [] }) });
    await new Promise(r => setTimeout(r, 1200)); return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, agents: { data: 'Counters look steady.', supervision: 'No signal.', diagnostics: 'No error category.', maintenance: 'Nothing to do.', support: 'No incident.' }, automaticActions: { temporaryCacheSweep: { removed: 0, remaining: 0 } }, requiresHumanReview: true }) }); });
  ok('configurée : les cinq rôles sont « disponible »', (await states(page)).every(x => x === 'ready'), JSON.stringify(await states(page)));
  await page.click('[data-ag="run"]'); await page.waitForTimeout(400);
  ok('revue en cours : les cinq rôles sont « occupé » et le bouton annonce la revue', (await states(page)).every(x => x === 'busy') && /in progress/i.test(await page.evaluate(() => document.querySelector('[data-ag="run"]').textContent)), JSON.stringify(await states(page)));
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ outs: document.querySelectorAll('.ag-out').length, human: (document.querySelector('.ag-human') || {}).textContent }));
  ok('revue terminée : cinq textes, « à lire par une personne, rien n\'a été appliqué »', (await states(page)).every(x => x === 'ready') && after.outs === 5 && /Nothing has been applied/.test(after.human), JSON.stringify(after));
  ok('la revue demande seulement « status » puis « review » (aucune écriture côté client)', seen.join() === 'status,review', seen.join());
  await page.screenshot({ path: path.join(out, 'agents-report.png') }); await ctx.close(); }
/* 4. erreur du serveur pendant la revue */
{ const { ctx, page } = await open((route, body) => body.mode === 'status' ? route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, configured: true }) }) : route.fulfill({ status: 502, headers: CORS, body: JSON.stringify({ error: 'ai_unavailable' }) }));
  await page.click('[data-ag="run"]'); await page.waitForTimeout(900);
  ok('erreur serveur : les cinq rôles passent à « erreur » avec une raison', (await states(page)).every(x => x === 'error') && /could not be completed/i.test(await why(page)), JSON.stringify({ st: await states(page), why: await why(page) })); await ctx.close(); }
/* 5. arabe */
{ const { ctx, page } = await open((route, body) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, configured: true }) }), 'ar');
  ok('arabe : titre, sens et états traduits', await page.evaluate(() => document.documentElement.dir === 'rtl' && /متاح/.test(document.querySelector('.ag-st').textContent)), ''); await page.screenshot({ path: path.join(out, 'agents-ar.png') }); await ctx.close(); }
await b.close(); srv.close(); console.log(`\n${res.filter(Boolean).length}/${res.length} réussis`); process.exitCode = res.every(Boolean) ? 0 : 1;
