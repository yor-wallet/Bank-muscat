/* Banc de test Sanad Pay (local uniquement).
   - sert un dossier statique (dist/ par défaut) sur un port local ;
   - intercepte TOUT trafic vers Supabase et répond avec des données de test FICTIVES (jamais de réseau réel, jamais de production) ;
   - toute écriture (POST/PATCH/PUT/DELETE hors lecture de session) est refusée et comptée : un test de transfert ne peut pas déplacer de l'argent.
   Les montants, noms et références ci-dessous sont des fixtures de test, affichés uniquement dans le navigateur de test. */
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

export const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.txt': 'text/plain' };

export function serve(root, port = 0) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end(fs.existsSync(path.join(root, '404.html')) ? fs.readFileSync(path.join(root, '404.html')) : 'not found'); }
    const type = MIME[path.extname(f)] || 'application/octet-stream';
    /* compression comme un CDN (Netlify / Vercel) : sans elle les mesures d'octets transférés seraient irréalistes */
    if (/(javascript|css|html|svg|json|manifest|text)/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache', 'content-encoding': 'gzip', vary: 'accept-encoding' });
      return res.end(zlib.gzipSync(fs.readFileSync(f), { level: 6 }));
    }
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}

const UID = '11111111-2222-4333-8444-555555555555';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Date.now();
const iso = ms => new Date(ms).toISOString();

export const FIXTURE = {
  profile: { id: UID, user_id: 'USR-A1B2C3', yor_id: 'YOR-A1B2C3', email: 'aisha.balushi@example.invalid', role: 'user', first_name: 'Aisha', last_name: 'Al Balushi', phone: '+96890000000', country: 'OM', photo: null, kyc: { status: 'VERIFIED', level: 1, verifiedAt: iso(now - 864e5 * 30) }, created_at: iso(now - 864e5 * 60) },
  accounts: [{ id: 'ACC-OMR-0001', user_id: UID, type: 'MAIN', name: 'Main OMR', currency: 'OMR', balance: '1250.500', available_balance: '1250.500', reserved_balance: '0', status: 'ACTIVE', country: 'OM', created_at: iso(now - 864e5 * 60) }],
  transactions: [
    { id: 'tx-1', reference: 'YOR-TX-100001', kind: 'FIAT_EXTERNAL', direction: 'OUT', status: 'CONFIRMED', asset: 'OMR', amount: 25, fee: 0, total: 25, counterparty_name: 'Salim Al Harthy', note: null, meta: { receiver: '+96891111111' }, created_at: iso(now - 36e5 * 5) },
    { id: 'tx-2', reference: 'YOR-TX-100002', kind: 'FIAT_TRANSFER', direction: 'IN', status: 'CONFIRMED', asset: 'OMR', amount: 100, fee: 0, total: 100, counterparty_name: 'Fatma Al Rawahi', note: null, meta: {}, created_at: iso(now - 864e5 * 2) },
    { id: 'tx-3', reference: 'YOR-TX-100003', kind: 'FIAT_EXTERNAL', direction: 'OUT', status: 'PENDING', asset: 'OMR', amount: 12.5, fee: 0, total: 12.5, counterparty_name: 'Salim Al Harthy', note: null, meta: {}, created_at: iso(now - 864e5 * 3) },
    { id: 'tx-4', reference: 'YOR-TX-100004', kind: 'FIAT_EXTERNAL', direction: 'OUT', status: 'FAILED', asset: 'OMR', amount: 8, fee: 0, total: 8, counterparty_name: 'Salim Al Harthy', note: null, meta: {}, created_at: iso(now - 864e5 * 4) },
  ],
  notifications: [{ id: '99999999-0000-4000-8000-000000000001', user_id: UID, type: 'TRANSFER_RECEIVED', title: 'Money received', message: 'You received 100.000 OMR', read: false, transaction_id: 'tx-2', data: {}, created_at: iso(now - 864e5 * 2) }],
};

export function sessionStorageValue() {
  const exp = Math.floor(now / 1000) + 3600 * 24;
  const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: UID, aud: 'authenticated', role: 'authenticated', exp, iat: exp - 3600 })}.test`;
  return JSON.stringify({ access_token: jwt, token_type: 'bearer', expires_in: 86400, expires_at: exp, refresh_token: 'refresh-0001', user: { id: UID, aud: 'authenticated', role: 'authenticated', email: FIXTURE.profile.email, app_metadata: {}, user_metadata: {}, created_at: FIXTURE.profile.created_at } });
}

/* options.loggedIn : session de test pré-posée ; options.log : tableau recevant les requêtes bloquées */
export async function newPage(browser, base, { loggedIn = false, lang = 'en', theme = 'light', viewport = { width: 390, height: 844 }, deviceScaleFactor = 2, userAgent, isMobile = true, hasTouch = true, log = [], extraStorage = {}, reducedMotion = 'no-preference' } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent, reducedMotion, serviceWorkers: 'block', locale: lang === 'ar' ? 'ar-OM' : lang === 'fr' ? 'fr-FR' : 'en-GB' });
  await ctx.route(/supabase\.co/, async route => {
    const req = route.request(), u = new URL(req.url()), m = req.method();
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }, body: JSON.stringify(body) });
    if (m === 'OPTIONS') return json({});
    if (u.pathname.endsWith('.js')) return route.abort();
    const p = u.pathname;
    if (p.startsWith('/auth/v1/user')) return json(JSON.parse(sessionStorageValue()).user);
    if (p.startsWith('/auth/v1/logout')) return json({});
    if (p.startsWith('/auth/v1/token')) return json(JSON.parse(sessionStorageValue()));
    const wantsObject = /vnd\.pgrst\.object/.test(req.headers()['accept'] || '');
    const one = rows => wantsObject ? (rows.length ? json(rows[0]) : json({ message: 'no rows', code: 'PGRST116' }, 406)) : json(rows);
    if (m === 'GET' || m === 'HEAD') {
      if (p === '/rest/v1/profiles') return one([FIXTURE.profile]);
      if (p === '/rest/v1/accounts') return json(FIXTURE.accounts);
      if (p === '/rest/v1/notifications') return json(FIXTURE.notifications);
      if (p === '/rest/v1/user_items' && /eq\.cards/.test(u.searchParams.get('collection') || '')) return json([{ item_id: 'CARD-0001', data: { label: 'Daily card', theme: 'midnight', number: '4532018800004821', holderName: 'AISHA AL BALUSHI', currency: 'OMR', createdAt: now - 864e5 * 9, issued: true, frozen: false } }]);
      if (p === '/rest/v1/crypto_wallets' || p === '/rest/v1/user_items' || p === '/rest/v1/announcements' || p === '/rest/v1/intl_countries' || p === '/rest/v1/invest_plans') return json([]);
      if (p === '/rest/v1/user_docs') return one([]);
      return json([]);
    }
    if (p === '/rest/v1/rpc/my_transactions') return json(FIXTURE.transactions);
    if (p.startsWith('/rest/v1/rpc/')) {
      const name = p.split('/').pop();
      if (name === 'pin_status') return json({ has_pin: true, locked: false });
      if (name === 'verify_pin') return json({ ok: true, grant: 'local-grant-not-valid-anywhere' });   /* le code de test n'ouvre que l'écran de verrouillage : toute écriture reste refusée plus bas */
      if (['get_app_config'].includes(name)) return json({});
      if (['kyc_status'].includes(name)) return json({ status: 'VERIFIED', level: 1 });
      if (/^(get_|.*_overview$|.*_status$|.*_list$)/.test(name)) return json([]);
    }
    /* toute autre écriture / appel : refusé et journalisé — aucune opération ne peut aboutir pendant un test */
    log.push(`${m} ${u.pathname}`);
    return json({ message: 'blocked by the local harness', code: 'LOCAL_BLOCKED' }, 403);
  });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => /supabase\.co/.test(route.request().url()) ? route.fallback() : route.abort());
  const page = await ctx.newPage();
  const store = Object.assign({ fp_theme: theme, yor_device_lang: lang, yor_lang_chosen: '1', lx_inst_seen: '1' }, extraStorage);
  await page.addInitScript(([s, session, logged, lang, theme]) => {
    try {
      for (const k in s) localStorage.setItem(k, s[k]);
      if (logged) localStorage.setItem('sb-gebjmguoauvutiqvoswl-auth-token', session);
    } catch (e) { /* stockage indisponible */ }
  }, [store, sessionStorageValue(), loggedIn, lang, theme]);
  page.on('pageerror', e => (page.__errors ||= []).push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::ERR/.test(m.text())) (page.__errors ||= []).push('console: ' + m.text()); });
  return { ctx, page };
}

export async function launch() { return chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : (fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {})); }
