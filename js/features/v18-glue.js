'use strict';

/* ============================================================
   V18 GLUE (18.0.0) — relie les nouveaux modules à l'application existante : accueil (film publicitaire + raccourcis), Services, alertes en direct
   (message, crédit, annonce), vue des notifications, démarrage / arrêt du chat, diagnostic. Aucune donnée d'exemple : tout vient du serveur.
   ============================================================ */
Strings.add({
  en: { 'v18.g.grow': 'Grow and get help', 'v18.credit': 'Credit', 'v18.creditD': 'Up to {max} OMR', 'v18.boost': 'Boost', 'v18.boostD': 'Earn every second', 'v18.chat': 'Support chat', 'v18.chatD': 'Deposits and help', 'v18.yaser': 'YASER', 'v18.yaserD': 'Your assistant', 'v18.cinema': 'Discover', 'v18.n.chat': 'New message', 'v18.n.creditOk': 'Credit approved', 'v18.n.creditNo': 'Credit declined', 'v18.n.creditReq': 'Credit request', 'v18.n.ann': 'Announcement', 'v18.quick': 'Quick access' },
  fr: { 'v18.g.grow': 'Gagner et être aidé', 'v18.credit': 'Crédit', 'v18.creditD': 'Jusqu’à {max} OMR', 'v18.boost': 'Boost', 'v18.boostD': 'Gagnez chaque seconde', 'v18.chat': 'Chat assistance', 'v18.chatD': 'Dépôts et aide', 'v18.yaser': 'YASER', 'v18.yaserD': 'Votre assistant', 'v18.cinema': 'Découvrir', 'v18.n.chat': 'Nouveau message', 'v18.n.creditOk': 'Crédit accordé', 'v18.n.creditNo': 'Crédit refusé', 'v18.n.creditReq': 'Demande de crédit', 'v18.n.ann': 'Annonce', 'v18.quick': 'Accès rapide' },
  ar: { 'v18.g.grow': 'اربح واحصل على المساعدة', 'v18.credit': 'الائتمان', 'v18.creditD': 'حتى {max} ر.ع', 'v18.boost': 'بوست', 'v18.boostD': 'اربح كل ثانية', 'v18.chat': 'دردشة الدعم', 'v18.chatD': 'الإيداع والمساعدة', 'v18.yaser': 'ياسر', 'v18.yaserD': 'مساعدك', 'v18.cinema': 'اكتشف', 'v18.n.chat': 'رسالة جديدة', 'v18.n.creditOk': 'تمت الموافقة على الائتمان', 'v18.n.creditNo': 'تم رفض الائتمان', 'v18.n.creditReq': 'طلب ائتمان', 'v18.n.ann': 'إعلان', 'v18.quick': 'وصول سريع' }
});

const V18 = (() => {
  const HANDLED = ['CHAT_MESSAGE', 'CREDIT_DECISION', 'CREDIT_REQUEST', 'ANNOUNCEMENT'];
  const has = k => { try { return typeof window[k] !== 'undefined' || (0, eval)('typeof ' + k) !== 'undefined'; } catch(e){ return false; } };
  const isAdmin = () => !!(Runtime.ctx && Runtime.ctx.role === 'admin');

  /* ----- accueil : film publicitaire + 4 raccourcis ----- */
  function tile(nav, ic, title, sub, badge){
    return '<button type="button" class="v18-q" data-nav="' + nav + '"><i>' + icon(ic, 22) + '</i><b>' + escapeHtml(title) + '</b><small>' + escapeHtml(sub) + '</small>' + (badge ? '<em class="v18-q-b" data-chat-badge>' + badge + '</em>' : (nav === 'chat' ? '<em class="v18-q-b" data-chat-badge hidden></em>' : '')) + '</button>';
  }
  function homeHtml(){
    const cfg = Cfg.get();
    let film = '';
    try { film = (typeof Cinema !== 'undefined' && Cinema.homeHtml) ? Cinema.homeHtml() : ((typeof Promos !== 'undefined') ? Promos.html() : ''); } catch(e){ film = ''; }
    const q = '<section class="v18-quick" aria-label="' + escapeHtml(t('v18.quick')) + '">' +
      tile('invest', 'trend', t('v18.boost'), t('v18.boostD')) +
      tile('credit', 'coins', t('v18.credit'), tf('v18.creditD', { max: Money.int(cfg.credit_max) })) +
      tile('chat', 'chat', t('v18.chat'), t('v18.chatD')) +
      tile('yaser', 'bot', t('v18.yaser'), t('v18.yaserD')) +
    '</section>';
    return film + q;
  }
  Hooks.on('home', root => {
    /* le film est monté par le module cinéma, au repos du navigateur ; le chat (canal temps réel + non lus) démarre un peu après l'affichage de l'accueil */
    try { if (typeof Fx !== 'undefined') Fx.stagger(root, '.v18-q', 70); } catch(e){ /* rien */ }
    setTimeout(() => {
      try { Cfg.load(); } catch(e){ /* rien */ }
      try { if (typeof Chat !== 'undefined' && Chat.start && AuthEngine.hasValidContext()) { Chat.start(); paintBadge(); } } catch(e){ /* rien */ }
    }, 1200);
  });

  /* ----- pastille de messages non lus (accueil, Services) ----- */
  function paintBadge(){
    try {
      const n = (typeof Chat !== 'undefined' && Chat.unread) ? Number(Chat.unread()) || 0 : 0;
      document.querySelectorAll('[data-chat-badge]').forEach(el => { el.textContent = n > 9 ? '9+' : String(n); el.hidden = n <= 0; });
    } catch(e){ /* rien */ }
  }
  try { if (typeof Chat !== 'undefined' && Chat.onUnread) Chat.onUnread(paintBadge); } catch(e){ /* rien */ }

  /* ----- alertes en direct pour les nouveaux types ----- */
  function handles(type){ return HANDLED.indexOf(type) !== -1; }
  function onNotif(n){
    try {
      const d = n.data || {};
      if (n.type === 'CHAT_MESSAGE'){
        const onChat = ['chat', 'admin-chat-thread'].indexOf(R.current()) !== -1;
        if (!onChat) InAppNotif.showCall({ title: t('v18.n.chat'), message: n.message, status: 'default', onClick: () => { try { R.go(isAdmin() && d.from !== 'Sanad Pay' ? 'admin-chat' : 'chat'); } catch(e){ /* rien */ } } });
      } else if (n.type === 'CREDIT_DECISION'){
        const ok = d.status === 'APPROVED';
        InAppNotif.showCall({ title: t(ok ? 'v18.n.creditOk' : 'v18.n.creditNo'), message: ok ? Money.fmt(d.amount, d.currency || 'OMR') : (d.note || ''), status: ok ? 'success' : 'default', onClick: () => { try { R.go('credit'); } catch(e){ /* rien */ } } });
        if (ok && typeof Credit !== 'undefined' && Credit.checkApproved) setTimeout(async () => { try { await AuthEngine.hydrateLive(); await Credit.checkApproved(); } catch(e){ /* rien */ } }, 500);
        else { try { Sfx.play(ok ? 'credit' : 'notify'); if (ok) Fx.confetti(null, { n: 90 }); } catch(e){ /* rien */ } }
      } else if (n.type === 'CREDIT_REQUEST'){
        InAppNotif.showCall({ title: t('v18.n.creditReq'), message: n.message, status: 'default', onClick: () => { try { R.go('admin-credit'); } catch(e){ /* rien */ } } });
        try { Sfx.play('notify'); } catch(e){ /* rien */ }
      } else if (n.type === 'ANNOUNCEMENT'){
        InAppNotif.showCall({ title: n.title || t('v18.n.ann'), message: n.message, status: 'default', onClick: () => { try { if (typeof Cinema !== 'undefined') Cinema.open(0); } catch(e){ /* rien */ } } });
        try { Sfx.play('notify'); if (typeof Cinema !== 'undefined' && Cinema.refresh) Cinema.refresh(); } catch(e){ /* rien */ }
      }
      if (['CREDIT_DECISION', 'CREDIT_REQUEST'].indexOf(n.type) !== -1 && ['credit', 'admin-credit'].indexOf(R.current()) !== -1) R.go(R.current(), { force: true, replace: true });
    } catch(e){ console.warn('v18 notif', e); }
    return true;
  }

  /* ----- fermeture de session : le chat s'arrête ----- */
  try {
    const so = AuthEngine.signOut;
    AuthEngine.signOut = async function(){
      try { const u = Runtime.ctx && Runtime.ctx.uid; if (u) Guardian.store.del('yas_hist_' + u); } catch(e){ /* rien */ }      /* la conversation avec YASER contient des soldes : effacée à la déconnexion */
      try { if (typeof Chat !== 'undefined' && Chat.stop) Chat.stop(); } catch(e){ /* rien */ }
      return so.apply(this, arguments);
    };
  } catch(e){ /* rien */ }

  return { homeHtml, handles, onNotif, paintBadge };
})();

/* vue des notifications (liste, bannière) : textes traduits pour les nouveaux types ; le reste est inchangé */
(function(){
  const base = (typeof notifView === 'function') ? notifView : null;
  window.notifView = function(n){
    try {
      const d = (n && n.data) || {};
      if (n && n.type === 'CHAT_MESSAGE') return { title: t('v18.n.chat'), message: n.message };
      if (n && n.type === 'CREDIT_REQUEST') return { title: t('v18.n.creditReq'), message: n.message };
      if (n && n.type === 'CREDIT_DECISION'){ const ok = d.status === 'APPROVED'; return { title: t(ok ? 'v18.n.creditOk' : 'v18.n.creditNo'), message: ok ? Money.fmt(d.amount, d.currency || 'OMR') : (d.note || n.message) }; }
      if (n && n.type === 'ANNOUNCEMENT') return { title: n.title, message: n.message };
    } catch(e){ /* repli */ }
    return base ? base(n) : { title: n && n.title, message: n && n.message };
  };
})();

/* sons de toucher très doux sur tous les boutons (le son « tap » est presque inaudible, « nav » pour la navigation) ; réglable dans Réglages > Sons */
(function(){
  const SEL = '.btn,.chip,.qs-tile,.yb-svc,.v18-q,.rv-act,.settings-row,.topbar-back,.topbar-action,.px-circ,.rv-circ,.adv>summary,.adv-g>summary';
  const NAV = '.nav-item,.side-item';
  let last = 0;
  document.addEventListener('pointerdown', e => {
    try {
      const t0 = e.target && e.target.closest && e.target.closest(NAV + ',' + SEL); if (!t0) return;
      if (t0.disabled || t0.getAttribute('aria-disabled') === 'true') return;
      const now = Date.now(); if (now - last < 90) return; last = now;
      Sfx.play(t0.matches(NAV) ? 'nav' : 'tap');
    } catch(x){ /* rien */ }
  }, { capture: true, passive: true });
})();
