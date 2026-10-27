/* Parcours Amal : accord IA, réponse serveur simulée, urgence, donnée sensible, serveur absent, états du personnage. Aucune requête réelle (la fonction serveur est simulée par le test). Usage : node tests/ui/amal.mjs <site> <dossier> */
import path from 'node:path'; import fs from 'node:fs';
import { serve, newPage, launch } from './harness.mjs';
const site = process.argv[2], out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(site); const b = await launch(); const results = [];
const ok = (n, c, d = '') => { results.push([n, !!c, d]); console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (d ? ' — ' + d : '')); };
async function open(lang, fn, { storage = {} } = {}) {
  const calls = [];
  const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, extraStorage: storage });
  await ctx.route(/\/functions\/v1\/sanad-agents/, async route => {
    const req = route.request(); if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    calls.push(JSON.parse(req.postData() || '{}'));
    return fn(route, calls.length);
  });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
  for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => { document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()); R.go('yaser', { force: true }); });
  await page.waitForSelector('.yas-comp input', { timeout: 6000 }); await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('.ov-root .mb,.ov-root').forEach(e => { try { e.remove(); } catch (x) {} })); await page.waitForTimeout(300);
  return { ctx, page, calls };
}
const send = async (page, text) => { await page.fill('.yas-comp input', text); await page.press('.yas-comp input', 'Enter'); };
const lastBot = page => page.evaluate(() => { const m = [...document.querySelectorAll('.yas-m.bot:not(.yas-typing) .yas-b')]; return m.length ? m[m.length - 1].textContent : ''; });
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };

/* 1. première question hors réponses guidées : demande d'accord, rien n'est envoyé avant */
{
  const { ctx, page, calls } = await open('en', (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, code: 'answered', urgent: false, handoff: false, text: 'You can change the language in Settings.' }) }));
  await send(page, 'Can I change the app language?'); await page.waitForTimeout(2600);
  ok('consent asked before any call', calls.length === 0 && (await page.locator('.yas-act[data-ai]').count()) === 2, (await lastBot(page)).slice(0, 60));
  await page.screenshot({ path: path.join(out, 'amal-consent-en.png') });
  await page.click('.yas-act[data-ai="yes"]'); await page.waitForTimeout(3200);
  ok('after consent the pending question is sent once', calls.length === 1 && calls[0].mode === 'support' && calls[0].message === 'Can I change the app language?' && Object.keys(calls[0]).sort().join() === 'lang,message,mode', JSON.stringify(calls[0]));
  ok('answer shown', /change the language in Settings/.test(await lastBot(page)));
  ok('consent stored per account', await page.evaluate(() => Object.keys(localStorage).some(k => /^amal_ai_/.test(k) && localStorage.getItem(k) === 'yes')), await page.evaluate(() => JSON.stringify(Object.keys(localStorage).filter(k => /amal|sanad/.test(k)))));
  await page.screenshot({ path: path.join(out, 'amal-answer-en.png') });
  /* 2. urgent : aucun appel, réponse fixe, passage au chat */
  const n0 = calls.length; await send(page, 'someone hacked my account'); await page.waitForTimeout(1800);
  ok('urgent: no call, fixed text, support chat action', calls.length === n0 && /needs a person/.test(await lastBot(page)));
  await page.waitForTimeout(2600); ok('urgent: moved to support chat', await page.evaluate(() => location.hash.includes('chat')), await page.evaluate(() => location.hash));
  await ctx.close();
}
/* 3. donnée sensible : jamais envoyée, ni affichée, ni gardée */
{
  const { ctx, page, calls } = await open('en', (route) => route.fulfill({ status: 200, headers: CORS, body: '{}' }), { storage: {} });
  await send(page, 'my pin is 482913'); await page.waitForTimeout(2000);
  const shown = await page.evaluate(() => document.querySelector('.yas-list').innerText + JSON.stringify(Object.assign({}, localStorage)));
  ok('sensitive: not sent, not displayed, not stored', calls.length === 0 && !shown.includes('482913'));
  ok('sensitive: fixed warning', /cannot read passwords/.test(await lastBot(page)));
  await ctx.close();
}
/* 4. serveur non déployé (404) : repli sur la réponse guidée, rien d'inventé */
{
  const { ctx, page, calls } = await open('fr', (route) => route.fulfill({ status: 404, headers: CORS, body: JSON.stringify({ error: 'NOT_FOUND' }) }), { storage: {} });
  await page.evaluate(() => { const u = Runtime.ctx.uid; localStorage.setItem('amal_ai_' + u, 'yes'); });
  await send(page, 'Quelle est la couleur du ciel ?'); await page.waitForTimeout(3200);
  const t = await lastBot(page);
  ok('server absent: guided fallback, no invented answer', calls.length === 1 && /pas (tout à fait )?compris|personne/i.test(t), t.slice(0, 80));
  await page.screenshot({ path: path.join(out, 'amal-fallback-fr.png') });
  await ctx.close();
}
/* 5. réponse du modèle qui affirme un résultat : remplacée */
{
  const { ctx, page } = await open('en', (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, code: 'answered', handoff: false, text: 'Your transfer has been completed.' }) }), {});
  await page.evaluate(() => { localStorage.setItem('amal_ai_' + Runtime.ctx.uid, 'yes'); });
  await send(page, 'tell me a story'); await page.waitForTimeout(3200);
  ok('model claim is replaced client-side too', /cannot confirm that from here/.test(await lastBot(page)), (await lastBot(page)).slice(0, 80));
  await ctx.close();
}
/* 6. arabe RTL */
{
  const { ctx, page } = await open('ar', (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, code: 'answered', handoff: false, text: 'يمكنك تغيير اللغة من الإعدادات.' }) }), {});
  await page.evaluate(() => { localStorage.setItem('amal_ai_' + Runtime.ctx.uid, 'yes'); });
  await send(page, 'هل يمكنني تغيير لغة التطبيق؟'); await page.waitForTimeout(3200);
  ok('arabic answer', /تغيير اللغة/.test(await lastBot(page)));
  await page.screenshot({ path: path.join(out, 'amal-answer-ar.png') });
  await ctx.close();
}

/* 7. états : réponse locale sans indicateur de rédaction ; indicateur seulement pendant une vraie demande ; passage à une personne sans envoi */
{
  const { ctx, page, calls } = await open('en', async (route) => { await new Promise(r => setTimeout(r, 1100)); route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, code: 'answered', handoff: false, text: 'You can change the language in Settings.' }) }); });
  await page.evaluate(() => { localStorage.setItem('amal_ai_' + Runtime.ctx.uid, 'yes'); window.__typing = []; window.__states = []; const w = document.querySelector('.yas-wrap'); new MutationObserver(() => { window.__typing.push(document.querySelectorAll('.yas-typing').length); window.__states.push(w.getAttribute('data-state')); }).observe(document.querySelector('.yas-list'), { childList: true }); new MutationObserver(() => window.__states.push(w.getAttribute('data-state'))).observe(w, { attributes: true, attributeFilter: ['data-state'] }); });
  await page.click('.yas-chip[data-i="deposit"]'); await page.waitForTimeout(500);
  const local = await page.evaluate(() => ({ typing: Math.max(0, ...window.__typing), states: [...window.__states] }));
  ok('réponse guidée : aucun indicateur de rédaction, réponse immédiate', local.typing === 0 && /administrator|chat/i.test(await lastBot(page)), JSON.stringify(local));
  await page.evaluate(() => { window.__typing.length = 0; window.__states.length = 0; });
  await send(page, 'Can I change the app language?'); await page.waitForTimeout(500);
  const mid = await page.evaluate(() => ({ typing: document.querySelectorAll('.yas-typing').length, state: document.querySelector('.yas-wrap').getAttribute('data-state'), think: !!document.querySelector('.yas-hero .is-think') }));
  ok('demande réelle en cours : indicateur de rédaction + état « think »', mid.typing === 1 && mid.state === 'think' && mid.think, JSON.stringify(mid));
  await page.waitForTimeout(1500);
  const end = await page.evaluate(() => ({ typing: document.querySelectorAll('.yas-typing').length, state: document.querySelector('.yas-wrap').getAttribute('data-state'), talk: document.querySelectorAll('.is-talk').length }));
  ok('réponse reçue : indicateur retiré, état « answer », aucune bouche animée', end.typing === 0 && end.state === 'answer' && end.talk === 0, JSON.stringify(end));
  await page.screenshot({ path: path.join(out, 'amal-state-answer.png') });
  /* urgence : l'écran d'assistance s'ouvre avec le texte dans la zone de saisie, SANS envoi */
  const w0 = [];
  page.on('request', r => { if (r.method() === 'POST' && /chat_messages/.test(r.url())) w0.push(r.url()); });
  await send(page, 'someone hacked my account'); await page.waitForTimeout(700);
  const st = await page.evaluate(() => document.querySelector('.yas-wrap').getAttribute('data-state'));
  await page.waitForTimeout(2300);
  const chat = await page.evaluate(() => ({ hash: location.hash, composer: (document.querySelector('.chat-ta, textarea, #chat-ta') || {}).value || '' }));
  ok('urgence : état « handoff », conversation d\'assistance ouverte, texte préparé mais non envoyé', st === 'handoff' && /chat/.test(chat.hash) && /hacked/.test(chat.composer) && w0.length === 0, JSON.stringify({ st, chat, writes: w0.length }));
  await ctx.close();
}
/* 8. serveur indisponible : état « away », message d'indisponibilité, rien d'inventé */
{
  const { ctx, page } = await open('en', (route) => route.fulfill({ status: 503, headers: CORS, body: JSON.stringify({ error: 'ai_not_configured' }) }), {});
  await page.evaluate(() => { localStorage.setItem('amal_ai_' + Runtime.ctx.uid, 'yes'); });
  await send(page, 'tell me a story'); await page.waitForTimeout(1800);
  const r = await page.evaluate(() => ({ state: document.querySelector('.yas-wrap').getAttribute('data-state'), text: [...document.querySelectorAll('.yas-m.bot:not(.yas-typing) .yas-b')].pop().textContent }));
  ok('IA indisponible : état « away » et message clair', r.state === 'away' && /cannot reach the AI service/.test(r.text), JSON.stringify(r));
  await page.screenshot({ path: path.join(out, 'amal-state-away.png') });
  await ctx.close();
}
await b.close(); srv.close();
const bad = results.filter(r => !r[1]); console.log(`\n${results.length - bad.length}/${results.length} réussis`); process.exitCode = bad.length ? 1 : 0;
