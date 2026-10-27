'use strict';

/* ============================================================
   CENTRE DE CONTRÔLE (18.0.0) — écrans « admin-hub » et « admin-announce », réservés au rôle admin.
   Masquage d'INTERFACE seulement : la sécurité est dans le serveur (is_admin() dans chaque fonction admin_*, journal d'audit).
   - admin-hub      : résumé en direct (membres, nouveaux, demandes de crédit en attente, capital Boost, messages non lus), tuiles-fonctions animées
                      vers Membres / Chat / Crédit / Boost / Annonces, dépôt rapide, journal d'audit, aperçu des sons, diagnostic.
   - admin-announce : rédiger une annonce (aperçu en direct sous forme de scène du film), la publier à tous (notification + film), l'arrêter.
   - Les écrans « admin », « admin-chat », « admin-credit », « admin-boost » sont dans d'autres modules : ici on ne fait que naviguer.
   ============================================================ */
Strings.add({
  en: {
    'hub.title': 'Control center', 'hub.badge': 'ADMIN', 'hub.ro': 'Visible to administrators only. Every action is logged.', 'hub.live': 'Live', 'hub.hello': 'Welcome back, {n}', 'hub.sub': 'Everything you manage, in one place. Every action is logged.', 'hub.err': 'Could not load. Try again.', 'hub.retry': 'Retry',
    'hub.kMembers': 'Members', 'hub.kToday': 'New today', 'hub.kCredit': 'Credit requests waiting', 'hub.kBoost': 'Boost capital (OMR)',
    'hub.t.members': 'Members', 'hub.d.members': 'Search, details, welcome reward', 'hub.t.chat': 'Messages', 'hub.d.chat': 'Chat with every member', 'hub.t.credit': 'Credit requests', 'hub.d.credit': 'Approve or decline',
    'hub.t.boost': 'Boost and settings', 'hub.d.boost': 'Rate, limits, switches', 'hub.t.announce': 'Announcements', 'hub.d.announce': 'Broadcast to everyone', 'hub.t.deposit': 'Quick deposit', 'hub.d.deposit': 'Credit a member by ID',
    'hub.t.audit': 'Audit log', 'hub.d.audit': 'Latest actions', 'hub.t.sounds': 'Sounds', 'hub.d.sounds': 'Preview the sound bank', 'hub.t.diag': 'Diagnostic', 'hub.d.diag': 'Report for support',
    'hub.dSub': 'Credits the member’s wallet right away. Recorded in the audit log.', 'hub.dId': 'Sanad Pay ID', 'hub.dAmt': 'Amount (OMR)', 'hub.dNote': 'Note (optional)', 'hub.dReview': 'Review', 'hub.dConfirm': 'Credit {a} to {n}?',
    'hub.dGo': 'Credit now', 'hub.dBack': 'Back', 'hub.dDone': 'Deposit completed', 'hub.dRef': 'Reference', 'hub.dClose': 'Done', 'hub.dBadId': 'Enter a valid Sanad Pay ID.', 'hub.dBadAmt': 'Enter an amount above zero.',
    'hub.dNoMember': 'No member with this ID.', 'hub.dChecking': 'Checking…', 'hub.dWorking': 'Crediting…',
    'hub.aEmpty': 'No action yet', 'hub.aSession': 'The server did not return the log. Showing this session only.',
    'hub.a.ADMIN_DEPOSIT': 'Deposit', 'hub.a.CREDIT_APPROVED': 'Credit approved', 'hub.a.CREDIT_REJECTED': 'Credit declined', 'hub.a.CREDIT_REQUEST': 'Credit request', 'hub.a.SETTING': 'Setting changed',
    'hub.a.ANNOUNCEMENT': 'Announcement', 'hub.a.SIGNUP_BONUS': 'Welcome reward', 'hub.a.ADMIN_SET_SIGNUP_BONUS': 'Reward amount',
    'hub.sSub': 'Soft, short sounds. Tap one to preview.', 'hub.s.notify': 'Notification', 'hub.s.money': 'Money received', 'hub.s.newUser': 'New member', 'hub.s.reward': 'Reward', 'hub.s.success': 'Success',
    'hub.s.msgRecv': 'Message received', 'hub.s.msgSend': 'Message sent', 'hub.s.collect': 'Collect earnings', 'hub.s.credit': 'Credit granted', 'hub.s.yaser': 'YASER', 'hub.s.error': 'Error', 'hub.s.tick': 'Tick',
    'hub.copy': 'Copy report',
    'hub.anTitle': 'Announcements', 'hub.anNew': 'New announcement', 'hub.anT': 'Title', 'hub.anB': 'Message', 'hub.anPrev': 'Preview in the film', 'hub.anPublish': 'Publish to everyone', 'hub.anHint': 'Every member gets a notification and the announcement opens the film.',
    'hub.anConfirm': 'Send this to every member as a notification and show it in the film?', 'hub.anSend': 'Send', 'hub.anDone': 'Published to {n} members', 'hub.anList': 'Published', 'hub.anStop': 'Stop', 'hub.anStopped': 'Announcement stopped',
    'hub.anActive': 'Active', 'hub.anOff': 'Stopped', 'hub.anEmpty': 'No announcement yet', 'hub.anBad': 'Add a title and a message.', 'hub.cancel': 'Cancel'
  },
  fr: {
    'hub.title': 'Centre de contrôle', 'hub.badge': 'ADMIN', 'hub.ro': 'Visible par les administrateurs seulement. Chaque action est journalisée.', 'hub.live': 'En direct', 'hub.hello': 'Bon retour, {n}', 'hub.sub': 'Tout ce que vous gérez, au même endroit. Chaque action est journalisée.', 'hub.err': 'Chargement impossible. Réessayez.', 'hub.retry': 'Réessayer',
    'hub.kMembers': 'Membres', 'hub.kToday': 'Nouveaux aujourd’hui', 'hub.kCredit': 'Demandes de crédit en attente', 'hub.kBoost': 'Capital Boost (OMR)',
    'hub.t.members': 'Membres', 'hub.d.members': 'Recherche, fiches, récompense', 'hub.t.chat': 'Messages', 'hub.d.chat': 'Chat avec chaque membre', 'hub.t.credit': 'Demandes de crédit', 'hub.d.credit': 'Accepter ou refuser',
    'hub.t.boost': 'Boost et réglages', 'hub.d.boost': 'Taux, limites, interrupteurs', 'hub.t.announce': 'Annonces', 'hub.d.announce': 'Diffuser à tout le monde', 'hub.t.deposit': 'Dépôt rapide', 'hub.d.deposit': 'Créditer un membre par ID',
    'hub.t.audit': 'Journal d’audit', 'hub.d.audit': 'Dernières actions', 'hub.t.sounds': 'Sons', 'hub.d.sounds': 'Écouter la banque de sons', 'hub.t.diag': 'Diagnostic', 'hub.d.diag': 'Rapport pour l’assistance',
    'hub.dSub': 'Crédite aussitôt le portefeuille du membre. Enregistré dans le journal d’audit.', 'hub.dId': 'ID Sanad Pay', 'hub.dAmt': 'Montant (OMR)', 'hub.dNote': 'Note (facultatif)', 'hub.dReview': 'Vérifier', 'hub.dConfirm': 'Créditer {a} à {n} ?',
    'hub.dGo': 'Créditer maintenant', 'hub.dBack': 'Retour', 'hub.dDone': 'Dépôt effectué', 'hub.dRef': 'Référence', 'hub.dClose': 'Terminé', 'hub.dBadId': 'Saisissez un ID Sanad Pay valide.', 'hub.dBadAmt': 'Saisissez un montant supérieur à zéro.',
    'hub.dNoMember': 'Aucun membre avec cet ID.', 'hub.dChecking': 'Vérification…', 'hub.dWorking': 'Crédit en cours…',
    'hub.aEmpty': 'Aucune action pour l’instant', 'hub.aSession': 'Le serveur n’a pas renvoyé le journal. Affichage de cette session seulement.',
    'hub.a.ADMIN_DEPOSIT': 'Dépôt', 'hub.a.CREDIT_APPROVED': 'Crédit accordé', 'hub.a.CREDIT_REJECTED': 'Crédit refusé', 'hub.a.CREDIT_REQUEST': 'Demande de crédit', 'hub.a.SETTING': 'Réglage modifié',
    'hub.a.ANNOUNCEMENT': 'Annonce', 'hub.a.SIGNUP_BONUS': 'Récompense de bienvenue', 'hub.a.ADMIN_SET_SIGNUP_BONUS': 'Montant de la récompense',
    'hub.sSub': 'Sons doux et courts. Touchez-en un pour l’écouter.', 'hub.s.notify': 'Notification', 'hub.s.money': 'Argent reçu', 'hub.s.newUser': 'Nouveau membre', 'hub.s.reward': 'Récompense', 'hub.s.success': 'Succès',
    'hub.s.msgRecv': 'Message reçu', 'hub.s.msgSend': 'Message envoyé', 'hub.s.collect': 'Récupérer les gains', 'hub.s.credit': 'Crédit accordé', 'hub.s.yaser': 'YASER', 'hub.s.error': 'Erreur', 'hub.s.tick': 'Tic',
    'hub.copy': 'Copier le rapport',
    'hub.anTitle': 'Annonces', 'hub.anNew': 'Nouvelle annonce', 'hub.anT': 'Titre', 'hub.anB': 'Message', 'hub.anPrev': 'Aperçu dans le film', 'hub.anPublish': 'Publier à tout le monde', 'hub.anHint': 'Chaque membre reçoit une notification et l’annonce ouvre le film.',
    'hub.anConfirm': 'Envoyer ceci à chaque membre en notification et l’afficher dans le film ?', 'hub.anSend': 'Envoyer', 'hub.anDone': 'Publié pour {n} membres', 'hub.anList': 'Publiées', 'hub.anStop': 'Arrêter', 'hub.anStopped': 'Annonce arrêtée',
    'hub.anActive': 'Active', 'hub.anOff': 'Arrêtée', 'hub.anEmpty': 'Aucune annonce pour l’instant', 'hub.anBad': 'Ajoutez un titre et un message.', 'hub.cancel': 'Annuler'
  },
  ar: {
    'hub.title': 'مركز التحكم', 'hub.badge': 'مسؤول', 'hub.ro': 'تظهر للمسؤولين فقط. يتم تسجيل كل إجراء.', 'hub.live': 'مباشر', 'hub.hello': 'أهلاً بعودتك، {n}', 'hub.sub': 'كل ما تديره في مكان واحد. يتم تسجيل كل إجراء.', 'hub.err': 'تعذّر التحميل. حاول مجدداً.', 'hub.retry': 'إعادة المحاولة',
    'hub.kMembers': 'الأعضاء', 'hub.kToday': 'جدد اليوم', 'hub.kCredit': 'طلبات ائتمان معلّقة', 'hub.kBoost': 'رأس مال بوست (ر.ع)',
    'hub.t.members': 'الأعضاء', 'hub.d.members': 'بحث وتفاصيل ومكافأة', 'hub.t.chat': 'الرسائل', 'hub.d.chat': 'محادثة مع كل عضو', 'hub.t.credit': 'طلبات الائتمان', 'hub.d.credit': 'قبول أو رفض',
    'hub.t.boost': 'بوست والإعدادات', 'hub.d.boost': 'النسبة والحدود والمفاتيح', 'hub.t.announce': 'الإعلانات', 'hub.d.announce': 'بث للجميع', 'hub.t.deposit': 'إيداع سريع', 'hub.d.deposit': 'أضف رصيداً لعضو بمعرّفه',
    'hub.t.audit': 'سجل التدقيق', 'hub.d.audit': 'آخر الإجراءات', 'hub.t.sounds': 'الأصوات', 'hub.d.sounds': 'استمع إلى مكتبة الأصوات', 'hub.t.diag': 'التشخيص', 'hub.d.diag': 'تقرير للدعم',
    'hub.dSub': 'يُضاف فوراً إلى محفظة العضو. يُسجَّل في سجل التدقيق.', 'hub.dId': 'معرّف سند باي', 'hub.dAmt': 'المبلغ (ر.ع)', 'hub.dNote': 'ملاحظة (اختياري)', 'hub.dReview': 'مراجعة', 'hub.dConfirm': 'إضافة {a} إلى {n}؟',
    'hub.dGo': 'أضف الآن', 'hub.dBack': 'رجوع', 'hub.dDone': 'تم الإيداع', 'hub.dRef': 'المرجع', 'hub.dClose': 'تم', 'hub.dBadId': 'أدخل معرّف سند باي صحيحاً.', 'hub.dBadAmt': 'أدخل مبلغاً أكبر من الصفر.',
    'hub.dNoMember': 'لا يوجد عضو بهذا المعرّف.', 'hub.dChecking': 'جارٍ التحقق…', 'hub.dWorking': 'جارٍ الإضافة…',
    'hub.aEmpty': 'لا توجد إجراءات بعد', 'hub.aSession': 'لم يُرجع الخادم السجل. تُعرض هذه الجلسة فقط.',
    'hub.a.ADMIN_DEPOSIT': 'إيداع', 'hub.a.CREDIT_APPROVED': 'قبول ائتمان', 'hub.a.CREDIT_REJECTED': 'رفض ائتمان', 'hub.a.CREDIT_REQUEST': 'طلب ائتمان', 'hub.a.SETTING': 'تعديل إعداد',
    'hub.a.ANNOUNCEMENT': 'إعلان', 'hub.a.SIGNUP_BONUS': 'مكافأة الترحيب', 'hub.a.ADMIN_SET_SIGNUP_BONUS': 'مبلغ المكافأة',
    'hub.sSub': 'أصوات ناعمة وقصيرة. المس أحدها للاستماع.', 'hub.s.notify': 'إشعار', 'hub.s.money': 'استلام مبلغ', 'hub.s.newUser': 'عضو جديد', 'hub.s.reward': 'مكافأة', 'hub.s.success': 'نجاح',
    'hub.s.msgRecv': 'رسالة واردة', 'hub.s.msgSend': 'رسالة مرسلة', 'hub.s.collect': 'سحب الأرباح', 'hub.s.credit': 'منح ائتمان', 'hub.s.yaser': 'YASER', 'hub.s.error': 'خطأ', 'hub.s.tick': 'نقرة',
    'hub.copy': 'نسخ التقرير',
    'hub.anTitle': 'الإعلانات', 'hub.anNew': 'إعلان جديد', 'hub.anT': 'العنوان', 'hub.anB': 'الرسالة', 'hub.anPrev': 'معاينة في الفيلم', 'hub.anPublish': 'انشر للجميع', 'hub.anHint': 'يصل إشعار لكل عضو ويظهر الإعلان في الفيلم.',
    'hub.anConfirm': 'إرسال هذا إلى كل عضو كإشعار وعرضه في الفيلم؟', 'hub.anSend': 'إرسال', 'hub.anDone': 'تم النشر لـ {n} عضواً', 'hub.anList': 'المنشورة', 'hub.anStop': 'إيقاف', 'hub.anStopped': 'تم إيقاف الإعلان',
    'hub.anActive': 'نشط', 'hub.anOff': 'متوقف', 'hub.anEmpty': 'لا توجد إعلانات بعد', 'hub.anBad': 'أضف عنواناً ورسالة.', 'hub.cancel': 'إلغاء'
  }
});

const AdminHub = (() => {
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const e = (k, v) => { let s = t('hub.' + k); if (v) Object.keys(v).forEach(x => { s = s.replace('{' + x + '}', v[x]); }); return s; };
  const isAdmin = () => !!(typeof Runtime !== 'undefined' && Runtime.ctx && Runtime.ctx.role === 'admin');
  const S = { stats: null, vault: null, chat: 0, log: [], anns: null, stop: null };
  const N = () => Guardian.norm;

  /* icônes : celles de l'application, plus deux dessinées ici */
  const MY = {
    chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.2 3.4a.6.6 0 0 1-1-.47V16A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 9h8M8 12h5"/>',
    mega: '<path d="M4 10v4a1 1 0 0 0 1 1h2.5l6 4V5l-6 4H5a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    vault: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>'
  };
  const ic = (name, size) => MY[name] ? '<svg class="ic" width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + MY[name] + '</svg>' : icon(name, size || 22);

  const top = (title, back) => '<div class="topbar adm-top"><button class="topbar-back" data-action="back" aria-label="' + esc(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button>' +
    '<span class="topbar-title">' + esc(title) + '</span><span class="adm-badge">' + icon('admin', 14) + esc(e('badge')) + '</span></div>';
  const guard = () => { if (!isAdmin()){ setTimeout(() => { try { R.go('home', { reset: true }); } catch(x){ /* rien */ } }, 0); return false; } return true; };
  const errMsg = er => { const k = er && er.key; if (er && /recipient_not_found/i.test(er.message || '')) return e('dNoMember'); return k && k !== 'errors.UNKNOWN_ERROR' ? t(k) : t('errors.UNKNOWN_ERROR'); };
  const note = (kind, detail) => { S.log.unshift({ at: Date.now(), kind, detail }); if (S.log.length > 30) S.log.pop(); };
  const dispName = () => { const p = (Runtime && Runtime.profile) || {}; return (p.firstName || '').trim() || (p.lastName || '').trim() || 'Admin'; };

  /* ---------- données ---------- */
  async function chatUnread(){
    try {
      if (typeof Chat !== 'undefined' && Chat && typeof Chat.unread === 'function'){ const n = await Promise.resolve(Chat.unread()); return N().int(n); }
    } catch(x){ /* repli ci-dessous */ }
    const r = await Guardian.rpc('admin_chat_threads', { p_limit: 100 });
    return r.ok ? N().arr(r.data).reduce((a, x) => a + N().int(x && x.unread_admin), 0) : S.chat;
  }
  async function badges(){
    const [v, c] = await Promise.all([Guardian.rpc('admin_vault_overview', {}), chatUnread()]);
    return { credit: v.ok ? N().int(N().obj(v.data).credit_pending) : (S.vault ? N().int(S.vault.credit_pending) : 0), chat: c };
  }
  async function load(){
    const [st, vo, ch] = await Promise.all([Guardian.rpc('admin_stats', {}), Guardian.rpc('admin_vault_overview', {}), chatUnread()]);
    if (st.ok) S.stats = N().obj(st.data);
    if (vo.ok) S.vault = N().obj(vo.data);
    S.chat = ch; S.err = !(st.ok || vo.ok);
    return S;
  }
  function paint(root){
    if (!root || !root.isConnected) return;
    const set = (k, v) => {
      const b = root.querySelector('.hub-kpi[data-k="' + k + '"] b'); if (!b) return;
      if (v == null){ b.textContent = '—'; return; }
      const from = Number(b.getAttribute('data-v')) || 0; b.setAttribute('data-v', String(v));
      if (from === v && b.textContent !== '—') return;
      Fx.countUp(b, v, { from, ms: 900, dec: 0 });
    };
    const st = S.stats || {}, vo = S.vault || {};
    set('members', S.stats ? N().int(st.users) : null); set('today', S.stats ? N().int(st.users_today) : null);
    set('credit', S.vault ? N().int(vo.credit_pending) : null); set('boost', S.vault ? Math.round(N().num(vo.principal)) : null);
    const bd = (key, n) => { const el = root.querySelector('[data-badge="' + key + '"]'); if (!el) return; const was = el.textContent; el.textContent = n > 99 ? '99+' : String(n); el.hidden = !(n > 0); if (n > 0 && was !== el.textContent){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } };
    bd('chat', S.chat); bd('credit', S.vault ? N().int(vo.credit_pending) : 0);
    const err = root.querySelector('.hub-err'); if (err) err.hidden = !S.err;
  }

  /* ---------- écran admin-hub ---------- */
  const TILES = [
    { k: 'chat', ic: 'chat', route: 'admin-chat', badge: 'chat' }, { k: 'credit', ic: 'cards', route: 'admin-credit', badge: 'credit' },
    { k: 'members', ic: 'users', route: 'admin' }, { k: 'boost', ic: 'vault', route: 'admin-boost' },
    { k: 'announce', ic: 'mega', route: 'admin-announce' }, { k: 'deposit', ic: 'banknote', sheet: 'deposit' },
    { k: 'audit', ic: 'doc', sheet: 'audit' }, { k: 'sounds', ic: 'volume', sheet: 'sounds' }, { k: 'diag', ic: 'chart', sheet: 'diag' }
  ];
  /* 19.0.0 : tuiles de l'espace administrateur 19 (plans, paiements, identités, retraits, utilisateurs, journal, notifications) */
  function allTiles(){
    let extra = []; try { if (typeof Admin19 !== 'undefined' && Admin19.tiles) extra = Admin19.tiles().map(x => ({ k: 'a19:' + x.route, ic: x.icon, route: x.route, titleKey: x.titleKey, subKey: x.subKey, badge: 'a19:' + x.route })); } catch(err){ extra = []; }
    return extra.concat(TILES);
  }
  function kpi(k, label, ico){ return '<div class="hub-kpi" data-k="' + k + '"><i>' + icon(ico, 18) + '</i><b class="ltr" dir="ltr" data-v="0">—</b><span>' + esc(label) + '</span></div>'; }
  function render(){
    if (!guard()) return '';
    return top(e('title')) + '<div class="screen-body adm-body hub-body">' +
      '<div class="hub-hero"><i class="hub-orb"></i><div class="adm-live"><i class="adm-pulse"></i><span>' + esc(e('live')) + '</span></div>' +
        '<h1>' + esc(e('hello', { n: dispName() })) + '</h1><p>' + esc(e('sub')) + '</p></div>' +
      '<div class="hub-err adm-empty" hidden>' + esc(e('err')) + ' <button type="button" class="adm-link" data-hub="reload">' + esc(e('retry')) + '</button></div>' +
      '<div class="hub-kpis">' + kpi('members', e('kMembers'), 'users') + kpi('today', e('kToday'), 'sparkle') + kpi('credit', e('kCredit'), 'cards') + kpi('boost', e('kBoost'), 'trending') + '</div>' +
      '<div class="hub-grid">' + allTiles().map((x, i) => '<button type="button" class="hub-tile" data-hub="' + x.k + '" style="--i:' + i + '"><i class="hub-ic">' + ic(x.ic, 24) + '</i><b>' + esc(x.titleKey ? t(x.titleKey) : e('t.' + x.k)) + '</b><small>' + esc(x.subKey ? t(x.subKey) : e('d.' + x.k)) + '</small>' +
        (x.badge ? '<em class="hub-badge" data-badge="' + x.badge + '" hidden>0</em>' : '') + '</button>').join('') + '</div>' +
      '<p class="adm-foot">' + icon('shield', 14) + '<span>' + esc(e('ro')) + '</span></p><div style="height:calc(40px + var(--safe-b))"></div></div>';
  }

  /* ---------- feuilles ---------- */
  function sheet(html, wire){
    let close = () => {};
    try { close = R.overlay.open('<div class="hub-sheet" dir="' + (document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr') + '">' + html + '</div>', {}); } catch(x){ Guardian.note('hub:sheet', x); return; }
    setTimeout(() => { const roots = document.querySelectorAll('.hub-sheet'); const r = roots[roots.length - 1]; if (r) { try { wire(r, close); } catch(x){ Guardian.note('hub:wire', x); } } }, 80);
  }
  const normId = v => { v = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v.indexOf('LXD') === 0) v = 'YOR' + v.slice(3); if (/^[A-Z0-9]{6}$/.test(v)) v = 'YOR' + v; return /^YOR[A-Z0-9]{6}$/.test(v) ? 'YOR-' + v.slice(3) : ''; };
  const parseAmt = v => { const x = String(v || '').trim().replace(/\s/g, ''); if (!/^\d{1,8}([.,]\d{1,3})?$/.test(x)) return 0; const n = parseFloat(x.replace(',', '.')); return Number.isFinite(n) && n > 0 && n <= 10000000 ? Math.round(n * 1000) / 1000 : 0; };      /* « -50 », « 1e3 », « 5.5.5 » sont refusés (avant : « -50 » devenait 50) */

  function depositSheet(){
    sheet('<h2>' + esc(e('t.deposit')) + '</h2><p class="hub-p">' + esc(e('dSub')) + '</p>' +
      '<div class="hub-step" id="hd-1"><label class="hub-l" for="hd-id">' + esc(e('dId')) + '</label><div class="field-box"><input id="hd-id" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="FP-ABC123" maxlength="14"></div>' +
      '<label class="hub-l" for="hd-amt">' + esc(e('dAmt')) + '</label><div class="field-box"><input id="hd-amt" dir="ltr" inputmode="decimal" autocomplete="off" placeholder="0.000" maxlength="12"></div>' +
      '<div class="hub-chips">' + [10, 50, 100, 500].map(n => '<button type="button" class="chip" data-amt="' + n + '">' + n + '</button>').join('') + '</div>' +
      '<label class="hub-l" for="hd-note">' + esc(e('dNote')) + '</label><div class="field-box"><input id="hd-note" autocomplete="off" maxlength="140"></div>' +
      '<div class="field-err" id="hd-err" role="alert"></div><button type="button" class="btn btn-primary" id="hd-go">' + esc(e('dReview')) + '</button></div><div id="hd-2" hidden></div>', (root, close) => {
      const $ = s => root.querySelector(s), id = $('#hd-id'), amt = $('#hd-amt'), note0 = $('#hd-note'), err = $('#hd-err'), go = $('#hd-go'), s1 = $('#hd-1'), s2 = $('#hd-2');
      let busy = false;
      root.querySelectorAll('[data-amt]').forEach(b => { b.onclick = () => { amt.value = b.getAttribute('data-amt'); try { Sfx.play('tick'); Fx.haptic('tap'); } catch(x){ /* rien */ } }; });
      const bad = m => { err.textContent = m; try { Sfx.play('error'); } catch(x){ /* rien */ } Fx.shake(go); };
      go.onclick = async () => {
        if (busy) return;
        const yid = normId(id.value), a = parseAmt(amt.value);
        if (!yid) return bad(e('dBadId')); if (!(a > 0)) return bad(e('dBadAmt'));
        err.textContent = ''; busy = true; go.disabled = true; go.textContent = e('dChecking');
        const r = await Guardian.rpc('find_user_by_yor_id', { p_yor_id: yid });
        busy = false; go.disabled = false; go.textContent = e('dReview');
        const row = r.ok ? (Array.isArray(r.data) ? r.data[0] : r.data) : null;
        if (!r.ok) return bad(errMsg(r.error));
        if (!row) return bad(e('dNoMember'));
        const nm = N().str(row.display_name || row.name || [row.first_name, row.last_name].filter(Boolean).join(' '), 80) || dispId(yid);
        confirmStep(yid, a, nm, N().str(note0.value, 140));
      };
      function confirmStep(yid, a, nm, nt){
        s1.hidden = true; s2.hidden = false;
        s2.innerHTML = '<div class="hub-conf"><span class="adm-ava big ok">' + esc((nm[0] || '?').toUpperCase()) + '</span><h3>' + esc(e('dConfirm', { a: Money.fmt(a, 'OMR'), n: nm })) + '</h3><small class="ltr" dir="ltr">' + esc(dispId(yid)) + '</small></div>' +
          '<div class="adm-btns"><button type="button" class="btn btn-secondary" id="hd-back">' + esc(e('dBack')) + '</button><button type="button" class="btn btn-primary" id="hd-do">' + esc(e('dGo')) + '</button></div><div class="field-err" id="hd-err2" role="alert"></div>';
        try { Sfx.play('pop'); } catch(x){ /* rien */ }
        s2.querySelector('#hd-back').onclick = () => { s2.hidden = true; s1.hidden = false; };
        const doBtn = s2.querySelector('#hd-do'), idem = uuid();      /* UNE clé par confirmation : si la réponse se perd, un nouvel appui rejoue le même dépôt (jamais un second) */
        doBtn.onclick = async () => {
          if (busy) return; busy = true; doBtn.disabled = true; doBtn.textContent = e('dWorking');
          const r = await Guardian.rpc('admin_deposit', { p_target_yor_id: yid, p_amount: a, p_currency: 'OMR', p_note: nt || null, p_idempotency_key: idem }, { retries: 0, read: false });
          busy = false;
          if (!r.ok || !r.data || r.data.ok === false){ doBtn.disabled = false; doBtn.textContent = e('dGo'); s2.querySelector('#hd-err2').textContent = errMsg(r.error); try { Sfx.play('error'); Fx.haptic('error'); } catch(x){ /* rien */ } return; }
          note('ADMIN_DEPOSIT', Money.fmt(a, 'OMR') + ' · ' + dispId(yid)); done(a, nm, N().str(N().obj(r.data).reference, 40));
        };
      }
      function done(a, nm, ref){
        s2.innerHTML = '<div class="hub-ok"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="hub-ok-c" cx="40" cy="40" r="34" fill="none" stroke="#3a9adf" stroke-width="5"/><path class="hub-ok-p" d="M25 41l11 11 20-23" fill="none" stroke="#3a9adf" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<h3>' + esc(e('dDone')) + '</h3><b class="hub-ok-a ltr" dir="ltr">0.000</b><small>OMR → ' + esc(nm) + '</small>' + (ref ? '<small class="ltr" dir="ltr">' + esc(e('dRef')) + ' · ' + esc(dispId(ref)) + '</small>' : '') + '</div>' +
          '<button type="button" class="btn btn-primary" id="hd-close">' + esc(e('dClose')) + '</button>';
        try { Sfx.play('money'); Fx.haptic('success'); Fx.countUp(s2.querySelector('.hub-ok-a'), a, { dec: 3, ms: 1000 }); Fx.confetti(s2.querySelector('.hub-ok'), { n: 60 }); } catch(x){ /* rien */ }
        s2.querySelector('#hd-close').onclick = () => close();
      }
      id.focus && setTimeout(() => { try { id.focus({ preventScroll: true }); } catch(x){ /* rien */ } }, 120);
    });
  }
  function auditSheet(){
    sheet('<h2>' + esc(e('t.audit')) + '</h2><div class="hub-list" id="au-l"><div class="adm-skel"></div><div class="adm-skel"></div></div>', async root => {
      const box = root.querySelector('#au-l');
      const r = await Guardian.query(() => sb.from('audit_log').select('*').order('created_at', { ascending: false }).limit(40), { retries: 1 });
      const rows = r.ok ? N().arr(r.data) : [];
      const lab = a => { const k = 'hub.a.' + a; const v = t(k); return v === k ? String(a || '').replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) : v; };
      const det = d => { d = N().obj(d); const bits = []; if (d.amount != null) bits.push(Money.fmt(d.amount, d.currency || 'OMR')); if (d.reference) bits.push(dispId(String(d.reference))); if (d.key) bits.push(String(d.key) + (d.value != null ? ' = ' + String(d.value) : '')); return bits.join(' · '); };
      if (rows.length){
        box.innerHTML = rows.map(x => '<div class="hub-row"><i>' + icon('shield', 16) + '</i><span><b>' + esc(lab(x.action)) + '</b><small class="ltr" dir="ltr">' + esc(det(x.details)) + '</small></span><em>' + esc(v18Time(N().time(x.created_at))) + '</em></div>').join('');
      } else if (S.log.length){
        box.innerHTML = '<p class="hub-p">' + esc(e('aSession')) + '</p>' + S.log.map(x => '<div class="hub-row"><i>' + icon('shield', 16) + '</i><span><b>' + esc(lab(x.kind)) + '</b><small class="ltr" dir="ltr">' + esc(x.detail) + '</small></span><em>' + esc(v18Time(x.at)) + '</em></div>').join('');
      } else box.innerHTML = '<div class="adm-empty">' + esc(e('aEmpty')) + '</div>';
    });
  }
  function soundsSheet(){
    const names = ['notify', 'money', 'newUser', 'reward', 'success', 'msgRecv', 'msgSend', 'collect', 'credit', 'yaser', 'error', 'tick'];
    sheet('<h2>' + esc(e('t.sounds')) + '</h2><p class="hub-p">' + esc(e('sSub')) + '</p><div class="hub-snd">' + names.map(n => '<button type="button" class="hub-sb" data-snd="' + n + '">' + icon('volume', 16) + '<span>' + esc(e('s.' + n)) + '</span></button>').join('') + '</div>', root => {
      root.querySelectorAll('[data-snd]').forEach(b => { b.onclick = () => { try { Sfx.unlock(); Sfx.play(b.getAttribute('data-snd')); Fx.haptic('tap'); } catch(x){ /* rien */ } b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }; });
    });
  }
  function diagSheet(){
    const rep = (() => { try { return Guardian.report(); } catch(x){ return String(x); } })();
    sheet('<h2>' + esc(t('g.diag')) + '</h2><p class="hub-p">' + esc(t('g.diagD')) + '</p><pre class="hub-pre ltr" dir="ltr">' + esc(rep) + '</pre><button type="button" class="btn btn-primary" id="dg-copy">' + esc(e('copy')) + '</button>', root => {
      root.querySelector('#dg-copy').onclick = async () => {
        let ok = false; try { await navigator.clipboard.writeText(rep); ok = true; } catch(x){ try { const ta = document.createElement('textarea'); ta.value = rep; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch(y){ ok = false; } }
        if (ok){ try { toast(t('g.diagOk'), 'success'); Sfx.play('success'); } catch(x){ /* rien */ } } else { try { toast(t('errors.UNKNOWN_ERROR'), 'error'); } catch(x){ /* rien */ } }
      };
    });
  }
  function openSheet(k){ ({ deposit: depositSheet, audit: auditSheet, sounds: soundsSheet, diag: diagSheet })[k](); }

  /* ---------- câblage admin-hub ---------- */
  function wireHub(root){
    if (!root) return;
    const reload = async () => { await load(); paint(root); };
    paint(root); reload();
    const stop = Guardian.every(reload, 20000);
    S.stop = stop; try { R.onLeave(stop); } catch(x){ /* rien */ }
    const body = root.querySelector('.hub-body') || root;      /* le conteneur est recréé à chaque affichage : pas d'écouteur en double */
    body.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-hub]'); if (!b) return;
      const k = b.getAttribute('data-hub');
      try { Sfx.play('nav'); Fx.haptic('tap'); } catch(x){ /* rien */ }
      if (k === 'reload'){ reload(); return; }
      const tile = allTiles().find(x => x.k === k); if (!tile) return;
      Fx.pulse(b);
      if (tile.sheet){ openSheet(tile.sheet); return; }
      try { R.go(tile.route); } catch(x){ Guardian.note('hub:go', x); }
    });
  }

  /* ---------- écran admin-announce ---------- */
  function renderAnnounce(){
    if (!guard()) return '';
    return top(e('anTitle')) + '<div class="screen-body adm-body hub-body">' +
      '<div class="adm-card hub-compose"><h2 class="hub-h">' + esc(e('anNew')) + '</h2>' +
        '<label class="hub-l" for="an-t">' + esc(e('anT')) + '</label><div class="field-box"><input id="an-t" maxlength="80" autocomplete="off"></div><div class="hub-cnt"><span id="an-tc">0/80</span></div>' +
        '<label class="hub-l" for="an-b">' + esc(e('anB')) + '</label><div class="field-box hub-ta"><textarea id="an-b" rows="4" maxlength="240"></textarea></div><div class="hub-cnt"><span id="an-bc">0/240</span></div>' +
        '<div class="hub-l">' + esc(e('anPrev')) + '</div><div class="hub-prev" id="an-prev"></div>' +
        '<div class="field-err" id="an-err" role="alert"></div><button type="button" class="btn btn-primary" id="an-go" disabled>' + icon('send', 18) + '<span>' + esc(e('anPublish')) + '</span></button>' +
        '<p class="adm-foot">' + icon('info', 14) + '<span>' + esc(e('anHint')) + '</span></p></div>' +
      '<div class="adm-sec"><h2>' + esc(e('anList')) + '</h2></div><div class="adm-list" id="an-list"><div class="adm-skel"></div><div class="adm-skel"></div></div><div style="height:calc(40px + var(--safe-b))"></div></div>';
  }
  async function loadAnns(){
    const r = await Guardian.query(() => sb.from('announcements').select('*').order('created_at', { ascending: false }).limit(20), { retries: 1 });
    S.anns = r.ok ? N().arr(r.data).map(a => ({ id: N().id(a.id), title: N().str(a.title, 80), body: N().str(a.body, 240), active: !!a.active, at: N().time(a.created_at) })) : (S.anns || []);
    return r.ok;
  }
  function paintAnns(root){
    const box = root.querySelector('#an-list'); if (!box) return;
    if (!S.anns || !S.anns.length){ box.innerHTML = '<div class="adm-empty">' + esc(e('anEmpty')) + '</div>'; return; }
    box.innerHTML = S.anns.map(a => '<div class="hub-ann' + (a.active ? '' : ' off') + '"><span class="hub-ann-b"><b>' + esc(a.title) + '</b><small>' + esc(a.body) + '</small><em>' + esc(v18Time(a.at)) + ' · ' + esc(e(a.active ? 'anActive' : 'anOff')) + '</em></span>' +
      (a.active ? '<button type="button" class="hub-stop" data-stop="' + esc(a.id) + '">' + esc(e('anStop')) + '</button>' : '') + '</div>').join('');
  }
  function wireAnnounce(root){
    if (!root) return;
    const $ = s => root.querySelector(s), ti = $('#an-t'), bo = $('#an-b'), go = $('#an-go'), err = $('#an-err'), prev = $('#an-prev');
    let busy = false, pt = 0;
    const clean = () => ({ t: ti.value.trim().slice(0, 80), b: bo.value.trim().slice(0, 240) });
    const upd = () => {
      $('#an-tc').textContent = ti.value.length + '/80'; $('#an-bc').textContent = bo.value.length + '/240';
      const c = clean(); go.disabled = !(c.t && c.b) || busy; clearTimeout(pt);
      pt = setTimeout(() => { prev.innerHTML = Cinema.previewHtml(c.t || '…', c.b || ''); }, 260);
    };
    ti.addEventListener('input', upd); bo.addEventListener('input', upd);
    prev.innerHTML = Cinema.previewHtml('…', '');
    loadAnns().then(() => paintAnns(root));
    (root.querySelector('.hub-body') || root).addEventListener('click', async ev => {
      const sb0 = ev.target.closest && ev.target.closest('[data-stop]');
      if (sb0){
        const id = sb0.getAttribute('data-stop'); sb0.disabled = true;
        const r = await Guardian.rpc('admin_announcement_stop', { p_id: id }, { retries: 0, read: false });
        if (r.ok){ note('ANNOUNCEMENT', e('anStopped')); try { Sfx.play('tap'); toast(e('anStopped'), 'success'); } catch(x){ /* rien */ } await loadAnns(); paintAnns(root); try { Cinema.refresh(); } catch(x){ /* rien */ } }
        else { sb0.disabled = false; try { toast(errMsg(r.error), 'error'); Sfx.play('error'); } catch(x){ /* rien */ } }
        return;
      }
      if (!ev.target.closest('#an-go')) return;
      const c = clean(); if (!c.t || !c.b){ err.textContent = e('anBad'); Fx.shake(go); return; }
      err.textContent = '';
      sheet('<h2>' + esc(e('anNew')) + '</h2><p class="hub-p">' + esc(e('anConfirm')) + '</p><div class="adm-btns"><button type="button" class="btn btn-secondary" id="ac-no">' + esc(e('cancel')) + '</button><button type="button" class="btn btn-primary" id="ac-yes">' + esc(e('anSend')) + '</button></div><div class="field-err" id="ac-err" role="alert"></div>', (sr, close) => {
        sr.querySelector('#ac-no').onclick = () => close();
        const yes = sr.querySelector('#ac-yes');
        yes.onclick = async () => {
          if (busy) return; busy = true; yes.disabled = true;
          const r = await Guardian.rpc('admin_announce', { p_title: c.t, p_body: c.b }, { retries: 0, read: false });
          busy = false;
          if (!r.ok || !r.data || r.data.ok === false){ yes.disabled = false; sr.querySelector('#ac-err').textContent = errMsg(r.error); try { Sfx.play('error'); Fx.haptic('error'); } catch(x){ /* rien */ } return; }
          const n = N().int(N().obj(r.data).recipients);
          note('ANNOUNCEMENT', c.t); close();
          try { Sfx.play('reward'); Fx.haptic('success'); Fx.confetti(go, { n: 80 }); toast(e('anDone', { n }), 'success'); } catch(x){ /* rien */ }
          ti.value = ''; bo.value = ''; upd(); await loadAnns(); paintAnns(root); try { Cinema.refresh(); } catch(x){ /* rien */ }
        };
      });
    });
    try { R.onLeave(() => clearTimeout(pt)); } catch(x){ /* rien */ }
  }

  R.register({ 'admin-hub': render, 'admin-announce': renderAnnounce });
  R.meta({ 'admin-hub': { parent: 'services', nav: 'services', admin: true }, 'admin-announce': { parent: 'admin-hub', nav: 'services', admin: true } });
  Hooks.on('admin-hub', wireHub);
  Hooks.on('admin-announce', wireAnnounce);
  return { open: () => R.go('admin-hub'), badges, render, renderAnnounce };
})();
