'use strict';

/* ============================================================
   RETRAITS (19.0.0) — écran `withdraw` : montant, titulaire, banque omanaise, numéro de compte, IBAN, suivi.
   Les fonds sont réservés dès la demande ; « effectué » n'est affiché que lorsque le serveur renvoie le statut PAID (virement confirmé par
   l'administrateur, avec sa référence bancaire). Tous les chiffres et statuts viennent de withdraw_overview().
   ============================================================ */
Strings.add({
  en: {
    'wd.title': 'Withdrawal', 'wd.avail': 'Available balance', 'wd.reserved': 'Reserved', 'wd.min': 'Minimum {m} OMR', 'wd.amount': 'Amount', 'wd.holder': 'Account holder name', 'wd.bank': 'Bank', 'wd.bankPick': 'Choose a bank', 'wd.bankSearch': 'Search a bank', 'wd.noBank': 'No bank found',
    'wd.acc': 'Account number', 'wd.iban': 'IBAN (optional if the account number is given)', 'wd.ibanOk': 'Valid IBAN', 'wd.consent': 'I confirm that this account is in my name and that the details are correct.', 'wd.reserve': 'The amount is reserved as soon as you submit the request. It is released if the request is declined or cancelled.',
    'wd.submit': 'Request the withdrawal', 'wd.sent': 'Request sent. It is now under review.', 'wd.list': 'My requests', 'wd.emptyT': 'No withdrawal yet', 'wd.emptyD': 'Your withdrawal requests will appear here with their real status.',
    'wd.kycT': 'Verify your identity first', 'wd.kycD': 'An identity check is required before requesting a withdrawal.', 'wd.kycGo': 'Verify my identity', 'wd.off': 'Withdrawals are paused by the administrator.',
    'wd.st.PENDING': 'Under review', 'wd.st.APPROVED': 'Approved, transfer in progress', 'wd.st.PAID': 'Paid', 'wd.st.REJECTED': 'Declined', 'wd.st.CANCELLED': 'Cancelled',
    'wd.tl.req': 'Request sent', 'wd.tl.rev': 'Reviewed by the administrator', 'wd.tl.revW': 'Waiting for the administrator', 'wd.tl.paid': 'Transfer confirmed', 'wd.tl.paidW': 'Waiting for the bank transfer', 'wd.tl.rej': 'Declined', 'wd.tl.can': 'Cancelled', 'wd.bankRef': 'Bank reference',
    'wd.cancel': 'Cancel', 'wd.cancelQ': 'Cancel this request? The amount is released.', 'wd.cancelled': 'Request cancelled', 'wd.copyRef': 'Copy the reference', 'wd.reason': 'Reason',
    'wd.eMin': 'The minimum is {m} OMR.', 'wd.eMax': 'Your available balance is {a} OMR.', 'wd.eHolder': 'Enter the account holder name (3 characters minimum).', 'wd.eBank': 'Choose a bank.', 'wd.eAcc': 'Enter the account number or the IBAN.', 'wd.eIban': 'This IBAN is not valid (Oman: OM + 21 characters).', 'wd.eConsent': 'Please confirm the declaration.'
  },
  fr: {
    'wd.title': 'Retrait', 'wd.avail': 'Solde disponible', 'wd.reserved': 'Réservé', 'wd.min': 'Minimum {m} OMR', 'wd.amount': 'Montant', 'wd.holder': 'Nom du titulaire du compte', 'wd.bank': 'Banque', 'wd.bankPick': 'Choisir une banque', 'wd.bankSearch': 'Rechercher une banque', 'wd.noBank': 'Aucune banque trouvée',
    'wd.acc': 'Numéro de compte', 'wd.iban': 'IBAN (facultatif si le numéro de compte est donné)', 'wd.ibanOk': 'IBAN valide', 'wd.consent': 'Je confirme que ce compte est à mon nom et que les informations sont exactes.', 'wd.reserve': 'Le montant est réservé dès l’envoi de la demande. Il est libéré si la demande est refusée ou annulée.',
    'wd.submit': 'Demander le retrait', 'wd.sent': 'Demande envoyée. Elle est maintenant en cours d’examen.', 'wd.list': 'Mes demandes', 'wd.emptyT': 'Aucun retrait pour l’instant', 'wd.emptyD': 'Vos demandes de retrait apparaîtront ici avec leur statut réel.',
    'wd.kycT': 'Vérifiez d’abord votre identité', 'wd.kycD': 'Une vérification d’identité est nécessaire avant de demander un retrait.', 'wd.kycGo': 'Vérifier mon identité', 'wd.off': 'Les retraits sont suspendus par l’administrateur.',
    'wd.st.PENDING': 'En examen', 'wd.st.APPROVED': 'Approuvé, virement en cours', 'wd.st.PAID': 'Payé', 'wd.st.REJECTED': 'Refusé', 'wd.st.CANCELLED': 'Annulé',
    'wd.tl.req': 'Demande envoyée', 'wd.tl.rev': 'Examinée par l’administrateur', 'wd.tl.revW': 'En attente de l’administrateur', 'wd.tl.paid': 'Virement confirmé', 'wd.tl.paidW': 'En attente du virement bancaire', 'wd.tl.rej': 'Refusée', 'wd.tl.can': 'Annulée', 'wd.bankRef': 'Référence bancaire',
    'wd.cancel': 'Annuler', 'wd.cancelQ': 'Annuler cette demande ? Le montant est libéré.', 'wd.cancelled': 'Demande annulée', 'wd.copyRef': 'Copier la référence', 'wd.reason': 'Motif',
    'wd.eMin': 'Le minimum est de {m} OMR.', 'wd.eMax': 'Votre solde disponible est de {a} OMR.', 'wd.eHolder': 'Saisissez le nom du titulaire (3 caractères minimum).', 'wd.eBank': 'Choisissez une banque.', 'wd.eAcc': 'Saisissez le numéro de compte ou l’IBAN.', 'wd.eIban': 'Cet IBAN n’est pas valide (Oman : OM + 21 caractères).', 'wd.eConsent': 'Veuillez confirmer la déclaration.'
  },
  ar: {
    'wd.title': 'السحب', 'wd.avail': 'الرصيد المتاح', 'wd.reserved': 'محجوز', 'wd.min': 'الحد الأدنى {m} ر.ع', 'wd.amount': 'المبلغ', 'wd.holder': 'اسم صاحب الحساب', 'wd.bank': 'البنك', 'wd.bankPick': 'اختر بنكاً', 'wd.bankSearch': 'ابحث عن بنك', 'wd.noBank': 'لم يتم العثور على بنك',
    'wd.acc': 'رقم الحساب', 'wd.iban': 'الآيبان (اختياري إذا أُدخل رقم الحساب)', 'wd.ibanOk': 'آيبان صالح', 'wd.consent': 'أؤكد أن هذا الحساب باسمي وأن البيانات صحيحة.', 'wd.reserve': 'يُحجز المبلغ بمجرد إرسال الطلب. ويُفرج عنه إذا رُفض الطلب أو أُلغي.',
    'wd.submit': 'طلب السحب', 'wd.sent': 'تم إرسال الطلب. هو الآن قيد المراجعة.', 'wd.list': 'طلباتي', 'wd.emptyT': 'لا توجد عمليات سحب بعد', 'wd.emptyD': 'ستظهر طلبات السحب هنا بحالتها الحقيقية.',
    'wd.kycT': 'وثّق هويتك أولاً', 'wd.kycD': 'التحقق من الهوية مطلوب قبل طلب السحب.', 'wd.kycGo': 'توثيق هويتي', 'wd.off': 'السحب متوقف من قِبل المسؤول.',
    'wd.st.PENDING': 'قيد المراجعة', 'wd.st.APPROVED': 'تمت الموافقة، التحويل جارٍ', 'wd.st.PAID': 'تم الدفع', 'wd.st.REJECTED': 'مرفوض', 'wd.st.CANCELLED': 'ملغى',
    'wd.tl.req': 'تم إرسال الطلب', 'wd.tl.rev': 'راجعه المسؤول', 'wd.tl.revW': 'بانتظار المسؤول', 'wd.tl.paid': 'تم تأكيد التحويل', 'wd.tl.paidW': 'بانتظار التحويل المصرفي', 'wd.tl.rej': 'مرفوض', 'wd.tl.can': 'ملغى', 'wd.bankRef': 'مرجع التحويل المصرفي',
    'wd.cancel': 'إلغاء', 'wd.cancelQ': 'إلغاء هذا الطلب؟ سيُفرج عن المبلغ.', 'wd.cancelled': 'تم إلغاء الطلب', 'wd.copyRef': 'نسخ المرجع', 'wd.reason': 'السبب',
    'wd.eMin': 'الحد الأدنى {m} ر.ع.', 'wd.eMax': 'رصيدك المتاح {a} ر.ع.', 'wd.eHolder': 'أدخل اسم صاحب الحساب (3 أحرف على الأقل).', 'wd.eBank': 'اختر بنكاً.', 'wd.eAcc': 'أدخل رقم الحساب أو الآيبان.', 'wd.eIban': 'الآيبان غير صالح (عُمان: OM + 21 خانة).', 'wd.eConsent': 'يرجى تأكيد الإقرار.'
  }
});

const Withdraw = (() => {
  const F = Flow, esc = F.esc;
  const S = { data: null, kyc: null, loading: false, err: false, busy: false, key: null, f: { amount: '', holder: '', bank: '', acc: '', iban: '', ok: false }, errs: {} };

  /* IBAN omanais : OM + 2 chiffres de contrôle + 19 alphanumériques ; mod 97 (identique au serveur) */
  const cleanIban = v => String(v || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 23);
  const fmtIban = v => cleanIban(v).replace(/(.{4})/g, '$1 ').trim();
  function ibanValid(v){
    const s = cleanIban(v); if (!s) return true;
    if (!/^OM[0-9]{2}[0-9A-Z]{19}$/.test(s)) return false;
    const r = s.slice(4) + s.slice(0, 4); let rem = 0;
    for (const ch of r){ const d = /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55); for (const c of d) rem = (rem * 10 + (c.charCodeAt(0) - 48)) % 97; }
    return rem === 1;
  }

  async function load(){
    S.loading = true; S.err = false;
    const [a, k] = await Promise.all([Guardian.rpc('withdraw_overview', {}, { retries: 1 }), Guardian.rpc('kyc_status', {}, { retries: 1 })]);
    S.loading = false;
    if (a.ok && a.data && typeof a.data === 'object'){ const d = a.data; S.data = { items: Guardian.norm.arr(d.items), banks: Guardian.norm.arr(d.banks), available: Guardian.norm.num(d.available), reserved: Guardian.norm.num(d.reserved), min: Guardian.norm.num(d.min, 10), enabled: d.enabled !== false }; } else if (!S.data) S.err = true;
    if (k.ok && k.data) S.kyc = String(k.data.status || 'UNVERIFIED');
    return S.data;
  }
  const bankName = (code, fb) => { const b = S.data && S.data.banks.find(x => x.code === code); return b ? (b[LANG] || b.en) : (fb || code); };
  const stCls = s => (s === 'PAID' ? 'ok' : s === 'REJECTED' ? 'bad' : s === 'CANCELLED' ? 'off' : 'wait');

  function timeline(w){
    const rej = w.status === 'REJECTED', can = w.status === 'CANCELLED', paid = w.status === 'PAID', appr = w.status === 'APPROVED' || paid;
    const s = [{ t: t('wd.tl.req'), d: F.dtime(w.created_at), st: 'done' }];
    if (can) s.push({ t: t('wd.tl.can'), d: F.dtime(w.decided_at), st: 'bad' });
    else if (rej) s.push({ t: t('wd.tl.rej'), d: F.dtime(w.decided_at), st: 'bad' });
    else { s.push({ t: appr ? t('wd.tl.rev') : t('wd.tl.revW'), d: appr ? F.dtime(w.decided_at) : '', st: appr ? 'done' : 'current' }); s.push({ t: paid ? t('wd.tl.paid') : t('wd.tl.paidW'), d: paid ? F.dtime(w.paid_at) : '', st: paid ? 'done' : (appr ? 'current' : 'todo') }); }
    return F.timeline(s);
  }
  function reqCard(w, i){
    return '<article class="fl-card fl-wd fl-in" style="--i:' + i + '"><div class="fl-ref"><div><small class="ltr" dir="ltr">' + esc(w.reference) + '</small><b class="ltr" dir="ltr">' + esc(F.dec(w.amount)) + ' ' + esc(t('fl.omr')) + '</b></div><span class="fl-badge ' + stCls(w.status) + '">' + esc(t('wd.st.' + w.status)) + '</span></div>' +
      '<div class="fl-kv"><span>' + esc(t('wd.bank')) + '</span><b>' + esc(bankName(w.bank_code, w.bank_name)) + '</b></div><div class="fl-kv"><span>' + esc(t('wd.holder')) + '</span><b>' + esc(w.holder) + '</b></div>' +
      (w.status === 'PAID' && w.paid_ref ? '<div class="fl-kv"><span>' + esc(t('wd.bankRef')) + '</span><b class="ltr" dir="ltr">' + esc(w.paid_ref) + '</b></div>' : '') +
      ((w.status === 'REJECTED') && w.admin_note ? '<p class="fl-note bad">' + F.ic('x', 16) + '<span>' + esc(t('wd.reason')) + ' : ' + esc(w.admin_note) + '</span></p>' : '') +
      timeline(w) + '<div class="fl-row"><button type="button" class="btn btn-secondary" data-copy="' + esc(w.reference) + '">' + F.ic('copy', 16) + '<span>' + esc(t('wd.copyRef')) + '</span></button>' + (w.status === 'PENDING' ? '<button type="button" class="btn btn-ghost fl-danger" data-wcancel="' + esc(w.id) + '">' + esc(t('wd.cancel')) + '</button>' : '') + '</div></article>';
  }
  function form(){
    const d = S.data, f = S.f, e = S.errs, ibanLen = cleanIban(f.iban).length;
    const field = (k, label, inner, extra) => '<div class="field fl-in"><label class="field-label" for="wd-' + k + '">' + esc(label) + '</label>' + inner + (extra || '') + '<div class="field-err" data-err="' + k + '" role="alert">' + esc(e[k] || '') + '</div></div>';
    return '<section class="fl-card fl-form"><div class="fl-bal"><div><small>' + esc(t('wd.avail')) + '</small><b class="ltr" dir="ltr" data-fl-count="' + d.available + '">0.000</b><em>' + esc(t('fl.omr')) + '</em></div>' + (d.reserved > 0 ? '<div><small>' + esc(t('wd.reserved')) + '</small><b class="ltr" dir="ltr">' + esc(F.dec(d.reserved)) + '</b></div>' : '') + '</div>' +
      field('amount', t('wd.amount'), '<div class="field-box fl-amt"><input id="wd-amount" type="text" inputmode="decimal" dir="ltr" autocomplete="off" value="' + esc(f.amount) + '" placeholder="' + esc(F.dec(d.min, 0)) + '"><span>' + esc(t('fl.omr')) + '</span></div>', '<div class="fl-hint">' + esc(tf('wd.min', { m: F.dec(d.min, 0) })) + '</div>') +
      field('holder', t('wd.holder'), '<div class="field-box"><input id="wd-holder" type="text" autocomplete="name" maxlength="80" value="' + esc(f.holder) + '"></div>') +
      field('bank', t('wd.bank'), '<button type="button" class="field-box fl-bankbtn" id="wd-bank" aria-haspopup="dialog"><span class="' + (f.bank ? '' : 'ph') + '">' + F.ic('bank', 18) + '<em>' + esc(f.bank ? bankName(f.bank) : t('wd.bankPick')) + '</em></span>' + F.ic('chev', 16) + '</button>') +
      field('acc', t('wd.acc'), '<div class="field-box"><input id="wd-acc" type="text" inputmode="text" dir="ltr" autocomplete="off" maxlength="34" value="' + esc(f.acc) + '"></div>') +
      field('iban', t('wd.iban'), '<div class="field-box"><input id="wd-iban" type="text" dir="ltr" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="OM81 0180 0000 0129 9123 456" value="' + esc(fmtIban(f.iban)) + '"></div>', '<div class="fl-hint ok" data-iban-ok ' + (ibanLen === 23 && ibanValid(f.iban) ? '' : 'hidden') + '>' + F.ic('check', 14) + ' ' + esc(t('wd.ibanOk')) + '</div>') +
      '<p class="fl-note">' + F.ic('lock', 16) + '<span>' + esc(t('wd.reserve')) + '</span></p>' +
      '<label class="fl-check"><input type="checkbox" id="wd-ok"' + (f.ok ? ' checked' : '') + '><i>' + F.ic('check', 14) + '</i><span>' + esc(t('wd.consent')) + '</span></label><div class="field-err" data-err="ok" role="alert">' + esc(e.ok || '') + '</div>' +
      '<button type="button" class="btn btn-primary fl-cta" data-wd-submit>' + F.ic('upload', 18) + '<span>' + esc(t('wd.submit')) + '</span></button></section>';
  }
  function body(){
    if (S.err) return F.errCard('data-fl-retry');
    if (!S.data) return F.skeleton();
    const d = S.data;
    let head = '';
    if (S.kyc && S.kyc !== 'VERIFIED') head = '<div class="fl-card fl-alert fl-in"><i>' + F.ic('id', 24) + '</i><div><b>' + esc(t('wd.kycT')) + '</b><p>' + esc(t('wd.kycD')) + '</p><button type="button" class="btn btn-primary" data-fl-kyc>' + esc(t('wd.kycGo')) + '</button></div></div>';
    else if (!d.enabled) head = '<p class="fl-note bad">' + F.ic('lock', 16) + '<span>' + esc(t('wd.off')) + '</span></p>';
    const f = (!head) ? form() : '';
    const list = '<section><h2 class="fl-h">' + esc(t('wd.list')) + '</h2>' + (d.items.length ? '<div class="fl-list col">' + d.items.map(reqCard).join('') + '</div>' : F.empty('bank', t('wd.emptyT'), t('wd.emptyD'))) + '</section>';
    return head + f + list;
  }
  const render = () => '<div class="fl-screen" data-fl="withdraw">' + F.top(t('wd.title')) + '<div class="screen-body fl-body">' + body() + '</div></div>';
  const bodyEl = () => document.querySelector('.screen.active [data-fl="withdraw"] .fl-body');
  function repaint(){ const b = bodyEl(); if (b){ b.innerHTML = body(); wire(b); } }

  function pickBank(){
    if (!S.data) return;
    const banks = S.data.banks;
    const li = q => { const k = String(q || '').trim().toLowerCase(); const l = banks.filter(b => !k || [b.en, b.fr, b.ar].some(x => String(x || '').toLowerCase().indexOf(k) !== -1)); return l.length ? l.map(b => '<button type="button" role="option" class="fl-bank' + (S.f.bank === b.code ? ' on' : '') + '" data-code="' + esc(b.code) + '"><i>' + F.ic('bank', 18) + '</i><span>' + esc(b[LANG] || b.en) + '</span>' + (S.f.bank === b.code ? F.ic('check', 16) : '') + '</button>').join('') : '<p class="fl-hint c">' + esc(t('wd.noBank')) + '</p>'; };
    const close = R.overlay.open('<div class="fl-sheet" dir="' + (LANG === 'ar' ? 'rtl' : 'ltr') + '"><h3>' + esc(t('wd.bankPick')) + '</h3><div class="field-box"><input type="search" id="fl-bq" placeholder="' + esc(t('wd.bankSearch')) + '" autocomplete="off"></div><div class="fl-banks" role="listbox" id="fl-bl">' + li('') + '</div></div>', { kind: 'modal', dismissible: true });
    setTimeout(() => {
      const root = document.querySelector('.fl-sheet'); if (!root) return;
      const list = root.querySelector('#fl-bl'), q = root.querySelector('#fl-bq');
      const bind = () => list.querySelectorAll('[data-code]').forEach(x => { x.onclick = () => { S.f.bank = x.getAttribute('data-code'); S.errs.bank = ''; F.hap('tap'); F.snd('pop'); try { close(); } catch(e){ /* rien */ } repaint(); }; });
      q.oninput = () => { list.innerHTML = li(q.value); bind(); }; bind();
    }, 200);
  }

  function validate(){
    const d = S.data, f = S.f, e = {}; const v = Number(String(f.amount).replace(',', '.'));
    if (!Number.isFinite(v) || v < d.min) e.amount = tf('wd.eMin', { m: F.dec(d.min, 0) });
    else if (v > d.available + 1e-9) e.amount = tf('wd.eMax', { a: F.dec(d.available) });
    if (String(f.holder).trim().length < 3) e.holder = t('wd.eHolder');
    if (!f.bank) e.bank = t('wd.eBank');
    if (!String(f.acc).trim() && !cleanIban(f.iban)) e.acc = t('wd.eAcc');
    if (String(f.acc).trim() && !/^[0-9A-Za-z -]{4,34}$/.test(String(f.acc).trim())) e.acc = t('fl.e.invalid_account');
    if (cleanIban(f.iban) && !ibanValid(f.iban)) e.iban = t('wd.eIban');
    if (!f.ok) e.ok = t('wd.eConsent');
    return { e, v };
  }
  function showErrs(b){ b.querySelectorAll('[data-err]').forEach(x => { x.textContent = S.errs[x.getAttribute('data-err')] || ''; }); }

  function wire(b){
    F.countAll(b);
    b.querySelectorAll('[data-fl-retry]').forEach(x => { x.onclick = async () => { S.err = false; await load(); repaint(); }; });
    const kg = b.querySelector('[data-fl-kyc]'); if (kg) kg.onclick = () => { try { Kyc.open(); } catch(e){ R.go('kyc'); } };
    b.querySelectorAll('[data-copy]').forEach(x => { x.onclick = () => { F.copyTxt(x.getAttribute('data-copy')); F.hap('tap'); }; });
    b.querySelectorAll('[data-wcancel]').forEach(x => { x.onclick = async () => {
      if (!confirm(t('wd.cancelQ'))) return; F.btnBusy(x, true);
      const r = await Guardian.rpc('withdraw_cancel', { p_id: x.getAttribute('data-wcancel') }, { retries: 0 });
      if (r.ok){ toast(t('wd.cancelled'), 'success'); F.snd('success'); await load(); repaint(); } else { F.btnBusy(x, false); toast(F.srvErr(r.error), 'error'); }
    }; });
    const am = b.querySelector('#wd-amount'), ho = b.querySelector('#wd-holder'), bk = b.querySelector('#wd-bank'), ac = b.querySelector('#wd-acc'), ib = b.querySelector('#wd-iban'), ok = b.querySelector('#wd-ok'), sub = b.querySelector('[data-wd-submit]');
    if (!sub) return;
    am.oninput = () => { am.value = am.value.replace(/[^0-9.,]/g, ''); S.f.amount = am.value; };
    ho.oninput = () => { S.f.holder = ho.value; };
    ac.oninput = () => { S.f.acc = ac.value; };
    ib.oninput = () => { const pos = ib.selectionStart; S.f.iban = cleanIban(ib.value); ib.value = fmtIban(S.f.iban); try { ib.setSelectionRange(ib.value.length, ib.value.length); } catch(e){ /* rien */ } const okEl = b.querySelector('[data-iban-ok]'); if (okEl) okEl.hidden = !(S.f.iban.length === 23 && ibanValid(S.f.iban)); };
    ok.onchange = () => { S.f.ok = ok.checked; if (ok.checked) { S.errs.ok = ''; showErrs(b); } F.hap('tap'); };
    bk.onclick = pickBank;
    sub.onclick = async () => {
      if (S.busy) return;
      const { e, v } = validate(); S.errs = e; showErrs(b);
      const first = Object.keys(e)[0];
      if (first){ F.snd('error'); Fx.shake(sub); const el = b.querySelector('[data-err="' + first + '"]'); try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(x){ /* rien */ } return; }
      S.busy = true; F.btnBusy(sub, true);
      const r = await Guardian.rpc('withdraw_request', { p_amount: v, p_holder: S.f.holder.trim(), p_bank_code: S.f.bank, p_account: S.f.acc.trim() || cleanIban(S.f.iban), p_iban: cleanIban(S.f.iban), p_key: S.key || (S.key = F.uuid()) }, { retries: 0 });
      S.busy = false; F.btnBusy(sub, false);
      if (r.ok && r.data && r.data.id){
        S.key = null; S.f = { amount: '', holder: S.f.holder, bank: '', acc: '', iban: '', ok: false }; S.errs = {};
        F.snd('success'); F.hap('success'); toast(t('wd.sent'), 'success'); await load(); repaint(); Fx.confetti(null, { n: 40 });
        try { AuthEngine.hydrateLive(); } catch(x){ /* rien */ }
        return;
      }
      const m = String((r.error && r.error.message) || '').toLowerCase();
      if (m.indexOf('kyc_required') !== -1){ S.kyc = 'UNVERIFIED'; repaint(); return; }
      const key = /invalid_iban/.test(m) ? 'iban' : /invalid_holder/.test(m) ? 'holder' : /invalid_bank/.test(m) ? 'bank' : /invalid_account/.test(m) ? 'acc' : /amount_out_of_range|insufficient/.test(m) ? 'amount' : 'ok';
      S.errs = { [key]: F.srvErr(r.error) }; showErrs(b); F.snd('error'); Fx.shake(sub);
      if (/too_many_open|already|rate_limited|withdraw_disabled/.test(m)) toast(F.srvErr(r.error), 'error');
    };
  }
  Hooks.on('withdraw', async () => { const b = bodyEl(); if (b) wire(b); await load(); repaint(); });
  R.register({ withdraw: render });
  R.meta({ withdraw: { parent: 'services', nav: 'services' } });
  return { open(){ R.go('withdraw'); }, ibanValid, _S: S, _load: load };
})();
