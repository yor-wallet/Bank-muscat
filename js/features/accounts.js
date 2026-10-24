'use strict';

/* ============================================================
   Freindi Pay 20.3.0 — écran « Comptes » (onglet de la barre du bas)
   Chaque compte de l'utilisateur, tel que le serveur le renvoie : solde disponible, devise, statut, dernière mise à jour,
   entrées et sorties des 30 derniers jours, coordonnées du compte et dernières opérations.
   Règles : rien n'est inventé. Les montants viennent de Runtime.accounts (table accounts) et de Runtime.transactions (RPC
   my_transactions) ; seules les opérations CONFIRMÉES comptent dans les entrées et les sorties ; si une valeur manque
   (par exemple la date de mise à jour), la ligne n'est pas affichée. Chargé après premium.js, avant wire.js.
   ============================================================ */
Object.assign(TR.en, {
  'ac.title':'Accounts','ac.sub':'Your accounts and balances, read live from Freindi Pay.','ac.available':'Available balance','ac.balance':'Balance',
  'ac.reserved':'Reserved','ac.in':'In','ac.out':'Out','ac.period':'Last 30 days, confirmed operations only','ac.partial':'Computed from your {n} latest operations.',
  'ac.status':'Status','ac.active':'Active','ac.statusOther':'{s}','ac.updated':'Last update','ac.opened':'Opened','ac.country':'Country','ac.currency':'Currency',
  'ac.type':'Type','ac.MAIN':'Main account','ac.other':'Account','ac.details':'Account details','ac.yid':'Freindi Pay ID','ac.recent':'Recent activity',
  'ac.history':'Full history','ac.send':'Send','ac.receive':'Receive','ac.none':'No account yet','ac.noneD':'Your accounts will appear here as soon as they are opened.',
  'ac.approx':'≈ {v}','ac.ref':'Balances are shown in the currency of each account.'
});
Object.assign(TR.fr, {
  'ac.title':'Comptes','ac.sub':'Vos comptes et soldes, lus en direct sur Freindi Pay.','ac.available':'Solde disponible','ac.balance':'Solde',
  'ac.reserved':'Réservé','ac.in':'Entrées','ac.out':'Sorties','ac.period':'30 derniers jours, opérations confirmées uniquement','ac.partial':'Calculé sur vos {n} dernières opérations.',
  'ac.status':'Statut','ac.active':'Actif','ac.statusOther':'{s}','ac.updated':'Dernière mise à jour','ac.opened':'Ouvert le','ac.country':'Pays','ac.currency':'Devise',
  'ac.type':'Type','ac.MAIN':'Compte principal','ac.other':'Compte','ac.details':'Coordonnées du compte','ac.yid':'Freindi Pay ID','ac.recent':'Activité récente',
  'ac.history':'Historique complet','ac.send':'Envoyer','ac.receive':'Recevoir','ac.none':'Aucun compte pour le moment','ac.noneD':'Vos comptes apparaîtront ici dès leur ouverture.',
  'ac.approx':'≈ {v}','ac.ref':'Les soldes sont affichés dans la devise de chaque compte.'
});
Object.assign(TR.ar, {
  'ac.title':'الحسابات','ac.sub':'حساباتك وأرصدتك، تُقرأ مباشرة من فريندي باي.','ac.available':'الرصيد المتاح','ac.balance':'الرصيد',
  'ac.reserved':'محجوز','ac.in':'الوارد','ac.out':'الصادر','ac.period':'آخر 30 يوماً، العمليات المؤكدة فقط','ac.partial':'محسوب من آخر {n} عملية.',
  'ac.status':'الحالة','ac.active':'نشط','ac.statusOther':'{s}','ac.updated':'آخر تحديث','ac.opened':'تاريخ الفتح','ac.country':'الدولة','ac.currency':'العملة',
  'ac.type':'النوع','ac.MAIN':'الحساب الرئيسي','ac.other':'حساب','ac.details':'بيانات الحساب','ac.yid':'معرّف فريندي باي','ac.recent':'آخر العمليات',
  'ac.history':'السجل الكامل','ac.send':'إرسال','ac.receive':'استلام','ac.none':'لا توجد حسابات بعد','ac.noneD':'ستظهر حساباتك هنا بمجرد فتحها.',
  'ac.approx':'≈ {v}','ac.ref':'تُعرض الأرصدة بعملة كل حساب.'
});

const Accounts = (() => {
  const MASK = '••••••';
  const DAY = 86400000;
  const money = (a, c) => escapeHtml(CurrencyEngine.format(Number(a) || 0, String(c || 'OMR').toUpperCase()));
  const topbar = title => '<div class="topbar px-topbar"><span style="width:calc(44px*var(--ui))"></span><span class="topbar-title">' + escapeHtml(title) + '</span><span style="width:calc(44px*var(--ui))"></span></div>';

  /* comptes d'argent affichés : même règle que l'accueil (pas de crypto, pas de compte West Africa) */
  function list(){
    return (Runtime.accounts || []).filter(a => a && a.type !== 'WEST_AFRICA' && (FEATURES.crypto || a.type !== 'CRYPTO'))
      .slice().sort((a, b) => (a.type === 'MAIN' ? 0 : 1) - (b.type === 'MAIN' ? 0 : 1));
  }
  function txOf(cur){
    const all = (typeof visibleTransactions === 'function' ? visibleTransactions(Runtime.transactions || []) : (Runtime.transactions || []));
    return all.filter(x => String(x.currency || '').toUpperCase() === String(cur || '').toUpperCase());
  }
  /* entrées / sorties confirmées des 30 derniers jours, lues sur les opérations du serveur */
  function flows(cur){
    const since = Date.now() - 30 * DAY;
    let inn = 0, out = 0;
    txOf(cur).forEach(x => {
      if (txState(x.status) !== 'success' || !(x.createdAt >= since)) return;
      if (x.direction === 'IN') inn += Number(x.amount) || 0;
      else if (x.direction === 'OUT') out += Number(x.total) || (Number(x.amount) || 0) + (Number(x.fee) || 0);
    });
    return { inn, out };
  }
  function partialNote(){
    const txs = Runtime.transactions || [];
    if (txs.length < 200) return '';
    const oldest = Math.min.apply(null, txs.map(x => x.createdAt || Infinity));
    return oldest > Date.now() - 30 * DAY ? '<p class="ac-note">' + escapeHtml(tf('ac.partial', { n: txs.length })) + '</p>' : '';
  }
  const kv = (k, v) => v ? '<div class="ac-kv"><small>' + escapeHtml(k) + '</small><b>' + v + '</b></div>' : '';
  function statusChip(a){
    const st = String(a.status || '').toUpperCase();
    if (!st) return '';
    return st === 'ACTIVE' ? '<span class="px-chip ok"><i></i>' + escapeHtml(t('ac.active')) + '</span>'
      : '<span class="px-chip warn"><i></i>' + escapeHtml(tf('ac.statusOther', { s: st.toLowerCase() })) + '</span>';
  }
  function card(a, idx, hide){
    const cur = String(a.currency || 'OMR').toUpperCase();
    const avail = a.availableBalance != null && isFinite(a.availableBalance) ? a.availableBalance : a.balance;
    const v = balanceView(avail, cur);
    const f = flows(cur);
    const txs = txOf(cur).slice(0, 3);
    const typeLbl = TR[LANG] && TR[LANG]['ac.' + a.type] ? t('ac.' + a.type) : t('ac.other');
    const upd = a.updatedAt ? '<bdi>' + escapeHtml(fmtDate(a.updatedAt)) + '</bdi> · <bdi class="ltr" dir="ltr">' + escapeHtml(fmtTime(a.updatedAt)) + '</bdi>' : '';
    const yid = a.type === 'MAIN' && Runtime.ctx && Runtime.ctx.yorId ? dispId(Runtime.ctx.yorId) : '';
    return '<section class="ac-card' + (a.type === 'MAIN' ? ' main' : '') + '" style="--i:' + idx + '" aria-label="' + escapeHtml(a.name || cur) + '">' +
      '<header class="ac-h"><div><small>' + escapeHtml(a.name || typeLbl) + '</small><span class="ac-cur ltr">' + escapeHtml(cur) + '</span></div>' + statusChip(a) + '</header>' +
      '<div class="ac-bal"><small>' + escapeHtml(t('ac.available')) + '</small><b class="ltr" dir="ltr">' + (hide ? escapeHtml(MASK) : money(avail, cur)) + '</b>' +
        (!hide && v.converted ? '<span class="ac-cap ltr" dir="ltr">' + escapeHtml(tf('ac.approx', { v: CurrencyEngine.format(v.amount, v.currency) })) + '</span>' : '') +
        (!hide && Number(a.reservedBalance) > 0 ? '<span class="ac-cap">' + escapeHtml(t('ac.reserved')) + ' · <span class="ltr" dir="ltr">' + money(a.reservedBalance, cur) + '</span></span>' : '') +
      '</div>' +
      '<div class="ac-flow"><div class="in"><small>' + escapeHtml(t('ac.in')) + '</small><b class="ltr" dir="ltr">' + (hide ? escapeHtml(MASK) : (f.inn > 0 ? '+' : '') + money(f.inn, cur)) + '</b></div>' +
        '<div class="out"><small>' + escapeHtml(t('ac.out')) + '</small><b class="ltr" dir="ltr">' + (hide ? escapeHtml(MASK) : (f.out > 0 ? '−' : '') + money(f.out, cur)) + '</b></div></div>' +
      '<p class="ac-note">' + escapeHtml(t('ac.period')) + '</p>' +
      '<div class="ac-det"><h3>' + escapeHtml(t('ac.details')) + '</h3>' +
        kv(t('ac.type'), escapeHtml(typeLbl)) + kv(t('ac.currency'), '<span class="ltr" dir="ltr">' + escapeHtml(cur) + '</span>') + kv(t('ac.country'), escapeHtml(a.country || '')) +
        kv(t('ac.yid'), yid ? '<span class="ltr" dir="ltr">' + escapeHtml(yid) + '</span>' : '') +
        kv(t('ac.opened'), a.createdAt ? escapeHtml(fmtDate(a.createdAt)) : '') + kv(t('ac.updated'), upd) +
      '</div>' +
      (txs.length ? '<div class="ac-rec"><h3>' + escapeHtml(t('ac.recent')) + '</h3>' + txGroupedHtml(txs, hide) + '</div>' : '') +
      '<div class="ac-acts"><button class="btn btn-primary" data-nav="country-select">' + icon('send', 18) + '<span>' + escapeHtml(t('ac.send')) + '</span></button>' +
        '<button class="btn btn-secondary" data-nav="receive">' + icon('receive', 18) + '<span>' + escapeHtml(t('ac.receive')) + '</span></button>' +
        '<button class="btn btn-secondary" data-nav="history">' + icon('history', 18) + '<span>' + escapeHtml(t('ac.history')) + '</span></button></div>' +
    '</section>';
  }
  function render(){
    const accts = list(), hide = !!Runtime.hideBalance;
    return topbar(t('ac.title')) +
      '<div class="screen-body ac-body" style="padding-top:0">' +
        '<p class="px-lead">' + escapeHtml(t('ac.sub')) + '</p>' +
        (accts.length ? accts.map((a, i) => card(a, i, hide)).join('') + partialNote() + '<p class="ac-note ac-foot">' + escapeHtml(t('ac.ref')) + '</p>'
          : '<div class="rv-list">' + emptyState('wallet', t('ac.none'), t('ac.noneD')) + '</div>') +
        '<div style="height:calc(24px + var(--safe-b))"></div>' +
      '</div>';
  }
  return { render, list, flows };
})();

R.register({ accounts: Accounts.render });
R.meta({ accounts: { parent: 'home', nav: 'accounts' } });
