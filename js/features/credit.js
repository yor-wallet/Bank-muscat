'use strict';

/* ============================================================
   CREDIT (18.0.0) — demande de crédit de 5 000 à 500 000 OMR.
   - Écran utilisateur « credit » : anneau animé, curseur, durée, motif, demande en attente, historique, célébration à l'approbation.
   - Écran admin « admin-credit » : file des demandes (en attente / accordées / refusées), approbation avec montant modifiable, refus avec note.
   - SEUL l'administrateur accorde : la décision passe par la fonction serveur admin_credit_decide (is_admin() côté serveur).
   - CrUI : petites briques communes (feuilles, confirmation, icônes, formats) réutilisées par vault.js.
   Aucun emoji ; chiffres latins ; FR / EN / AR ; clair / sombre.
   ============================================================ */
Strings.add({
  en: {
    'cr.title': 'Credit request', 'cr.svc': 'Credit', 'cr.svcD': 'Request 5,000 to 500,000 OMR',
    'cr.heroSub': 'From {min} to {max} OMR', 'cr.only': 'Only an administrator can grant a credit. Every decision is recorded.',
    'cr.amount': 'Amount', 'cr.amountL': 'Amount in OMR', 'cr.months': 'Duration', 'cr.mo': '{n} months', 'cr.monthly': 'Indicative monthly amount',
    'cr.indic': 'Indicative only, no interest is added here. The administrator decides the final terms.',
    'cr.purpose': 'What is it for? (optional)', 'cr.purposePh': 'Business, project, studies...',
    'cr.send': 'Send the request', 'cr.sentT': 'Request sent', 'cr.sentD': 'An administrator will review it. You will be told here and on your phone.',
    'cr.pendT': 'Your request is under review', 'cr.pendD': 'You will be notified as soon as the administrator decides.', 'cr.since': 'Sent {when}',
    'cr.cancel': 'Cancel the request', 'cr.cancelQ': 'Cancel this request?', 'cr.cancelD': 'The administrator will no longer see it. You can send a new one afterwards.',
    'cr.cancelYes': 'Yes, cancel it', 'cr.keep': 'Keep it', 'cr.cancelled': 'Request cancelled',
    'cr.history': 'My requests', 'cr.noHist': 'No request yet', 'cr.noHistD': 'Your requests and the administrator’s answers will appear here.',
    'cr.st.PENDING': 'Under review', 'cr.st.APPROVED': 'Granted', 'cr.st.REJECTED': 'Declined', 'cr.st.CANCELLED': 'Cancelled',
    'cr.note': 'Administrator note', 'cr.granted': 'Granted: {amt}',
    'cr.off': 'Credit requests are not available right now.', 'cr.offD': 'Please come back later.',
    'cr.err.range': 'Choose an amount between {min} and {max} OMR.', 'cr.err.load': 'Could not load your requests.', 'cr.retry': 'Try again',
    'cr.apprT': 'Credit granted', 'cr.apprD': 'has been added to your balance.', 'cr.apprGo': 'See my balance',
    'cr.a.title': 'Credit requests', 'cr.a.pending': 'Pending', 'cr.a.approved': 'Granted', 'cr.a.rejected': 'Declined', 'cr.a.search': 'Search a member, ID, phone or purpose',
    'cr.a.empty': 'Nothing here', 'cr.a.emptyD': 'No request in this list.', 'cr.a.approve': 'Approve', 'cr.a.reject': 'Decline',
    'cr.a.approveT': 'Approve this credit', 'cr.a.amt': 'Amount granted (OMR)', 'cr.a.max': 'Maximum {max} OMR', 'cr.a.noteL': 'Note for the member (optional)',
    'cr.a.ok': 'Approve and credit the account', 'cr.a.rejectT': 'Decline this request', 'cr.a.rejectOk': 'Decline the request',
    'cr.a.done': '{amt} OMR credited', 'cr.a.declined': 'Request declined', 'cr.a.count': '{n} waiting', 'cr.a.requested': 'Requested', 'cr.a.for': 'for {n} months',
    'cr.a.err': 'Could not load. Try again.', 'cr.a.decidedOn': 'Decided {when}', 'cr.a.warn': 'The amount is credited to the member’s balance immediately.',
    'cr.a.noPhone': 'No phone', 'cr.a.live': 'Updates every 20 seconds'
  },
  fr: {
    'cr.title': 'Demande de crédit', 'cr.svc': 'Crédit', 'cr.svcD': 'Demandez de 5 000 à 500 000 OMR',
    'cr.heroSub': 'De {min} à {max} OMR', 'cr.only': 'Seul un administrateur peut accorder un crédit. Chaque décision est enregistrée.',
    'cr.amount': 'Montant', 'cr.amountL': 'Montant en OMR', 'cr.months': 'Durée', 'cr.mo': '{n} mois', 'cr.monthly': 'Mensualité indicative',
    'cr.indic': 'Indicatif seulement, aucun intérêt n’est ajouté ici. L’administrateur fixe les conditions finales.',
    'cr.purpose': 'Pour quel projet ? (facultatif)', 'cr.purposePh': 'Commerce, projet, études...',
    'cr.send': 'Envoyer la demande', 'cr.sentT': 'Demande envoyée', 'cr.sentD': 'Un administrateur va l’examiner. Vous serez prévenu ici et sur votre téléphone.',
    'cr.pendT': 'Votre demande est à l’étude', 'cr.pendD': 'Vous serez prévenu dès que l’administrateur aura décidé.', 'cr.since': 'Envoyée {when}',
    'cr.cancel': 'Annuler la demande', 'cr.cancelQ': 'Annuler cette demande ?', 'cr.cancelD': 'L’administrateur ne la verra plus. Vous pourrez en envoyer une nouvelle ensuite.',
    'cr.cancelYes': 'Oui, l’annuler', 'cr.keep': 'La garder', 'cr.cancelled': 'Demande annulée',
    'cr.history': 'Mes demandes', 'cr.noHist': 'Aucune demande', 'cr.noHistD': 'Vos demandes et les réponses de l’administrateur apparaîtront ici.',
    'cr.st.PENDING': 'À l’étude', 'cr.st.APPROVED': 'Accordé', 'cr.st.REJECTED': 'Refusé', 'cr.st.CANCELLED': 'Annulée',
    'cr.note': 'Note de l’administrateur', 'cr.granted': 'Accordé : {amt}',
    'cr.off': 'Les demandes de crédit ne sont pas disponibles pour le moment.', 'cr.offD': 'Revenez un peu plus tard.',
    'cr.err.range': 'Choisissez un montant entre {min} et {max} OMR.', 'cr.err.load': 'Impossible de charger vos demandes.', 'cr.retry': 'Réessayer',
    'cr.apprT': 'Crédit accordé', 'cr.apprD': 'ont été ajoutés à votre solde.', 'cr.apprGo': 'Voir mon solde',
    'cr.a.title': 'Demandes de crédit', 'cr.a.pending': 'En attente', 'cr.a.approved': 'Accordées', 'cr.a.rejected': 'Refusées', 'cr.a.search': 'Chercher un membre, un ID, un numéro ou un motif',
    'cr.a.empty': 'Rien ici', 'cr.a.emptyD': 'Aucune demande dans cette liste.', 'cr.a.approve': 'Approuver', 'cr.a.reject': 'Refuser',
    'cr.a.approveT': 'Approuver ce crédit', 'cr.a.amt': 'Montant accordé (OMR)', 'cr.a.max': 'Maximum {max} OMR', 'cr.a.noteL': 'Note pour le membre (facultatif)',
    'cr.a.ok': 'Approuver et créditer le compte', 'cr.a.rejectT': 'Refuser cette demande', 'cr.a.rejectOk': 'Refuser la demande',
    'cr.a.done': '{amt} OMR crédités', 'cr.a.declined': 'Demande refusée', 'cr.a.count': '{n} en attente', 'cr.a.requested': 'Demandé', 'cr.a.for': 'sur {n} mois',
    'cr.a.err': 'Chargement impossible. Réessayez.', 'cr.a.decidedOn': 'Décidé {when}', 'cr.a.warn': 'Le montant est crédité tout de suite sur le solde du membre.',
    'cr.a.noPhone': 'Sans téléphone', 'cr.a.live': 'Mise à jour toutes les 20 secondes'
  },
  ar: {
    'cr.title': 'طلب ائتمان', 'cr.svc': 'ائتمان', 'cr.svcD': 'اطلب من 5,000 إلى 500,000 ر.ع',
    'cr.heroSub': 'من {min} إلى {max} ر.ع', 'cr.only': 'المسؤول وحده يستطيع منح الائتمان. يتم تسجيل كل قرار.',
    'cr.amount': 'المبلغ', 'cr.amountL': 'المبلغ بالريال العُماني', 'cr.months': 'المدة', 'cr.mo': '{n} شهراً', 'cr.monthly': 'القسط الشهري التقريبي',
    'cr.indic': 'تقريبي فقط ولا تُضاف هنا أي فوائد. المسؤول يحدد الشروط النهائية.',
    'cr.purpose': 'ما الغرض؟ (اختياري)', 'cr.purposePh': 'تجارة، مشروع، دراسة...',
    'cr.send': 'إرسال الطلب', 'cr.sentT': 'تم إرسال الطلب', 'cr.sentD': 'سيراجعه أحد المسؤولين. سيصلك إشعار هنا وعلى هاتفك.',
    'cr.pendT': 'طلبك قيد المراجعة', 'cr.pendD': 'سيصلك إشعار فور قرار المسؤول.', 'cr.since': 'أُرسل {when}',
    'cr.cancel': 'إلغاء الطلب', 'cr.cancelQ': 'إلغاء هذا الطلب؟', 'cr.cancelD': 'لن يراه المسؤول بعد الآن. يمكنك إرسال طلب جديد بعدها.',
    'cr.cancelYes': 'نعم، إلغاء', 'cr.keep': 'الإبقاء عليه', 'cr.cancelled': 'تم إلغاء الطلب',
    'cr.history': 'طلباتي', 'cr.noHist': 'لا توجد طلبات', 'cr.noHistD': 'ستظهر هنا طلباتك وردود المسؤول.',
    'cr.st.PENDING': 'قيد المراجعة', 'cr.st.APPROVED': 'تمت الموافقة', 'cr.st.REJECTED': 'مرفوض', 'cr.st.CANCELLED': 'ملغى',
    'cr.note': 'ملاحظة المسؤول', 'cr.granted': 'الممنوح: {amt}',
    'cr.off': 'طلبات الائتمان غير متاحة حالياً.', 'cr.offD': 'يُرجى المحاولة لاحقاً.',
    'cr.err.range': 'اختر مبلغاً بين {min} و{max} ر.ع.', 'cr.err.load': 'تعذّر تحميل طلباتك.', 'cr.retry': 'إعادة المحاولة',
    'cr.apprT': 'تم منح الائتمان', 'cr.apprD': 'أُضيفت إلى رصيدك.', 'cr.apprGo': 'عرض رصيدي',
    'cr.a.title': 'طلبات الائتمان', 'cr.a.pending': 'قيد الانتظار', 'cr.a.approved': 'الممنوحة', 'cr.a.rejected': 'المرفوضة', 'cr.a.search': 'ابحث عن عضو أو معرّف أو هاتف أو غرض',
    'cr.a.empty': 'لا شيء هنا', 'cr.a.emptyD': 'لا توجد طلبات في هذه القائمة.', 'cr.a.approve': 'موافقة', 'cr.a.reject': 'رفض',
    'cr.a.approveT': 'الموافقة على هذا الائتمان', 'cr.a.amt': 'المبلغ الممنوح (ر.ع)', 'cr.a.max': 'الحد الأقصى {max} ر.ع', 'cr.a.noteL': 'ملاحظة للعضو (اختياري)',
    'cr.a.ok': 'موافقة وإضافة المبلغ إلى الحساب', 'cr.a.rejectT': 'رفض هذا الطلب', 'cr.a.rejectOk': 'رفض الطلب',
    'cr.a.done': 'تمت إضافة {amt} ر.ع', 'cr.a.declined': 'تم رفض الطلب', 'cr.a.count': '{n} بالانتظار', 'cr.a.requested': 'المطلوب', 'cr.a.for': 'لمدة {n} شهراً',
    'cr.a.err': 'تعذّر التحميل. حاول مجدداً.', 'cr.a.decidedOn': 'تم القرار {when}', 'cr.a.warn': 'يُضاف المبلغ فوراً إلى رصيد العضو.',
    'cr.a.noPhone': 'بدون هاتف', 'cr.a.live': 'يتحدث كل 20 ثانية'
  }
});

/* ---------- briques communes (aussi utilisées par vault.js) ---------- */
const CrUI = (() => {
  const SV = {
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.6h4a1.6 1.6 0 0 1 0 3.2h-3a1.6 1.6 0 0 0 0 3.2h4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    vault: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="12" r="3.4"/><path d="M12 8.6V10M12 14v1.4M8.6 12H10M14 12h1.4"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.4 2.4M15.6 15.6 18 18M18 6l-2.4 2.4M8.4 15.6 6 18"/>',
    rate: '<path d="M4 18 10 11l4 4 6-8"/><path d="M15 7h5v5"/>',
    deposit: '<rect x="3" y="9" width="18" height="11" rx="3"/><path d="M12 3v8M8.6 7.6 12 11l3.4-3.4"/>'
  };
  const svgI = (name, size) => {
    const body = SV[name]; if (!body) return icon(name, size || 20);
    const s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" style="width:calc(' + s + 'px*var(--ui));height:calc(' + s + 'px*var(--ui))" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ic">' + body + '</svg>';
  };
  const rtl = () => (LANG === 'ar' ? 'rtl' : 'ltr');
  /* 25 000 -> « 25,000 » (EN, AR) ou « 25 000 » (FR) ; chiffres latins partout */
  const grp = (n) => { const s = Money.int(n); return LANG === 'fr' ? s.replace(/,/g, ' ') : s; };
  const dec = (n, d) => { const s = Money.num(n, d); return LANG === 'fr' ? s.replace(/,/g, ' ').replace('.', ',') : s; };
  const pct = (n) => { const v = Number(n) || 0; const s = String(Math.round(v * 1000) / 1000); return LANG === 'fr' ? s.replace('.', ',') : s; };
  function errText(er){
    try { const k = er && er.key; if (k){ const v = t(k); if (v && v !== k) return v; } } catch(e){ /* rien */ }
    return t('errors.UNKNOWN_ERROR');
  }
  /* code d'erreur serveur (« amount_out_of_range »...) -> texte */
  function srvErr(er){
    const m = String((er && er.message) || '').toLowerCase();
    if (/amount_out_of_range/.test(m)){ const c = Cfg.get(); return tf('cr.err.range', { min: grp(c.credit_min), max: grp(c.credit_max) }); }
    if (/request_pending/.test(m)) return t('g.pending');
    if (/credit_disabled/.test(m)) return t('cr.off');
    if (/vault_disabled/.test(m)) return t('vt.off');
    if (/invalid_amount/.test(m)) return t('g.amount');
    if (/insufficient_balance/.test(m)){ const v = t('errors.INSUFFICIENT_BALANCE'); return v === 'errors.INSUFFICIENT_BALANCE' ? t('errors.UNKNOWN_ERROR') : v; }
    return errText(er);
  }
  /* feuille du bas : sheet(html, (root, close) => ...) */
  function sheet(inner, onWire, o){
    const sid = 's' + Math.random().toString(36).slice(2, 8);
    const close = R.overlay.open('<div class="cr-sheet" data-sid="' + sid + '" dir="' + rtl() + '"><div class="cr-grab"></div>' + inner + '</div>', { dismissible: !(o && o.locked) });
    setTimeout(() => {
      const root = document.querySelector('.cr-sheet[data-sid="' + sid + '"]');
      if (root){ try { onWire(root, close); } catch(e){ console.error('[sheet]', e); } }
    }, 70);
    return close;
  }
  /* confirmation : confirm({ title, body, ok, cancel, danger }, onOk) */
  function confirm(o, onOk){
    return sheet('<div class="cr-cf-ic' + (o.danger ? ' is-danger' : '') + '">' + svgI(o.icon || (o.danger ? 'close' : 'check'), 28) + '</div><h2 class="cr-cf-t">' + escapeHtml(o.title) + '</h2>' +
      (o.body ? '<p class="cr-cf-b">' + escapeHtml(o.body) + '</p>' : '') +
      '<button type="button" class="btn ' + (o.danger ? 'btn-secondary cr-danger' : 'btn-primary') + '" data-cf="ok">' + escapeHtml(o.ok) + '</button>' +
      '<button type="button" class="btn btn-ghost" data-cf="no">' + escapeHtml(o.cancel || t('action.cancel') || '') + '</button>', (root, close) => {
      let busy = false;
      root.querySelector('[data-cf="no"]').onclick = () => { try { Sfx.play('tap'); } catch(e){ /* rien */ } close(); };
      root.querySelector('[data-cf="ok"]').onclick = async () => {
        if (busy) return; busy = true;
        try { await onOk(close); } finally { busy = false; }
      };
    });
  }
  async function refreshMoney(){
    try { if (typeof AuthEngine !== 'undefined' && AuthEngine.hasValidContext()) await AuthEngine.hydrateLive(); } catch(e){ /* rien */ }
  }
  const uid = () => { try { return Runtime.ctx && Runtime.ctx.uid; } catch(e){ return null; } };
  const omr = () => { try { const a = (Runtime.accounts || []).find(x => x.currency === 'OMR'); return a ? Number(a.availableBalance != null ? a.availableBalance : a.balance) || 0 : 0; } catch(e){ return 0; } };
  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase() || '?';
  function snd(n){ try { Sfx.play(n); } catch(e){ /* rien */ } }
  function ago(ts){ try { return timeAgo(ts); } catch(e){ return ''; } }
  return { svgI, rtl, grp, dec, pct, errText, srvErr, sheet, confirm, refreshMoney, uid, omr, initials, snd, ago };
})();

const Credit = (() => {
  const esc = escapeHtml;
  const CH = [5000, 25000, 100000, 250000, 500000];
  const MONTHS = [6, 12, 24, 36, 60];
  const FETE = 'cr_fete_';
  const st = { reqs: [], loaded: false, error: false, amount: 25000, months: 12, purpose: '', busy: false, loadingCfg: false,
    a: { list: [], tab: 'PENDING', q: '', loaded: false, error: false, busy: false } };
  const c = () => Cfg.get();
  const clampAmt = (v) => { const k = c(); return Math.max(k.credit_min, Math.min(k.credit_max, Math.round(Number(v) || k.credit_min))); };
  const prog = (v) => { const k = c(); const d = k.credit_max - k.credit_min; return d > 0 ? Math.sqrt(Math.max(0, Math.min(1, (v - k.credit_min) / d))) : 0; };      /* l'anneau suit la racine : un petit montant reste visible */
  const lin = (v) => { const k = c(); const d = k.credit_max - k.credit_min; return d > 0 ? Math.max(0, Math.min(1, (v - k.credit_min) / d)) : 0; };
  const RING_C = 2 * Math.PI * 84;

  /* ---------- données ---------- */
  async function loadMine(){
    const u = CrUI.uid();
    if (!u){ st.loaded = true; return; }
    const r = await Guardian.query(() => sb.from('credit_requests').select('*').eq('user_id', u).order('created_at', { ascending: false }).limit(30));
    if (r.ok){ st.reqs = (r.data || []).map(x => { const n = Guardian.norm.credit(x); n.at = Guardian.norm.time(x.created_at); n.decided = Guardian.norm.time(x.decided_at); return n; }); st.error = false; }
    else st.error = true;
    st.loaded = true;
  }
  const pendingReq = () => st.reqs.find(x => x.status === 'PENDING') || null;
  function fetedIds(){ return Guardian.store.get(FETE + (CrUI.uid() || ''), []); }
  function markFete(id){ const l = fetedIds(); if (l.indexOf(id) === -1){ l.push(id); Guardian.store.set(FETE + (CrUI.uid() || ''), l.slice(-40)); } }
  /* une demande accordée pas encore fêtée : confettis, son doux, solde relu */
  async function checkApproved(){
    try {
      if (!st.loaded) await loadMine();
      const seen = fetedIds();
      const r = st.reqs.find(x => x.status === 'APPROVED' && seen.indexOf(x.id) === -1 && Date.now() - (x.decided || x.at) < 14 * 864e5);
      if (!r) return false;
      markFete(r.id);
      await CrUI.refreshMoney();
      celebrate(r);
      return true;
    } catch(e){ return false; }
  }
  function celebrate(r){
    const amt = r.approved_amount != null ? r.approved_amount : r.amount;
    CrUI.snd('credit'); Fx.haptic('success');
    CrUI.sheet('<div class="cr-gift"><div class="cr-gift-ring">' + CrUI.svgI('coin', 40) + '<i></i><i></i><i></i></div><h2>' + esc(t('cr.apprT')) + '</h2>' +
      '<div class="cr-gift-amt"><b class="ltr" dir="ltr" data-cu>0</b><span>OMR</span></div><p>' + esc(t('cr.apprD')) + '</p>' +
      (r.admin_note ? '<blockquote class="cr-quote">' + esc(r.admin_note) + '</blockquote>' : '') +
      '<button type="button" class="btn btn-primary" data-go>' + esc(t('cr.apprGo')) + '</button></div>', (root, close) => {
      const cu = root.querySelector('[data-cu]'); Fx.countUp(cu, amt, { dec: 3, ms: 1400 });
      setTimeout(() => Fx.confetti(root.querySelector('.cr-gift-ring'), { n: 110, power: 9 }), 250);
      setTimeout(() => Fx.confetti({ x: innerWidth * 0.2, y: innerHeight * 0.55 }, { n: 40, spread: 1.6, power: 8 }), 700);
      setTimeout(() => Fx.confetti({ x: innerWidth * 0.8, y: innerHeight * 0.55 }, { n: 40, spread: 1.6, power: 8 }), 900);
      root.querySelector('[data-go]').onclick = () => { CrUI.snd('tap'); close(); try { R.go('home', { reset: true }); } catch(e){ /* rien */ } };
    });
  }

  /* ---------- écran utilisateur ---------- */
  function ringHtml(){
    return '<div class="cr-ring" id="cr-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="crg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd36b"/><stop offset=".6" stop-color="#f2b632"/><stop offset="1" stop-color="#b87d0a"/></linearGradient></defs>' +
      '<circle class="cr-orbit" cx="100" cy="100" r="96"/><circle class="cr-track" cx="100" cy="100" r="84"/>' +
      '<circle class="cr-fill" id="cr-fill" cx="100" cy="100" r="84" stroke="url(#crg)" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + RING_C.toFixed(2) + '"/></svg>' +
      '<span class="cr-sp cr-sp1"></span><span class="cr-sp cr-sp2"></span><span class="cr-sp cr-sp3"></span>' +
      '<div class="cr-ring-c"><b id="cr-big" class="ltr" dir="ltr">' + CrUI.grp(st.amount) + '</b><span>OMR</span></div></div>';
  }
  function render(){
    return v18Top(t('cr.title')) +
      '<div class="screen-body cr-body"><section class="cr-hero">' + ringHtml() +
      '<p class="cr-hero-sub" id="cr-range">' + esc(tf('cr.heroSub', { min: CrUI.grp(c().credit_min), max: CrUI.grp(c().credit_max) })) + '</p></section>' +
      '<div id="cr-main"></div><div id="cr-hist"></div>' +
      '<p class="cr-only">' + CrUI.svgI('shield', 15) + '<span>' + esc(t('cr.only')) + '</span></p></div>';
  }
  function setRing(root, v, animate){
    const fill = root.querySelector('#cr-fill'), big = root.querySelector('#cr-big');
    if (fill) fill.style.strokeDashoffset = (RING_C * (1 - prog(v))).toFixed(2);
    if (big){
      if (animate){ const from = Number(big.getAttribute('data-v')) || 0; Fx.countUp(big, v, { from, dec: 0, ms: 520 }); setTimeout(() => { big.textContent = CrUI.grp(v); }, 540); }
      else big.textContent = CrUI.grp(v);
      big.setAttribute('data-v', String(v));
    }
  }
  function formHtml(){
    const k = c(), list = CH.filter(x => x >= k.credit_min && x <= k.credit_max);
    return '<section class="cr-card cr-form">' +
      '<label class="cr-l" for="cr-amt">' + esc(t('cr.amountL')) + '</label>' +
      '<div class="cr-amt-row"><div class="cr-field ltr" dir="ltr"><input id="cr-amt" type="text" inputmode="numeric" autocomplete="off" value="' + CrUI.grp(st.amount) + '" aria-label="' + esc(t('cr.amountL')) + '"><em>OMR</em></div></div>' +
      '<div class="cr-slider ltr" dir="ltr"><input id="cr-rng" type="range" min="' + k.credit_min + '" max="' + k.credit_max + '" step="500" value="' + st.amount + '" aria-label="' + esc(t('cr.amount')) + '"></div>' +
      '<div class="cr-mm ltr" dir="ltr"><span>' + CrUI.grp(k.credit_min) + '</span><span>' + CrUI.grp(k.credit_max) + '</span></div>' +
      '<div class="cr-chips" role="group">' + list.map(v => '<button type="button" class="cr-chip" data-amt="' + v + '" aria-pressed="' + (v === st.amount ? 'true' : 'false') + '">' + CrUI.grp(v) + '</button>').join('') + '</div>' +
      '<div class="cr-l">' + esc(t('cr.months')) + '</div>' +
      '<div class="cr-chips cr-mchips" role="group">' + MONTHS.map(m => '<button type="button" class="cr-chip" data-mo="' + m + '" aria-pressed="' + (m === st.months ? 'true' : 'false') + '">' + esc(tf('cr.mo', { n: m })) + '</button>').join('') + '</div>' +
      '<div class="cr-monthly"><span>' + CrUI.svgI('cal', 18) + esc(t('cr.monthly')) + '</span><b class="ltr" dir="ltr" id="cr-mthly">' + CrUI.dec(st.amount / st.months, 3) + ' OMR</b></div>' +
      '<p class="cr-indic">' + esc(t('cr.indic')) + '</p>' +
      '<label class="cr-l" for="cr-why">' + esc(t('cr.purpose')) + '</label>' +
      '<textarea id="cr-why" class="cr-why" rows="2" maxlength="300" placeholder="' + esc(t('cr.purposePh')) + '">' + esc(st.purpose) + '</textarea>' +
      '<div class="cr-err" id="cr-err" role="alert"></div>' +
      '<button type="button" class="btn btn-primary cr-send" id="cr-send"><span>' + esc(t('cr.send')) + '</span>' + CrUI.svgI('send', 18) + '</button></section>';
  }
  function pendingHtml(r){
    return '<section class="cr-card cr-pend"><div class="cr-hg">' + CrUI.svgI('hourglass', 30) + '<i></i></div>' +
      '<h2>' + esc(t('cr.pendT')) + '</h2><p>' + esc(t('cr.pendD')) + '</p>' +
      '<div class="cr-pend-amt"><b class="ltr" dir="ltr">' + CrUI.grp(r.amount) + '</b><span>OMR</span><em>' + esc(tf('cr.mo', { n: r.months })) + '</em></div>' +
      '<small>' + esc(tf('cr.since', { when: CrUI.ago(r.at) })) + '</small>' +
      '<button type="button" class="btn btn-ghost cr-cancel" id="cr-cancel">' + esc(t('cr.cancel')) + '</button></section>';
  }
  function offHtml(){
    return '<section class="cr-card cr-off"><div class="cr-off-ic">' + CrUI.svgI('lock', 28) + '</div><h2>' + esc(t('cr.off')) + '</h2><p>' + esc(t('cr.offD')) + '</p></section>';
  }
  function histHtml(){
    if (!st.loaded) return '<section class="cr-hist"><h3 class="cr-h">' + esc(t('cr.history')) + '</h3><div class="cr-skel"></div><div class="cr-skel"></div></section>';
    if (st.error && !st.reqs.length) return '<section class="cr-hist"><h3 class="cr-h">' + esc(t('cr.history')) + '</h3><div class="cr-empty"><p>' + esc(t('cr.err.load')) + '</p><button type="button" class="btn btn-secondary" id="cr-retry">' + esc(t('cr.retry')) + '</button></div></section>';
    if (!st.reqs.length) return '<section class="cr-hist"><h3 class="cr-h">' + esc(t('cr.history')) + '</h3><div class="cr-empty">' + CrUI.svgI('doc', 28) + '<b>' + esc(t('cr.noHist')) + '</b><p>' + esc(t('cr.noHistD')) + '</p></div></section>';
    return '<section class="cr-hist"><h3 class="cr-h">' + esc(t('cr.history')) + '</h3>' + st.reqs.map((r, i) => {
      const amt = r.status === 'APPROVED' && r.approved_amount != null ? r.approved_amount : r.amount;
      return '<article class="cr-item st-' + r.status + '" style="--i:' + i + '"><div class="cr-item-top"><span class="cr-badge">' + esc(t('cr.st.' + r.status)) + '</span><time>' + esc(CrUI.ago(r.at)) + '</time></div>' +
        '<div class="cr-item-amt"><b class="ltr" dir="ltr">' + CrUI.grp(amt) + '</b><span>OMR</span><em>' + esc(tf('cr.mo', { n: r.months })) + '</em></div>' +
        (r.purpose ? '<p class="cr-item-why">' + esc(r.purpose) + '</p>' : '') +
        (r.admin_note ? '<p class="cr-item-note"><b>' + esc(t('cr.note')) + '</b>' + esc(r.admin_note) + '</p>' : '') + '</article>';
    }).join('') + '</section>';
  }
  function paint(root){
    const main = root.querySelector('#cr-main'), hist = root.querySelector('#cr-hist'); if (!main || !hist) return;
    const p = pendingReq();
    if (!c().credit_enabled){ main.innerHTML = offHtml(); setRing(root, st.amount); }
    else if (p){ main.innerHTML = pendingHtml(p); setRing(root, clampAmt(p.amount)); }
    else { main.innerHTML = formHtml(); setRing(root, st.amount); bindForm(root); }
    root.querySelector('.cr-ring').classList.toggle('is-wait', !!p);
    hist.innerHTML = histHtml();
    const rt = hist.querySelector('#cr-retry'); if (rt) rt.onclick = async () => { await loadMine(); paint(root); };
    const cn = main.querySelector('#cr-cancel'); if (cn) cn.onclick = () => askCancel(root, p);
  }
  function askCancel(root, p){
    CrUI.snd('open');
    CrUI.confirm({ title: t('cr.cancelQ'), body: t('cr.cancelD'), ok: t('cr.cancelYes'), cancel: t('cr.keep'), danger: true, icon: 'close' }, async (close) => {
      const r = await Guardian.rpc('credit_request_cancel', { p_id: p.id }, { read: false });
      close();
      if (r.ok){ CrUI.snd('pop'); toast(t('cr.cancelled'), 'success'); await loadMine(); } else { CrUI.snd('error'); toast(CrUI.srvErr(r.error), 'error'); }
      paint(root);
    });
  }
  function setAmount(root, v, o){
    o = o || {};
    v = clampAmt(v); const was = st.amount; st.amount = v;
    setRing(root, v, !!o.animate && was !== v);
    const rng = root.querySelector('#cr-rng'); if (rng){ rng.value = String(v); rng.style.setProperty('--p', (lin(v) * 100).toFixed(1) + '%'); }
    const inp = root.querySelector('#cr-amt'); if (inp && !o.keepInput) inp.value = CrUI.grp(v);
    root.querySelectorAll('[data-amt]').forEach(b => b.setAttribute('aria-pressed', Number(b.getAttribute('data-amt')) === v ? 'true' : 'false'));
    const m = root.querySelector('#cr-mthly'); if (m) m.textContent = CrUI.dec(v / st.months, 3) + ' OMR';
  }
  function bindForm(root){
    const rng = root.querySelector('#cr-rng'), inp = root.querySelector('#cr-amt'), why = root.querySelector('#cr-why'), err = root.querySelector('#cr-err'), btn = root.querySelector('#cr-send');
    if (!rng) return;
    rng.style.setProperty('--p', (lin(st.amount) * 100).toFixed(1) + '%');
    let tickAt = 0;
    rng.oninput = () => {
      setAmount(root, Number(rng.value), {});
      const n = Date.now(); if (n - tickAt > 70){ tickAt = n; CrUI.snd('tick'); }
    };
    rng.onchange = () => { Fx.haptic('tap'); };
    inp.onfocus = () => { try { inp.select(); } catch(e){ /* rien */ } };
    inp.oninput = () => {
      const d = inp.value.replace(/\D/g, '').slice(0, 7); inp.value = d ? CrUI.grp(Number(d)) : '';
      const k = c(); const n = Number(d) || 0;
      if (n >= k.credit_min && n <= k.credit_max) setAmount(root, n, { keepInput: true });
    };
    inp.onblur = () => { setAmount(root, Number(inp.value.replace(/\D/g, '')) || c().credit_min, { animate: true }); };
    root.querySelectorAll('[data-amt]').forEach(b => { b.onclick = () => { CrUI.snd('pop'); Fx.haptic('tap'); setAmount(root, Number(b.getAttribute('data-amt')), { animate: true }); Fx.pulse(root.querySelector('.cr-ring')); }; });
    root.querySelectorAll('[data-mo]').forEach(b => { b.onclick = () => {
      st.months = Number(b.getAttribute('data-mo')); CrUI.snd('tick'); Fx.haptic('tap');
      root.querySelectorAll('[data-mo]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      const m = root.querySelector('#cr-mthly'); if (m) m.textContent = CrUI.dec(st.amount / st.months, 3) + ' OMR';
    }; });
    why.oninput = () => { st.purpose = why.value; };
    btn.onclick = async () => {
      if (st.busy) return;
      const k = c(); err.textContent = '';
      if (!(st.amount >= k.credit_min && st.amount <= k.credit_max)){ err.textContent = tf('cr.err.range', { min: CrUI.grp(k.credit_min), max: CrUI.grp(k.credit_max) }); CrUI.snd('error'); Fx.shake(btn); return; }
      st.busy = true; UIKit.loading(btn, true); CrUI.snd('pop');
      const r = await Guardian.rpc('credit_request_create', { p_amount: st.amount, p_months: st.months, p_purpose: (st.purpose || '').trim() }, { read: false });
      st.busy = false; UIKit.loading(btn, false);
      if (!r.ok){ err.textContent = CrUI.srvErr(r.error); CrUI.snd('error'); Fx.haptic('error'); Fx.shake(btn); if (/request_pending/.test(r.error.message || '')){ await loadMine(); paint(root); } return; }
      st.purpose = '';
      successFx(root);
      await loadMine(); paint(root);
    };
  }
  function successFx(root){
    CrUI.snd('success'); Fx.haptic('success');
    const ov = document.createElement('div'); ov.className = 'cr-ok';
    ov.innerHTML = '<div class="cr-ok-in"><div class="cr-ok-ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 14-16"/></svg></div><h2>' + esc(t('cr.sentT')) + '</h2><p>' + esc(t('cr.sentD')) + '</p></div>';
    document.body.appendChild(ov);      /* hors de l'écran : un écran animé (transform) casserait position:fixed */
    setTimeout(() => Fx.confetti(ov.querySelector('.cr-ok-ring'), { n: 80, power: 8 }), 350);
    setTimeout(() => { ov.classList.add('is-out'); setTimeout(() => ov.remove(), 450); }, 2300);
    ov.onclick = () => { ov.remove(); };
  }
  function wire(root){
    try {
      const sig = () => JSON.stringify([st.reqs.map(x => x.id + x.status), c().credit_enabled, c().credit_min, c().credit_max]);
      const rangeTxt = () => { const rg = root.querySelector('#cr-range'); if (rg) rg.textContent = tf('cr.heroSub', { min: CrUI.grp(c().credit_min), max: CrUI.grp(c().credit_max) }); };
      st.amount = clampAmt(st.amount); paint(root);
      Cfg.load().then(() => { if (root.isConnected){ st.amount = clampAmt(st.amount); paint(root); rangeTxt(); } });
      loadMine().then(async () => { if (root.isConnected) paint(root); await checkApproved(); });
      /* rafraîchissement discret : l'écran n'est redessiné que si quelque chose a changé (on ne casse pas une saisie en cours) */
      const stop = Guardian.every(async () => {
        if (!root.isConnected) return;
        const before = sig(), had = pendingReq();
        await loadMine(); await Cfg.load(true);
        if (!root.isConnected) return;
        if (sig() !== before){ st.amount = clampAmt(st.amount); paint(root); rangeTxt(); }
        if (had && !pendingReq()) await checkApproved();
      }, 20000);
      R.onLeave(stop);
    } catch(e){ console.error('[credit]', e); }
  }

  /* ---------- administrateur ---------- */
  async function loadAdmin(){
    st.a.busy = true;
    const r = await Guardian.rpc('admin_credit_list', { p_status: null, p_limit: 300 });
    if (r.ok){ st.a.list = (r.data || []).map(x => { const n = Guardian.norm.credit(x); n.at = Guardian.norm.time(x.created_at); n.decided = Guardian.norm.time(x.decided_at); n.full_name = Guardian.norm.str(x.full_name, 80); n.yor_id = Guardian.norm.str(x.yor_id, 24); n.phone = Guardian.norm.str(x.phone, 32); return n; }); st.a.error = false; }
    else st.a.error = true;
    st.a.loaded = true; st.a.busy = false;
  }
  const cnt = (s) => st.a.list.filter(x => x.status === s).length;
  function adminRender(){
    const tabs = [['PENDING', 'cr.a.pending'], ['APPROVED', 'cr.a.approved'], ['REJECTED', 'cr.a.rejected']];
    return v18Top(t('cr.a.title'), '<span class="cr-a-badge" id="cra-n">' + CrUI.svgI('hourglass', 14) + '<b>' + cnt('PENDING') + '</b></span>') +
      '<div class="screen-body cr-body cr-a"><div class="cr-a-tabs" role="tablist">' + tabs.map(x => '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (st.a.tab === x[0]) + '">' + esc(t(x[1])) + '<em>' + cnt(x[0]) + '</em></button>').join('') + '</div>' +
      '<div class="cr-a-search">' + icon('search', 18) + '<input type="search" id="cra-q" placeholder="' + esc(t('cr.a.search')) + '" value="' + esc(st.a.q) + '" autocomplete="off"></div>' +
      '<p class="cr-a-live"><i></i>' + esc(t('cr.a.live')) + '</p><div id="cra-list"></div></div>';
  }
  function adminCard(r, i){
    const pend = r.status === 'PENDING';
    return '<article class="cr-ac st-' + r.status + '" data-id="' + esc(r.id) + '" style="--i:' + i + '">' +
      '<div class="cr-ac-top"><span class="cr-ac-av">' + esc(CrUI.initials(r.full_name || r.yor_id)) + '</span><div class="cr-ac-who"><b>' + esc(r.full_name || dispId(r.yor_id)) + '</b><small class="ltr" dir="ltr">' + esc(dispId(r.yor_id)) + ' · ' + esc(r.phone || t('cr.a.noPhone')) + '</small></div><time>' + esc(CrUI.ago(r.at)) + '</time></div>' +
      '<div class="cr-ac-amt"><span>' + esc(t('cr.a.requested')) + '</span><b class="ltr" dir="ltr">' + CrUI.grp(r.amount) + '</b><em>OMR</em><i>' + esc(tf('cr.a.for', { n: r.months })) + '</i></div>' +
      (r.purpose ? '<p class="cr-ac-why">' + esc(r.purpose) + '</p>' : '') +
      (pend ? '<div class="cr-ac-act"><button type="button" class="btn btn-secondary cr-danger" data-rej="' + esc(r.id) + '">' + esc(t('cr.a.reject')) + '</button><button type="button" class="btn btn-primary" data-app="' + esc(r.id) + '">' + CrUI.svgI('check', 18) + '<span>' + esc(t('cr.a.approve')) + '</span></button></div>'
        : '<div class="cr-ac-res"><span class="cr-badge">' + esc(t('cr.st.' + r.status)) + '</span>' + (r.status === 'APPROVED' && r.approved_amount != null ? '<b class="ltr" dir="ltr">' + CrUI.grp(r.approved_amount) + ' OMR</b>' : '') + '<small>' + esc(tf('cr.a.decidedOn', { when: CrUI.ago(r.decided || r.at) })) + '</small></div>' + (r.admin_note ? '<p class="cr-item-note"><b>' + esc(t('cr.note')) + '</b>' + esc(r.admin_note) + '</p>' : '')) +
      '</article>';
  }
  function adminPaint(root){
    const box = root.querySelector('#cra-list'); if (!box) return;
    if (!st.a.loaded){ box.innerHTML = '<div class="cr-skel"></div><div class="cr-skel"></div><div class="cr-skel"></div>'; return; }
    if (st.a.error && !st.a.list.length){ box.innerHTML = '<div class="cr-empty"><p>' + esc(t('cr.a.err')) + '</p><button type="button" class="btn btn-secondary" id="cra-retry">' + esc(t('cr.retry')) + '</button></div>'; const b = box.querySelector('#cra-retry'); if (b) b.onclick = async () => { await loadAdmin(); adminPaint(root); }; return; }
    const q = st.a.q.trim().toLowerCase();
    const rows = st.a.list.filter(x => x.status === st.a.tab && (!q || (x.full_name + ' ' + x.yor_id + ' ' + x.phone + ' ' + x.purpose).toLowerCase().indexOf(q) !== -1));
    box.innerHTML = rows.length ? rows.map(adminCard).join('') : '<div class="cr-empty">' + CrUI.svgI('doc', 28) + '<b>' + esc(t('cr.a.empty')) + '</b><p>' + esc(t('cr.a.emptyD')) + '</p></div>';
    box.querySelectorAll('[data-app]').forEach(b => { b.onclick = () => approveSheet(root, b.getAttribute('data-app')); });
    box.querySelectorAll('[data-rej]').forEach(b => { b.onclick = () => rejectSheet(root, b.getAttribute('data-rej')); });
    root.querySelectorAll('.cr-a-tabs [data-tab]').forEach(b => { const em = b.querySelector('em'); if (em) em.textContent = String(cnt(b.getAttribute('data-tab'))); b.setAttribute('aria-selected', String(st.a.tab === b.getAttribute('data-tab'))); });
    const n = root.querySelector('#cra-n b'); if (n) n.textContent = String(cnt('PENDING'));
  }
  const byId = (id) => st.a.list.find(x => x.id === id);
  function approveSheet(root, id){
    const r = byId(id); if (!r) return; const k = c(); CrUI.snd('open');
    CrUI.sheet('<h2 class="cr-sh-t">' + esc(t('cr.a.approveT')) + '</h2><p class="cr-sh-who"><b>' + esc(r.full_name || dispId(r.yor_id)) + '</b><small class="ltr" dir="ltr">' + esc(dispId(r.yor_id)) + '</small></p>' +
      '<label class="cr-l" for="cra-amt">' + esc(t('cr.a.amt')) + '</label><div class="cr-field ltr" dir="ltr"><input id="cra-amt" type="text" inputmode="numeric" value="' + CrUI.grp(Math.min(r.amount, k.credit_max)) + '"><em>OMR</em></div>' +
      '<small class="cr-hint">' + esc(tf('cr.a.max', { max: CrUI.grp(k.credit_max) })) + '</small>' +
      '<label class="cr-l" for="cra-note">' + esc(t('cr.a.noteL')) + '</label><textarea id="cra-note" class="cr-why" rows="2" maxlength="300"></textarea>' +
      '<p class="cr-hint cr-warn">' + esc(t('cr.a.warn')) + '</p><div class="cr-err" id="cra-err" role="alert"></div>' +
      '<button type="button" class="btn btn-primary" id="cra-ok">' + esc(t('cr.a.ok')) + '</button>', (sh, close) => {
      const inp = sh.querySelector('#cra-amt'), btn = sh.querySelector('#cra-ok'), err = sh.querySelector('#cra-err');
      inp.oninput = () => { const d = inp.value.replace(/\D/g, '').slice(0, 7); inp.value = d ? CrUI.grp(Number(d)) : ''; };
      let busy = false;
      btn.onclick = async () => {
        if (busy) return; const a = Number(inp.value.replace(/\D/g, '')) || 0;
        if (a <= 0 || a > k.credit_max){ err.textContent = tf('cr.a.max', { max: CrUI.grp(k.credit_max) }); CrUI.snd('error'); Fx.shake(btn); return; }
        busy = true; UIKit.loading(btn, true);
        const res = await Guardian.rpc('admin_credit_decide', { p_id: id, p_approve: true, p_amount: a, p_note: sh.querySelector('#cra-note').value.trim() }, { read: false });
        busy = false; UIKit.loading(btn, false);
        if (!res.ok){ err.textContent = CrUI.srvErr(res.error); CrUI.snd('error'); Fx.shake(btn); if (/already_decided/.test(res.error.message || '')){ await loadAdmin(); adminPaint(root); } return; }
        close(); CrUI.snd('credit'); Fx.haptic('success');
        const card = root.querySelector('.cr-ac[data-id="' + id + '"]');
        if (card){ card.classList.add('is-granted'); Fx.confetti(card, { n: 90, power: 8 }); }
        toast(tf('cr.a.done', { amt: CrUI.grp(a) }), 'success');
        setTimeout(async () => { await loadAdmin(); if (root.isConnected) adminPaint(root); }, 900);
      };
    });
  }
  function rejectSheet(root, id){
    const r = byId(id); if (!r) return; CrUI.snd('open');
    CrUI.sheet('<h2 class="cr-sh-t">' + esc(t('cr.a.rejectT')) + '</h2><p class="cr-sh-who"><b>' + esc(r.full_name || dispId(r.yor_id)) + '</b><small class="ltr" dir="ltr">' + CrUI.grp(r.amount) + ' OMR</small></p>' +
      '<label class="cr-l" for="cra-note">' + esc(t('cr.a.noteL')) + '</label><textarea id="cra-note" class="cr-why" rows="2" maxlength="300"></textarea><div class="cr-err" id="cra-err" role="alert"></div>' +
      '<button type="button" class="btn btn-secondary cr-danger" id="cra-no">' + esc(t('cr.a.rejectOk')) + '</button>', (sh, close) => {
      const btn = sh.querySelector('#cra-no'), err = sh.querySelector('#cra-err'); let busy = false;
      btn.onclick = async () => {
        if (busy) return; busy = true; UIKit.loading(btn, true);
        const res = await Guardian.rpc('admin_credit_decide', { p_id: id, p_approve: false, p_amount: null, p_note: sh.querySelector('#cra-note').value.trim() }, { read: false });
        busy = false; UIKit.loading(btn, false);
        if (!res.ok){ err.textContent = CrUI.srvErr(res.error); CrUI.snd('error'); return; }
        close(); CrUI.snd('pop'); toast(t('cr.a.declined'), 'success');
        await loadAdmin(); if (root.isConnected) adminPaint(root);
      };
    });
  }
  function adminWire(root){
    try {
      adminPaint(root);
      root.querySelectorAll('.cr-a-tabs [data-tab]').forEach(b => { b.onclick = () => { st.a.tab = b.getAttribute('data-tab'); CrUI.snd('tick'); Fx.haptic('tap'); adminPaint(root); }; });
      const q = root.querySelector('#cra-q'); if (q) q.oninput = Guardian.debounce(() => { st.a.q = q.value; adminPaint(root); }, 180);
      Cfg.load();
      loadAdmin().then(() => { if (root.isConnected) adminPaint(root); });
      const stop = Guardian.every(async () => {
        if (!root.isConnected || document.querySelector('.cr-sheet')) return;
        const before = cnt('PENDING'); await loadAdmin();
        if (root.isConnected){ adminPaint(root); if (cnt('PENDING') > before){ CrUI.snd('notify'); try { Fx.pulse(root.querySelector('#cra-n')); } catch(e){ /* rien */ } } }
      }, 20000);
      R.onLeave(stop);
    } catch(e){ console.error('[admin-credit]', e); }
  }
  async function pendingCount(){
    try {
      const o = await Guardian.rpc('admin_vault_overview', {});
      if (o.ok && o.data && o.data.credit_pending != null) return Guardian.norm.int(o.data.credit_pending);
      const l = await Guardian.rpc('admin_credit_list', { p_status: 'PENDING', p_limit: 100 });
      return l.ok ? (l.data || []).length : 0;
    } catch(e){ return 0; }
  }
  const mine = () => st.reqs.slice();
  return { open: () => R.go('credit'), adminOpen: () => R.go('admin-credit'), pendingCount, mine, checkApproved, render, wire, adminRender, adminWire };
})();

R.register({ credit: () => Credit.render(), 'admin-credit': () => Credit.adminRender() });
R.meta({ credit: { parent: 'services', nav: 'services' }, 'admin-credit': { parent: 'admin-hub', nav: 'services', admin: true } });
Hooks.on('credit', root => Credit.wire(root));
Hooks.on('admin-credit', root => Credit.adminWire(root));
