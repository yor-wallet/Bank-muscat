'use strict';

/* ============================================================
   SENTINELS (20.4.0) — les mini-agents de contrôle, comme des globules blancs : petits, nombreux, discrets, toujours en patrouille.
   Chacun surveille UNE chose, passe au repos du navigateur (planificateur du Conductor : un seul à la fois, jamais page cachée, jamais pendant une animation
   lourde) et ne fait jamais de bruit : il n'affiche rien à l'écran. S'il trouve un défaut, il le note (sans montant ni nom), et, selon le cas, demande au
   centre de données une relecture du serveur (la vérité), ou range un détail d'interface (notifications empilées, caches trop gros).
   Règle d'or : LECTURE SEULE sur l'argent. Aucun agent n'écrit, ne corrige ni ne recalcule un solde ou une opération : le serveur seul fait foi.
   Agents :  balance   cohérence des soldes affichés (disponible ≤ solde, réservé ≥ 0, nombres valides)
             ledger    opérations : références en double, montant confirmé nul ou négatif, date dans le futur
             sync      fraîcheur des données : trop ancienne ou lectures qui échouent en série → relecture demandée
             render    santé de l'écran : nombre de nœuds, notifications empilées, fluidité mesurée par le Conductor
             storage   espace de stockage du téléphone : au-delà de 80 % → nettoyage (Janitor)
             shell     service worker : mise à jour prête, vérification de version (au plus toutes les 6 h)
             faults    rafale d'erreurs JavaScript sur 5 minutes
             i18n      texte brut de clé de traduction visible à l'écran (« ac.title » au lieu du texte)
   Journal court (80 lignes) ; `summary()` est joint au rapport de diagnostic (Paramètres › Diagnostic) ; `line()` donne la phrase honnête affichée dans ce même écran.
   ============================================================ */
Object.assign(TR.en, { 'sn.ok': 'All {n} automatic checks passed.', 'sn.warn': '{k} of {n} automatic checks need attention — copy the report for support.' });
Object.assign(TR.fr, { 'sn.ok': 'Les {n} contrôles automatiques sont réussis.', 'sn.warn': '{k} contrôle(s) sur {n} à vérifier — copiez le rapport pour l’assistance.' });
Object.assign(TR.ar, { 'sn.ok': 'نجحت جميع الفحوصات التلقائية ({n}).', 'sn.warn': '{k} من {n} فحوصات تحتاج إلى مراجعة — انسخ التقرير للدعم.' });

const Sentinels = (() => {
  const LOG_MAX = 80;
  const now = () => Date.now();
  const log = [], agents = {}, order = [];
  const note = (k, i) => { try { Guardian.note(k, i); } catch(e){ /* rien */ } };
  function logIt(level, id, msg){ log.push({ t: now(), l: level, a: id, m: String(msg).slice(0, 120) }); if (log.length > LOG_MAX) log.shift(); }

  /* demande de relecture au centre de données : au plus une fois toutes les 5 minutes, tous agents confondus */
  let lastAsk = 0;
  function ask(){
    if (now() - lastAsk < 300000) return;
    lastAsk = now();
    try { if (typeof DataCenter !== 'undefined') DataCenter.request('verify'); } catch(e){ /* rien */ }
  }

  /* agent(id, intervalle, première exécution, fonction) — la fonction rend { ok, note } (ou rien = ok) */
  function agent(id, every, first, fn, heavy){
    agents[id] = { id, ok: null, note: '', at: 0, runs: 0, flags: 0 };
    order.push(id);
    const wrapped = async () => {
      const a = agents[id]; let res;
      try { res = await fn(); } catch(e){ res = { ok: false, note: 'agent error: ' + (e && e.message || e) }; }
      res = res || { ok: true };
      const prev = a.ok;
      a.ok = res.ok !== false; a.note = res.note || ''; a.at = now(); a.runs++;
      if (!a.ok){ a.flags++; if (prev !== false){ logIt('warn', id, a.note); note('sentinel:' + id, a.note); } }
      else if (prev === false){ logIt('ok', id, 'back to normal'); }
      return true;
    };
    try { if (typeof Conductor !== 'undefined') Conductor.task('sentinel:' + id, wrapped, { every, first, prio: 6, heavy: !!heavy }); } catch(e){ /* rien */ }
    agents[id].run = wrapped;
  }

  const ready = () => { try { return !!(typeof UserContext !== 'undefined' && UserContext.get() && Runtime.ctx); } catch(e){ return false; } };

  /* ---------- balance : cohérence des soldes affichés (aucun montant dans la note) ---------- */
  agent('balance', 45000, 20000, () => {
    if (!ready()) return { ok: true, note: 'signed out' };
    const bad = [];
    (Runtime.accounts || []).forEach(a => {
      const b = a.balance, av = a.availableBalance, rs = a.reservedBalance, c = String(a.currency || '?');
      if (![b, av, rs].every(Number.isFinite)) bad.push(c + ':not-a-number');
      else if (av > b + 0.0005) bad.push(c + ':available>balance');
      else if (rs < 0) bad.push(c + ':reserved<0');
    });
    if (bad.length){ ask(); return { ok: false, note: bad.slice(0, 3).join(', ') }; }
    return { ok: true };
  });

  /* ---------- ledger : opérations ---------- */
  agent('ledger', 60000, 28000, () => {
    if (!ready()) return { ok: true, note: 'signed out' };
    const tx = Runtime.transactions || [], seen = new Set(), t = now();
    let dup = 0, nonPos = 0, future = 0;
    tx.forEach(x => {
      if (x.reference){ const k = x.reference + '|' + x.direction + '|' + x.kind; if (seen.has(k)) dup++; else seen.add(k); }
      if (typeof txState === 'function' && txState(x.status) === 'success' && !(Number(x.amount) > 0)) nonPos++;
      if (x.createdAt > t + 10 * 60000) future++;
    });
    const bad = []; if (dup) bad.push(dup + ' duplicate ref'); if (nonPos) bad.push(nonPos + ' confirmed with amount<=0'); if (future) bad.push(future + ' dated in the future');
    if (bad.length){ ask(); return { ok: false, note: bad.join(', ') }; }
    return { ok: true };
  });

  /* ---------- sync : fraîcheur des données ---------- */
  agent('sync', 30000, 35000, () => {
    if (typeof DataCenter === 'undefined' || !DataCenter.canRun()) return { ok: true, note: 'idle' };
    const st = DataCenter.status(), age = DataCenter.age();
    if (st.fails >= 3) return { ok: false, note: 'reads failing x' + st.fails };
    if (age > 4 * 60000 && st.state !== 'syncing'){ ask(); return { ok: false, note: 'data older than ' + Math.round(age / 1000) + ' s' }; }
    return { ok: true };
  });

  /* ---------- render : santé de l'écran ---------- */
  agent('render', 40000, 42000, () => {
    const bad = [];
    const n = document.getElementsByTagName('*').length;
    if (n > 9000) bad.push('dom ' + n + ' nodes');
    const tz = document.getElementById('toasts');
    if (tz && tz.children.length > 6){ while (tz.children.length > 4) tz.removeChild(tz.firstChild); bad.push('toasts piled up (tidied)'); }
    try { const f = Conductor.stats().fps; if (f != null && f < 30) bad.push('fps ' + f); } catch(e){ /* rien */ }
    return bad.length ? { ok: false, note: bad.join(', ') } : { ok: true };
  });

  /* ---------- storage : espace du téléphone ---------- */
  agent('storage', 10 * 60000, 55000, async () => {
    const bad = [];
    try {
      if (navigator.storage && navigator.storage.estimate){
        const e = await navigator.storage.estimate();
        if (e && e.quota && e.usage / e.quota > 0.8) bad.push('storage ' + Math.round(100 * e.usage / e.quota) + '% used');
      }
    } catch(e){ /* rien */ }
    try {
      let chars = 0; for (let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); chars += k.length + (localStorage.getItem(k) || '').length; }
      if (chars > 4.2e6) bad.push('localStorage ' + Math.round(chars / 1024) + ' KB');
    } catch(e){ /* rien */ }
    if (bad.length){ try { if (typeof Janitor !== 'undefined') await Janitor.run(); } catch(e){ /* rien */ } return { ok: false, note: bad.join(', ') + ' (cleanup run)' }; }
    return { ok: true };
  }, true);

  /* ---------- shell : service worker ---------- */
  agent('shell', 30 * 60000, 70000, async () => {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return { ok: true, note: 'n/a' };
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return { ok: true, note: 'no worker' };
    try {      /* vérification de version : au plus toutes les 6 h */
      const last = Number(Guardian.store.get('sn_swu', 0)) || 0;
      if (now() - last > 6 * 3600000){ Guardian.store.set('sn_swu', now()); reg.update().catch(() => {}); }
    } catch(e){ /* rien */ }
    return { ok: true, note: reg.waiting ? 'update ready' : 'current' };
  }, true);

  /* ---------- faults : rafale d'erreurs ---------- */
  agent('faults', 60000, 48000, () => {
    try {
      const rep = JSON.parse(Guardian.report()), t = now();
      const recent = (rep.log || []).filter(x => x.k === 'fault' && t - x.t < 5 * 60000).length;
      if (recent >= 8) return { ok: false, note: recent + ' errors in 5 min' };
    } catch(e){ /* rien */ }
    return { ok: true };
  });

  /* ---------- i18n : clé de traduction affichée telle quelle ---------- */
  let keys = null;
  const keySet = () => { if (keys) return keys; keys = new Set(); try { Object.keys(TR.en).forEach(k => { if (k.indexOf('.') > 0 && k.length >= 4) keys.add(k); }); } catch(e){ /* rien */ } return keys; };
  agent('i18n', 45000, 62000, () => {
    const root = document.getElementById('screens'); if (!root) return { ok: true };
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), hits = []; let n = 0;
    while (w.nextNode() && n < 600){
      n++; const s = (w.currentNode.nodeValue || '').trim();
      if (s && s.length < 60 && keySet().has(s)) hits.push(s);
    }
    return hits.length ? { ok: false, note: 'raw key on screen: ' + hits.slice(0, 3).join(', ') } : { ok: true };
  });

  /* ---------- lecture ---------- */
  function status(){
    const list = order.map(id => { const a = agents[id]; return { id, ok: a.ok, note: a.note, at: a.at, runs: a.runs, flags: a.flags }; });
    const ran = list.filter(a => a.ok !== null);
    return { total: list.length, ran: ran.length, bad: ran.filter(a => a.ok === false).length, agents: list, log: log.slice(-20) };
  }
  /* version courte pour le rapport de diagnostic */
  function summary(){
    const s = status();
    return { agents: s.agents.map(a => a.id + ':' + (a.ok === null ? 'pending' : a.ok ? 'ok' : 'WARN ' + a.note) + ' (x' + a.runs + ')'), log: s.log.slice(-8) };
  }
  /* phrase honnête : vide tant qu'aucun agent n'est passé (on n'affirme rien qui n'a pas été vérifié) */
  function line(){
    const s = status(); if (!s.ran) return '';
    return s.bad ? tf('sn.warn', { k: s.bad, n: s.ran }) : tf('sn.ok', { n: s.ran });
  }
  /* tout vérifier maintenant (tests, assistance) */
  async function runAll(){ for (const id of order){ try { await agents[id].run(); } catch(e){ /* rien */ } } return status(); }
  async function run(id){ if (agents[id]) await agents[id].run(); return agents[id] ? status() : null; }

  return { status, summary, line, run, runAll, ask };
})();
