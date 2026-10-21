'use strict';

/* ============================================================
   GUARDIAN (18.0.0) — moteur de données : l'application ne doit ni planter ni afficher n'importe quoi.
   1  rpc()        appel serveur protégé : délai maximal, nouvelles tentatives, coupe-circuit, lectures identiques fusionnées, erreurs classées.
   2  norm.*       normalisation : un texte reste un texte, un nombre un nombre, une liste une liste (jamais undefined / NaN à l'écran).
   3  heal()       contrôle d'intégrité des données chargées : doublons retirés, entrées illisibles écartées, tri, soldes valides.
   4  store        stockage local sûr (JSON illisible = purgé, quota plein = nettoyage), avec version.
   5  queue        file d'envois : un message écrit hors ligne part tout seul au retour du réseau.
   6  every()      rafraîchissement régulier qui se met en pause quand la page est cachée ou hors ligne.
   7  health       surveille les erreurs : en rafale, il vide les caches volatils et relit les données (auto-réparation) ; jamais de détail à l'écran.
   8  report()     journal court des incidents, pour l'assistance (Paramètres avancés > Diagnostic).
   Aucune dépendance ; chaque fonction attrape ses propres erreurs.
   ============================================================ */
const Guardian = (() => {
  const LOG_MAX = 60;
  const log = [];
  const now = () => Date.now();
  function note(kind, info){
    try { log.push({ t: now(), k: String(kind).slice(0, 24), i: String(info && info.message ? info.message : info).slice(0, 160) }); if (log.length > LOG_MAX) log.shift(); } catch(e){ /* rien */ }
  }

  /* ---------- 2. normalisation ---------- */
  const norm = {
    num(v, d){ const n = typeof v === 'number' ? v : parseFloat(v); return Number.isFinite(n) ? n : (d == null ? 0 : d); },
    int(v, d){ const n = Math.trunc(norm.num(v, d)); return Number.isFinite(n) ? n : (d == null ? 0 : d); },
    str(v, max){ if (v == null) return ''; const s = typeof v === 'string' ? v : (typeof v === 'object' ? '' : String(v)); return max ? s.slice(0, max) : s; },
    arr(v){ return Array.isArray(v) ? v : []; },
    obj(v){ return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; },
    bool(v){ return v === true || v === 'true' || v === 1 || v === '1'; },
    time(v){ const n = typeof v === 'number' ? v : (v ? new Date(v).getTime() : NaN); return Number.isFinite(n) ? n : 0; },
    id(v){ return typeof v === 'string' || typeof v === 'number' ? String(v) : ''; },
    /* chaque forme de ligne reçue du serveur a une version « sûre » */
    tx(r){ r = norm.obj(r); return Object.assign({}, r, { id: norm.id(r.id), reference: norm.str(r.reference, 40), kind: norm.str(r.kind, 40), amount: norm.num(r.amount), fee: norm.num(r.fee), total: norm.num(r.total, norm.num(r.amount)), createdAt: norm.time(r.createdAt) || now() }); },
    account(r){ r = norm.obj(r); return Object.assign({}, r, { id: norm.id(r.id), balance: norm.num(r.balance), availableBalance: norm.num(r.availableBalance, norm.num(r.balance)), reservedBalance: norm.num(r.reservedBalance), currency: norm.str(r.currency, 6) || 'OMR' }); },
    notif(r){ r = norm.obj(r); return Object.assign({}, r, { id: norm.id(r.id), type: norm.str(r.type, 40), title: norm.str(r.title, 160), message: norm.str(r.message, 400), read: !!r.read, data: norm.obj(r.data), createdAt: norm.time(r.createdAt) || now() }); },
    msg(r){ r = norm.obj(r); return { id: norm.id(r.id), thread: norm.id(r.thread_user), role: ['user', 'admin', 'system'].indexOf(r.sender_role) === -1 ? 'system' : r.sender_role, kind: norm.str(r.kind, 12) || 'text', body: norm.str(r.body, 4000),
      path: norm.str(r.media_path, 200), mime: norm.str(r.media_mime, 60), size: norm.int(r.media_size), dur: norm.int(r.duration_ms), meta: norm.obj(r.meta), at: norm.time(r.created_at) || now(), read: !!r.read_at }; },
    credit(r){ r = norm.obj(r); return Object.assign({}, r, { id: norm.id(r.id), amount: norm.num(r.amount), approved_amount: r.approved_amount == null ? null : norm.num(r.approved_amount), months: norm.int(r.months, 12), status: norm.str(r.status, 12) || 'PENDING', purpose: norm.str(r.purpose, 300), admin_note: norm.str(r.admin_note, 300) }); }
  };

  /* ---------- 1. appels serveur protégés ---------- */
  const circuit = {};            /* nom -> { fails, openUntil } */
  const inflight = {};           /* clé -> promise */
  const READS = /^(get_|vault_status|admin_credit_list|admin_chat_threads|admin_vault_overview|admin_stats|admin_recent_users|my_|pin_status|find_)/;
  function classify(err){
    const msg = String(err && (err.message || err.error_description || err.msg) || err || '');
    const code = String(err && (err.code || err.status) || '');
    const low = msg.toLowerCase();
    const net = /failed to fetch|networkerror|network request failed|load failed|timeout|timed out|abort|offline|fetch/.test(low) || code === '0';
    let key = 'errors.UNKNOWN_ERROR';
    if (/insufficient_balance/.test(low)) key = 'errors.INSUFFICIENT_BALANCE';
    else if (/forbidden|42501/.test(low + code)) key = 'g.forbidden';
    else if (/amount_out_of_range|invalid_amount/.test(low)) key = 'g.amount';
    else if (/request_pending/.test(low)) key = 'g.pending';
    else if (/rate_limited|54000/.test(low + code)) key = 'g.rate';
    else if (net) key = 'g.network';
    return { code: code || (net ? 'NETWORK' : 'ERROR'), message: msg.slice(0, 200), key, retryable: net || /^(5\d\d|429)$/.test(code) || /jwt expired|fetch/.test(low) };
  }
  function withTimeout(p, ms){
    let to; const t = new Promise((_, rej) => { to = setTimeout(() => rej(new Error('timeout')), ms); });
    return Promise.race([p, t]).finally(() => clearTimeout(to));
  }
  /* rpc('vault_status', args, { retries:2, timeout:12000, read:true|false }) -> { ok, data, error } ; ne lève jamais */
  async function rpc(name, args, o){
    o = o || {};
    const isRead = o.read != null ? o.read : READS.test(name);
    const c = circuit[name] || (circuit[name] = { fails: 0, openUntil: 0 });
    if (c.openUntil > now()){ return { ok: false, data: null, error: { code: 'CIRCUIT', message: 'paused', key: 'g.network', retryable: true } }; }
    const run = async () => {
      const tries = 1 + (o.retries != null ? o.retries : (isRead ? 2 : 0));        /* une écriture n'est JAMAIS rejouée automatiquement */
      let last = null;
      for (let i = 0; i < tries; i++){
        try {
          if (typeof supabaseReady !== 'undefined' && !supabaseReady) throw new Error('offline');
          const res = await withTimeout(sb.rpc(name, args || {}), o.timeout || 12000);
          if (res && res.error){ last = res.error; if (!classify(res.error).retryable) break; }
          else { c.fails = 0; return { ok: true, data: res ? res.data : null, error: null }; }
        } catch(e){ last = e; }
        if (i < tries - 1) await new Promise(r => setTimeout(r, 400 * Math.pow(2, i)));
      }
      const er = classify(last); note('rpc:' + name, er.message);
      /* seules les pannes de transport comptent pour le coupe-circuit : une réponse métier (solde insuffisant, interdit…) prouve que le serveur répond */
      if (er.retryable){ c.fails++; if (c.fails >= 5){ c.openUntil = now() + 20000; c.fails = 0; note('circuit', name); } } else c.fails = 0;
      return { ok: false, data: null, error: er };
    };
    if (!isRead) return run();
    const key = name + ':' + JSON.stringify(args || {});
    if (inflight[key]) return inflight[key];
    const p = run().finally(() => { delete inflight[key]; });
    inflight[key] = p; return p;
  }
  /* lecture d'une table / vue avec les mêmes protections */
  async function query(build, o){
    o = o || {};
    const tries = 1 + (o.retries != null ? o.retries : 2); let last = null;
    for (let i = 0; i < tries; i++){
      try { const res = await withTimeout(build(), o.timeout || 12000); if (res && !res.error) return { ok: true, data: res.data, error: null, count: res.count }; last = res && res.error; if (!classify(last).retryable) break; }
      catch(e){ last = e; }
      if (i < tries - 1) await new Promise(r => setTimeout(r, 400 * Math.pow(2, i)));
    }
    const er = classify(last); note('query', er.message); return { ok: false, data: null, error: er };
  }

  /* ---------- 4. stockage local sûr ---------- */
  const store = {
    get(k, d){ try { const v = localStorage.getItem(k); if (v == null) return d; return JSON.parse(v); } catch(e){ try { localStorage.removeItem(k); } catch(x){ /* rien */ } note('store', 'purged ' + k); return d; } },
    set(k, v){
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch(e){ try { Object.keys(localStorage).filter(x => /^(lx_tmp|fp_cache|gq_done)/.test(x)).forEach(x => localStorage.removeItem(x)); localStorage.setItem(k, JSON.stringify(v)); return true; } catch(x){ note('store', 'quota ' + k); return false; } }
    },
    del(k){ try { localStorage.removeItem(k); } catch(e){ /* rien */ } }
  };

  /* ---------- 5. file d'envois hors ligne ---------- */
  const QK = 'gq_pending_v1';
  const curUid = () => { try { return (typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.uid) || ''; } catch(e){ return ''; } };
  const handlers = {};
  let flushing = false;
  const queue = {
    handle(type, fn){ handlers[type] = fn; },
    add(type, payload){ const q = store.get(QK, []); q.push({ id: now().toString(36) + Math.random().toString(36).slice(2, 6), type, payload, at: now(), tries: 0, uid: curUid() }); store.set(QK, q.slice(-80)); },
    size(){ return store.get(QK, []).length; },
    async flush(){
      if (flushing || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
      flushing = true;
      try {
        let q = store.get(QK, []);
        for (const job of q.slice()){
          const fn = handlers[job.type]; if (!fn) continue;
          /* un envoi en attente appartient à la personne qui l'a écrit : jamais rejoué au nom d'une autre */
          const cu = curUid();
          if (job.uid && cu && job.uid !== cu){ store.set(QK, store.get(QK, []).filter(x => x.id !== job.id)); continue; }
          if (job.uid && !cu) continue;
          let ok = false; try { ok = await fn(job.payload); } catch(e){ ok = false; }
          q = store.get(QK, []);
          if (ok || ++job.tries >= 6 || now() - job.at > 864e5){ q = q.filter(x => x.id !== job.id); }
          else { q = q.map(x => (x.id === job.id ? job : x)); }
          store.set(QK, q);
          if (!ok) break;                                  /* l'ordre est gardé : on s'arrête au premier échec */
        }
      } finally { flushing = false; }
    }
  };

  /* ---------- 6. rafraîchissement régulier ---------- */
  function every(fn, ms){
    let id = 0, stopped = false, busy = false;
    const tick = async () => {
      if (stopped || busy || document.hidden || navigator.onLine === false) return;
      busy = true; try { await fn(); } catch(e){ note('every', e); } busy = false;
    };
    id = setInterval(tick, ms);
    const vis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', vis);
    return () => { stopped = true; clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }
  const debounce = (fn, ms) => { let t; return function(){ const a = arguments, s = this; clearTimeout(t); t = setTimeout(() => fn.apply(s, a), ms); }; };
  const throttle = (fn, ms) => { let last = 0; return function(){ const n = now(); if (n - last >= ms){ last = n; return fn.apply(this, arguments); } }; };
  function safe(fn, fb){ try { const r = fn(); return r === undefined ? fb : r; } catch(e){ note('safe', e); return fb; } }

  /* ---------- 3. intégrité des données chargées ---------- */
  function dedupe(list){ const seen = new Set(); return list.filter(x => { const k = x && x.id; if (!k || seen.has(k)) return false; seen.add(k); return true; }); }
  function heal(R0){
    try {
      R0.accounts = dedupe(norm.arr(R0.accounts).map(norm.account));
      R0.transactions = dedupe(norm.arr(R0.transactions).map(norm.tx)).filter(x => x.kind !== 'SIGNUP_BONUS').sort((a, b) => b.createdAt - a.createdAt);
      R0.notifications = dedupe(norm.arr(R0.notifications).map(norm.notif)).sort((a, b) => b.createdAt - a.createdAt);
      ['receipts', 'cards', 'wallets', 'bankAccounts', 'contacts', 'beneficiaries', 'devices', 'sessions'].forEach(k => { R0[k] = norm.arr(R0[k]).filter(x => x && typeof x === 'object'); });
      R0.settings = norm.obj(R0.settings); R0.security = norm.obj(R0.security);
    } catch(e){ note('heal', e); }
    return R0;
  }

  /* ---------- 7. surveillance et auto-réparation ---------- */
  const errs = []; let heals = [];
  function onFault(why){
    note('fault', why);
    const t = now(); errs.push(t); while (errs.length && t - errs[0] > 20000) errs.shift();
    if (errs.length < 6) return;
    errs.length = 0; heals.push(t); heals = heals.filter(x => t - x < 120000);
    selfHeal(heals.length);
  }
  async function selfHeal(level){
    note('selfheal', 'level ' + level);
    try { Object.keys(inflight).forEach(k => delete inflight[k]); Object.keys(circuit).forEach(k => { circuit[k].openUntil = 0; circuit[k].fails = 0; }); } catch(e){ /* rien */ }
    try { if (typeof AuthEngine !== 'undefined' && AuthEngine.hasValidContext() && AuthEngine.hydrateLive) { await AuthEngine.hydrateLive(); heal(Runtime); } } catch(e){ /* rien */ }
    try {
      const cur = (typeof R !== 'undefined' && R.current && R.current()) || '';
      /* jamais pendant une saisie ou une fenêtre ouverte : on ne perd pas le brouillon d'un message ni d'un montant */
      const busy = /^(chat|yaser|admin-chat-thread|login|signup|reset|tx-|processing|intl-|crypto-)/.test(cur) || (typeof R !== 'undefined' && R.overlay && R.overlay.isOpen());
      if (!busy){
        if (level >= 3 && cur !== 'home'){ R.go('home', { reset: true, force: true }); }
        else if (cur){ R.go(cur, { force: true, replace: true }); }
      }
    } catch(e){ /* rien */ }
  }
  function start(){
    try {
      window.addEventListener('error', e => { if (e && /ResizeObserver|Script error/i.test(e.message || '')) return; onFault(e && e.message); });
      window.addEventListener('unhandledrejection', e => { const m = e && e.reason && (e.reason.message || e.reason); if (/AbortError|NetworkError|Failed to fetch|Load failed/i.test(String(m))) return; onFault(m); });
      window.addEventListener('online', () => { note('net', 'online'); queue.flush(); });
      setInterval(() => queue.flush(), 15000);
    } catch(e){ /* rien */ }
  }

  /* ---------- 8. diagnostic ---------- */
  function report(){
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    return JSON.stringify({ v: (typeof CONFIG !== 'undefined' && CONFIG.APP && CONFIG.APP.version) || '', at: new Date().toISOString(), online: navigator.onLine, screen: (typeof R !== 'undefined' && R.current && R.current()) || '', queue: queue.size(), ua: ua.slice(0, 120), log: log.slice(-30) }, null, 1);
  }

  start();
  return { rpc, query, norm, heal, store, queue, every, debounce, throttle, safe, report, note, classify, selfHeal };
})();

Object.assign(TR.en, { 'g.forbidden': 'This action is reserved.', 'g.amount': 'This amount is not allowed.', 'g.pending': 'A request is already waiting.', 'g.rate': 'Too fast. Please wait a moment.', 'g.network': 'No connection. Please try again.', 'g.diag': 'Diagnostic', 'g.diagD': 'Copy a short technical report for support', 'g.diagOk': 'Report copied' });
Object.assign(TR.fr, { 'g.forbidden': 'Cette action est réservée.', 'g.amount': 'Ce montant n’est pas autorisé.', 'g.pending': 'Une demande est déjà en attente.', 'g.rate': 'Trop rapide. Patientez un instant.', 'g.network': 'Pas de connexion. Réessayez.', 'g.diag': 'Diagnostic', 'g.diagD': 'Copier un court rapport technique pour l’assistance', 'g.diagOk': 'Rapport copié' });
Object.assign(TR.ar, { 'g.forbidden': 'هذا الإجراء محجوز.', 'g.amount': 'هذا المبلغ غير مسموح.', 'g.pending': 'يوجد طلب قيد الانتظار.', 'g.rate': 'سريع جداً. انتظر لحظة.', 'g.network': 'لا يوجد اتصال. حاول مجدداً.', 'g.diag': 'التشخيص', 'g.diagD': 'انسخ تقريراً تقنياً قصيراً للدعم', 'g.diagOk': 'تم نسخ التقرير' });
