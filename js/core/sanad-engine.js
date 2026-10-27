'use strict';

/* ============================================================
   SANAD ENGINE (21.0.0) — le moteur qui gère les DONNÉES autour de l'ouverture et de la fermeture de l'application.
   Il ne calcule rien d'financier, n'écrit aucune donnée métier et ne remplace aucune fonction existante : il ORCHESTRE ce qui existe
   (AuthEngine.hydrateLive, Snap, Janitor) pour que l'application s'ouvre vite, se ferme sans rien perdre et reste à jour sans bruit.

   1. Ouverture instantanée  : la copie chiffrée (Snap) est lue DÈS le chargement du script, en parallèle du client d'authentification
                               (avant : seulement une fois la session confirmée) ; Snap.load() rend alors la promesse déjà en cours.
   2. Fermeture / mise en arrière-plan : à `visibilitychange: hidden`, `pagehide` et `freeze` la copie chiffrée est écrite tout de suite (une seule écriture
                               à la fois, regroupée) et l'état d'interface (onglet, filtres de l'historique) est sauvegardé, sans attendre.
   3. Reprise                : au retour (plus de 20 s d'absence, ou retour du réseau) les 3 lectures vives sont relancées EN ARRIÈRE-PLAN, une seule à la fois,
                               au plus toutes les 8 s, avec recul en cas d'échec ; l'écran n'est redessiné QUE si les données ont réellement changé
                               (aucun clignotement) et jamais pendant une saisie, une fenêtre ouverte ou un envoi.
   4. Retour où l'on était   : au prochain démarrage (moins de 30 min), l'onglet quitté est rouvert ; jamais un écran au milieu d'un parcours.
   Rien de ce qui est gardé n'est un secret : l'état d'interface ne contient ni montant, ni nom, ni identifiant de compte ; il est propre à la personne
   (clé `sanad_ui_<uid>`), supprimé par le nettoyeur des autres comptes et à la déconnexion.
   ============================================================ */
const SanadEngine = (() => {
  const TABS = ['home', 'history', 'cards', 'services', 'profile'];
  const RESTORE_MS = 30 * 60 * 1000, AWAY_MS = 20 * 1000, MIN_GAP = 8000;
  let hiddenAt = 0, last = 0, fails = 0, flight = null, sigPrev = '', started = false, flushing = 0, tabTimer = 0;
  const uid = () => { try { return (Runtime.ctx && Runtime.ctx.uid) || (UserContext.get() && UserContext.get().uid) || ''; } catch(e){ return ''; } };
  const key = u => 'sanad_ui_' + u;
  const online = () => navigator.onLine !== false;

  /* ---------- 1. ouverture instantanée : lecture anticipée de la copie chiffrée ---------- */
  function sessionUid(){
    try {
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (k && /^sb-.+-auth-token$/.test(k)){ const v = JSON.parse(localStorage.getItem(k) || 'null'); const id = v && (v.user && v.user.id || (v.currentSession && v.currentSession.user && v.currentSession.user.id)); if (id) return String(id); }
      }
    } catch(e){ /* rien */ }
    return '';
  }
  const pre = { uid: '', p: null };
  function prefetch(){
    try {
      if (typeof Snap === 'undefined') return;
      pre.uid = sessionUid(); if (!pre.uid) return;
      const orig = Snap.load;
      pre.p = orig(pre.uid);
      Snap.load = function(u){ if (u === pre.uid && pre.p){ const p = pre.p; pre.p = null; return p; } return orig(u); };   /* la première lecture réutilise la promesse en cours */
    } catch(e){ /* rien : l'ouverture reprend son chemin normal */ }
  }

  /* ---------- 2. fermeture : tout est écrit tout de suite ---------- */
  function uiState(){
    const o = { at: Date.now() };
    try { const cur = R.current(); if (TABS.indexOf(cur) !== -1) o.route = cur; } catch(e){ /* rien */ }
    try { if (typeof HIST !== 'undefined') o.hist = { period: HIST.period, dir: HIST.dir, q: String(HIST.q || '').slice(0, 60) }; } catch(e){ /* rien */ }
    return o;
  }
  function saveUi(){
    const u = uid(); if (!u) return;
    try { localStorage.setItem(key(u), JSON.stringify(uiState())); } catch(e){ /* stockage plein ou bloqué : sans conséquence */ }
  }
  function flush(){
    if (flushing && Date.now() - flushing < 1500) return;          /* regroupe les déclencheurs (hidden + pagehide arrivent ensemble) */
    flushing = Date.now();
    saveUi();
    try { const u = uid(); if (u && typeof Snap !== 'undefined' && Runtime && Runtime.profile) Snap.write(u, Runtime); } catch(e){ /* rien */ }
  }

  /* ---------- 3. reprise : relecture vive, en arrière-plan, sans clignotement ---------- */
  function signature(){
    try {
      const a = (Runtime.accounts || []).map(x => x.id + ':' + x.balance + ':' + x.availableBalance).join('|');
      const t = (Runtime.transactions || []).slice(0, 40).map(x => x.id + ':' + x.status).join('|');
      const n = (Runtime.notifications || []).slice(0, 30).map(x => x.id + ':' + (x.read ? 1 : 0)).join('|');
      return a + '#' + t + '#' + n;
    } catch(e){ return ''; }
  }
  const busyScreen = () => {
    try {
      if (R.overlay.isOpen()) return true;
      const cur = R.current(); if (['processing', 'tx-review', 'tx-amount', 'country-select', 'tx-result'].indexOf(cur) !== -1) return true;
      const ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return true;
      if (document.querySelector('.yl, .fid, .ps')) return true;                  /* verrouillage, Face ID ou code ouverts */
    } catch(e){ /* rien */ }
    return false;
  };
  function refresh(why){
    if (flight) return flight;
    if (!uid() || !online() || document.hidden) return Promise.resolve(false);
    const gap = Math.max(MIN_GAP, Math.min(60000, fails * 15000));
    if (Date.now() - last < gap) return Promise.resolve(false);
    last = Date.now();
    sigPrev = signature();
    flight = (async () => {
      try {
        await AuthEngine.hydrateLive();                                   /* soldes, opérations, alertes : lecture seule */
        fails = 0;
        const changed = signature() !== sigPrev;
        const cur = R.current();
        if (changed && ['home', 'history', 'notifications'].indexOf(cur) !== -1 && !busyScreen()) R.go(cur, { force: true, replace: true });
        return changed;
      } catch(e){ fails = Math.min(fails + 1, 4); return false; }
      finally { flight = null; }
    })();
    return flight;
  }

  /* ---------- 4. retour où l'on était ---------- */
  function restore(){
    try {
      const u = uid(); if (!u) return false;
      const o = JSON.parse(localStorage.getItem(key(u)) || 'null');
      if (!o || Date.now() - (o.at || 0) > RESTORE_MS) return false;
      if (o.hist && typeof HIST !== 'undefined'){ if (['all', 'today', '7d', '30d', 'month'].indexOf(o.hist.period) !== -1) HIST.period = o.hist.period; if (['all', 'in', 'out'].indexOf(o.hist.dir) !== -1) HIST.dir = o.hist.dir; HIST.q = String(o.hist.q || ''); }
      if (o.route && o.route !== 'home' && TABS.indexOf(o.route) !== -1){ R.go(o.route); return true; }
    } catch(e){ /* rien */ }
    return false;
  }
  function forgetUi(){ try { for (let i = localStorage.length - 1; i >= 0; i--){ const k = localStorage.key(i); if (k && k.indexOf('sanad_ui_') === 0) localStorage.removeItem(k); } } catch(e){ /* rien */ } }

  /* transitions d'onglet : fondu croisé (voir css/s-shell.css), jamais un glissement complet entre deux onglets */
  function watchRoutes(){
    try {
      const go0 = R.go;
      R.go = function(id, o){
        try {
          const from = R.current();
          const tab = TABS.indexOf(id) !== -1 && TABS.indexOf(from) !== -1 && !(o && o.back);
          document.documentElement.setAttribute('data-sx-tab', tab ? '1' : '0');
        } catch(e){ /* rien */ }
        const r = go0.apply(this, arguments);
        try { if (TABS.indexOf(id) !== -1) { clearTimeout(tabTimer); tabTimer = setTimeout(saveUi, 800); } else if (id === 'login') forgetUi(); } catch(e){ /* rien */ }
        return r;
      };
    } catch(e){ /* rien */ }
  }

  function start(){
    if (started) return; started = true;
    watchRoutes();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden'){ hiddenAt = Date.now(); flush(); }
      else { flushing = 0; if (hiddenAt && Date.now() - hiddenAt > AWAY_MS) refresh('resume'); hiddenAt = 0; }
    });
    window.addEventListener('pagehide', flush);
    document.addEventListener('freeze', flush);
    window.addEventListener('online', () => refresh('online'));
    window.addEventListener('pageshow', e => { if (e.persisted) refresh('pageshow'); });
  }
  return { start, prefetch, flush, refresh, restore, forgetUi, signature, _state: () => ({ last, fails, hiddenAt }) };
})();
try { SanadEngine.prefetch(); } catch(e){ /* rien */ }
