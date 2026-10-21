'use strict';

/* ============================================================
   PLANS / INVESTISSEMENTS (19.0.0) — écrans `invest`, `invest-new`, `invest-pay`.
   Règle centrale : aucun faux rendement, aucun faux statut. Les chiffres viennent de invest_overview() ; un rendement n'est affiché que si le
   serveur le renvoie avec model_validated vrai. Le reçu de paiement est envoyé DANS le chat (image ou PDF) puis rattaché au dossier ;
   « confirmé » n'apparaît qu'après la vérification réelle de l'administrateur.
   Contient aussi `Flow` : petites briques partagées par kyc.js et withdraw.js (chargés ensuite).
   ============================================================ */
const Flow = (() => {
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const lc = () => (LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG === 'fr' ? 'fr-FR' : 'en-GB');
  const grp = n => { const s = Money.int(n); return LANG === 'fr' ? s.replace(/,/g, ' ') : s; };
  const dec = (n, d) => { const s = Money.num(n, d == null ? 3 : d); return LANG === 'fr' ? s.replace(/,/g, ' ').replace('.', ',') : s; };
  const pct = v => { const s = String(Math.round((Number(v) || 0) * 100) / 100); return LANG === 'fr' ? s.replace('.', ',') : s; };
  const loc = o => (o && typeof o === 'object' ? (o[LANG] || o.en || '') : String(o || ''));
  const date = ts => { try { return ts ? new Date(ts).toLocaleDateString(lc(), { day: '2-digit', month: 'short', year: 'numeric' }) : ''; } catch(e){ return ''; } };
  const dtime = ts => { try { return ts ? new Date(ts).toLocaleString(lc(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; } catch(e){ return ''; } };
  const uuid = () => { try { return crypto.randomUUID(); } catch(e){ return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };
  const uid = () => { try { return Runtime.ctx.uid; } catch(e){ return ''; } };
  const SV = {
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h5M9.5 15.5h5"/>', camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', lock: '<rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V8a4 4 0 0 1 8 0v2"/>',
    shield: '<path d="M12 3.2 19 6v5.6c0 4.2-2.9 7.3-7 9-4.1-1.7-7-4.8-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>', bank: '<path d="M3 9l9-5 9 5M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 20h18"/>',
    upload: '<path d="M12 16V5M7.6 9.4 12 5l4.4 4.4M5 19h14"/>', id: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.7-1.6 1.9-2.3 3.2-2.3s2.5.7 3.2 2.3M14.5 10h4M14.5 13.5h3"/>',
    selfie: '<circle cx="12" cy="9" r="4"/><path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', chev: '<path d="M9 5l7 7-7 7"/>',
    trend: '<path d="M3.5 17l5-5 3.5 3.5 8-8M15 7.5h5v5"/>', wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M16 12.5h3M3 10h18"/>', refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5M19.5 4v4h-4M19.5 12a7.5 7.5 0 0 1-13 5M4.5 20v-4h4"/>'
  };
  const ic = (n, s) => { s = s || 20; return '<svg class="fl-i" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (SV[n] || '') + '</svg>'; };
  const copyTxt = (v) => { try { navigator.clipboard.writeText(String(v)).then(() => toast(t('action.copy')), () => {}); } catch(e){ /* rien */ } };
  const hap = k => { try { Fx.haptic(k || 'tap'); } catch(e){ /* rien */ } };
  const snd = n => { try { Sfx.play(n); } catch(e){ /* rien */ } };
  /* erreurs serveur -> texte traduit (préfixe de clés : fl.e.*) */
  function srvErr(er){
    const m = String((er && er.message) || '').toLowerCase();
    const ks = ['kyc_required', 'plan_unavailable', 'amount_out_of_range', 'too_many_open', 'invest_disabled', 'invalid_holder', 'invalid_bank', 'invalid_account', 'invalid_iban', 'insufficient_balance', 'withdraw_disabled', 'request_pending', 'already_verified', 'invalid_media', 'invalid_state', 'proof_not_found', 'not_found', 'rate_limited', 'forbidden'];
    for (const k of ks) if (m.indexOf(k) !== -1) return t('fl.e.' + k);
    try { const kk = er && er.key; if (kk){ const v = t(kk); if (v && v !== kk) return v; } } catch(e){ /* rien */ }
    return t('errors.UNKNOWN_ERROR');
  }
  /* image -> JPEG réduit (1600 px) ; autres formats / échec : fichier d'origine */
  function compress(file, max, q){
    return new Promise(res => {
      try {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return res(file);
        const url = URL.createObjectURL(file), im = new Image();
        im.onload = () => {
          try {
            const k = Math.min(1, (max || 1600) / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
            const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
            c.toBlob(b => { URL.revokeObjectURL(url); res(b && b.size ? b : file); }, 'image/jpeg', q || 0.85);
          } catch(e){ URL.revokeObjectURL(url); res(file); }
        };
        im.onerror = () => { URL.revokeObjectURL(url); res(file); };
        im.src = url;
      } catch(e){ res(file); }
    });
  }
  async function upload(bucket, path, blob, mime){
    const r = await Guardian.query(() => sb.storage.from(bucket).upload(path, blob, { contentType: mime, cacheControl: '3600', upsert: false }), { retries: 1, timeout: 90000 });
    return r;
  }
  const extOf = (mime) => (/pdf/.test(mime) ? 'pdf' : /png/.test(mime) ? 'png' : /webp/.test(mime) ? 'webp' : /heic/.test(mime) ? 'heic' : 'jpg');
  const top = (title, right) => v18Top(title, right);
  const spin = '<span class="fl-spin" aria-hidden="true"></span>';
  function btnBusy(b, on){ if (!b) return; b.disabled = !!on; b.classList.toggle('is-busy', !!on); }
  const box = () => document.querySelector('.screen.active');
  const stat = (label, v, cls) => '<div class="fl-stat' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) + '</span><b class="ltr" dir="ltr" data-fl-count="' + esc(v) + '">0.000</b><em>OMR</em></div>';
  function countAll(root){ try { root.querySelectorAll('[data-fl-count]').forEach(el => Fx.countUp(el, Number(el.getAttribute('data-fl-count')) || 0, { dec: 3, ms: 800 })); } catch(e){ /* rien */ } }
  /* donut SVG : segments [{value, cls}] */
  function donut(segs, label, sub){
    const tot = segs.reduce((a, s) => a + (Number(s.value) || 0), 0); if (tot <= 0) return '';
    const R0 = 52, C = 2 * Math.PI * R0; let off = 0;
    const arcs = segs.filter(s => s.value > 0).map(s => { const l = C * s.value / tot, d = '<circle class="fl-arc ' + s.cls + '" cx="70" cy="70" r="' + R0 + '" stroke-dasharray="' + l.toFixed(2) + ' ' + (C - l).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += l; return d; }).join('');
    return '<div class="fl-donut" role="img" aria-label="' + esc(label) + '"><svg viewBox="0 0 140 140"><circle class="fl-arc-bg" cx="70" cy="70" r="' + R0 + '"/>' + arcs + '</svg><div><b class="ltr" dir="ltr">' + esc(sub) + '</b><small>' + esc(label) + '</small></div></div>';
  }
  /* chronologie : [{t, d, st: done|current|todo|bad}] */
  function timeline(steps){
    return '<ol class="fl-tl">' + steps.map(s => '<li class="' + s.st + '"><i>' + (s.st === 'done' ? ic('check', 14) : s.st === 'bad' ? ic('x', 14) : s.st === 'current' ? '<span class="fl-pulse"></span>' : '') + '</i><div><b>' + esc(s.t) + '</b>' + (s.d ? '<small>' + esc(s.d) + '</small>' : '') + '</div></li>').join('') + '</ol>';
  }
  const empty = (icn, title, body) => '<div class="fl-empty"><i>' + ic(icn, 28) + '</i><b>' + esc(title) + '</b><p>' + esc(body) + '</p></div>';
  const skeleton = () => '<div class="fl-skel"><i></i><i></i><i></i></div>';
  const errCard = (retryAttr) => '<div class="fl-card fl-err"><p>' + esc(t('fl.loadErr')) + '</p><button type="button" class="btn btn-secondary" ' + retryAttr + '>' + esc(t('res.retry')) + '</button></div>';
  return { esc, grp, dec, pct, loc, date, dtime, uuid, uid, ic, copyTxt, hap, snd, srvErr, compress, upload, extOf, top, spin, btnBusy, box, stat, countAll, donut, timeline, empty, skeleton, errCard, SV };
})();

Strings.add({
  en: {
    'fl.loadErr': 'Could not load. Check your connection.', 'fl.copy': 'Copy', 'fl.back': 'Back', 'fl.cont': 'Continue', 'fl.omr': 'OMR',
    'fl.e.kyc_required': 'Verify your identity first.', 'fl.e.plan_unavailable': 'This plan is not available.', 'fl.e.amount_out_of_range': 'This amount is outside the allowed range.', 'fl.e.too_many_open': 'Too many open requests. Finish or cancel one first.', 'fl.e.invest_disabled': 'Plans are paused by the administrator.',
    'fl.e.invalid_holder': 'Enter the account holder name.', 'fl.e.invalid_bank': 'Choose a bank.', 'fl.e.invalid_account': 'Check the account number.', 'fl.e.invalid_iban': 'This IBAN is not valid.', 'fl.e.insufficient_balance': 'Your available balance is too low.', 'fl.e.withdraw_disabled': 'Withdrawals are paused by the administrator.',
    'fl.e.request_pending': 'A request is already being reviewed.', 'fl.e.already_verified': 'Your identity is already verified.', 'fl.e.invalid_media': 'A file was refused. Retake it.', 'fl.e.invalid_state': 'This request can no longer be changed.', 'fl.e.proof_not_found': 'The receipt was not found. Send it again.', 'fl.e.not_found': 'Not found.', 'fl.e.rate_limited': 'Too fast. Please wait a moment.', 'fl.e.forbidden': 'This action is reserved.',
    'inv.title': 'Plans', 'inv.hero': 'Your portfolio', 'inv.active': 'Active capital', 'inv.pending': 'Awaiting payment', 'inv.settled': 'Settled', 'inv.gains': 'Realised gains', 'inv.donut': 'Capital', 'inv.mine': 'My plans', 'inv.plans': 'Choose a plan',
    'inv.range': '{min} to {max} OMR', 'inv.days': '{n} days', 'inv.choose': 'Choose', 'inv.unavail': 'Unavailable', 'inv.noRet': 'Return not defined', 'inv.ret': 'Validated return {p}%', 'inv.retNote': 'Return not defined: no gain is announced. Gains are shown only when the administrator has defined and validated the financial model.',
    'inv.emptyT': 'No plan yet', 'inv.emptyD': 'Your plans will appear here once you create one. Nothing is invested and no gain is announced.', 'inv.new': 'New plan', 'inv.amount': 'Amount', 'inv.amountH': 'Between {min} and {max} OMR', 'inv.recap': 'Summary', 'inv.dur': 'Duration', 'inv.end': 'Estimated end', 'inv.endH': 'If your payment is confirmed today',
    'inv.next': 'What happens next', 'inv.n1': 'You receive the payment instructions.', 'inv.n2': 'You pay, then send your receipt (image or PDF) in the chat.', 'inv.n3': 'The administrator checks that the funds really arrived, then confirms.', 'inv.n4': 'You are notified of the decision.',
    'inv.create': 'Create my request', 'inv.kycT': 'Verify your identity first', 'inv.kycD': 'An identity check is required before choosing a plan.', 'inv.kycGo': 'Verify my identity', 'inv.rangeErr': 'Enter an amount between {min} and {max} OMR.',
    'inv.ref': 'Reference', 'inv.status': 'Status', 'inv.st.AWAITING_PAYMENT': 'Awaiting payment', 'inv.st.PROOF_SENT': 'Receipt sent, awaiting verification', 'inv.st.ACTIVE': 'Active', 'inv.st.MATURED': 'Ended, awaiting settlement', 'inv.st.SETTLED': 'Settled', 'inv.st.REJECTED': 'Not confirmed', 'inv.st.CANCELLED': 'Cancelled',
    'inv.pay': 'Payment instructions', 'inv.payNone': 'The payment instructions are not configured yet. Contact the administrator in the chat.', 'inv.payHint': 'Write the reference {r} in the transfer reason.', 'inv.bank': 'Bank', 'inv.holder': 'Account name', 'inv.acc': 'Account number', 'inv.iban': 'IBAN', 'inv.swift': 'SWIFT',
    'inv.send': 'Send the receipt', 'inv.sendMore': 'Send another receipt', 'inv.sendHint': 'Image or PDF, 10 MB maximum. It is sent in the support chat.', 'inv.sent': 'Receipt sent. The administrator will verify that the funds arrived. Nothing is confirmed yet.', 'inv.openChat': 'Open the chat', 'inv.cancel': 'Cancel this request', 'inv.cancelQ': 'Cancel this request?', 'inv.cancelled': 'Request cancelled', 'inv.fileBig': 'File too large (10 MB maximum).', 'inv.fileType': 'Choose an image or a PDF.', 'inv.up1': 'Sending the file', 'inv.up2': 'Sending it in the chat', 'inv.up3': 'Attaching it to your request',
    'inv.tl.created': 'Request created', 'inv.tl.proof': 'Receipt sent', 'inv.tl.conf': 'Confirmed by the administrator', 'inv.tl.confW': 'Waiting for the administrator', 'inv.tl.rej': 'Not confirmed', 'inv.tl.run': 'Plan running until {d}', 'inv.tl.end': 'Plan ended', 'inv.tl.settled': 'Settled: {a} OMR credited',
    'inv.payout': 'Amount credited', 'inv.principal': 'Capital', 'inv.reason': 'Reason', 'inv.copied': 'Copied'
  },
  fr: {
    'fl.loadErr': 'Chargement impossible. Vérifiez votre connexion.', 'fl.copy': 'Copier', 'fl.back': 'Retour', 'fl.cont': 'Continuer', 'fl.omr': 'OMR',
    'fl.e.kyc_required': 'Vérifiez d’abord votre identité.', 'fl.e.plan_unavailable': 'Ce plan n’est pas disponible.', 'fl.e.amount_out_of_range': 'Ce montant est hors de la plage autorisée.', 'fl.e.too_many_open': 'Trop de demandes ouvertes. Terminez ou annulez-en une.', 'fl.e.invest_disabled': 'Les plans sont suspendus par l’administrateur.',
    'fl.e.invalid_holder': 'Saisissez le nom du titulaire.', 'fl.e.invalid_bank': 'Choisissez une banque.', 'fl.e.invalid_account': 'Vérifiez le numéro de compte.', 'fl.e.invalid_iban': 'Cet IBAN n’est pas valide.', 'fl.e.insufficient_balance': 'Votre solde disponible est insuffisant.', 'fl.e.withdraw_disabled': 'Les retraits sont suspendus par l’administrateur.',
    'fl.e.request_pending': 'Une demande est déjà en cours d’examen.', 'fl.e.already_verified': 'Votre identité est déjà vérifiée.', 'fl.e.invalid_media': 'Un fichier a été refusé. Reprenez-le.', 'fl.e.invalid_state': 'Cette demande ne peut plus être modifiée.', 'fl.e.proof_not_found': 'Le reçu est introuvable. Renvoyez-le.', 'fl.e.not_found': 'Introuvable.', 'fl.e.rate_limited': 'Trop rapide. Patientez un instant.', 'fl.e.forbidden': 'Cette action est réservée.',
    'inv.title': 'Plans', 'inv.hero': 'Votre portefeuille', 'inv.active': 'Capital actif', 'inv.pending': 'En attente de paiement', 'inv.settled': 'Réglé', 'inv.gains': 'Gains réalisés', 'inv.donut': 'Capital', 'inv.mine': 'Mes plans', 'inv.plans': 'Choisir un plan',
    'inv.range': '{min} à {max} OMR', 'inv.days': '{n} jours', 'inv.choose': 'Choisir', 'inv.unavail': 'Indisponible', 'inv.noRet': 'Rendement non défini', 'inv.ret': 'Rendement validé {p} %', 'inv.retNote': 'Le rendement n’est pas défini : aucun gain n’est annoncé. Un gain n’apparaît que si l’administrateur a défini et validé le modèle financier.',
    'inv.emptyT': 'Aucun plan pour l’instant', 'inv.emptyD': 'Vos plans apparaîtront ici dès que vous en créerez un. Rien n’est investi et aucun gain n’est annoncé.', 'inv.new': 'Nouveau plan', 'inv.amount': 'Montant', 'inv.amountH': 'Entre {min} et {max} OMR', 'inv.recap': 'Récapitulatif', 'inv.dur': 'Durée', 'inv.end': 'Fin estimée', 'inv.endH': 'Si votre paiement est confirmé aujourd’hui',
    'inv.next': 'Et ensuite', 'inv.n1': 'Vous recevez les instructions de paiement.', 'inv.n2': 'Vous payez, puis vous envoyez votre reçu (image ou PDF) dans le chat.', 'inv.n3': 'L’administrateur vérifie que les fonds sont réellement arrivés, puis confirme.', 'inv.n4': 'Vous êtes prévenu de la décision.',
    'inv.create': 'Créer ma demande', 'inv.kycT': 'Vérifiez d’abord votre identité', 'inv.kycD': 'Une vérification d’identité est nécessaire avant de choisir un plan.', 'inv.kycGo': 'Vérifier mon identité', 'inv.rangeErr': 'Saisissez un montant entre {min} et {max} OMR.',
    'inv.ref': 'Référence', 'inv.status': 'Statut', 'inv.st.AWAITING_PAYMENT': 'En attente de paiement', 'inv.st.PROOF_SENT': 'Reçu envoyé, en attente de vérification', 'inv.st.ACTIVE': 'Actif', 'inv.st.MATURED': 'Terminé, en attente de règlement', 'inv.st.SETTLED': 'Réglé', 'inv.st.REJECTED': 'Non confirmé', 'inv.st.CANCELLED': 'Annulé',
    'inv.pay': 'Instructions de paiement', 'inv.payNone': 'Les instructions de paiement ne sont pas encore configurées. Contactez l’administrateur dans le chat.', 'inv.payHint': 'Indiquez la référence {r} comme motif du virement.', 'inv.bank': 'Banque', 'inv.holder': 'Nom du compte', 'inv.acc': 'Numéro de compte', 'inv.iban': 'IBAN', 'inv.swift': 'SWIFT',
    'inv.send': 'Envoyer le reçu', 'inv.sendMore': 'Envoyer un autre reçu', 'inv.sendHint': 'Image ou PDF, 10 Mo maximum. Il est envoyé dans le chat d’assistance.', 'inv.sent': 'Reçu envoyé. L’administrateur va vérifier que les fonds sont arrivés. Rien n’est encore confirmé.', 'inv.openChat': 'Ouvrir le chat', 'inv.cancel': 'Annuler cette demande', 'inv.cancelQ': 'Annuler cette demande ?', 'inv.cancelled': 'Demande annulée', 'inv.fileBig': 'Fichier trop lourd (10 Mo maximum).', 'inv.fileType': 'Choisissez une image ou un PDF.', 'inv.up1': 'Envoi du fichier', 'inv.up2': 'Envoi dans le chat', 'inv.up3': 'Rattachement à votre demande',
    'inv.tl.created': 'Demande créée', 'inv.tl.proof': 'Reçu envoyé', 'inv.tl.conf': 'Confirmé par l’administrateur', 'inv.tl.confW': 'En attente de l’administrateur', 'inv.tl.rej': 'Non confirmé', 'inv.tl.run': 'Plan en cours jusqu’au {d}', 'inv.tl.end': 'Plan terminé', 'inv.tl.settled': 'Réglé : {a} OMR crédités',
    'inv.payout': 'Montant crédité', 'inv.principal': 'Capital', 'inv.reason': 'Motif', 'inv.copied': 'Copié'
  },
  ar: {
    'fl.loadErr': 'تعذّر التحميل. تحقق من اتصالك.', 'fl.copy': 'نسخ', 'fl.back': 'رجوع', 'fl.cont': 'متابعة', 'fl.omr': 'ر.ع',
    'fl.e.kyc_required': 'وثّق هويتك أولاً.', 'fl.e.plan_unavailable': 'هذه الخطة غير متاحة.', 'fl.e.amount_out_of_range': 'هذا المبلغ خارج النطاق المسموح.', 'fl.e.too_many_open': 'طلبات مفتوحة كثيرة. أنهِ أحدها أو ألغه.', 'fl.e.invest_disabled': 'الخطط متوقفة من قِبل المسؤول.',
    'fl.e.invalid_holder': 'أدخل اسم صاحب الحساب.', 'fl.e.invalid_bank': 'اختر بنكاً.', 'fl.e.invalid_account': 'تحقق من رقم الحساب.', 'fl.e.invalid_iban': 'رقم الآيبان غير صالح.', 'fl.e.insufficient_balance': 'رصيدك المتاح غير كافٍ.', 'fl.e.withdraw_disabled': 'السحب متوقف من قِبل المسؤول.',
    'fl.e.request_pending': 'يوجد طلب قيد المراجعة.', 'fl.e.already_verified': 'تم توثيق هويتك بالفعل.', 'fl.e.invalid_media': 'تم رفض ملف. أعد التقاطه.', 'fl.e.invalid_state': 'لا يمكن تعديل هذا الطلب بعد الآن.', 'fl.e.proof_not_found': 'لم يتم العثور على الإيصال. أعد إرساله.', 'fl.e.not_found': 'غير موجود.', 'fl.e.rate_limited': 'سريع جداً. انتظر لحظة.', 'fl.e.forbidden': 'هذا الإجراء محجوز.',
    'inv.title': 'الخطط', 'inv.hero': 'محفظتك', 'inv.active': 'رأس المال النشط', 'inv.pending': 'بانتظار الدفع', 'inv.settled': 'تمت التسوية', 'inv.gains': 'الأرباح المحققة', 'inv.donut': 'رأس المال', 'inv.mine': 'خططي', 'inv.plans': 'اختر خطة',
    'inv.range': 'من {min} إلى {max} ر.ع', 'inv.days': '{n} يوماً', 'inv.choose': 'اختيار', 'inv.unavail': 'غير متاحة', 'inv.noRet': 'العائد غير محدد', 'inv.ret': 'عائد معتمد {p}%', 'inv.retNote': 'العائد غير محدد: لا يُعلن أي ربح. لا يظهر الربح إلا إذا حدّد المسؤول النموذج المالي واعتمده.',
    'inv.emptyT': 'لا توجد خطط بعد', 'inv.emptyD': 'ستظهر خططك هنا بمجرد إنشاء خطة. لا شيء مستثمر ولا يُعلن أي ربح.', 'inv.new': 'خطة جديدة', 'inv.amount': 'المبلغ', 'inv.amountH': 'بين {min} و{max} ر.ع', 'inv.recap': 'الملخص', 'inv.dur': 'المدة', 'inv.end': 'النهاية المقدّرة', 'inv.endH': 'إذا تم تأكيد دفعتك اليوم',
    'inv.next': 'ماذا بعد', 'inv.n1': 'تصلك تعليمات الدفع.', 'inv.n2': 'تدفع ثم ترسل إيصالك (صورة أو PDF) في الدردشة.', 'inv.n3': 'يتحقق المسؤول من وصول الأموال فعلاً ثم يؤكد.', 'inv.n4': 'يصلك إشعار بالقرار.',
    'inv.create': 'إنشاء طلبي', 'inv.kycT': 'وثّق هويتك أولاً', 'inv.kycD': 'التحقق من الهوية مطلوب قبل اختيار خطة.', 'inv.kycGo': 'توثيق هويتي', 'inv.rangeErr': 'أدخل مبلغاً بين {min} و{max} ر.ع.',
    'inv.ref': 'المرجع', 'inv.status': 'الحالة', 'inv.st.AWAITING_PAYMENT': 'بانتظار الدفع', 'inv.st.PROOF_SENT': 'تم إرسال الإيصال، بانتظار التحقق', 'inv.st.ACTIVE': 'نشطة', 'inv.st.MATURED': 'انتهت، بانتظار التسوية', 'inv.st.SETTLED': 'تمت التسوية', 'inv.st.REJECTED': 'لم يتم التأكيد', 'inv.st.CANCELLED': 'ملغاة',
    'inv.pay': 'تعليمات الدفع', 'inv.payNone': 'لم تُضبط تعليمات الدفع بعد. تواصل مع المسؤول في الدردشة.', 'inv.payHint': 'اكتب المرجع {r} في سبب التحويل.', 'inv.bank': 'البنك', 'inv.holder': 'اسم الحساب', 'inv.acc': 'رقم الحساب', 'inv.iban': 'الآيبان', 'inv.swift': 'سويفت',
    'inv.send': 'إرسال الإيصال', 'inv.sendMore': 'إرسال إيصال آخر', 'inv.sendHint': 'صورة أو PDF، بحد أقصى 10 ميغابايت. يُرسل في دردشة الدعم.', 'inv.sent': 'تم إرسال الإيصال. سيتحقق المسؤول من وصول الأموال. لم يتم تأكيد أي شيء بعد.', 'inv.openChat': 'فتح الدردشة', 'inv.cancel': 'إلغاء هذا الطلب', 'inv.cancelQ': 'إلغاء هذا الطلب؟', 'inv.cancelled': 'تم إلغاء الطلب', 'inv.fileBig': 'الملف كبير جداً (10 ميغابايت كحد أقصى).', 'inv.fileType': 'اختر صورة أو ملف PDF.', 'inv.up1': 'جارٍ إرسال الملف', 'inv.up2': 'جارٍ إرساله في الدردشة', 'inv.up3': 'جارٍ ربطه بطلبك',
    'inv.tl.created': 'تم إنشاء الطلب', 'inv.tl.proof': 'تم إرسال الإيصال', 'inv.tl.conf': 'تم التأكيد من المسؤول', 'inv.tl.confW': 'بانتظار المسؤول', 'inv.tl.rej': 'لم يتم التأكيد', 'inv.tl.run': 'الخطة سارية حتى {d}', 'inv.tl.end': 'انتهت الخطة', 'inv.tl.settled': 'تمت التسوية: أُضيف {a} ر.ع',
    'inv.payout': 'المبلغ المضاف', 'inv.principal': 'رأس المال', 'inv.reason': 'السبب', 'inv.copied': 'تم النسخ'
  }
});

const Invest = (() => {
  const F = Flow, esc = F.esc;
  const S = { data: null, loading: false, err: false, plan: null, amount: '', cur: null, pay: null, busy: false, kycNeeded: false, proofBusy: false, sentNote: false };
  const PLAN_IC = { ESSENTIAL: 'wallet', GROWTH: 'trend', PREMIUM: 'shield' };
  const STC = { AWAITING_PAYMENT: 'wait', PROOF_SENT: 'wait', ACTIVE: 'ok', MATURED: 'ok', SETTLED: 'ok', REJECTED: 'bad', CANCELLED: 'off' };

  async function load(force){
    if (S.loading) return S.data;
    S.loading = true; S.err = false;
    const r = await Guardian.rpc('invest_overview', {}, { retries: 1 });
    S.loading = false;
    if (r.ok && r.data && typeof r.data === 'object'){ S.data = { items: Guardian.norm.arr(r.data.items), totals: Guardian.norm.obj(r.data.totals), plans: Guardian.norm.arr(r.data.plans) }; } else { S.err = !S.data; }
    return S.data;
  }
  const items = () => (S.data ? S.data.items : []);
  const plans = () => (S.data ? S.data.plans : []);
  const planOf = c => plans().find(p => p.code === c) || null;
  const planName = c => { const p = planOf(c); return p ? F.loc(p.name) : String(c || ''); };
  const retBadge = p => (p && p.model_validated && Number(p.return_pct) > 0 ? '<span class="fl-badge ok">' + esc(tf('inv.ret', { p: F.pct(p.return_pct) })) + '</span>' : '<span class="fl-badge muted">' + esc(t('inv.noRet')) + '</span>');
  const stBadge = s => '<span class="fl-badge ' + (STC[s] || 'muted') + '">' + esc(t('inv.st.' + s)) + '</span>';

  /* ---------- écran : plans ---------- */
  function planCard(p, i){
    const on = p.active !== false;
    return '<article class="fl-plan' + (on ? '' : ' off') + ' fl-in" style="--i:' + i + '"><header><i>' + F.ic(PLAN_IC[p.code] || 'wallet', 22) + '</i><div><h3>' + esc(F.loc(p.name)) + '</h3>' + retBadge(p) + '</div></header>' +
      '<p>' + esc(F.loc(p.justification)) + '</p>' +
      '<dl><div><dt>' + esc(t('inv.amount')) + '</dt><dd class="ltr" dir="ltr">' + esc(tf('inv.range', { min: F.grp(p.min), max: F.grp(p.max) })) + '</dd></div><div><dt>' + esc(t('inv.dur')) + '</dt><dd>' + esc(tf('inv.days', { n: p.days })) + '</dd></div></dl>' +
      '<button type="button" class="btn ' + (on ? 'btn-primary' : 'btn-secondary') + '" data-fl-plan="' + esc(p.code) + '"' + (on ? '' : ' disabled') + '>' + esc(on ? t('inv.choose') : t('inv.unavail')) + '</button></article>';
  }
  function itemCard(it, i){
    return '<button type="button" class="fl-item fl-in" style="--i:' + i + '" data-fl-open="' + esc(it.id) + '"><div><b>' + esc(planName(it.plan)) + '</b><small class="ltr" dir="ltr">' + esc(it.reference) + '</small></div><div class="fl-item-r"><b class="ltr" dir="ltr">' + esc(F.grp(it.amount)) + ' ' + esc(t('fl.omr')) + '</b>' + stBadge(it.status) + '</div><span class="fl-chev">' + F.ic('chev', 16) + '</span></button>';
  }
  function plansBody(){
    if (S.err) return F.errCard('data-fl-retry');
    if (!S.data) return F.skeleton();
    const tt = S.data.totals, a = Number(tt.active) || 0, p = Number(tt.pending) || 0, s = Number(tt.settled) || 0, g = Number(tt.gains) || 0;
    const any = a + p + s > 0;
    const hero = '<section class="fl-card fl-hero fl-in"><h2>' + esc(t('inv.hero')) + '</h2><div class="fl-hero-in">' +
      (any ? F.donut([{ value: a, cls: 'a' }, { value: p, cls: 'p' }, { value: s, cls: 's' }], t('inv.donut'), F.grp(a + p + s)) : '') +
      '<div class="fl-stats">' + F.stat(t('inv.active'), a, 'a') + F.stat(t('inv.pending'), p, 'p') + F.stat(t('inv.settled'), s, 's') + F.stat(t('inv.gains'), g, 'g') + '</div></div></section>';
    const note = '<p class="fl-note">' + F.ic('shield', 16) + '<span>' + esc(t('inv.retNote')) + '</span></p>';
    const pl = '<section><h2 class="fl-h">' + esc(t('inv.plans')) + '</h2><div class="fl-plans">' + plans().map(planCard).join('') + '</div></section>';
    const mine = '<section><h2 class="fl-h">' + esc(t('inv.mine')) + '</h2>' + (items().length ? '<div class="fl-list">' + items().map(itemCard).join('') + '</div>' : F.empty('trend', t('inv.emptyT'), t('inv.emptyD'))) + '</section>';
    return hero + note + pl + mine;
  }
  function renderPlans(){ return '<div class="fl-screen" data-fl="invest">' + F.top(t('inv.title')) + '<div class="screen-body fl-body">' + plansBody() + '</div></div>'; }

  /* ---------- écran : nouvelle demande ---------- */
  const stepFor = p => { const mn = Number(p.min), mx = Number(p.max), r = mx - mn; return r > 200000 ? 1000 : r > 20000 ? 500 : r > 2000 ? 50 : r > 200 ? 10 : 1; };
  function amountOk(p){ const v = Number(String(S.amount).replace(',', '.')); return Number.isFinite(v) && v >= Number(p.min) && v <= Number(p.max) ? v : null; }
  function newBody(){
    const p = planOf(S.plan);
    if (!S.data && !S.err) return F.skeleton();
    if (S.err) return F.errCard('data-fl-retry');
    if (!p) return '<div class="fl-plans">' + plans().map(planCard).join('') + '</div>';
    const v = amountOk(p), end = new Date(Date.now() + p.days * 864e5);
    const kyc = S.kycNeeded ? '<div class="fl-card fl-alert fl-in"><i>' + F.ic('id', 24) + '</i><div><b>' + esc(t('inv.kycT')) + '</b><p>' + esc(t('inv.kycD')) + '</p><button type="button" class="btn btn-primary" data-fl-kyc>' + esc(t('inv.kycGo')) + '</button></div></div>' : '';
    return kyc + '<section class="fl-card fl-in"><div class="fl-plan-h"><i>' + F.ic(PLAN_IC[p.code] || 'wallet', 22) + '</i><div><h3>' + esc(F.loc(p.name)) + '</h3><small>' + esc(F.loc(p.justification)) + '</small></div><button type="button" class="fl-link" data-fl-change>' + esc(t('inv.choose')) + '</button></div>' +
      '<label class="field-label" for="fl-amt">' + esc(t('inv.amount')) + '</label><div class="field-box fl-amt"><input id="fl-amt" type="text" inputmode="decimal" dir="ltr" autocomplete="off" value="' + esc(S.amount) + '" placeholder="' + esc(F.grp(p.min)) + '" aria-describedby="fl-amt-h"><span>' + esc(t('fl.omr')) + '</span></div>' +
      '<input type="range" id="fl-rng" class="fl-range" min="' + p.min + '" max="' + p.max + '" step="' + stepFor(p) + '" value="' + (v || p.min) + '" aria-label="' + esc(t('inv.amount')) + '">' +
      '<div class="fl-hint" id="fl-amt-h">' + esc(tf('inv.amountH', { min: F.grp(p.min), max: F.grp(p.max) })) + '</div><div class="field-err" id="fl-err" role="alert"></div></section>' +
      '<section class="fl-card fl-in" style="--i:1"><h3 class="fl-h2">' + esc(t('inv.recap')) + '</h3><div class="fl-kv"><span>' + esc(t('inv.dur')) + '</span><b>' + esc(tf('inv.days', { n: p.days })) + '</b></div><div class="fl-kv"><span>' + esc(t('inv.end')) + '</span><b>' + esc(F.date(end)) + '</b></div><small class="fl-hint">' + esc(t('inv.endH')) + '</small><div class="fl-kv"><span>' + esc(t('inv.noRet')) + '</span>' + retBadge(p) + '</div></section>' +
      '<section class="fl-card fl-in" style="--i:2"><h3 class="fl-h2">' + esc(t('inv.next')) + '</h3><ol class="fl-steps">' + [1, 2, 3, 4].map(n => '<li><i>' + n + '</i><span>' + esc(t('inv.n' + n)) + '</span></li>').join('') + '</ol></section>' +
      '<button type="button" class="btn btn-primary fl-cta" data-fl-create' + (v ? '' : ' disabled') + '>' + esc(t('inv.create')) + '</button>';
  }
  function renderNew(){ return '<div class="fl-screen" data-fl="invest-new">' + F.top(t('inv.new')) + '<div class="screen-body fl-body">' + newBody() + '</div></div>'; }

  /* ---------- écran : dossier / paiement ---------- */
  const cur = () => items().find(i => i.id === S.cur) || null;
  function instrRows(pi, it){
    const f = [['inv.bank', pi.bank_name], ['inv.holder', pi.account_name], ['inv.acc', pi.account_number], ['inv.iban', pi.iban], ['inv.swift', pi.swift]].filter(x => String(x[1] || '').trim());
    if (!f.length) return '<p class="fl-hint">' + esc(t('inv.payNone')) + '</p>';
    const note = String(pi['note_' + LANG] || pi.note_en || '').trim();
    return f.map(x => '<div class="fl-copy"><div><small>' + esc(t(x[0])) + '</small><b class="ltr" dir="ltr">' + esc(x[1]) + '</b></div><button type="button" class="fl-ibtn" data-fl-copy="' + esc(x[1]) + '" aria-label="' + esc(t('fl.copy')) + '">' + F.ic('copy', 18) + '</button></div>').join('') +
      '<div class="fl-copy ref"><div><small>' + esc(t('inv.ref')) + '</small><b class="ltr" dir="ltr">' + esc(it.reference) + '</b></div><button type="button" class="fl-ibtn" data-fl-copy="' + esc(it.reference) + '" aria-label="' + esc(t('fl.copy')) + '">' + F.ic('copy', 18) + '</button></div>' +
      '<p class="fl-note">' + F.ic('file', 16) + '<span>' + esc(tf('inv.payHint', { r: it.reference })) + '</span></p>' + (note ? '<p class="fl-hint">' + esc(note) + '</p>' : '');
  }
  function timelineFor(it){
    const st = it.status, rej = st === 'REJECTED', can = st === 'CANCELLED', ended = ['MATURED', 'SETTLED'].indexOf(st) !== -1 || (st === 'ACTIVE' && it.ends_at && new Date(it.ends_at) <= new Date());
    const s = [{ t: t('inv.tl.created'), d: F.dtime(it.created_at), st: 'done' }];
    s.push({ t: t('inv.tl.proof'), d: it.proof_sent_at ? F.dtime(it.proof_sent_at) : '', st: it.proof_sent_at ? 'done' : (can ? 'todo' : 'current') });
    if (rej) s.push({ t: t('inv.tl.rej'), d: F.dtime(it.confirmed_at), st: 'bad' });
    else if (can) s.push({ t: t('inv.st.CANCELLED'), d: '', st: 'bad' });
    else {
      s.push({ t: it.confirmed_at ? t('inv.tl.conf') : t('inv.tl.confW'), d: it.confirmed_at ? F.dtime(it.confirmed_at) : '', st: it.confirmed_at ? 'done' : (it.proof_sent_at ? 'current' : 'todo') });
      s.push({ t: ended ? t('inv.tl.end') : tf('inv.tl.run', { d: it.ends_at ? F.date(it.ends_at) : '…' }), d: '', st: ended ? 'done' : (it.confirmed_at ? 'current' : 'todo') });
      s.push({ t: it.status === 'SETTLED' ? tf('inv.tl.settled', { a: F.dec(it.payout) }) : t('inv.st.SETTLED'), d: it.settled_at ? F.dtime(it.settled_at) : '', st: it.status === 'SETTLED' ? 'done' : (ended ? 'current' : 'todo') });
    }
    return F.timeline(s);
  }
  function payBody(){
    const it = cur();
    if (!S.data && !S.err) return F.skeleton();
    if (!it) return S.err ? F.errCard('data-fl-retry') : F.empty('file', t('inv.emptyT'), t('inv.emptyD'));
    const open = it.status === 'AWAITING_PAYMENT' || it.status === 'PROOF_SENT';
    const ret = it.model_validated && Number(it.return_pct) > 0 ? '<div class="fl-kv"><span>' + esc(tf('inv.ret', { p: F.pct(it.return_pct) })) + '</span></div>' : '';
    const head = '<section class="fl-card fl-in"><div class="fl-ref"><div><small>' + esc(planName(it.plan)) + '</small><b class="ltr" dir="ltr">' + esc(it.reference) + '</b></div>' + stBadge(it.status) + '</div>' +
      '<div class="fl-kv"><span>' + esc(t('inv.amount')) + '</span><b class="ltr" dir="ltr">' + esc(F.dec(it.amount)) + ' ' + esc(t('fl.omr')) + '</b></div><div class="fl-kv"><span>' + esc(t('inv.dur')) + '</span><b>' + esc(tf('inv.days', { n: it.duration_days })) + '</b></div>' + ret +
      (it.status === 'SETTLED' ? '<div class="fl-kv"><span>' + esc(t('inv.payout')) + '</span><b class="ltr" dir="ltr">' + esc(F.dec(it.payout)) + ' ' + esc(t('fl.omr')) + '</b></div>' : '') +
      (it.status === 'REJECTED' && it.rejected_reason ? '<p class="fl-note bad">' + F.ic('x', 16) + '<span>' + esc(t('inv.reason')) + ' : ' + esc(it.rejected_reason) + '</span></p>' : '') + '</section>';
    const pay = open ? '<section class="fl-card fl-in" style="--i:1"><h3 class="fl-h2">' + esc(t('inv.pay')) + '</h3>' + (S.pay ? instrRows(S.pay, it) : F.skeleton()) + '</section>' : '';
    const send = open ? '<section class="fl-card fl-in" style="--i:2"><h3 class="fl-h2">' + esc(t(it.status === 'PROOF_SENT' ? 'inv.sendMore' : 'inv.send')) + '</h3><p class="fl-hint">' + esc(t('inv.sendHint')) + '</p>' +
      (S.sentNote || it.status === 'PROOF_SENT' ? '<p class="fl-note ok">' + F.ic('clock', 16) + '<span>' + esc(t('inv.sent')) + '</span></p>' : '') +
      '<div class="fl-prog" id="fl-prog" hidden><i></i><span></span></div>' +
      '<input type="file" id="fl-file" accept="image/*,application/pdf" hidden><div class="fl-row"><button type="button" class="btn btn-primary" data-fl-send>' + F.ic('upload', 18) + '<span>' + esc(t(it.status === 'PROOF_SENT' ? 'inv.sendMore' : 'inv.send')) + '</span></button><button type="button" class="btn btn-secondary" data-fl-chat>' + esc(t('inv.openChat')) + '</button></div><div class="field-err" id="fl-err" role="alert"></div></section>' : '';
    const tl = '<section class="fl-card fl-in" style="--i:3">' + timelineFor(it) + '</section>';
    const cancel = open ? '<button type="button" class="btn btn-ghost fl-danger" data-fl-cancel>' + esc(t('inv.cancel')) + '</button>' : '';
    return head + pay + send + tl + cancel;
  }
  function renderPay(){ return '<div class="fl-screen" data-fl="invest-pay">' + F.top(t('inv.title')) + '<div class="screen-body fl-body">' + payBody() + '</div></div>'; }

  /* ---------- câblage ---------- */
  const bodyOf = id => { const sc = document.querySelector('.screen.active [data-fl="' + id + '"] .fl-body'); return sc; };
  function repaint(id, fn){ const b = bodyOf(id); if (b){ b.innerHTML = fn(); wire(id, b); } }
  function wire(id, b){
    F.countAll(b);
    b.querySelectorAll('[data-fl-retry]').forEach(x => { x.onclick = async () => { S.err = false; repaintFor(id); await load(); repaintFor(id); }; });
    b.querySelectorAll('[data-fl-plan]').forEach(x => { x.onclick = () => { S.plan = x.getAttribute('data-fl-plan'); const p = planOf(S.plan); S.amount = p ? String(p.min) : ''; S.kycNeeded = false; F.hap('tap'); R.go('invest-new'); }; });
    b.querySelectorAll('[data-fl-open]').forEach(x => { x.onclick = () => { S.cur = x.getAttribute('data-fl-open'); S.sentNote = false; F.hap('tap'); R.go('invest-pay'); }; });
    if (id === 'invest-new') wireNew(b);
    if (id === 'invest-pay') wirePay(b);
  }
  const repaintFor = id => repaint(id, id === 'invest' ? plansBody : id === 'invest-new' ? newBody : payBody);
  function wireNew(b){
    const p = planOf(S.plan); if (!p) return;
    const inp = b.querySelector('#fl-amt'), rng = b.querySelector('#fl-rng'), cta = b.querySelector('[data-fl-create]'), err = b.querySelector('#fl-err');
    const upd = () => { const ok = amountOk(p); if (cta) cta.disabled = !ok; if (err) err.textContent = (!ok && String(S.amount).length) ? tf('inv.rangeErr', { min: F.grp(p.min), max: F.grp(p.max) }) : ''; };
    if (inp) inp.oninput = () => { inp.value = inp.value.replace(/[^0-9.,]/g, ''); S.amount = inp.value; const v = amountOk(p); if (v && rng) rng.value = v; upd(); };
    if (rng) rng.oninput = () => { S.amount = rng.value; if (inp) inp.value = rng.value; upd(); F.hap('tap'); };
    const ch = b.querySelector('[data-fl-change]'); if (ch) ch.onclick = () => { S.plan = null; repaint('invest-new', newBody); };
    const kg = b.querySelector('[data-fl-kyc]'); if (kg) kg.onclick = () => { try { Kyc.open(); } catch(e){ R.go('kyc'); } };
    if (cta) cta.onclick = async () => {
      const v = amountOk(p); if (!v || S.busy) return;
      S.busy = true; F.btnBusy(cta, true);
      const r = await Guardian.rpc('invest_create', { p_plan: p.code, p_amount: v, p_key: S.key || (S.key = F.uuid()) }, { retries: 0 });
      S.busy = false; F.btnBusy(cta, false);
      if (r.ok && r.data && r.data.id){
        S.key = null; S.cur = r.data.id; S.sentNote = false; await load(); F.snd('success'); F.hap('success'); R.go('invest-pay'); return;
      }
      const m = String((r.error && r.error.message) || '').toLowerCase();
      if (m.indexOf('kyc_required') !== -1){ S.kycNeeded = true; repaint('invest-new', newBody); return; }
      if (err) err.textContent = F.srvErr(r.error); F.snd('error'); Fx.shake(cta);
    };
  }
  function prog(b, k, n){ const el = b.querySelector('#fl-prog'); if (!el) return; el.hidden = n === 0; el.style.setProperty('--p', (n === 0 ? 0 : [18, 55, 88][k] || 90) + '%'); el.querySelector('span').textContent = n === 0 ? '' : t('inv.up' + (k + 1)); }
  function wirePay(b){
    const it = cur(); if (!it) return;
    b.querySelectorAll('[data-fl-copy]').forEach(x => { x.onclick = () => { F.copyTxt(x.getAttribute('data-fl-copy')); F.hap('tap'); F.snd('tick'); }; });
    const chat = b.querySelector('[data-fl-chat]'); if (chat) chat.onclick = () => { try { if (typeof Chat !== 'undefined' && Chat.openSupport) Chat.openSupport(); else R.go('chat'); } catch(e){ R.go('chat'); } };
    const file = b.querySelector('#fl-file'), send = b.querySelector('[data-fl-send]'), err = b.querySelector('#fl-err');
    if (send && file) send.onclick = () => file.click();
    if (file) file.onchange = async () => {
      const f = file.files && file.files[0]; file.value = ''; if (!f || S.proofBusy) return;
      if (!(/^image\//.test(f.type) || f.type === 'application/pdf')){ err.textContent = t('inv.fileType'); F.snd('error'); return; }
      if (f.size > 10 * 1048576){ err.textContent = t('inv.fileBig'); F.snd('error'); return; }
      err.textContent = ''; S.proofBusy = true; F.btnBusy(send, true); prog(b, 0, 1);
      try {
        const isPdf = f.type === 'application/pdf';
        const blob = isPdf ? f : await F.compress(f, 1600, 0.85), mime = isPdf ? 'application/pdf' : (blob.type || 'image/jpeg');
        if (blob.size > 10 * 1048576) throw new Error('too_big');
        const path = F.uid() + '/' + F.uuid() + '.' + F.extOf(mime);
        const up = await F.upload('chat-media', path, blob, mime); if (!up.ok) throw up.error || new Error('upload');
        prog(b, 1, 1);
        const cs = await Guardian.rpc('chat_send', { p_thread: null, p_kind: isPdf ? 'file' : 'image', p_body: it.reference, p_media_path: path, p_media_mime: mime, p_media_size: blob.size, p_duration_ms: null }, { retries: 0 });
        if (!cs.ok || !cs.data || !cs.data.id) throw cs.error || new Error('chat');
        prog(b, 2, 1);
        const at = await Guardian.rpc('invest_attach_proof', { p_id: it.id, p_message: cs.data.id }, { retries: 0 });
        if (!at.ok) throw at.error || new Error('attach');
        S.sentNote = true; await load(); F.snd('success'); F.hap('success');
        repaint('invest-pay', payBody); toast(t('inv.sent'), 'success');
      } catch(e){
        prog(b, 0, 0); F.btnBusy(send, false); err.textContent = /too_big/.test(String(e && e.message)) ? t('inv.fileBig') : F.srvErr(e && e.message ? e : null); F.snd('error');
      }
      S.proofBusy = false;
    };
    const cn = b.querySelector('[data-fl-cancel]');
    if (cn) cn.onclick = async () => {
      if (!confirm(t('inv.cancelQ'))) return;
      F.btnBusy(cn, true);
      const r = await Guardian.rpc('invest_cancel', { p_id: it.id }, { retries: 0 });
      F.btnBusy(cn, false);
      if (r.ok && r.data && r.data.ok){ await load(); toast(t('inv.cancelled'), 'success'); R.go('invest', { replace: true }); } else toast(F.srvErr(r.error), 'error');
    };
  }
  async function loadPay(){ try { const r = await Guardian.rpc('get_payment_instructions', {}, { retries: 1 }); S.pay = r.ok && r.data && typeof r.data === 'object' ? r.data : {}; } catch(e){ S.pay = {}; } }

  Hooks.on('invest', async root => { const b = bodyOf('invest'); if (b) wire('invest', b); await load(); repaint('invest', plansBody); });
  Hooks.on('invest-new', async root => { const b = bodyOf('invest-new'); if (b) wire('invest-new', b); if (!S.data) { await load(); repaint('invest-new', newBody); } });
  Hooks.on('invest-pay', async root => { const b = bodyOf('invest-pay'); if (b) wire('invest-pay', b); const it0 = cur(); await Promise.all([load(), (it0 && (it0.status === 'AWAITING_PAYMENT' || it0.status === 'PROOF_SENT') ? loadPay() : (S.pay ? Promise.resolve() : loadPay()))]); repaint('invest-pay', payBody); });

  R.register({ invest: renderPlans, 'invest-new': renderNew, 'invest-pay': renderPay });
  R.meta({ invest: { parent: 'services', nav: 'services' }, 'invest-new': { parent: 'invest', nav: 'services' }, 'invest-pay': { parent: 'invest', nav: 'services' } });

  return {
    open(){ R.go('invest'); },
    async myOpenCount(){ const d = await load(); return d ? d.items.filter(i => ['AWAITING_PAYMENT', 'PROOF_SENT', 'ACTIVE', 'MATURED'].indexOf(i.status) !== -1).length : 0; },
    _S: S, _load: load
  };
})();
