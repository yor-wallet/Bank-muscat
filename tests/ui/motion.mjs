/* Contrôles du système de mouvement (durées visuelles, états, repli, nettoyage). Usage : node tests/ui/motion.mjs <site>
   Serveur simulé, écritures refusées. Ces contrôles vérifient des DURÉES DÉCLARÉES et des COMPORTEMENTS ; la fluidité se mesure dans tests/perf/motion.mjs. */
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const site = path.resolve(process.argv[2] || 'dist');
const { srv, url } = await serve(site); const b = await launch(); const res = [];
const ok = (n, c, d = '') => { res.push([n, !!c, d]); console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const between = (v, a, z) => v >= a && v <= z;
const msOf = s => { const m = /([\d.]+)(m?s)/.exec(String(s)); return m ? (m[2] === 's' ? +m[1] * 1000 : +m[1]) : NaN; };
async function boot(lang = 'en', o = {}) {
  const { ctx, page } = await newPage(b, url, Object.assign({ loggedIn: true, lang }, o));
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
  for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()));
  return { ctx, page };
}
/* 1. jetons de durée dans les bornes demandées */
{
  const { ctx, page } = await boot();
  const t = await page.evaluate(() => { const g = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return { press: g('--mo-press'), release: g('--mo-release'), screen: g('--mo-screen'), panel: g('--mo-panel'), panelOut: g('--mo-panel-out'), stagger: g('--mo-stagger'), reveal: g('--mo-reveal') }; });
  ok('bouton : pression 80–110 ms', between(msOf(t.press), 80, 110), t.press);
  ok('bouton : retour 150–200 ms', between(msOf(t.release), 150, 200), t.release);
  ok('écran : transition 280–420 ms', between(msOf(t.screen), 280, 420), t.screen);
  ok('panneau : ouverture 240–360 ms', between(msOf(t.panel), 240, 360) && between(msOf(t.panelOut), 240, 360), t.panel + ' / ' + t.panelOut);
  ok('cascade : décalage court (≤ 60 ms)', msOf(t.stagger) <= 60, t.stagger);
  /* appliqué réellement aux composants */
  const comp = await page.evaluate(() => { R.go('settings', { force: true }); return null; }); await page.waitForTimeout(600);
  const d = await page.evaluate(() => { const s = document.querySelector('#settings.active'); const btn = document.querySelector('#settings .btn, #settings .settings-row, #settings .item'); return { screenAnim: s ? getComputedStyle(s).animationDuration : '', btn: btn ? getComputedStyle(btn).transitionDuration : '' }; });
  ok('écran actif : durée = jeton', between(msOf(d.screenAnim), 280, 420), d.screenAnim);
  ok('commande : retour tactile appliqué', between(msOf((d.btn || '').split(',')[0]), 150, 200), d.btn);
  await ctx.close();
}
/* 2. repli : « réduire les animations » -> contenu visible tout de suite, rien ne bouge */
{
  const { ctx, page } = await boot('en', { reducedMotion: 'reduce' });
  await page.evaluate(() => R.go('settings', { force: true })); await page.waitForTimeout(150);
  const r = await page.evaluate(() => { const s = document.querySelector('#settings.active'); const kid = document.querySelector('#settings.active .screen-body > *'); const cs = kid && getComputedStyle(kid); return { op: s && getComputedStyle(s).opacity, kidOp: cs && cs.opacity, kidAnim: cs && cs.animationName, dur: s && getComputedStyle(s).animationDuration }; });
  ok('reduced-motion : écran et contenu visibles immédiatement', +r.op === 1 && +r.kidOp === 1 && (r.kidAnim === 'none' || msOf(r.dur) < 1), JSON.stringify(r));
  await ctx.close();
}
/* 3. rendu léger : pas de flou, même mise en page */
{
  const { ctx, page } = await boot('en', { extraStorage: { sanad_fx: 'lite' } });
  const r = await page.evaluate(() => ({ fx: document.documentElement.getAttribute('data-fx'), bf: getComputedStyle(document.querySelector('.sx-rail') || document.body).backdropFilter }));
  ok('rendu léger : data-fx=lite et flou coupé', r.fx === 'lite' && (r.bf === 'none' || r.bf === ''), JSON.stringify(r));
  await ctx.close();
}
/* 4. panneau : naît de l'endroit touché, se ferme, aucune action inaccessible pendant l'animation */
{
  const { ctx, page } = await boot();
  await page.evaluate(() => R.go('home', { force: true })); await page.waitForTimeout(800);
  const box = await page.evaluate(() => { const e = document.querySelector('.mh-q') || document.querySelector('.mh-ib'); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(box.x, box.y); await page.mouse.down(); await page.mouse.up();
  await page.evaluate(() => { R.overlay.open('<div style="padding:20px"><button id="mo-btn" class="btn btn-primary">ok</button></div>', { kind: 'modal' }); }); await page.waitForTimeout(60);
  const o1 = await page.evaluate(() => { const p = document.querySelector('.ov-panel'); return { ox: p.style.getPropertyValue('--mo-ox'), oy: p.style.getPropertyValue('--mo-oy'), d: getComputedStyle(p).transitionDuration }; });
  ok('panneau : point d\'origine défini depuis le dernier toucher', /px$/.test(o1.ox) && /px$/.test(o1.oy), JSON.stringify(o1));
  ok('panneau : durée dans la borne', between(msOf(o1.d), 240, 360), o1.d);
  await page.waitForTimeout(80);
  const clickable = await page.evaluate(() => { const e = document.getElementById('mo-btn'); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e.contains(top) || top === e; });
  ok('panneau : le bouton est déjà cliquable pendant l\'ouverture', clickable);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  ok('panneau : Échap le ferme', (await page.locator('#mo-btn').count()) === 0);
  await ctx.close();
}
/* 5. ouverture : démarrage impossible (client de données indisponible) -> la cinématique cède la place aux actions de récupération, qui restent affichées */
{
  const { ctx, page } = await newPage(b, url, { loggedIn: false, lang: 'en' });
  await ctx.route(/js\/vendor\/supabase-2\.45\.4\.js/, r => r.abort());
  await page.goto(url + '/index.html', { waitUntil: 'commit' }); await page.waitForSelector('.sxo'); await page.waitForTimeout(3200);
  const r = await page.evaluate(() => { const sp = document.getElementById('splash'); return { sxo: !!document.querySelector('.sxo'), fatal: !!document.querySelector('.res-fatal'), btn: !!document.querySelector('[data-res-reload]'), shown: !!sp && getComputedStyle(sp).display !== 'none' && !sp.classList.contains('is-hidden') }; });
  ok('ouverture : démarrage impossible -> action de récupération visible, cinématique quittée', !r.sxo && r.fatal && r.btn && r.shown, JSON.stringify(r));
  await ctx.close();
}
/* 6. connexion : saisie invalide lisible, chargement lié à la vraie requête */
{
  const { ctx, page } = await newPage(b, url, { loggedIn: false, lang: 'en', extraStorage: { yor_onboarded: '1' } });
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForSelector('#au-submit', { timeout: 8000 }); await page.waitForTimeout(900);
  const clean = () => page.evaluate(() => document.querySelectorAll('.ov-root').forEach(e => e.remove()));
  await clean(); await page.click('#au-submit'); await page.waitForTimeout(250);
  const r = await page.evaluate(() => ({ err: document.getElementById('login-err').textContent, inv: [...document.querySelectorAll('#login input[aria-invalid="true"]')].length, box: document.querySelectorAll('#login .field-box.has-err').length, desc: document.getElementById('au-email').getAttribute('aria-describedby') }));
  ok('connexion : champs vides -> message, cadre d\'erreur, aria-invalid', r.err && r.inv === 2 && r.box === 2 && r.desc === 'login-err', JSON.stringify(r));
  await page.fill('#au-email', 'x@y.zz'); await page.waitForTimeout(80);
  const r2 = await page.evaluate(() => ({ inv: document.querySelectorAll('#login input[aria-invalid="true"]').length }));
  ok('connexion : l\'erreur s\'efface dès la saisie', r2.inv === 1, JSON.stringify(r2));
  /* chargement : posé et retiré par la vraie requête (la requête de test est lente à dessein) */
  await ctx.route(/\/auth\/v1\/token/, async route => { await new Promise(r => setTimeout(r, 900)); route.fulfill({ status: 400, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }) }); });
  await page.fill('#au-pass', 'secret-123'); await page.waitForTimeout(400); /* un toucher réel suit la saisie de plus de 100 ms ; un clic automatisé immédiat est perdu dès la 21.1.0 (blur du champ pendant l'appui), indépendamment du mouvement */ await clean(); await page.click('#au-submit'); await page.waitForTimeout(250);
  const during = await page.evaluate(() => { const bt = document.getElementById('au-submit'); return { loading: bt.classList.contains('is-loading'), busy: bt.getAttribute('aria-busy') }; });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => { const bt = document.getElementById('au-submit'); return { loading: bt.classList.contains('is-loading'), err: document.getElementById('login-err').textContent }; });
  ok('connexion : chargement pendant la requête, retiré à la réponse, erreur affichée', during.loading && during.busy === 'true' && !after.loading && !!after.err, JSON.stringify({ during, after }));
  await ctx.close();
}
/* 7. tableau de bord : le solde est toujours la valeur exacte (aucun compteur) ; la carte de solde reste immobile */
{
  const { ctx, page } = await boot();
  await page.evaluate(() => R.go('home', { force: true })); await page.waitForTimeout(900);
  const first = await page.evaluate(() => document.getElementById('px-bal-amt').textContent);
  await page.evaluate(() => { const a = Runtime.accounts.find(x => x.type === 'MAIN') || Runtime.accounts[0]; a.balance = Number(a.balance) + 17.25; a.availableBalance = a.balance; });
  await page.evaluate(() => { window.__seen = new Set(); const el0 = () => document.getElementById('px-bal-amt'); R.go('home', { force: true }); const t0 = performance.now(); const tick = () => { const e = el0(); if (e) window.__seen.add(e.textContent); if (performance.now() - t0 < 1000) requestAnimationFrame(tick); }; tick(); });
  await page.waitForTimeout(1150);
  const seen = await page.evaluate(() => [...window.__seen]);
  ok('solde : une seule valeur affichée après un changement réel (aucune valeur intermédiaire)', seen.length === 1 && seen[0] !== first, JSON.stringify({ first, seen }));
  const hero = await page.evaluate(() => { const h = document.querySelector('.mh-card'); return { cls: h.className, bg: getComputedStyle(h).backgroundImage.slice(0, 20), tilt: document.querySelectorAll('.mo-tilt').length }; });
  ok('carte de solde : aplat bleu marine, aucune inclinaison ni reflet qui suit le doigt (sobriété)', /gradient/.test(hero.bg) && !/mo-tilt/.test(hero.cls) && hero.tilt === 0, JSON.stringify(hero));
  await page.evaluate(() => document.querySelectorAll('.ov-root').forEach(e => e.remove()));
  await page.evaluate(() => R.go('history', { force: true })); await page.waitForTimeout(500);
  const gone = await page.evaluate(() => document.querySelectorAll('.mo-tilt').length);
  ok('carte de solde : inclinaison retirée en quittant l\'écran (écouteurs nettoyés)', gone === 0, 'restants=' + gone);
  await ctx.close();
}
/* 8. navigation : un seul onglet actif, marqué par la ligne d'horizon (LTR et RTL) ; plus de pastille glissante */
for (const lang of ['en', 'ar']) {
  const { ctx, page } = await boot(lang);
  await page.evaluate(() => R.go('home', { force: true })); await page.waitForTimeout(700);
  for (const nav of ['history', 'cards', 'services', 'home']) {
    await page.evaluate(n => R.go(n, { force: true }), nav); await page.waitForTimeout(650);
    const m = await page.evaluate(() => { const cur = [...document.querySelectorAll('#bottom-nav .nav-item[aria-current="page"]')]; const tab = cur[0]; if (!tab) return null; const on = (t) => getComputedStyle(t, '::after').transform; const all = [...document.querySelectorAll('#bottom-nav .nav-item')]; const lit = all.filter(t => getComputedStyle(t, '::after').display !== 'none' && !/^matrix\(0,/.test(on(t))).length; const a = tab.getBoundingClientRect(), d = document.querySelector('.nav-dock').getBoundingClientRect(); return { actifs: cur.length, allumes: lit, dansBarre: a.left >= d.left - 1 && a.right <= d.right + 1, ind: getComputedStyle(document.querySelector('.nav-ind')).display }; });
    ok('[' + lang + '] onglet « ' + nav + ' » : un seul actif, une seule ligne allumée, aucune pastille glissante', m && m.actifs === 1 && m.allumes === 1 && m.dansBarre && m.ind === 'none', JSON.stringify(m));
  }
  await ctx.close();
}
await b.close(); srv.close();
const bad = res.filter(r => !r[1]); console.log(`\n${res.length - bad.length}/${res.length} réussis`); process.exitCode = bad.length ? 1 : 0;
