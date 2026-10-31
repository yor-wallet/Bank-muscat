'use strict';

/* ============================================================
   SFX (21.3.0 : sobriété bancaire — interface silencieuse, une seule note douce pour les événements importants ; 18.0.0 : notes pures, attaque lente, volume bas) — sons de l'application, synthétisés (WebAudio) : aucun fichier audio, aucune requête.
   - Cloche « FM » (porteuse + modulatrice qui s'éteint) pour les notifications, l'argent reçu et la récompense ; petite réverbération générée.
   - Sons : tap, nav, success, error, warning, notify, money, reward, newUser, send, swipe, pop.
   - Réglage « Sons » (Réglages → Notifications) : Runtime.settings.sounds (défaut : activé), recopié dans localStorage pour l'avant-connexion.
   - Les navigateurs ne laissent démarrer le son qu'après un geste : le contexte est créé / réveillé au premier toucher.
   - Jamais d'exception : un son qui échoue ne doit rien casser. « Réduire les animations » ne coupe pas le son (réglage séparé) ;
     le son est coupé quand la page est cachée.
   ============================================================ */
const Sfx = (() => {
  const LS = 'fp_sounds';
  let ctx = null, master = null, wet = null, unlocked = false;
  const last = {};
  /* 19.0.0 : sons DÉSACTIVÉS par défaut ; ils ne jouent que si la personne les a activés (Réglages > Raccourcis > Sons) */
  function enabled(){
    try {
      if (typeof Runtime !== 'undefined' && Runtime.settings && typeof Runtime.settings.sounds === 'boolean') return Runtime.settings.sounds;
      return localStorage.getItem(LS) === '1';
    } catch(e){ return false; }
  }
  function set(on){
    try { localStorage.setItem(LS, on ? '1' : '0'); } catch(e){ /* rien */ }
    try { if (typeof Runtime !== 'undefined' && Runtime.settings) Runtime.settings.sounds = !!on; } catch(e){ /* rien */ }
    if (on) play('success');
  }
  function build(){
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.34;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    /* réverbération : bruit qui décroît (1,6 s) */
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = 0.3;
    conv.connect(wet); wet.connect(master);
    master._verb = conv;
    return ctx;
  }
  function unlock(){
    try {
      const c = build(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      unlocked = true;
    } catch(e){ /* rien */ }
  }
  /* ---------- briques ---------- */
  function env(g, t, a, peak, d){ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function out(node, verb){ node.connect(master); if (verb && master._verb) { const s = ctx.createGain(); s.gain.value = verb; node.connect(s); s.connect(master._verb); } }
  function tone(f, t, d, o){
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    env(g, t, o.a || 0.006, o.v || 0.1, d);
    if (o.lp){ const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; osc.connect(lp); lp.connect(g); } else osc.connect(g);
    out(g, o.verb); osc.start(t); osc.stop(t + (o.a || 0.006) + d + 0.05);
  }
  /* « verre » : note pure + un harmonique doux, attaque de 9 ms, longue extinction — jamais métallique, jamais fort */
  function bell(f, t, d, v, verb){
    v = (v || 0.08) * 0.62;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    env(g, t, 0.009, v, d);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.005;
    const g2 = ctx.createGain(); env(g2, t, 0.006, v * 0.22, d * 0.45);
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp);
    out(lp, verb == null ? 0.55 : verb);
    o1.start(t); o2.start(t); const e = t + d + 0.1; o1.stop(e); o2.stop(e);
  }
  function noise(t, d, o){
    o = o || {};
    const n = Math.floor(ctx.sampleRate * (d + 0.05)), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 1.2;
    f.frequency.setValueAtTime(o.f0 || 800, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + d);
    const g = ctx.createGain(); env(g, t, o.a || 0.01, o.v || 0.1, d);
    src.connect(f); f.connect(g); out(g, o.verb); src.start(t); src.stop(t + d + 0.05);
  }
  /* ---------- sons ----------
     21.3.0 — sobriété bancaire. Une banque ne joue pas de jingles : l'interface est SILENCIEUSE (toucher, navigation, glissement, ouverture),
     et seuls les événements qui comptent émettent UNE note douce et courte (jamais d'arpège, de fanfare, de pièce ou de « pop »).
     Les noms historiques restent valides (les modules les appellent) ; les anciennes fanfares (reward, collect, credit, newUser) sont ramenées à une seule note. */
  const note = (f, t, d, v) => bell(f, t, d, v, 0.35);
  const SILENT = () => {};
  const SOUNDS = {
    tap: SILENT, tick: SILENT, nav: SILENT, pop: SILENT, open: SILENT, swipe: SILENT, send: SILENT, recStart: SILENT, recStop: SILENT, yaser: SILENT,
    success: t => { note(880, t, 0.5, 0.05); },
    money:   t => { note(988, t, 0.6, 0.05); },
    notify:  t => { note(1047, t, 0.55, 0.045); },
    warning: t => { note(523, t, 0.4, 0.045); },
    error:   t => { tone(233, t, 0.28, { v: 0.045, a: 0.012, to: 208, lp: 700, verb: 0.1 }); },
    msgSend: SILENT,
    msgRecv: t => { note(1175, t, 0.45, 0.04); },
    collect: t => { note(988, t, 0.6, 0.05); },
    credit:  t => { note(988, t, 0.7, 0.05); },
    newUser: t => { note(880, t, 0.6, 0.045); },
    reward:  t => { note(988, t, 0.7, 0.05); },
  };
  function play(name){
    try {
      if (!enabled() || document.hidden) return;
      const fn = SOUNDS[name]; if (!fn) return;
      const c = build(); if (!c) return;
      if (c.state === 'suspended'){ c.resume().catch(() => {}); if (!unlocked) return; }
      const now = Date.now(); if (last[name] && now - last[name] < 60) return; last[name] = now;
      fn(c.currentTime + 0.01);
    } catch(e){ /* un son qui échoue ne casse rien */ }
  }
  /* le contexte ne peut démarrer qu'après un geste de la personne */
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => { try { window.addEventListener(ev, unlock, { capture: true, passive: true }); } catch(e){ /* rien */ } });
  return { play, unlock, enabled, set, names: Object.keys(SOUNDS) };
})();
