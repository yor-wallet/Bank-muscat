'use strict';

/* ============================================================
   V18.1 (18.1.0) — remboursement du crédit : textes des opérations et des rappels d'échéance, alerte en direct.
   Fichier séparé : il complète V18 (v18-glue.js) sans le modifier.
   ============================================================ */
Strings.add({
  en: { 'op.CREDIT_REPAY': 'Credit repayment', 'v181.n.soon': 'Credit payment due soon', 'v181.n.today': 'Credit payment due today', 'v181.n.over': 'Credit payment overdue', 'v181.n.closed': 'Credit repaid', 'v181.n.forgiven': 'Credit closed', 'v181.n.closedD': 'Your credit is fully repaid', 'v181.n.forgivenD': 'The remaining balance was cancelled', 'v181.n.due': '{amt} due on {d}' },
  fr: { 'op.CREDIT_REPAY': 'Remboursement de crédit', 'v181.n.soon': 'Échéance de crédit proche', 'v181.n.today': 'Échéance de crédit aujourd’hui', 'v181.n.over': 'Échéance de crédit en retard', 'v181.n.closed': 'Crédit remboursé', 'v181.n.forgiven': 'Crédit clôturé', 'v181.n.closedD': 'Votre crédit est entièrement remboursé', 'v181.n.forgivenD': 'Le solde restant a été annulé', 'v181.n.due': '{amt} à payer le {d}' },
  ar: { 'op.CREDIT_REPAY': 'سداد الائتمان', 'v181.n.soon': 'اقتراب موعد قسط الائتمان', 'v181.n.today': 'قسط الائتمان مستحق اليوم', 'v181.n.over': 'قسط الائتمان متأخر', 'v181.n.closed': 'تم سداد الائتمان', 'v181.n.forgiven': 'تم إغلاق الائتمان', 'v181.n.closedD': 'تم سداد ائتمانك بالكامل', 'v181.n.forgivenD': 'تم إلغاء الرصيد المتبقي', 'v181.n.due': '{amt} مستحق في {d}' }
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
