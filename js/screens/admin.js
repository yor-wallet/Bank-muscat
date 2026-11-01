'use strict';

/* ============================================================
   CONSOLE ADMIN (16.0.0) — écran RÉSERVÉ au rôle admin, volontairement SÉPARÉ des réglages d'un utilisateur et d'un autre aspect
   (bleu nuit + or, bandeau « ADMIN », chiffres à chasse fixe) : on ne peut jamais la confondre avec les réglages normaux.
   - Masquage d'INTERFACE seulement : la sécurité est côté serveur (is_admin() dans chaque fonction admin_*, journal d'audit).
   - Contenu : indicateurs (admin_stats), nouveaux membres en direct avec numéro COMPLET (admin_recent_users), recherche (admin_search_users),
     fiche d'un membre (admin_user_overview) avec dépôt (admin_deposit), montant de la récompense de bienvenue (admin_set_signup_bonus), aperçus des sons.
   - En direct : une notification NEW_USER (écrite par le serveur à chaque inscription) rafraîchit l'écran et joue le son « nouveau membre ».
   ============================================================ */
const Admin = (() => {
  const E = {
    en: {
      title: 'Admin console', badge: 'ADMIN', live: 'Live — new members appear here instantly', ro: 'Visible to administrators only. Every action is logged.',
      kUsers: 'Members', kToday: 'New today', k7: 'Last 7 days', kNoPhone: 'Missing phone', kBonus: 'Rewards paid', kIntl: 'International in progress',
      recent: 'New members', search: 'Search a member (name, phone, e-mail, ID)', noRes: 'No member found', confirmed: 'Confirmed', pending: 'Not confirmed yet', noPhone: 'No phone', ago: 'just now',
      reward: 'Welcome reward', rewardD: 'Credited once to every new confirmed account (same phone number: once).', save: 'Save', off: 'Turn off', saved: 'Saved', amount: 'Amount (OMR)',
      alerts: 'Sounds and previews', playNew: 'New-member sound', playReward: 'Reward screen', playMoney: 'Money sound', openN: 'Notifications',
      member: 'Member', id: 'Barq ID', email: 'E-mail', phone: 'Phone', country: 'Country', since: 'Member since', status: 'Status', role: 'Role', accounts: 'Accounts', activity: 'Latest activity', none: 'Nothing yet',
      deposit: 'Add money', depositD: 'Credits the member’s wallet. Recorded in the audit log.', depAmt: 'Amount', depCur: 'Currency', depNote: 'Note (optional)', depGo: 'Credit', depDone: 'Credited', depConfirm: 'Credit {a} to {n}?',
      copy: 'Copy', copied: 'Copied', call: 'Call', err: 'Could not load. Try again.', retry: 'Retry', refresh: 'Refresh', forbidden: 'Administrators only.',
    },
    fr: {
      title: 'Console admin', badge: 'ADMIN', live: 'En direct — les nouveaux membres apparaissent ici tout de suite', ro: 'Visible par les administrateurs seulement. Chaque action est journalisée.',
      kUsers: 'Membres', kToday: 'Nouveaux aujourd’hui', k7: '7 derniers jours', kNoPhone: 'Sans téléphone', kBonus: 'Récompenses versées', kIntl: 'International en cours',
      recent: 'Nouveaux membres', search: 'Chercher un membre (nom, téléphone, e-mail, ID)', noRes: 'Aucun membre trouvé', confirmed: 'Confirmé', pending: 'Pas encore confirmé', noPhone: 'Sans téléphone', ago: 'à l’instant',
      reward: 'Récompense de bienvenue', rewardD: 'Créditée une fois à chaque nouveau compte confirmé (même numéro de téléphone : une fois).', save: 'Enregistrer', off: 'Désactiver', saved: 'Enregistré', amount: 'Montant (OMR)',
      alerts: 'Sons et aperçus', playNew: 'Son « nouveau membre »', playReward: 'Écran de récompense', playMoney: 'Son « argent reçu »', openN: 'Notifications',
      member: 'Membre', id: 'ID Barq', email: 'E-mail', phone: 'Téléphone', country: 'Pays', since: 'Membre depuis', status: 'Statut', role: 'Rôle', accounts: 'Comptes', activity: 'Dernière activité', none: 'Rien pour l’instant',
      deposit: 'Ajouter de l’argent', depositD: 'Crédite le portefeuille du membre. Enregistré dans le journal d’audit.', depAmt: 'Montant', depCur: 'Devise', depNote: 'Note (facultatif)', depGo: 'Créditer', depDone: 'Crédité', depConfirm: 'Créditer {a} à {n} ?',
      copy: 'Copier', copied: 'Copié', call: 'Appeler', err: 'Chargement impossible. Réessayez.', retry: 'Réessayer', refresh: 'Actualiser', forbidden: 'Réservé aux administrateurs.',
    },
    ar: {
      title: 'لوحة الإدارة', badge: 'مسؤول', live: 'مباشر — يظهر الأعضاء الجدد هنا فوراً', ro: 'تظهر للمسؤولين فقط. يتم تسجيل كل إجراء.',
      kUsers: 'الأعضاء', kToday: 'جدد اليوم', k7: 'آخر 7 أيام', kNoPhone: 'بدون هاتف', kBonus: 'المكافآت المدفوعة', kIntl: 'دولي قيد التنفيذ',
      recent: 'الأعضاء الجدد', search: 'ابحث عن عضو (الاسم، الهاتف، البريد، المعرّف)', noRes: 'لا يوجد عضو مطابق', confirmed: 'مؤكد', pending: 'غير مؤكد بعد', noPhone: 'بدون هاتف', ago: 'الآن',
      reward: 'مكافأة الترحيب', rewardD: 'تُضاف مرة واحدة لكل حساب جديد مؤكد (الرقم نفسه: مرة واحدة).', save: 'حفظ', off: 'إيقاف', saved: 'تم الحفظ', amount: 'المبلغ (ر.ع)',
      alerts: 'الأصوات والمعاينات', playNew: 'صوت عضو جديد', playReward: 'شاشة المكافأة', playMoney: 'صوت استلام مبلغ', openN: 'الإشعارات',
      member: 'العضو', id: 'معرّف برق', email: 'البريد الإلكتروني', phone: 'الهاتف', country: 'الدولة', since: 'عضو منذ', status: 'الحالة', role: 'الدور', accounts: 'الحسابات', activity: 'آخر نشاط', none: 'لا شيء بعد',
      deposit: 'إضافة مبلغ', depositD: 'يُضاف إلى محفظة العضو. يُسجَّل في سجل التدقيق.', depAmt: 'المبلغ', depCur: 'العملة', depNote: 'ملاحظة (اختياري)', depGo: 'إضافة', depDone: 'تمت الإضافة', depConfirm: 'إضافة {a} إلى {n}؟',
      copy: 'نسخ', copied: 'تم النسخ', call: 'اتصال', err: 'تعذّر التحميل. حاول مجدداً.', retry: 'إعادة المحاولة', refresh: 'تحديث', forbidden: 'للمسؤولين فقط.',
    },
  };
  const e = k => (E[LANG] && E[LANG][k]) || E.en[k] || k;
  const ef = (k, v) => e(k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));
  const S = { stats: null, users: [], seen: null, q: '', results: null, sel: null, detail: null, loading: false, error: false, timer: 0 };
  const isAdmin = () => !!(Runtime.ctx && Runtime.ctx.role === 'admin');
  const flag = iso => (iso && /^[A-Z]{2}$/.test(iso) ? iso : '');   /* 18.0.0 : plus d'emoji-drapeau : le code pays en texte */
  const cname = iso => { try { return new Intl.DisplayNames([LANG], { type: 'region' }).of(iso) || iso; } catch(err){ return iso; } };
  const fullName = u => ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || dispId(u.yor_id);
  const ini = u => (((u.first_name || u.yor_id || '?')[0] || '?') + ((u.last_name || '')[0] || '')).toUpperCase();
  function ago(ts){
    const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 45) return e('ago');
    try {
      const rtf = new Intl.RelativeTimeFormat(LANG, { numeric: 'auto' });
      if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute');
      if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
      return rtf.format(-Math.round(s / 86400), 'day');
    } catch(err){ return new Date(ts).toLocaleString(); }
  }
  const num = n => { try { return new Intl.NumberFormat(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG).format(Number(n) || 0); } catch(err){ return String(n); } };

  /* ---------- données ---------- */
  async function load(){
    S.loading = true; S.error = false; S.lastTry = Date.now();
    try {
      const [st, us] = await Promise.all([sb.rpc('admin_stats'), sb.rpc('admin_recent_users', { p_limit: 20 })]);
      if (st.error || us.error) throw (st.error || us.error);
      const prev = S.seen; S.stats = st.data || {}; S.users = us.data || [];
      S.seen = new Set(S.users.map(u => u.yor_id));
      S.fresh = prev ? S.users.filter(u => !prev.has(u.yor_id)).map(u => u.yor_id) : [];
    } catch(err){ console.error('admin load', err); S.error = true; }
    S.loading = false;
  }

  /* ---------- gabarits ---------- */
  const top = title => '<div class="topbar adm-top"><button class="topbar-back" data-action="back" aria-label="' + escapeHtml(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button>' +
    '<span class="topbar-title">' + escapeHtml(title) + '</span><span class="adm-badge">' + icon('admin', 14) + escapeHtml(e('badge')) + '</span></div>';
  const kpi = (id, label, v, ic) => '<div class="adm-kpi" data-k="' + id + '"><i>' + icon(ic, 18) + '</i><b class="ltr" dir="ltr" data-v="' + (v == null ? '' : v) + '">' + (v == null ? '—' : escapeHtml(num(v))) + '</b><span>' + escapeHtml(label) + '</span></div>';
  function userRow(u, fresh){
    const ph = u.phone && /^\+\d{8,15}$/.test(u.phone) ? formatPhoneIntl(u.phone) : '';
    return '<button type="button" class="adm-row' + (fresh ? ' fresh' : '') + '" data-ad="open" data-id="' + escapeHtml(u.yor_id) + '">' +
      '<span class="adm-ava' + (u.email_confirmed ? ' ok' : '') + '">' + escapeHtml(ini(u)) + '</span>' +
      '<span class="adm-row-b"><b>' + escapeHtml(fullName(u)) + (u.role === 'admin' ? ' <i class="adm-role">' + escapeHtml(e('badge')) + '</i>' : '') + '</b>' +
      '<small class="ltr" dir="ltr">' + (ph ? escapeHtml(ph) : '<em>' + escapeHtml(e('noPhone')) + '</em>') + '</small>' +
      '<small>' + (u.country ? flag(u.country) + ' ' + escapeHtml(cname(u.country)) + ' · ' : '') + escapeHtml(ago(u.created_at)) + '</small></span>' +
      '<span class="adm-st ' + (u.email_confirmed ? 'ok' : 'wait') + '">' + escapeHtml(u.email_confirmed ? e('confirmed') : e('pending')) + '</span></button>';
  }
  const usersHtml = (list, freshIds) => list.length ? list.map(u => userRow(u, freshIds && freshIds.indexOf(u.yor_id) >= 0)).join('') : '<div class="adm-empty">' + escapeHtml(e('noRes')) + '</div>';

  function render(){
    if (!isAdmin()){ setTimeout(() => R.go('home', { reset: true }), 0); return ''; }
    const st = S.stats || {};
    return top(e('title')) + '<div class="screen-body adm-body">' +
      '<div class="adm-live"><i class="adm-pulse"></i><span>' + escapeHtml(e('live')) + '</span><button type="button" class="adm-ref" data-ad="refresh" aria-label="' + escapeHtml(e('refresh')) + '">' + icon('refresh', 16) + '</button></div>' +
      '<div class="adm-kpis" id="adm-kpis">' + kpi('users', e('kUsers'), st.users, 'users') + kpi('today', e('kToday'), st.users_today, 'sparkle') + kpi('d7', e('k7'), st.users_7d, 'cal') +
        kpi('nophone', e('kNoPhone'), st.no_phone, 'mobile') + kpi('bonus', e('kBonus'), st.bonus_paid_omr != null ? Number(st.bonus_paid_omr) : null, 'gift') + kpi('intl', e('kIntl'), st.intl_open, 'globe') + '</div>' +
      '<div class="adm-sec"><h2>' + escapeHtml(e('recent')) + '</h2></div>' +
      '<div class="field-box adm-search">' + icon('search', 16) + '<input type="search" id="adm-q" autocomplete="off" placeholder="' + escapeHtml(e('search')) + '" value="' + escapeHtml(S.q) + '"></div>' +
      '<div class="adm-list" id="adm-list">' + (S.error ? '<div class="adm-empty">' + escapeHtml(e('err')) + ' <button type="button" class="adm-link" data-ad="refresh">' + escapeHtml(e('retry')) + '</button></div>' : S.stats ? usersHtml(S.results || S.users, S.results ? null : S.fresh) : '<div class="adm-skel"></div><div class="adm-skel"></div><div class="adm-skel"></div>') + '</div>' +
      '<div class="adm-sec"><h2>' + escapeHtml(e('reward')) + '</h2></div>' +
      '<div class="adm-card"><p>' + escapeHtml(e('rewardD')) + '</p><div class="adm-bonus"><label for="adm-bonus">' + escapeHtml(e('amount')) + '</label>' +
        '<div class="adm-step"><button type="button" data-ad="bminus" aria-label="−">−</button><input type="text" id="adm-bonus" inputmode="decimal" dir="ltr" value="' + escapeHtml(st.bonus_amount_omr != null ? String(st.bonus_amount_omr) : '10') + '"><button type="button" data-ad="bplus" aria-label="+">+</button></div></div>' +
        '<div class="adm-btns"><button type="button" class="btn btn-primary" data-ad="bsave">' + escapeHtml(e('save')) + '</button><button type="button" class="btn btn-secondary" data-ad="boff">' + escapeHtml(e('off')) + '</button></div></div>' +
      '<div class="adm-sec"><h2>' + escapeHtml(e('alerts')) + '</h2></div>' +
      '<div class="adm-card adm-prev"><button type="button" class="adm-pv" data-ad="p-new">' + icon('users', 18) + '<span>' + escapeHtml(e('playNew')) + '</span></button><button type="button" class="adm-pv" data-ad="p-reward">' + icon('gift', 18) + '<span>' + escapeHtml(e('playReward')) + '</span></button>' +
        '<button type="button" class="adm-pv" data-ad="p-money">' + icon('banknote', 18) + '<span>' + escapeHtml(e('playMoney')) + '</span></button><button type="button" class="adm-pv" data-nav="notifications">' + icon('bell', 18) + '<span>' + escapeHtml(e('openN')) + '</span></button></div>' +
      '<p class="adm-foot">' + icon('shield', 14) + '<span>' + escapeHtml(e('ro')) + '</span></p><div style="height:calc(40px + var(--safe-b))"></div></div>';
  }

  /* ---------- fiche d'un membre ---------- */
  async function loadDetail(){
    S.detail = null;
    try {
      const r = await sb.rpc('admin_user_overview', { p_yor_id: S.sel });
      if (r.error) throw r.error; S.detail = r.data;
    } catch(err){ console.error('admin detail', err); S.detail = { error: true }; }
  }
  function renderUser(){
    if (!isAdmin() || !S.sel){ setTimeout(() => R.go('admin'), 0); return ''; }
    const d = S.detail;
    let body;
    if (!d) body = '<div class="adm-skel"></div><div class="adm-skel"></div><div class="adm-skel"></div>';
    else if (d.error) body = '<div class="adm-empty">' + escapeHtml(e('err')) + ' <button type="button" class="adm-link" data-ad="reload">' + escapeHtml(e('retry')) + '</button></div>';
    else {
      const p = d.profile || {}, line = (k, v, ltr, copy) => '<div class="adm-kv"><span>' + escapeHtml(k) + '</span><b' + (ltr ? ' class="ltr" dir="ltr"' : '') + '>' + escapeHtml(v || '—') + '</b>' + (copy && v ? '<button type="button" class="adm-cp" data-ad="copy" data-v="' + escapeHtml(v) + '" aria-label="' + escapeHtml(e('copy')) + '">' + icon('copy', 15) + '</button>' : '') + '</div>';
      const ph = p.phone && /^\+\d{8,15}$/.test(p.phone) ? formatPhoneIntl(p.phone) : '';
      body = '<div class="adm-who"><span class="adm-ava big ok">' + escapeHtml(ini({ first_name: p.first_name, last_name: p.last_name, yor_id: p.yor_id })) + '</span><div><b>' + escapeHtml(fullName(p)) + '</b><small class="ltr" dir="ltr">' + escapeHtml(dispId(p.yor_id)) + '</small></div></div>' +
        '<div class="adm-card">' + line(e('phone'), ph, true, true) + line(e('email'), p.email, true, true) + line(e('country'), p.country ? flag(p.country) + ' ' + cname(p.country) : '') + line(e('since'), p.created_at ? new Date(p.created_at).toLocaleString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG) : '') + line(e('status'), p.status) + line(e('role'), p.role) + '</div>' +
        (ph ? '<a class="btn btn-secondary adm-call" href="tel:' + escapeHtml(p.phone) + '">' + icon('mobile', 18) + '<span>' + escapeHtml(e('call')) + '</span></a>' : '') +
        '<div class="adm-sec"><h2>' + escapeHtml(e('accounts')) + '</h2></div><div class="adm-card">' + ((d.accounts || []).length ? d.accounts.map(a => '<div class="adm-kv"><span>' + escapeHtml(a.name || a.type) + '</span><b class="ltr" dir="ltr">' + escapeHtml(CurrencyEngine.format(Number(a.balance), a.currency)) + '</b></div>').join('') : '<div class="adm-empty">' + escapeHtml(e('none')) + '</div>') + '</div>' +
        '<div class="adm-sec"><h2>' + escapeHtml(e('deposit')) + '</h2></div><div class="adm-card"><p>' + escapeHtml(e('depositD')) + '</p>' +
          '<div class="adm-dep"><div class="field-box"><input type="text" id="adm-dep-a" inputmode="decimal" dir="ltr" placeholder="' + escapeHtml(e('depAmt')) + '"></div><select id="adm-dep-c" class="adm-sel" aria-label="' + escapeHtml(e('depCur')) + '">' + ['OMR', 'USD', 'AED', 'SAR', 'XOF'].map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
          '<div class="field-box"><input type="text" id="adm-dep-n" maxlength="140" placeholder="' + escapeHtml(e('depNote')) + '"></div><div class="field-err" id="adm-dep-err" role="alert"></div>' +
          '<button type="button" class="btn btn-primary" data-ad="deposit">' + escapeHtml(e('depGo')) + '</button></div>' +
        '<div class="adm-sec"><h2>' + escapeHtml(e('activity')) + '</h2></div><div class="adm-card adm-tx">' + ((d.transactions || []).length ? d.transactions.slice(0, 12).map(x => '<div class="adm-kv"><span>' + escapeHtml((x.kind || '').replace(/_/g, ' ').toLowerCase()) + ' · ' + escapeHtml(ago(x.created_at)) + '</span><b class="ltr" dir="ltr">' + escapeHtml(CurrencyEngine.format(Number(x.amount), x.asset)) + '</b></div>').join('') : '<div class="adm-empty">' + escapeHtml(e('none')) + '</div>') + '</div>';
    }
    return top(e('member')) + '<div class="screen-body adm-body">' + body + '<div style="height:calc(40px + var(--safe-b))"></div></div>';
  }

  /* ---------- câblage ---------- */
  function countUp(root){
    root.querySelectorAll('.adm-kpi b[data-v]').forEach(b => {
      const v = Number(b.getAttribute('data-v')); if (!isFinite(v) || b.getAttribute('data-v') === '') return;
      const t0 = performance.now(), D = 700, frac = v % 1 !== 0;
      (function tick(now){ const k = Math.min(1, (now - t0) / D), x = v * (1 - Math.pow(1 - k, 3)); b.textContent = num(frac ? Math.round(x * 100) / 100 : Math.round(x)); if (k < 1) requestAnimationFrame(tick); })(t0);
    });
  }
  async function refresh(root, quiet){
    await load();
    if (R.current() !== 'admin') return;
    const fresh = S.fresh && S.fresh.length;
    R.go('admin', { force: true, replace: true });
    if (fresh && quiet){ try { Sfx.play('newUser'); } catch(err){ /* rien */ } }
  }
  function wire(id, root){
    if (id === 'admin'){
      /* 16.0.3 : si le chargement échoue, l'écran affiche « Réessayer » ; il ne relance PLUS le chargement tout seul en boucle (au plus un essai automatique toutes les 15 s) */
      if (!S.stats && !S.loading && (!S.lastTry || Date.now() - S.lastTry > 15000)){ load().then(() => { if (R.current() === 'admin') R.go('admin', { force: true, replace: true }); }); }
      else countUp(root);
      const q = root.querySelector('#adm-q');
      if (q) q.oninput = () => {
        S.q = q.value; clearTimeout(S.timer);
        if (S.q.trim().length < 2){ S.results = null; const l = root.querySelector('#adm-list'); if (l) l.innerHTML = usersHtml(S.users, null); return; }
        S.timer = setTimeout(async () => {
          const r = await sb.rpc('admin_search_users', { p_query: S.q.trim() });
          S.results = r.error ? [] : (r.data || []).map(u => Object.assign({ email_confirmed: true }, u));
          const l = root.querySelector('#adm-list'); if (l) l.innerHTML = usersHtml(S.results, null);
        }, 260);
      };
    }
    if (id === 'admin-user'){
      if (S.detail === null && S.sel) loadDetail().then(() => { if (R.current() === 'admin-user') R.go('admin-user', { force: true, replace: true }); });
    }
    root.onclick = async (ev) => {
      const el = ev.target.closest && ev.target.closest('[data-ad]'); if (!el) return;
      const k = el.getAttribute('data-ad');
      try { Sfx.play('tap'); } catch(err){ /* rien */ }
      if (k === 'open'){ S.sel = el.getAttribute('data-id'); S.detail = null; R.go('admin-user'); }
      else if (k === 'refresh') refresh(root, false);
      else if (k === 'reload'){ S.detail = null; R.go('admin-user', { force: true, replace: true }); }
      else if (k === 'p-new'){ try { InAppNotif.showCall({ title: e('playNew'), message: '+221 •••• 4567 · SN', status: 'success' }); Sfx.play('newUser'); } catch(err){ /* rien */ } }
      else if (k === 'p-reward'){ try { Reward.celebrate({ amount: Number((root.querySelector('#adm-bonus') || {}).value) || 10, currency: 'OMR' }); } catch(err){ /* rien */ } }
      else if (k === 'p-money'){ try { Sfx.play('money'); InAppNotif.showCall({ title: t('v13.nc.TRANSFER_RECEIVED'), message: 'Barq', amount: CurrencyEngine.format(25, 'OMR'), status: 'success' }); } catch(err){ /* rien */ } }
      else if (k === 'bplus' || k === 'bminus'){ const i = root.querySelector('#adm-bonus'); const v = Math.max(0, Math.min(100, (parseFloat(i.value) || 0) + (k === 'bplus' ? 1 : -1))); i.value = String(v); }
      else if (k === 'bsave' || k === 'boff'){
        const i = root.querySelector('#adm-bonus'); if (k === 'boff') i.value = '0';
        const v = parseFloat(String(i.value).replace(',', '.'));
        if (!isFinite(v) || v < 0 || v > 100){ toast(t('errors.UNKNOWN_ERROR'), 'error'); return; }
        const r = await sb.rpc('admin_set_signup_bonus', { p_amount: v });
        if (r.error){ toast(t('errors.UNKNOWN_ERROR'), 'error'); return; }
        if (S.stats) S.stats.bonus_amount_omr = v; try { Sfx.play('success'); } catch(err){ /* rien */ } toast(e('saved'), 'success');
      }
      else if (k === 'copy'){ try { await navigator.clipboard.writeText(el.getAttribute('data-v')); toast(e('copied'), 'success'); } catch(err){ /* rien */ } }
      else if (k === 'deposit'){
        const a = parseFloat(String((root.querySelector('#adm-dep-a') || {}).value || '').replace(',', '.')), c = root.querySelector('#adm-dep-c').value, n = root.querySelector('#adm-dep-n').value.trim(), er = root.querySelector('#adm-dep-err');
        if (!(a > 0)){ er.textContent = t('errors.MISSING_FIELD'); return; }
        const p = (S.detail && S.detail.profile) || {};
        if (!window.confirm(ef('depConfirm', { a: CurrencyEngine.format(a, c), n: fullName(p) }))) return;
        er.textContent = '';
        const r = await sb.rpc('admin_deposit', { p_target_yor_id: S.sel, p_amount: a, p_currency: c, p_note: n || null, p_idempotency_key: (typeof uuid === 'function' ? uuid() : String(Date.now())) + '-adm' });
        if (r.error){ er.textContent = t('errors.UNKNOWN_ERROR'); try { Sfx.play('error'); } catch(err){ /* rien */ } return; }
        try { Sfx.play('money'); } catch(err){ /* rien */ } toast(e('depDone'), 'success'); S.detail = null; R.go('admin-user', { force: true, replace: true });
      }
    };
  }
  /* appelé par la notification temps réel NEW_USER */
  function onNewUser(){ if (R.current() === 'admin'){ load().then(() => { if (R.current() === 'admin') R.go('admin', { force: true, replace: true }); }); } else S.stats = null; }
  return { render, renderUser, wire, onNewUser, e };
})();
