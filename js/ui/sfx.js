'use strict';

/* ============================================================
   SFX (16.0.0) — sons de l'application, synthétisés (WebAudio) : aucun fichier audio, aucune requête.
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
    master = ctx.createGain(); master.gain.value = 0.6;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    /* réverbération : bruit qui décroît (1,6 s) */
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = 0.22;
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
  /* cloche FM : un « ding » métallique qui s'éteint */
  function bell(f, t, d, v, verb){
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.type = 'sine'; car.frequency.value = f; mod.type = 'sine'; mod.frequency.value = f * 3.51;
    mg.gain.setValueAtTime(f * 1.6, t); mg.gain.exponentialRampToValueAtTime(f * 0.02, t + d * 0.7);
    mod.connect(mg); mg.connect(car.frequency);
    env(g, t, 0.004, v, d);
    car.connect(g); out(g, verb == null ? 0.5 : verb);
    const sub = ctx.createOscillator(), sg = ctx.createGain(); sub.type = 'triangle'; sub.frequency.value = f / 2; env(sg, t, 0.006, v * 0.35, d * 0.6); sub.connect(sg); out(sg, 0.2);
    car.start(t); mod.start(t); sub.start(t); const e = t + d + 0.1; car.stop(e); mod.stop(e); sub.stop(e);
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
    tap:     t => { tone(2100, t, 0.03, { v: 0.045, a: 0.002 }); tone(1300, t, 0.045, { v: 0.03, a: 0.002, type: 'triangle' }); },
    nav:     t => { tone(740, t, 0.07, { v: 0.05, a: 0.004, to: 980 }); },
    pop:     t => { tone(520, t, 0.09, { v: 0.09, a: 0.003, to: 900 }); },
    swipe:   t => { noise(t, 0.16, { f0: 500, f1: 2200, q: 0.9, v: 0.05, a: 0.03 }); },
    success: t => { bell(1046.5, t, 0.5, 0.1); bell(1568, t + 0.11, 0.7, 0.11); },
    warning: t => { tone(440, t, 0.14, { v: 0.09, type: 'triangle', lp: 1800 }); tone(440, t + 0.17, 0.14, { v: 0.09, type: 'triangle', lp: 1800 }); },
    error:   t => { tone(196, t, 0.16, { v: 0.12, type: 'sawtooth', lp: 700 }); tone(147, t + 0.14, 0.24, { v: 0.12, type: 'sawtooth', lp: 600 }); },
    notify:  t => { bell(1318.5, t, 0.55, 0.1); bell(1760, t + 0.13, 0.55, 0.1); bell(2093, t + 0.26, 0.9, 0.11); },
    money:   t => { bell(1975.5, t, 0.5, 0.11); bell(2637, t + 0.09, 1.0, 0.12, 0.7); noise(t + 0.09, 0.3, { type: 'highpass', f0: 6000, v: 0.02, a: 0.01 }); },
    newUser: t => { bell(659.3, t, 0.5, 0.1); bell(880, t + 0.16, 0.5, 0.1); bell(1174.7, t + 0.32, 1.1, 0.12, 0.7); tone(329.6, t, 0.9, { v: 0.05, type: 'triangle', lp: 900 }); },
    send:    t => { noise(t, 0.38, { f0: 350, f1: 3400, q: 1.1, v: 0.09, a: 0.05, verb: 0.2 }); bell(1568, t + 0.3, 0.6, 0.08); },
    reward:  t => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => bell(f, t + i * 0.085, 1.2 - i * 0.08, 0.1 + i * 0.006, 0.6));
      [261.63, 329.63, 392].forEach(f => tone(f, t + 0.45, 1.6, { v: 0.045, type: 'sawtooth', lp: 1100, a: 0.12, verb: 0.5 }));
      [0.55, 0.7, 0.82, 0.95].forEach(x => noise(t + x, 0.18, { type: 'highpass', f0: 5000 + x * 3000, v: 0.035, a: 0.004 }));
    },
  };
  function play(name){
    try {
      if (!enabled() || document.hidden) return;
      const fn = SOUNDS[name]; if (!fn) return;
      const c = build(); if (!c) return;
      if (c.state === 'suspended'){ c.resume().catch(() => {}); if (!unlocked) return; }
      const now = Date.now(); if (last[name] && now - last[name] < 70) return; last[name] = now;
      fn(c.currentTime + 0.01);
    } catch(e){ /* un son qui échoue ne casse rien */ }
  }
  /* le contexte ne peut démarrer qu'après un geste de la personne */
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => { try { window.addEventListener(ev, unlock, { capture: true, passive: true }); } catch(e){ /* rien */ } });
  return { play, unlock, enabled, set, names: Object.keys(SOUNDS) };
})();
