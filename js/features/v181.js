'use strict';

/* ============================================================
   V18.1 (18.1.0) — remboursement du crédit : textes des opérations et des rappels d'échéance, alerte en direct.
   Fichier séparé : il complète V18 (v18-glue.js) sans le modifier.
   ============================================================ */
Strings.add({
  en: { 'op.INVEST_PAYOUT': 'Plan payout', 'op.BANK_WITHDRAWAL': 'Bank withdrawal', 'op.CREDIT_REPAY': 'Credit repayment', 'v181.n.soon': 'Credit payment due soon', 'v181.n.today': 'Credit payment due today', 'v181.n.over': 'Credit payment overdue', 'v181.n.closed': 'Credit repaid', 'v181.n.forgiven': 'Credit closed', 'v181.n.closedD': 'Your credit is fully repaid', 'v181.n.forgivenD': 'The remaining balance was cancelled', 'v181.n.due': '{amt} due on {d}' },
  fr: { 'op.INVEST_PAYOUT': 'Règlement de plan', 'op.BANK_WITHDRAWAL': 'Retrait bancaire', 'op.CREDIT_REPAY': 'Remboursement de crédit', 'v181.n.soon': 'Échéance de crédit proche', 'v181.n.today': 'Échéance de crédit aujourd’hui', 'v181.n.over': 'Échéance de crédit en retard', 'v181.n.closed': 'Crédit remboursé', 'v181.n.forgiven': 'Crédit clôturé', 'v181.n.closedD': 'Votre crédit est entièrement remboursé', 'v181.n.forgivenD': 'Le solde restant a été annulé', 'v181.n.due': '{amt} à payer le {d}' },
  ar: { 'op.INVEST_PAYOUT': 'تسوية الخطة', 'op.BANK_WITHDRAWAL': 'سحب بنكي', 'op.CREDIT_REPAY': 'سداد الائتمان', 'v181.n.soon': 'اقتراب موعد قسط الائتمان', 'v181.n.today': 'قسط الائتمان مستحق اليوم', 'v181.n.over': 'قسط الائتمان متأخر', 'v181.n.closed': 'تم سداد الائتمان', 'v181.n.forgiven': 'تم إغلاق الائتمان', 'v181.n.closedD': 'تم سداد ائتمانك بالكامل', 'v181.n.forgivenD': 'تم إلغاء الرصيد المتبقي', 'v181.n.due': '{amt} مستحق في {d}' }
});

(function(){
  const dueView = (n) => {
    const d = (n && n.data) || {};
    const st = String(d.stage || '');
    const title = t(st === 'OVERDUE' ? 'v181.n.over' : st === 'TODAY' ? 'v181.n.today' : st === 'CLOSED' ? 'v181.n.closed' : st === 'FORGIVEN' ? 'v181.n.forgiven' : 'v181.n.soon');
    let msg = n.message;
    if (st === 'CLOSED') msg = t('v181.n.closedD');
    else if (st === 'FORGIVEN') msg = t('v181.n.forgivenD');
    else if (d.amount != null && d.due) { let dd = String(d.due); try { dd = new Date(d.due + 'T00:00:00').toLocaleDateString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { day: '2-digit', month: 'short', year: 'numeric' }); } catch(e){ /* rien */ } msg = tf('v181.n.due', { amt: Money.fmt(d.amount, d.currency || 'OMR'), d: dd }); }
    return { title, message: msg };
  };
  /* vue des notifications */
  const nv = window.notifView;
  window.notifView = function(n){ try { if (n && n.type === 'CREDIT_DUE') return dueView(n); } catch(e){ /* repli */ } return nv(n); };
  /* alerte en direct */
  try {
    const h = V18.handles, o = V18.onNotif;
    V18.handles = type => type === 'CREDIT_DUE' || h(type);
    V18.onNotif = n => {
      if (n && n.type === 'CREDIT_DUE'){
        try {
          const v = dueView(n), st = (n.data || {}).stage;
          InAppNotif.showCall({ title: v.title, message: v.message, status: st === 'OVERDUE' ? 'default' : 'success', onClick: () => { try { R.go('credit'); } catch(e){ /* rien */ } } });
          Sfx.play(st === 'CLOSED' ? 'credit' : 'notify'); if (st === 'CLOSED') Fx.confetti(null, { n: 80 });
          if (R.current() === 'credit') R.go('credit', { force: true, replace: true });
        } catch(e){ console.warn('credit due', e); }
        return true;
      }
      return o(n);
    };
  } catch(e){ console.warn('v181', e); }
})();

/* accueil : graphique réel envoyé / reçu sur 6 mois sous le panneau « Ce mois-ci » (uniquement s'il y a des opérations) */
Hooks.on('home', root => {
  try {
    if (typeof Charts === 'undefined' || !Runtime.transactions || !Runtime.transactions.length) return;
    const panel = root.querySelector('.v13-month'); if (!panel || panel.querySelector('.v19-monthly')) return;
    const box = document.createElement('div'); box.className = 'v19-monthly'; box.style.marginTop = '14px';
    panel.appendChild(box); Charts.monthly(box, Runtime.transactions);
  } catch(e){ console.warn('monthly chart', e); }
});

/* YASER : textes des réponses fondées sur les vrais dossiers (en / fr / ar) */
Strings.add({
  en: { 'yas.c.status': 'Status of my requests', 'yas.c.plans': 'The plans', 'yas.c.payment': 'I made a payment', 'yas.c.withdraw': 'Withdraw money',
    'yas.openPlans': 'Open the plans', 'yas.openKyc': 'Verify my identity', 'yas.openWithdraw': 'Request a withdrawal',
    'yas.r.plans': 'Here are the plans:', 'yas.r.noGain': 'No gain is announced unless the plan model is defined and validated by the administrator.', 'yas.days': 'days', 'yas.ret': 'validated return', 'yas.until': 'until',
    'yas.r.noData': 'I could not read your requests right now. Please try again, or write to the administrator in the chat.', 'yas.r.kyc': 'Identity check:', 'yas.r.withdraw': 'You can request a withdrawal to an Omani bank account. Minimum:', 'yas.r.last': 'Your latest request', 'yas.r.none': 'You have no withdrawal request yet.',
    'yas.r.status': 'Here is the real status of your requests:', 'yas.r.payment': 'After you pay, send your receipt (image or PDF) from the plan screen. Here is where your requests stand:', 'yas.r.noFake': 'A payment is confirmed only when the administrator has checked that the funds arrived. I never confirm a payment myself.',
    'yas.fin': 'Financing', 'yas.closed': 'repaid', 'yas.outstanding': 'remaining',
    'yas.st.kyc.UNVERIFIED': 'not verified', 'yas.st.kyc.PENDING': 'under review', 'yas.st.kyc.VERIFIED': 'verified', 'yas.st.kyc.REJECTED': 'declined',
    'yas.st.inv.AWAITING_PAYMENT': 'awaiting your payment', 'yas.st.inv.PROOF_SENT': 'receipt sent, waiting for the administrator to verify', 'yas.st.inv.ACTIVE': 'confirmed and active', 'yas.st.inv.MATURED': 'ended, awaiting settlement', 'yas.st.inv.SETTLED': 'settled', 'yas.st.inv.REJECTED': 'not confirmed', 'yas.st.inv.CANCELLED': 'cancelled',
    'yas.st.wd.PENDING': 'under review', 'yas.st.wd.APPROVED': 'approved, bank transfer in progress (not yet paid)', 'yas.st.wd.PAID': 'paid (confirmed by the administrator)', 'yas.st.wd.REJECTED': 'declined', 'yas.st.wd.CANCELLED': 'cancelled' },
  fr: { 'yas.c.status': 'Suivi de mes demandes', 'yas.c.plans': 'Les plans', 'yas.c.payment': 'J’ai effectué un paiement', 'yas.c.withdraw': 'Retirer de l’argent',
    'yas.openPlans': 'Ouvrir les plans', 'yas.openKyc': 'Vérifier mon identité', 'yas.openWithdraw': 'Demander un retrait',
    'yas.r.plans': 'Voici les plans :', 'yas.r.noGain': 'Aucun gain n’est annoncé tant que le modèle du plan n’est pas défini et validé par l’administrateur.', 'yas.days': 'jours', 'yas.ret': 'rendement validé', 'yas.until': 'jusqu’au',
    'yas.r.noData': 'Je n’ai pas pu lire vos demandes pour le moment. Réessayez, ou écrivez à l’administrateur dans le chat.', 'yas.r.kyc': 'Vérification d’identité :', 'yas.r.withdraw': 'Vous pouvez demander un retrait vers un compte bancaire omanais. Minimum :', 'yas.r.last': 'Votre dernière demande', 'yas.r.none': 'Vous n’avez encore aucune demande de retrait.',
    'yas.r.status': 'Voici le statut réel de vos demandes :', 'yas.r.payment': 'Après votre paiement, envoyez votre reçu (image ou PDF) depuis l’écran du plan. Voici où en sont vos demandes :', 'yas.r.noFake': 'Un paiement n’est confirmé que lorsque l’administrateur a vérifié l’arrivée des fonds. Je ne confirme jamais un paiement moi-même.',
    'yas.fin': 'Financement', 'yas.closed': 'soldé', 'yas.outstanding': 'reste',
    'yas.st.kyc.UNVERIFIED': 'non vérifiée', 'yas.st.kyc.PENDING': 'en cours d’examen', 'yas.st.kyc.VERIFIED': 'vérifiée', 'yas.st.kyc.REJECTED': 'refusée',
    'yas.st.inv.AWAITING_PAYMENT': 'en attente de votre paiement', 'yas.st.inv.PROOF_SENT': 'reçu envoyé, en attente de vérification par l’administrateur', 'yas.st.inv.ACTIVE': 'confirmé et actif', 'yas.st.inv.MATURED': 'terminé, en attente de règlement', 'yas.st.inv.SETTLED': 'réglé', 'yas.st.inv.REJECTED': 'non confirmé', 'yas.st.inv.CANCELLED': 'annulé',
    'yas.st.wd.PENDING': 'en examen', 'yas.st.wd.APPROVED': 'approuvé, virement en cours (pas encore payé)', 'yas.st.wd.PAID': 'payé (confirmé par l’administrateur)', 'yas.st.wd.REJECTED': 'refusé', 'yas.st.wd.CANCELLED': 'annulé' },
  ar: { 'yas.c.status': 'متابعة طلباتي', 'yas.c.plans': 'الخطط', 'yas.c.payment': 'لقد دفعت', 'yas.c.withdraw': 'سحب الأموال',
    'yas.openPlans': 'فتح الخطط', 'yas.openKyc': 'توثيق هويتي', 'yas.openWithdraw': 'طلب سحب',
    'yas.r.plans': 'هذه هي الخطط:', 'yas.r.noGain': 'لا يُعلن عن أي ربح ما لم يكن نموذج الخطة محدداً ومعتمداً من المسؤول.', 'yas.days': 'يوماً', 'yas.ret': 'العائد المعتمد', 'yas.until': 'حتى',
    'yas.r.noData': 'تعذّرت قراءة طلباتك الآن. أعد المحاولة أو راسل المسؤول في المحادثة.', 'yas.r.kyc': 'التحقق من الهوية:', 'yas.r.withdraw': 'يمكنك طلب السحب إلى حساب بنكي عُماني. الحد الأدنى:', 'yas.r.last': 'آخر طلب لك', 'yas.r.none': 'ليس لديك أي طلب سحب بعد.',
    'yas.r.status': 'هذه هي الحالة الفعلية لطلباتك:', 'yas.r.payment': 'بعد الدفع أرسل إيصالك (صورة أو PDF) من شاشة الخطة. وهذه حالة طلباتك:', 'yas.r.noFake': 'لا يُؤكَّد الدفع إلا بعد أن يتحقق المسؤول من وصول الأموال. لا أؤكد أي دفعة بنفسي أبداً.',
    'yas.fin': 'التمويل', 'yas.closed': 'تم السداد', 'yas.outstanding': 'المتبقي',
    'yas.st.kyc.UNVERIFIED': 'غير موثّقة', 'yas.st.kyc.PENDING': 'قيد المراجعة', 'yas.st.kyc.VERIFIED': 'موثّقة', 'yas.st.kyc.REJECTED': 'مرفوضة',
    'yas.st.inv.AWAITING_PAYMENT': 'بانتظار دفعتك', 'yas.st.inv.PROOF_SENT': 'تم إرسال الإيصال وبانتظار تحقق المسؤول', 'yas.st.inv.ACTIVE': 'مؤكدة وفعّالة', 'yas.st.inv.MATURED': 'انتهت وبانتظار التسوية', 'yas.st.inv.SETTLED': 'تمت التسوية', 'yas.st.inv.REJECTED': 'غير مؤكدة', 'yas.st.inv.CANCELLED': 'ملغاة',
    'yas.st.wd.PENDING': 'قيد المراجعة', 'yas.st.wd.APPROVED': 'تمت الموافقة والتحويل قيد التنفيذ (لم يُدفع بعد)', 'yas.st.wd.PAID': 'تم الدفع (بتأكيد المسؤول)', 'yas.st.wd.REJECTED': 'مرفوض', 'yas.st.wd.CANCELLED': 'ملغى' }
});

/* film publicitaire : la scène « Boost » devient la scène « Plans » (aucun gain annoncé) ; YASER / accueil : plus de promesse de rendement */
Strings.add({
  en: { 'cin.boost.k': 'PLANS', 'cin.boost.t': 'Three plans, *one* clear framework', 'cin.boost.s': 'Essential, Growth and Premium: choose your amount and duration. Payments are checked by our team; no return is announced unless it is validated.', 'cin.boost.c': 'See the plans',
    'cin.yaser.s': 'Ask about your plans, payments or withdrawals, any time of the day or night.', 'v18.boost': 'Plans', 'v18.boostD': 'Choose your plan' },
  fr: { 'cin.boost.k': 'PLANS', 'cin.boost.t': 'Trois plans, *un* cadre clair', 'cin.boost.s': 'Essentiel, Croissance et Premium : choisissez votre montant et votre durée. Les paiements sont vérifiés par notre équipe ; aucun rendement n’est annoncé s’il n’est pas validé.', 'cin.boost.c': 'Voir les plans',
    'cin.yaser.s': 'Posez vos questions sur vos plans, paiements ou retraits, de jour comme de nuit.', 'v18.boost': 'Plans', 'v18.boostD': 'Choisissez votre plan' },
  ar: { 'cin.boost.k': 'الخطط', 'cin.boost.t': 'ثلاث خطط، *إطار* واضح', 'cin.boost.s': 'الأساسية والنمو وبريميوم: اختر مبلغك ومدتك. يتحقق فريقنا من المدفوعات، ولا يُعلن عن أي عائد ما لم يكن معتمداً.', 'cin.boost.c': 'عرض الخطط',
    'cin.yaser.s': 'اسأل عن خططك أو مدفوعاتك أو عمليات السحب في أي وقت ليلاً أو نهاراً.', 'v18.boost': 'الخطط', 'v18.boostD': 'اختر خطتك' }
});
Strings.add({
  en: { 'v19.kyc': 'Identity check', 'v19.withdraw': 'Withdrawal', 'v18.credit': 'Financing' },
  fr: { 'v19.kyc': 'Vérification d’identité', 'v19.withdraw': 'Retrait', 'v18.credit': 'Financement' },
  ar: { 'v19.kyc': 'التحقق من الهوية', 'v19.withdraw': 'السحب', 'v18.credit': 'التمويل' }
});

/* centre de contrôle : pastilles des tuiles de l'espace administrateur 19 */
Hooks.on('admin-hub', root => {
  try {
    if (typeof Admin19 === 'undefined') return;
    const paint = () => Admin19.tiles().forEach(x => { Promise.resolve(x.badgePromise).then(n => { const el = root.querySelector('[data-badge="a19:' + x.route + '"]'); if (!el) return; const v = Number(n) || 0; el.textContent = v > 99 ? '99+' : String(v); el.hidden = v <= 0; }).catch(() => {}); });
    paint(); const stop = Guardian.every(paint, 20000); R.onLeave(stop);
  } catch(e){ console.warn('hub badges', e); }
});
