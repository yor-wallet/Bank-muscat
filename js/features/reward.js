'use strict';

/* ============================================================
   REWARD (16.0.0) — récompense de bienvenue : 10 OMR offerts à chaque nouveau compte confirmé.
   - Le montant est crédité PAR LE SERVEUR (fonction _grant_signup_bonus : une seule fois par compte, journal d'audit, notification « REWARD »).
     Ce fichier ne crédite jamais rien : il ne fait que CÉLÉBRER ce que le serveur a réellement écrit (notification REWARD non lue).
   - `Reward.check()` : à l'ouverture de l'accueil, s'il existe une notification REWARD non lue → célébration plein écran (avis sobre : logo, montant, texte),
     puis la notification est marquée lue (une seule célébration par récompense, même sur un autre appareil).
   - `Reward.celebrate({ amount, currency, id })` : l'écran lui-même (aussi utilisé en direct à l'arrivée de la notification en temps réel).
   ============================================================ */
const Reward = (() => {
  const SEEN = 'fp_rw_seen';
  const seenList = () => { try { return JSON.parse(localStorage.getItem(SEEN) || '[]'); } catch(e){ return []; } };
  const markLocal = id => { try { const l = seenList(); if (id && l.indexOf(id) === -1){ l.push(id); localStorage.setItem(SEEN, JSON.stringify(l.slice(-20))); } } catch(e){ /* rien */ } };
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  let open = null;

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
    /* 21.3.0 : avis de crédit sobre — logo, montant exact, texte, bouton. Plus de confettis, de pièce, d'ondes ni de compteur. */
    el.innerHTML = '<div class="rwd-medal" aria-hidden="true"><span class="rwd-coin">' + logoMark(64) + '</span></div>' +
      '<div class="rwd-k">' + escapeHtml(t('lx.rw.k')) + '</div>' +
      '<div class="rwd-amt" dir="ltr"><b id="rwd-n">' + escapeHtml(amount % 1 !== 0 ? amount.toFixed(2) : String(amount)) + '</b><span>' + escapeHtml(cur) + '</span></div>' +
      '<p class="rwd-p">' + escapeHtml(t('lx.rw.p')) + '</p>' +
      '<div class="rwd-sub">' + escapeHtml(approx ? approx + ' · ' + t('lx.rw.sub') : t('lx.rw.sub')) + '</div>' +
      '<button type="button" class="btn btn-primary rwd-go" id="rwd-go">' + escapeHtml(t('lx.rw.go')) + '</button>';
    document.body.appendChild(el);
    const prev = document.activeElement;
    let closed = false, resolve;
    const done = new Promise(r => { resolve = r; });
    requestAnimationFrame(() => el.classList.add('is-in'));
    try { Sfx.play('success'); } catch(e){ /* rien */ }
    try { if (navigator.vibrate && !(Runtime.settings && Runtime.settings.vibration === false)) navigator.vibrate(14); } catch(e){ /* rien */ }
    function close(){
      if (closed) return; closed = true; open = null;
      markLocal(o.id); markRead(o.id);
      el.classList.add('is-out');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { try { el.remove(); } catch(e){ /* rien */ } try { prev && prev.focus && prev.focus({ preventScroll: true }); } catch(e){ /* rien */ } resolve(true); }, 360);
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
