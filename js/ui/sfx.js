'use strict';

/* ============================================================
   SFX (18.0.0 : banque « verre doux », façon iPhone — notes pures, attaque lente, volume bas) — sons de l'application, synthétisés (WebAudio) : aucun fichier audio, aucune requête.
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
  function enabled(){
    try {
      if (typeof Runtime !== 'undefined' && Runtime.settings && Runtime.settings.sounds === false) return false;
      if (localStorage.getItem(LS) === '0') return false;
    } catch(e){ /* rien */ }
    return true;
  }
  function set(on){
    try { localStorage.setItem(LS, on ? '1' : '0'); } catch(e){ /* rien */ }
    try { if (typeof Runtime !== 'undefined' && Runtime.settings) Runtime.settings.sounds = !!on; } catch(e){ /* rien */ }
    if (on) play('pop');
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
  /* ---------- sons ---------- */
  const SOUNDS = {
    tap:     t => { tone(1750, t, 0.028, { v: 0.018, a: 0.003, lp: 3200 }); },
    tick:    t => { tone(2300, t, 0.014, { v: 0.009, a: 0.002, lp: 3600 }); },
    nav:     t => { bell(784, t, 0.2, 0.045, 0.3); },
    pop:     t => { tone(620, t, 0.1, { v: 0.05, a: 0.006, to: 840, lp: 3000, verb: 0.2 }); },
    open:    t => { noise(t, 0.2, { f0: 400, f1: 1500, q: 0.7, v: 0.02, a: 0.06, verb: 0.3 }); bell(988, t + 0.1, 0.35, 0.04, 0.5); },
    swipe:   t => { noise(t, 0.18, { f0: 500, f1: 1800, q: 0.7, v: 0.02, a: 0.05, verb: 0.2 }); },
    success: t => { bell(880, t, 0.55, 0.075); bell(1318.5, t + 0.12, 0.85, 0.08); },
    warning: t => { bell(523, t, 0.3, 0.06, 0.3); bell(523, t + 0.2, 0.4, 0.06, 0.3); },
    error:   t => { tone(233, t, 0.2, { v: 0.07, a: 0.01, to: 196, lp: 700, verb: 0.2 }); tone(196, t + 0.15, 0.28, { v: 0.06, a: 0.01, to: 165, lp: 600, verb: 0.2 }); },
    notify:  t => { bell(1175, t, 0.5, 0.07); bell(1480, t + 0.16, 0.5, 0.07); bell(1760, t + 0.32, 0.95, 0.075); },
    money:   t => { bell(1568, t, 0.6, 0.075); bell(2093, t + 0.1, 1.0, 0.07, 0.7); },
    newUser: t => { bell(659, t, 0.5, 0.07); bell(880, t + 0.16, 0.5, 0.07); bell(1175, t + 0.32, 1.0, 0.075, 0.7); },
    send:    t => { noise(t, 0.34, { f0: 380, f1: 2600, q: 0.8, v: 0.03, a: 0.07, verb: 0.3 }); bell(1318, t + 0.26, 0.7, 0.055); },
    msgSend: t => { tone(880, t, 0.09, { v: 0.045, a: 0.006, to: 1320, lp: 3600, verb: 0.2 }); bell(1760, t + 0.07, 0.25, 0.03, 0.3); },
    msgRecv: t => { bell(1318, t, 0.4, 0.06); bell(1760, t + 0.12, 0.7, 0.06, 0.6); },
    recStart:t => { tone(660, t, 0.09, { v: 0.04, a: 0.008, lp: 2800 }); tone(990, t + 0.09, 0.14, { v: 0.045, a: 0.008, lp: 2800, verb: 0.3 }); },
    recStop: t => { tone(990, t, 0.08, { v: 0.04, a: 0.008, lp: 2800 }); tone(660, t + 0.08, 0.16, { v: 0.045, a: 0.008, lp: 2800, verb: 0.3 }); },
    yaser:   t => { tone(520, t, 0.14, { v: 0.05, a: 0.01, to: 780, lp: 3000, verb: 0.3 }); bell(1040, t + 0.1, 0.5, 0.05, 0.6); },
    collect: t => { [1047, 1319, 1568, 2093, 2637].forEach((f, i) => bell(f, t + i * 0.07, 0.7 + i * 0.06, 0.055 + i * 0.004, 0.6)); },
    credit:  t => { [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.01, 1.4, { v: 0.03, a: 0.08, lp: 1800, verb: 0.6 })); bell(1046, t + 0.25, 1.1, 0.07, 0.7); bell(1568, t + 0.42, 1.4, 0.075, 0.8); },
    reward:  t => {
      [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => bell(f, t + i * 0.09, 1.2 - i * 0.07, 0.06 + i * 0.004, 0.65));
      [262, 330, 392].forEach(f => tone(f, t + 0.4, 1.7, { v: 0.022, a: 0.14, lp: 1000, verb: 0.6 }));
    },
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
