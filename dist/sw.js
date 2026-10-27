/* Sanad Pay service worker (21.1.0) : coquille de l'application hors ligne + réception des notifications push.
   - Il ne met JAMAIS en cache le trafic Supabase / API / chaîne : soldes et transactions viennent toujours du serveur.
   - 15.1.0 (vitesse) : les fichiers à empreinte (app.<hash>.js / .css), les polices et le client Supabase sont servis DEPUIS LE TÉLÉPHONE (copie locale d'abord,
     jamais de réseau tant qu'ils n'ont pas changé de nom) ; la page d'accueil aussi. Une nouvelle version = nouveau nom de cache : elle s'installe en arrière-plan
     et sert dès l'ouverture suivante. Les images / icônes : copie locale tout de suite, mise à jour en arrière-plan. Le reste : réseau d'abord comme avant.
   - Seules les réponses réussies (200) du même site sont gardées : une page d'erreur n'est jamais servie plus tard comme si c'était l'application.
   - Hors ligne : l'application démarre depuis la copie locale ; si elle n'existe pas encore, « offline.html » explique la situation.
   - Il ne touche JAMAIS aux ressources d'autres sites (client Supabase sur le CDN, WalletConnect, chaîne) : le navigateur les charge lui-même.
     (12.11.0 interceptait le client Supabase : la CSP bloquait ce rechargement par le service worker et l'application ne démarrait plus dès la 2e ouverture.) */
const CACHE = 'fp-shell-v21.1.0-fdee955b7f';
const SLOW_MS = 4500;      /* au-delà, on sert la copie locale si on en a une */
const IMMUTABLE = /(?:\.[0-9a-f]{10}\.(?:js|css)|(?:^|\/)js\/vendor\/[^/]*-\d[\w.]*\.js|(?:^|\/)assets\/fonts\/[^/]+\.woff2)$/;   /* nom = contenu : jamais besoin du réseau */

const SHELL = [
  './', 'index.html', 'offline.html', 'manifest.webmanifest', 'favicon.ico', 'css/app.895a09e476.css', 'js/vendor/supabase-2.45.4.js', 'js/app1.09ca47a2f7.js', 'js/app2.388ce458a3.js', 'js/app3.bac562c0f7.js', 'assets/brand/network/visa-white.svg', 'assets/brand/network/visa-blue.svg', 'assets/brand/sanad-s-192.png', 'assets/brand/sanad-s-320.png', 'assets/brand/wordmark-white.svg', 'assets/fonts/inter-latin-var.woff2', 'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png', 'assets/ui/snowflake.svg', 'assets/ui/chip.svg', 'assets/ui/contactless.svg', 'assets/ads/ad-send.svg', 'assets/ads/ad-id.svg', 'assets/ads/ad-card.svg', 'assets/ads/ad-secure.svg', 'assets/ads/ad-lang.svg'
];

/* Une réponse « redirigée » (ex. /offline.html → /offline avec cleanUrls) ne peut pas être servie à une navigation : on en garde une copie propre. */
async function clean(res) {
  if (!res || !res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

/* Installation : un fichier manquant ne doit jamais empêcher l'installation (avant : addAll() échouait en bloc). */
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(async u => {
      try {
        const res = await fetch(new Request(u, { cache: IMMUTABLE.test(u) ? 'default' : 'reload' }));
        if (res && res.status === 200) await c.put(u, await clean(res));
      } catch (err) { /* copie locale absente pour ce fichier : il sera mis en cache à sa première utilisation */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && /^(yor|fp)-shell-/.test(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(req, { slowMs = SLOW_MS } = {}) {
  const cache = await caches.open(CACHE);
  return new Promise(resolve => {
    let settled = false;
    const settle = r => { if (!settled && r) { settled = true; resolve(r); } };
    /* réseau lent : copie locale si elle existe, sinon on continue d'attendre le réseau */
    const timer = setTimeout(() => { cache.match(req).then(settle); }, slowMs);
    fetch(req).then(res => {
      clearTimeout(timer);
      if (res && res.status === 200) { const keep = res.clone(); clean(keep).then(k => cache.put(req, k)).catch(() => { /* rien */ }); }
      settle(res);
    }).catch(() => {
      clearTimeout(timer);
      cache.match(req).then(r => {
        if (r) return settle(r);
        if (req.mode === 'navigate') {
          return cache.match('index.html').then(i => i || cache.match('./')).then(i => i || cache.match('offline.html')).then(i => settle(i || Response.error()));
        }
        settle(Response.error());
      });
    });
  });
}

/* Copie locale d'abord ; le réseau seulement si on ne l'a pas (puis on la garde). */
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.status === 200) cache.put(req, res.clone()).catch(() => { /* rien */ });
  return res;
}
/* La page d'accueil vient de la copie installée avec CETTE version (cohérente avec ses fichiers à empreinte) ; sans copie : réseau, puis repli hors ligne. */
async function shellFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match('index.html');
  return hit || networkFirst(req);
}
/* Images / icônes : copie locale tout de suite, mise à jour en arrière-plan pour la prochaine fois. */
async function staleWhileRevalidate(e, req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res && res.status === 200) cache.put(req, res.clone()).catch(() => { /* rien */ }); return res; }).catch(() => null);
  if (hit) { e.waitUntil(net); return hit; }
  return (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;                                     /* Supabase (API et client), WalletConnect, chaîne : jamais touchés */
  if (url.pathname.endsWith('/sw.js')) return;                                         /* le service worker se met à jour lui-même, sans copie intermédiaire */
  if (req.headers.has('range')) return;
  const path = url.pathname;
  if (IMMUTABLE.test(path)) { e.respondWith(cacheFirst(req)); return; }
  if (req.mode === 'navigate' && (path === '/' || path.endsWith('/index.html'))) { e.respondWith(shellFirst(req)); return; }
  if (/\.(?:svg|png|jpe?g|webp|ico|woff2?)$/.test(path)) { e.respondWith(staleWhileRevalidate(e, req)); return; }
  e.respondWith(networkFirst(req));
});

/* ============================================================
   12.13.0 — NOTIFICATIONS PUSH (Web Push). Apple (iPhone, application ajoutée à l'écran d'accueil, iOS 16.4+) ou Google livrent le message
   même quand l'application est fermée ; le navigateur réveille CE fichier pour l'afficher.
   Règle d'Apple : chaque message reçu doit produire une notification visible (userVisibleOnly), sinon l'abonnement est retiré :
   on affiche donc TOUJOURS, même application ouverte (l'étiquette « tag » remplace la précédente, jamais de doublon empilé).
   Le message est déjà écrit dans la langue de la personne par le serveur. Il ne contient ni lien, ni code, ni solde.
   ============================================================ */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (err) { try { d = { body: e.data.text() }; } catch (err2) { d = {}; } }
  if (!d || typeof d !== 'object') d = {};
  const title = String(d.title || 'Sanad Pay').slice(0, 80);
  const opts = {
    body: String(d.body || '').slice(0, 200),
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
    tag: String(d.tag || 'fp'),
    data: { url: typeof d.url === 'string' && d.url.charAt(0) === '#' ? d.url : '#/notifications' },
  };
  if (d.lang) opts.lang = String(d.lang);
  if (d.dir === 'rtl' || d.dir === 'ltr') opts.dir = d.dir;
  if (Number(d.ts) > 0) opts.timestamp = Number(d.ts);
  e.waitUntil((async () => {
    await self.registration.showNotification(title, opts);
    /* pastille sur l'icône : nombre d'alertes non lues (calculé par le serveur) */
    try {
      const nav = self.navigator;
      if (nav && Number(d.badge) > 0 && nav.setAppBadge) await nav.setAppBadge(Number(d.badge));
    } catch (err) { /* la pastille est un plus : jamais bloquante */ }
  })());
});

/* Toucher la notification : l'application déjà ouverte passe au premier plan et ouvre l'écran voulu ; sinon elle s'ouvre directement dessus. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '#/notifications';
  e.waitUntil((async () => {
    const scope = self.registration.scope;
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url && c.url.indexOf(scope) === 0) {
        try { await c.focus(); } catch (err) { /* rien */ }
        c.postMessage({ type: 'fp-push-click', url });
        return;
      }
    }
    await self.clients.openWindow(scope + url);
  })());
});

/* Apple / Google ont renouvelé l'adresse de livraison : l'application ouverte la réenregistre (Push.sync) ; sinon elle le fait à sa prochaine ouverture. */
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => list.forEach(c => c.postMessage({ type: 'fp-push-resync' }))));
});
