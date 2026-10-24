'use strict';

/* ============================================================
   CONDUCTOR (20.4.0) — le chef d'orchestre adaptatif de l'application.
   Son rôle : équilibrer l'effort demandé au téléphone quand l'application s'ouvre, travaille, passe en arrière-plan, revient ou se ferme,
   pour qu'elle reste fluide et ne plante pas.
   1  profil       à l'ouverture il lit ce que le téléphone peut offrir (cœurs, mémoire, économie de données, « réduire les animations ») et en déduit un palier
                   d'effets : « high » (tout), « mid » (allégé), « low » (sobre). Le palier est écrit sur <html data-fx="…"> : le CSS et les animations s'y adaptent.
   2  fluidité     mesure réelle du nombre d'images par seconde (quelques secondes, au repos, jamais en cachette de la page) : si l'écran rame, le palier
                   descend d'un cran ; si tout est stable longtemps, il remonte. Jamais plus d'un changement toutes les 20 s.
   3  tâches       un seul planificateur pour tous les petits contrôles : une tâche à la fois, au repos du navigateur, jamais page cachée ; une tâche qui
                   coûte trop cher espace ses passages toute seule.
   4  cycle de vie ouverture / fermeture : retour au premier plan = un signal « resume » étalé avec un léger décalage aléatoire (pas de ruée de requêtes) ;
                   passage en arrière-plan = signal « hide » ; réseau perdu / retrouvé = « offline » / « online ».
   5  mode sûr     si la session précédente s'est terminée de façon anormale 3 fois en 10 minutes, cette session démarre en mode sûr : palier « low », caches
                   volatils vidés, copie locale ignorée ; la liste des fins anormales est remise à zéro après 45 s sans erreur.
   Lecture seule : ce fichier ne touche à aucun solde, aucune opération, aucun secret. Chaque fonction attrape ses propres erreurs.
   ============================================================ */
const Conductor = (() => {
  const LIFE = 'fp_life_v1', SAFE_WINDOW = 10 * 60 * 1000, ORDER = ['low', 'mid', 'high'];
  const root = document.documentElement;
  const now = () => Date.now();
  const note = (k, i) => { try { Guardian.note(k, i); } catch(e){ /* rien */ } };
  const mq = q => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch(e){ return false; } };
  const store = {
    get(k, d){ try { return Guardian.store.get(k, d); } catch(e){ return d; } },
    set(k, v){ try { return Guardian.store.set(k, v); } catch(e){ return false; } }
  };
  const conn = () => { try { return navigator.connection || navigator.mozConnection || {}; } catch(e){ return {}; } };

  /* ---------- abonnements ---------- */
  const listeners = {};
  function on(name, fn){
    (listeners[name] = listeners[name] || []).push(fn);
    return () => { listeners[name] = (listeners[name] || []).filter(f => f !== fn); };
  }
  function emit(name, arg){ (listeners[name] || []).slice().forEach(fn => { try { fn(arg); } catch(e){ note('conductor:' + name, e); } }); }

  /* ---------- 1. profil de l'appareil -> palier d'effets ---------- */
  let base = 'high', tier = 'high', safe = false;
  function probe(){
    let s = 2;
    try {
      const n = navigator, c = conn(), cores = n.hardwareConcurrency || 0, mem = n.deviceMemory || 0;
      if (cores && cores <= 2) s = 0; else if (cores && cores <= 4) s = Math.min(s, 1);
      if (mem && mem <= 2) s = 0; else if (mem && mem <= 4) s = Math.min(s, 1);
      if (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || '')) s = Math.min(s, 1);
      if (mq('(prefers-reduced-motion: reduce)')) s = 0;
    } catch(e){ /* rien */ }
    return ORDER[s];
  }
  function setTier(next, why){
    if (ORDER.indexOf(next) < 0 || next === tier) return;
    const prev = tier; tier = next;
    try { root.setAttribute('data-fx', tier); } catch(e){ /* rien */ }
    try { sessionStorage.setItem('fp.fx', tier); } catch(e){ /* rien */ }
    note('fx', prev + '>' + next + (why ? ' ' + why : ''));
    emit('tier', { tier: next, prev, why });
  }
  /* coefficient pour les moteurs d'animation (confettis, particules) : 1 plein, moins sur un appareil modeste, 0 si « réduire les animations » */
  function scale(){
    if (mq('(prefers-reduced-motion: reduce)')) return 0;
    return tier === 'high' ? 1 : tier === 'mid' ? 0.55 : 0.25;
  }

  /* ---------- 5 + 4. cycle de vie : fin normale ou anormale de la session précédente ---------- */
  let life = { opens: 0, last: 0, clean: true, bad: [], prevAbnormal: false };
  let firstRun = false;
  function openSession(){
    const L = store.get(LIFE, null) || {};
    const t = now();
    const wasDirty = L.clean === false;
    firstRun = !L.opens;
    const bad = (Array.isArray(L.bad) ? L.bad : []).filter(x => t - x < SAFE_WINDOW);
    if (wasDirty) bad.push(Number(L.last) || t);
    safe = bad.length >= 3;
    life = { opens: (Number(L.opens) || 0) + 1, last: t, clean: false, bad: bad.slice(-6), prevAbnormal: wasDirty };
    store.set(LIFE, life);
    if (wasDirty) note('life', 'previous session ended abnormally');
    if (safe){
      note('life', 'safe mode');
      try { root.setAttribute('data-safe', '1'); } catch(e){ /* rien */ }
      /* caches volatils seulement : jamais d'argent, jamais de session */
      try { Object.keys(localStorage).filter(k => /^(lx_tmp|fp_cache|gq_done)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch(e){ /* rien */ }
      /* si la session survit 45 s sans erreur, la série d'incidents est effacée : la prochaine ouverture sera normale */
      let errs = 0; const count = () => { errs++; };
      window.addEventListener('error', count);
      setTimeout(() => {
        window.removeEventListener('error', count);
        if (!errs && !document.hidden){ life.bad = []; store.set(LIFE, life); note('life', 'safe mode cleared'); }
      }, 45000);
    }
  }
  function markClean(clean){
    if (life.clean === clean) return;
    life.clean = clean; if (!clean) life.last = now();
    store.set(LIFE, life);
  }

  /* ---------- 2. fluidité réelle ---------- */
  let sampling = false, lastFps = null, bad = 0, good = 0, lastChange = 0;
  function sampleFps(ms){
    return new Promise(res => {
      if (sampling || document.hidden) return res(null);
      sampling = true;
      let frames = 0, t0 = 0, last = 0, stalled = false;
      const dur = ms || 1600;
      const step = ts => {
        if (document.hidden){ sampling = false; return res(null); }
        if (!t0){ t0 = ts; last = ts; }
        else { if (ts - last > 400) stalled = true; last = ts; frames++; }
        if (ts - t0 >= dur){ sampling = false; res(stalled ? null : Math.round(frames * 1000 / (ts - t0))); }
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  async function fpsCheck(){
    const fps = await sampleFps();
    if (fps == null) return true;                                    /* mesure invalide (page cachée, gel) : on ne conclut rien */
    lastFps = fps;
    if (fps < 40){ bad++; good = 0; } else if (fps >= 55){ good++; bad = 0; } else { bad = 0; good = 0; }
    const free = now() - lastChange > 20000, i = ORDER.indexOf(tier);
    if (free && bad >= 2 && i > 0){ setTier(ORDER[i - 1], 'fps ' + fps); lastChange = now(); bad = 0; }
    else if (free && good >= 3 && i < ORDER.indexOf(base) && !safe){ setTier(ORDER[i + 1], 'stable'); lastChange = now(); good = 0; }
    return true;
  }

  /* ---------- 3. planificateur : une tâche à la fois, au repos, jamais page cachée ---------- */
  const tasks = {};
  let timer = 0, running = false;
  /* task(nom, fn, { every, first, prio, heavy }) — fn doit être COURTE : un contrôle, pas une longue attente réseau (déléguer au DataCenter) */
  function task(name, fn, o){
    o = o || {};
    const every = Math.max(2000, o.every || 60000);
    tasks[name] = { name, fn, every, base: every, due: now() + (o.first != null ? o.first : every), prio: o.prio || 5, heavy: !!o.heavy, runs: 0, fails: 0, ms: 0, last: 0, ok: null };
    kick();
    return () => { delete tasks[name]; };
  }
  function kick(){ if (!timer && !running) timer = setTimeout(loop, 1200); }
  function loop(){
    timer = 0;
    if (document.hidden) return;                                     /* relancé au retour au premier plan */
    const t = now();
    const due = Object.keys(tasks).map(k => tasks[k]).filter(x => x.due <= t).sort((a, b) => (a.prio - b.prio) || (a.due - b.due));
    const job = due[0];
    if (!job){ timer = setTimeout(loop, 2500); return; }
    running = true;
    const go = async () => {
      const t0 = (typeof performance !== 'undefined' ? performance.now() : now());
      try { const r = await job.fn(); job.ok = r !== false; } catch(e){ job.fails++; job.ok = false; note('task:' + job.name, e); }
      const ms = (typeof performance !== 'undefined' ? performance.now() : now()) - t0;
      job.ms = Math.round(ms); job.runs++; job.last = now();
      /* une tâche chère espace ses passages ; une tâche légère revient à son rythme de base */
      job.every = ms > 80 ? Math.min(job.base * 4, job.every * 1.5) : Math.max(job.base, job.every / 1.2);
      job.due = now() + job.every * (tier === 'low' && job.heavy ? 2 : 1);
      running = false; timer = setTimeout(loop, 900);
    };
    try { (window.requestIdleCallback ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 60)); } catch(e){ setTimeout(go, 60); }
  }
  function run(name){ const j = tasks[name]; if (j){ j.due = 0; kick(); } }

  /* ---------- 4. ouverture / fermeture / réseau ---------- */
  let hiddenAt = 0;
  function onHidden(){
    if (hiddenAt) return;
    hiddenAt = now(); markClean(true);
    emit('hide', {});
  }
  function onVisible(){
    const away = hiddenAt ? now() - hiddenAt : 0; hiddenAt = 0;
    markClean(false); kick();
    /* décalage aléatoire : le centre de données, les contrôles et le temps réel ne partent pas tous à la même milliseconde */
    setTimeout(() => emit('resume', { away }), 120 + Math.floor(Math.random() * 380));
  }
  function netState(){
    try { if (navigator.onLine === false) return 'off'; const c = conn(); return (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || '')) ? 'slow' : 'ok'; } catch(e){ return 'ok'; }
  }
  function paintNet(){ try { root.setAttribute('data-net', netState()); } catch(e){ /* rien */ } }

  function start(){
    try {
      openSession();
      base = probe();
      let initial = safe ? 'low' : base;
      try { const s = sessionStorage.getItem('fp.fx'); if (!safe && ORDER.indexOf(s) >= 0 && ORDER.indexOf(s) < ORDER.indexOf(initial)) initial = s; } catch(e){ /* rien */ }
      tier = ''; setTier(initial); if (!tier){ tier = initial; root.setAttribute('data-fx', tier); }
      paintNet();
      document.addEventListener('visibilitychange', () => { if (document.hidden) onHidden(); else onVisible(); });
      window.addEventListener('pagehide', onHidden);
      window.addEventListener('pageshow', e => { if (e && e.persisted) onVisible(); });
      document.addEventListener('freeze', onHidden);
      document.addEventListener('resume', onVisible);
      window.addEventListener('online', () => { paintNet(); emit('online', {}); });
      window.addEventListener('offline', () => { paintNet(); emit('offline', {}); });
      try { const c = conn(); if (c && c.addEventListener) c.addEventListener('change', paintNet); } catch(e){ /* rien */ }
      /* mesure de fluidité : 5 s après le démarrage (animation d'ouverture passée), puis toutes les 90 s au repos */
      task('fps', fpsCheck, { first: 5000, every: 90000, prio: 9 });
    } catch(e){ note('conductor', e); }
  }
  start();

  function stats(){
    return { tier, base, safe, fps: lastFps, net: netState(), life: { opens: life.opens, prevAbnormal: !!life.prevAbnormal, bad: (life.bad || []).length },
      tasks: Object.keys(tasks).map(k => { const j = tasks[k]; return { name: j.name, runs: j.runs, fails: j.fails, ms: j.ms, every: Math.round(j.every), ok: j.ok }; }) };
  }
  return { on, task, run, scale, fx: () => tier, base: () => base, isSafe: () => safe, firstRun: () => firstRun, fps: fpsCheck, net: netState, stats, _setTier: setTier };
})();
