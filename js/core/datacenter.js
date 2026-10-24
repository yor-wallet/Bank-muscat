'use strict';

/* ============================================================
   DATA CENTER (20.4.0) — le centre de données : un seul endroit où toutes les relectures du serveur passent.
   Avant : chaque écran, chaque alerte en direct et chaque fin d'opération relisait les soldes pour son compte, parfois en même temps.
   Maintenant :
   1  pull()      relecture immédiate (soldes, opérations, alertes) — celle qu'on attend après un transfert. Deux demandes en même temps = UNE seule lecture,
                  les deux reçoivent le résultat. AuthEngine.hydrateLive() passe par ici : tous les appels existants en profitent sans changer.
   2  request()   relecture « quand c'est le bon moment » : regroupe les demandes rapprochées (alerte en direct + retour au premier plan + minuterie…) en une seule,
                  respecte un écart minimal selon le palier de l'appareil (Conductor), repart seule après un échec avec un délai croissant (5 s … 5 min).
   3  déclencheurs  retour au premier plan après plus de 20 s, réseau retrouvé, alerte en direct (temps réel), minuterie lente (60 s / 90 s / 150 s selon l'appareil,
                  uniquement page visible et en ligne), demande d'un contrôle (Sentinels).
   4  réconciliation  après chaque lecture réussie : empreinte des soldes / opérations / alertes comparée à la précédente ; si elle a changé, l'écran courant
                  (accueil, historique, alertes, comptes) est redessiné — jamais pendant une saisie, un transfert, une conversation ni quand une fenêtre est ouverte.
   5  copie        la copie chiffrée de l'appareil (Snap) est mise à jour par la lecture elle-même (hydrateLive) ; ce fichier ne garde aucune donnée.
   Lecture seule : aucun solde, aucune opération n'est jamais écrit ici ; un échec réseau ne remplace RIEN de ce qui est affiché (la lecture échoue en bloc).
   ============================================================ */
const DataCenter = (() => {
  const GAP = { high: 4000, mid: 7000, low: 12000 };          /* écart minimal entre deux relectures « à la demande » */
  const POLL = { high: 60000, mid: 90000, low: 150000 };      /* minuterie lente */
  const REFRESH = ['home', 'history', 'notifications', 'accounts'];
  const BUSY = /^(chat|yaser|admin-chat-thread|login|signup|reset|tx-|processing|intl-|crypto-|receipt)/;
  const REDRAW = ['live', 'resume', 'online', 'poll', 'verify', 'manual'];   /* seules ces raisons redessinent l'écran (pas la relecture après un transfert) */
  const now = () => Date.now();
  const note = (k, i) => { try { Guardian.note(k, i); } catch(e){ /* rien */ } };
  const tier = () => { try { return Conductor.fx(); } catch(e){ return 'high'; } };

  let state = 'idle', last = 0, lastOk = now(), fails = 0, backoffUntil = 0, syncs = 0, sig = '', inflightP = null, pending = null;
  const byReason = {};
  const listeners = {};
  function on(name, fn){ (listeners[name] = listeners[name] || []).push(fn); return () => { listeners[name] = (listeners[name] || []).filter(f => f !== fn); }; }
  function emit(name, arg){ (listeners[name] || []).slice().forEach(fn => { try { fn(arg); } catch(e){ note('datacenter:' + name, e); } }); }
  function setState(s){ if (s === state) return; state = s; try { document.documentElement.setAttribute('data-sync', s); } catch(e){ /* rien */ } emit('state', s); }

  const uid = () => { try { const c = UserContext.get(); return (c && c.uid) || ''; } catch(e){ return ''; } };
  function canRun(force){
    if (!uid()) return false;
    if (typeof supabaseReady !== 'undefined' && !supabaseReady) return false;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    if (typeof document !== 'undefined' && document.hidden && !force) return false;
    return true;
  }

  /* ---------- 4. empreinte : soldes, dernières opérations, alertes non lues ---------- */
  function signature(){
    try {
      const a = (Runtime.accounts || []).map(x => x.id + ':' + x.balance + ':' + x.availableBalance + ':' + x.reservedBalance + ':' + x.status).join('|');
      const tx = Runtime.transactions || [];
      const head = tx.slice(0, 8).map(x => x.id + ':' + x.status).join(',');
      const nf = Runtime.notifications || [];
      return a + '#' + tx.length + '#' + head + '#' + nf.length + ':' + nf.filter(n => !n.read).length;
    } catch(e){ return ''; }
  }
  function refreshScreen(){
    try {
      const cur = (typeof R !== 'undefined' && R.current && R.current()) || '';
      if (REFRESH.indexOf(cur) === -1 || BUSY.test(cur)) return false;
      if (R.overlay && R.overlay.isOpen && R.overlay.isOpen()) return false;
      R.go(cur, { force: true, replace: true });
      return true;
    } catch(e){ return false; }
  }

  /* ---------- 1. relecture immédiate, dédoublonnée ---------- */
  function pull(reason){
    const reasons = Array.isArray(reason) ? reason : [reason || 'pull'];
    if (inflightP){ reasons.forEach(r => { byReason[r] = (byReason[r] || 0) + 1; }); return inflightP; }
    setState('syncing');
    const before = sig || signature();
    inflightP = Promise.resolve().then(async () => {      /* démarrage asynchrone : inflightP est affecté avant que le « finally » ne s'exécute */
      try {
        const raw = (typeof AuthEngine !== 'undefined' && AuthEngine._hydrateRaw) ? AuthEngine._hydrateRaw : null;
        if (!raw) throw new Error('no-engine');
        const out = await raw();
        sig = signature();
        const changed = before !== sig;
        fails = 0; backoffUntil = 0; lastOk = now(); last = lastOk; syncs++;
        reasons.forEach(r => { byReason[r] = (byReason[r] || 0) + 1; });
        setState('idle');
        if (changed || reasons.indexOf('live') !== -1){
          if (reasons.some(r => REDRAW.indexOf(r) !== -1)) refreshScreen();
        }
        if (changed) emit('change', { reasons });
        return out;
      } catch(e){
        fails++; last = now();
        backoffUntil = now() + Math.min(300000, 5000 * Math.pow(2, fails - 1));
        note('datacenter', e);
        setState(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'error');
        throw e;
      } finally {
        inflightP = null;
        if (pending) schedule(0);
      }
    });
    return inflightP;
  }

  /* ---------- 2. relecture regroupée : plusieurs demandes rapprochées = une lecture ---------- */
  const gap = () => GAP[tier()] || GAP.high;
  function request(reason, o){
    o = o || {};
    if (!canRun(o.force)) return Promise.resolve(false);
    return new Promise(res => {
      if (!pending) pending = { reasons: [], waiters: [], force: false, timer: 0 };
      pending.reasons.push(reason || 'sync'); pending.waiters.push(res);
      if (o.force) pending.force = true;
      schedule(o.delay || 0);
    });
  }
  function schedule(delay){
    if (!pending || inflightP) return;                    /* la fin de la lecture en cours relancera */
    const t = now();
    const wait = pending.force ? Math.max(delay || 0, 0) : Math.max(delay || 0, last + gap() - t, backoffUntil - t, 0);
    clearTimeout(pending.timer);
    pending.timer = setTimeout(flush, wait);
  }
  async function flush(){
    if (!pending || inflightP) return;
    const batch = pending; pending = null;
    if (!canRun(batch.force)){ batch.waiters.forEach(r => r(false)); return; }
    let ok = false;
    try { await pull(batch.reasons); ok = true; } catch(e){ ok = false; }
    batch.waiters.forEach(r => r(ok));
  }

  /* ---------- 3. déclencheurs ---------- */
  function start(){
    try {
      if (typeof Conductor === 'undefined') return;
      Conductor.on('resume', o => {
        const away = (o && o.away) || 0;
        if (away > 20000) request('resume');
        /* longue absence : la connexion temps réel a pu tomber en silence, on la rétablit (après la relecture, étalé) */
        if (away > 120000) setTimeout(() => { try { if (canRun() && AuthEngine.reconnectRealtime) AuthEngine.reconnectRealtime(); } catch(e){ /* rien */ } }, 1500);
      });
      Conductor.on('online', () => { fails = 0; backoffUntil = 0; request('online', { force: true }); });
      Conductor.on('offline', () => setState('offline'));
      Conductor.task('datacenter', () => {
        if (!inflightP && !pending && canRun() && now() - lastOk >= (POLL[tier()] || POLL.high)) request('poll');
        return true;
      }, { every: 30000, first: 40000, prio: 3 });
    } catch(e){ note('datacenter', e); }
  }
  start();

  function status(){
    return { state, lastOk, last, fails, syncs, backoffMs: Math.max(0, backoffUntil - now()), reasons: Object.assign({}, byReason),
      snapshotAt: (typeof Snap !== 'undefined' && Snap.lastSaved) ? Snap.lastSaved() : 0, tier: tier() };
  }
  return { pull, request, on, status, signature, age: () => now() - lastOk, canRun };
})();
