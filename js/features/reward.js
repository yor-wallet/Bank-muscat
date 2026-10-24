'use strict';

/* ============================================================
   REWARD (16.0.0) — récompense de bienvenue : 10 OMR offerts à chaque nouveau compte confirmé.
   - Le montant est crédité PAR LE SERVEUR (fonction _grant_signup_bonus : une seule fois par compte, journal d'audit, notification « REWARD »).
     Ce fichier ne crédite jamais rien : il ne fait que CÉLÉBRER ce que le serveur a réellement écrit (notification REWARD non lue).
   - `Reward.check()` : à l'ouverture de l'accueil, s'il existe une notification REWARD non lue → célébration plein écran (confettis, pièce, son),
     puis la notification est marquée lue (une seule célébration par récompense, même sur un autre appareil).
   - `Reward.celebrate({ amount, currency, id })` : l'écran lui-même (aussi utilisé en direct à l'arrivée de la notification en temps réel).
   ============================================================ */
const Reward = (() => {
  const SEEN = 'fp_rw_seen';
  const seenList = () => { try { return JSON.parse(localStorage.getItem(SEEN) || '[]'); } catch(e){ return []; } };
  const markLocal = id => { try { const l = seenList(); if (id && l.indexOf(id) === -1){ l.push(id); localStorage.setItem(SEEN, JSON.stringify(l.slice(-20))); } } catch(e){ /* rien */ } };
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  let open = null;

  const giftIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9v11M3 9h18v3H3zM12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0"/></svg>';
  const COLORS = ['#48c2c9', '#bae8eb', '#FFFFFF', '#bae8eb', '#8edde2', '#bae8eb'];
  function confetti(n){
    const r = (a, b) => a + Math.random() * (b - a);
    let h = '';
    for (let i = 0; i < n; i++){
      const wave2 = i % 3 === 0;
      h += '<i style="--x:' + r(0, 100).toFixed(1) + '%;--w:' + r(6, 11).toFixed(0) + 'px;--h:' + r(10, 19).toFixed(0) + 'px;--c:' + COLORS[i % COLORS.length] + ';--d:' + (wave2 ? r(1.6, 2.6) : r(0, 0.9)).toFixed(2) + 's;--t:' + r(2.4, 4.2).toFixed(2) + 's;--dx:' + r(-18, 18).toFixed(0) + 'vw;--r:' + r(360, 960).toFixed(0) + 'deg"></i>';
    }
    return h;
  }
  /* marque la notification lue (serveur + mémoire) : plus de célébration, ni ici ni sur un autre appareil */
  function markRead(id){
    if (!id) return;
    try {
      const x = (Runtime.notifications || []).find(n => String(n.id) === String(id)); if (x) x.read = true;
      UserDataEngine.writeSub(UserContext.requireCtx().uid, 'notifications', id, { read: true }).catch(() => {});
      if (typeof Push !== 'undefined') Push.syncBadge();
    } catch(e){ /* rien */ }
  }
  function fmt(n, cur){ try { return CurrencyEngine.format(n, cur); } catch(e){ return n + ' ' + cur; } }

  function celebrate(o){
    o = o || {};
    if (open) return open.done;
    const amount = Number(o.amount) > 0 ? Number(o.amount) : 10, cur = String(o.currency || 'OMR').toUpperCase();
    const rtl = (typeof LANG !== 'undefined' && LANG === 'ar');
    const el = document.createElement('div');
    el.className = 'rwd'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    el.setAttribute('aria-label', t('lx.rw.p'));
    let approx = '';
    try { const v = balanceView(amount, cur); if (v.converted) approx = '≈ ' + fmt(v.amount, v.currency); } catch(e){ /* rien */ }
    el.innerHTML = '<div class="rwd-conf" aria-hidden="true">' + (reduced() ? '' : confetti(Math.max(18, Math.round(86 * (typeof Conductor !== 'undefined' ? Conductor.scale() : 1))))) + '</div>' +
      '<div class="rwd-medal" aria-hidden="true"><i class="rwd-ring"></i><i class="rwd-ring r2"></i><span class="rwd-coin">' + giftIcon + '</span></div>' +
      '<div class="rwd-k">' + escapeHtml(t('lx.rw.k')) + '</div>' +
      '<div class="rwd-amt" dir="ltr"><b id="rwd-n">0</b><span>' + escapeHtml(cur) + '</span></div>' +
      '<p class="rwd-p">' + escapeHtml(t('lx.rw.p')) + '</p>' +
      '<div class="rwd-sub">' + escapeHtml(approx ? approx + ' · ' + t('lx.rw.sub') : t('lx.rw.sub')) + '</div>' +
      '<button type="button" class="btn btn-primary rwd-go" id="rwd-go">' + escapeHtml(t('lx.rw.go')) + '</button>';
    document.body.appendChild(el);
    const prev = document.activeElement;
    let closed = false, resolve;
    const done = new Promise(r => { resolve = r; });
    const num = el.querySelector('#rwd-n');
    const frac = amount % 1 !== 0;
    const t0 = performance.now(), D = reduced() ? 1 : 1100;
    (function tick(now){
      if (closed) return;
      const k = Math.min(1, (now - t0 - 650) / D), e = k <= 0 ? 0 : 1 - Math.pow(1 - k, 3);
      num.textContent = (frac ? (amount * e).toFixed(2) : Math.round(amount * e)).toString();
      if (k < 1) requestAnimationFrame(tick); else num.textContent = frac ? amount.toFixed(2) : String(amount);
    })(t0);
    requestAnimationFrame(() => el.classList.add('is-in'));
    try { Sfx.play('reward'); } catch(e){ /* rien */ }
    try { if (navigator.vibrate && !(Runtime.settings && Runtime.settings.vibration === false)) navigator.vibrate([20, 50, 20, 50, 90]); } catch(e){ /* rien */ }
    /* deuxième salve de confettis */
    if (!reduced()) setTimeout(() => { if (closed) return; const c = el.querySelector('.rwd-conf'); if (c) c.insertAdjacentHTML('beforeend', confetti(Math.max(10, Math.round(40 * (typeof Conductor !== 'undefined' ? Conductor.scale() : 1))))); }, 2300);
    function close(){
      if (closed) return; closed = true; open = null;
      markLocal(o.id); markRead(o.id);
      el.classList.add('is-out');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { try { el.remove(); } catch(e){ /* rien */ } try { prev && prev.focus && prev.focus({ preventScroll: true }); } catch(e){ /* rien */ } resolve(true); }, 360);
      try { Sfx.play('pop'); } catch(e){ /* rien */ }
    }
    function onKey(e){ if (e.key === 'Escape' || e.key === 'Enter'){ e.preventDefault(); close(); } }
    document.addEventListener('keydown', onKey, true);
    el.querySelector('#rwd-go').onclick = close;
    setTimeout(() => { try { el.querySelector('#rwd-go').focus({ preventScroll: true }); } catch(e){ /* rien */ } }, 1100);
    open = { done };
    return done;
  }

  /* À appeler quand l'accueil s'ouvre : célèbre une récompense réelle non lue. */
  async function check(){
    try {
      const list = (Runtime.notifications || []).filter(n => n.type === 'REWARD' && !n.read && seenList().indexOf(n.id) === -1);
      if (!list.length) return false;
      const n = list[0], d = n.data || {};
      await celebrate({ id: n.id, amount: d.amount, currency: d.currency });
      list.slice(1).forEach(x => markRead(x.id));      /* une seule célébration, même s'il y avait plusieurs lignes */
      return true;
    } catch(e){ return false; }
  }
  return { check, celebrate };
})();
