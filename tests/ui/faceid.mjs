/* Face ID / code : une seule confirmation par transfert, jamais les deux. Authentificateur WebAuthn virtuel (CDP) ; serveur simulé, écritures refusées.
   Scénarios : A) Face ID activé + coffre prêt -> aucun écran de code ; B) Face ID activé, coffre vide -> code seul, puis la fois suivante Face ID seul ;
   C) Face ID non activé -> code seul.  Usage : node tests/ui/faceid.mjs <dossier-site> */
import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const { srv, url: url0 } = await serve(path.resolve(process.argv[2] || 'dist'));
const url = url0.replace('127.0.0.1', 'localhost');   /* WebAuthn n'accepte pas une adresse IP comme domaine */
const browser = await launch();
const res = []; const ok = (n, p, x = '') => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : '')); };
async function session(withAuth) {
  const blocked = [];
  const { ctx, page } = await newPage(browser, url, { loggedIn: true, lang: 'en', log: blocked, deviceScaleFactor: 1 });
  let cdp = null;
  if (withAuth) { cdp = await ctx.newCDPSession(page); await cdp.send('WebAuthn.enable'); await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: false, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } }); }
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()));
  return { ctx, page, blocked };
}
const swipe = async page => {
  await page.evaluate(() => { TX_STATE.beneficiary = { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' }; TX_STATE.amount = 25; TX_STATE.breakdown = { amount: 25, fee: 0, vat: 0, total: 25 }; R.go('tx-review'); });
  await page.waitForTimeout(900);
  const th = await page.locator('#swipe-thumb').boundingBox(), tr = await page.locator('#swipe').boundingBox();
  await page.mouse.move(th.x + th.width / 2, th.y + th.height / 2); await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(th.x + th.width / 2 + (tr.width - th.width) * i / 12, th.y + th.height / 2);
  await page.mouse.up();
};
const seen = page => page.evaluate(() => ({ pin: !!document.querySelector('.ps [data-k="1"], .ps-sheet, .yl-sheet') || /Enter your PIN/i.test(document.body.innerText), fid: !!document.querySelector('.fid-card, #fid-orb') }));

const pinSeen = page => page.evaluate(() => /Enter your PIN|6-digit PIN/i.test(document.body.innerText) && !!document.querySelector('.ps [data-k="1"], .yl [data-k="1"], [data-k="1"]'));
const typePin = async page => { for (let i = 0; i < 6; i++) { const k = page.locator('[data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); } };
async function launchWith(withAuth) {
  const blocked = [];
  const { ctx, page } = await newPage(browser, url, { loggedIn: true, lang: 'en', log: blocked, deviceScaleFactor: 1 });
  if (withAuth) { const cdp = await ctx.newCDPSession(page); await cdp.send('WebAuthn.enable'); await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: false, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } }); }
  await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(3000);
  await typePin(page); await page.waitForTimeout(1500);
  return { ctx, page, blocked };
}
/* C) appareil sans Face ID : le code seul */
{ const { ctx, page } = await launchWith(false);
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()));
  await swipe(page); await page.waitForTimeout(1500);
  ok('C — appareil sans Face ID : le code seul est demandé', await pinSeen(page));
  await ctx.close(); }
/* A) Face ID activé à l'ouverture (clé créée + code rangé dans le coffre), puis transfert */
{ const { ctx, page, blocked } = await launchWith(true);
  /* mode « naturel » : juste après la saisie du code, l'invite système Face ID s'ouvre directement (geste de l'utilisateur encore actif) ; sinon une feuille avec un orbe */
  await page.waitForTimeout(2500);
  const orb = await page.$('#fid-orb');
  if (orb) { await page.click('#fid-orb').catch(() => {}); await page.waitForTimeout(2500); }
  console.log('INFO  feuille Face ID intermédiaire affichée : ' + (orb ? 'oui' : 'non (invite système directe)'));
  ok('Face ID activé (clé WebAuthn créée)', await page.evaluate(() => FaceId.info().enrolled));
  ok('le code est rangé dans le coffre de l\'appareil', await page.evaluate(() => PinEngine.hasVault()));
  await page.evaluate(() => document.querySelectorAll('#lang-picker,#splash').forEach(e => e.remove()));
  await swipe(page);
  let sawPin = false;
  for (let i = 0; i < 24; i++) { await page.waitForTimeout(250); sawPin ||= await pinSeen(page); if (/tx\/result/.test(await page.evaluate(() => location.hash))) break; }
  await page.waitForTimeout(1500);
  ok('A — Face ID activé : le transfert part SANS écran de code', !sawPin);
  ok('A — la demande d\'envoi atteint le serveur (refusée par le harnais)', blocked.some(x => /rpc\/fiat_send_external/.test(x)), blocked.filter(x => /rpc/.test(x)).join(', '));
  // B) coffre vidé (code changé ailleurs, nouvel appareil…) : le CODE seul, une fois, puis le coffre est rempli
  await page.evaluate(() => { PinEngine.forget(); });
  ok('B — coffre vidé', !(await page.evaluate(() => PinEngine.hasVault())));
  await swipe(page); await page.waitForTimeout(2500);
  ok('B — Face ID activé mais coffre vide : le code SEUL est demandé', await pinSeen(page));
  await typePin(page); await page.waitForTimeout(6000);
  ok('B — le coffre est rempli : la fois suivante Face ID seul', await page.evaluate(() => PinEngine.hasVault()));
  await ctx.close(); }
await browser.close(); srv.close();
process.exitCode = res.every(Boolean) ? 0 : 1;
