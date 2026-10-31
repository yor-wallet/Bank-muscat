'use strict';

/* ============================================================
   CRYPTO SCREENS
   ============================================================ */
function assetRowC(r){
  const asset = CRYPTO_ASSETS.find(a => a.id === r.assetId) || { tint:'#2081c7' };
  return '<div class="asset-row-c" data-nav="crypto-spot" data-asset="' + r.assetId + '">' + assetLogo(r.symbol, 40, asset.tint) + '<div class="asset-info-c"><div class="asset-name-c">' + escapeHtml(r.name) + '</div><div class="asset-sym-c">' + r.symbol + ' · ' + r.network + '</div></div><div class="asset-right-c"><div class="asset-bal-c">' + escapeHtml(CurrencyEngine.formatCrypto(r.balance, r.symbol)) + '</div><div class="asset-fiat-c">' + escapeHtml(CurrencyEngine.format(r.fiatValue, 'USD')) + '</div></div><span class="asset-change-c ' + (r.change24h >= 0 ? 'up' : 'down') + '">' + (r.change24h >= 0 ? '+' : '') + r.change24h.toFixed(2) + '%</span></div>';
}
function renderCryptoPortfolio(){
  const snap = PortfolioEngine.snapshot();
  const recent = Runtime.transactions.filter(t => t.asset || (t.type || '').startsWith('CRYPTO')).slice(0, 4);
  const emptyActivity = !recent.length;
  return '<div class="topbar"><span class="topbar-title">' + t('crypto.portfolio') + '</span><button class="topbar-action" data-nav="crypto-market" aria-label="' + t('ui.market') + '">' + icon('chart', 18) + '</button></div>' +
    '<div class="portfolio-hero"><div class="crypto-orb" aria-hidden="true"><div class="co-ring"></div><div class="co-sphere"><div class="co-tex"></div><div class="co-light"></div></div></div>' +
      '<div class="hero-bal-label">' + t('crypto.totalValue') + simBadge() + '</div>' +
      '<div class="portfolio-value">' + CurrencyEngine.format(snap.totalUSD, 'USD') + '</div>' +
      '<span class="portfolio-change ' + (snap.totalChangePct >= 0 ? 'up' : 'down') + '">' + icon(snap.totalChangePct >= 0 ? 'trending' : 'arrowDownRight', 14) + ' ' + (snap.totalChangePct >= 0 ? '+' : '') + snap.totalChangePct.toFixed(2) + '% (24h)</span>' +
    '</div>' +
    '<div class="screen-body" style="padding-top:0">' +
      '<div class="quick">' +
        quickItem('crypto-buy', 'plus', 'crypto.buy') +
        quickItem('crypto-sell', 'minus', 'crypto.sell') +
        quickItem('crypto-swap', 'swap', 'crypto.swap') +
        quickItem('crypto-send', 'send', 'crypto.send') +
        quickItem('crypto-to-bank', 'bank', 'crypto.toBank') +
      '</div>' +
      '<div class="glass" style="padding:calc(6px*var(--ui)) calc(18px*var(--ui))">' + (snap.rows.length ? snap.rows.map(r => assetRowC(r)).join('') : '<div class="empty"><div class="empty-sub">—</div></div>') + '</div>' +
      '<div class="section"><span class="section-title">' + t('crypto.history') + '</span></div>' +
      '<div class="glass" style="padding:calc(6px*var(--ui)) calc(18px*var(--ui))">' +
        (emptyActivity ? '<div class="empty" style="padding:var(--sp-6) 0"><div class="empty-sub">' + t('home.no_tx') + '</div></div>'
          : recent.map(tx => {
              const credit = tx.direction === 'IN';
              const amt = tx.asset ? CurrencyEngine.formatCrypto(tx.amount, tx.asset) : CurrencyEngine.format(tx.amount, tx.currency || 'OMR');
              const typeLabel = tx.type === 'CRYPTO_BUY' ? t('crypto.buy') : tx.type === 'CRYPTO_SELL' ? t('crypto.sell') : tx.type === 'CRYPTO_SWAP' ? t('crypto.swap') : tx.type === 'CRYPTO_TO_BANK' ? t('crypto.toBank') : t('crypto.send');
              const ic = tx.type === 'CRYPTO_BUY' ? 'arrowDownRight' : tx.type === 'CRYPTO_SELL' ? 'arrowUpRight' : tx.type === 'CRYPTO_SWAP' ? 'swap' : 'send';
              return '<div class="crypto-activity-row" data-action="view-tx" data-tx="' + tx.id + '">' +
                '<div class="crypto-activity-icon ' + (credit ? 'credit' : 'debit') + '">' + icon(ic, 18) + '</div>' +
                '<div class="crypto-activity-body"><div class="crypto-activity-title">' + escapeHtml(typeLabel) + ' ' + escapeHtml(tx.asset || '') + '</div>' +
                  '<div class="crypto-activity-sub">' + escapeHtml(timeAgo(tx.createdAt)) + ' · ' + escapeHtml(tx.status || '') + '</div>' +
                '</div>' +
                '<div class="crypto-activity-amount ' + (credit ? 'credit' : '') + '">' + (credit ? '+' : '−') + escapeHtml(amt) + '</div>' +
              '</div>';
            }).join('')) +
      '</div>' +
    '</div>';
}
Object.assign(YT.en, { svcTitle:'Services', gMoney:'Money', gCrypto:'Crypto', gAccount:'Account & help', movers:'Top movers', tabTop:'Top', tabPrice:'Price', tab24:'24h %', help:'Help', privacy:'Privacy', mkt:'Markets', buyC:'Buy crypto', sellC:'Sell crypto', swapC:'Swap', recvC:'Receive crypto', nets:'Networks' });
Object.assign(YT.fr, { svcTitle:'Services', gMoney:'Argent', gCrypto:'Crypto', gAccount:'Compte et aide', movers:'Plus fortes variations', tabTop:'Top', tabPrice:'Prix', tab24:'24h %', help:'Aide', privacy:'Confidentialité', mkt:'Marchés', buyC:'Acheter', sellC:'Vendre', swapC:'Échanger', recvC:'Recevoir', nets:'Réseaux' });
Object.assign(YT.ar, { svcTitle:'الخدمات', gMoney:'الأموال', gCrypto:'العملات الرقمية', gAccount:'الحساب والمساعدة', movers:'الأكثر تحرّكاً', tabTop:'الأبرز', tabPrice:'السعر', tab24:'24 ساعة %', help:'المساعدة', privacy:'الخصوصية', mkt:'الأسواق', buyC:'شراء', sellC:'بيع', swapC:'مبادلة', recvC:'استلام', nets:'الشبكات' });
function ybRows(assets, sortBy){
  if (!assets.length) return '<div class="yb-empty">—</div>';
  const list = assets.slice();
  if (sortBy === 'change') list.sort((a, b) => b.change24h - a.change24h); else list.sort((a, b) => b.price - a.price);
  if (sortBy === 'rank') list.sort((a, b) => b.price - a.price);
  return list.map(a => '<button class="yb-row" data-nav="crypto-spot" data-asset="' + a.id + '">' + assetLogo(a.symbol, 38, a.tint) +
    '<span class="yb-row-m"><b>' + a.symbol + '</b><small>' + escapeHtml(a.name) + '</small></span>' +
    '<span class="yb-spark">' + sparklineSvg(a.symbol) + '</span>' +
    '<span class="yb-row-p">' + escapeHtml(CurrencyEngine.format(a.price, 'USD')) + '</span>' +
    '<span class="yb-chg ' + (a.change24h >= 0 ? 'up' : 'dn') + '">' + (a.change24h >= 0 ? '+' : '') + a.change24h.toFixed(2) + '%</span></button>').join('');
}
function renderMarketRows(assets, sortBy){ return ybRows(assets, sortBy); }
function renderCryptoMarket(){
  const assets = CryptoMarketEngine.list();
  const mv = assets.slice().sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 3);
  return '<div class="yb"><div class="yb-top"><button class="yb-ic" data-action="back" aria-label="' + t('ui.back') + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 22) + '</span></button>' +
    '<h1 class="yb-title">' + yt('mkt') + '</h1><span style="width:44px"></span></div>' +
    '<div class="yb-sec"><div class="yb-h"><h2>' + yt('movers') + '</h2></div><div class="yb-movers">' +
      mv.map(a => '<button class="yb-mv" data-nav="crypto-spot" data-asset="' + a.id + '"><span class="yb-mv-h">' + assetLogo(a.symbol, 28, a.tint) + '<b>' + a.symbol + '</b></span>' +
        '<span class="yb-mv-p">' + escapeHtml(CurrencyEngine.format(a.price, 'USD')) + '</span><span class="yb-chg ' + (a.change24h >= 0 ? 'up' : 'dn') + '">' + (a.change24h >= 0 ? '+' : '') + a.change24h.toFixed(2) + '%</span></button>').join('') +
    '</div></div>' +
    '<div class="yb-search" style="margin-bottom:12px;cursor:text">' + icon('search', 16) + '<input type="text" id="crypto-market-search" placeholder="' + escapeHtml(yt('search')) + '" autocomplete="off" style="flex:1;min-width:0;background:none;border:0;outline:0;color:var(--text);font-size:16px;height:100%"></div>' +
    '<div class="yb-tabs" id="crypto-market-sort"><button class="yb-tab" data-sort="rank" aria-pressed="true">' + yt('tabTop') + '</button><button class="yb-tab" data-sort="price" aria-pressed="false">' + yt('tabPrice') + '</button><button class="yb-tab" data-sort="change" aria-pressed="false">' + yt('tab24') + '</button></div>' +
    '<div class="yb-list" id="crypto-market-list">' + ybRows(assets, 'rank') + '</div><div style="height:calc(24px + var(--safe-b))"></div></div>';
}
function renderServices(){
  const G = [
    ['gMoney', [['country-select','send','send']].concat(FEATURES.crypto ? [['banks','bank','banks']] : [], [['cards','cards','cards'],['history','history','history']])],
    ['gCrypto', [['crypto-buy','plus','buyC'],['crypto-sell','minus','sellC'],['crypto-swap','swap','swapC'],['crypto-receive','receive','recvC'],['crypto-market','chart','mkt'],['crypto-networks','network','nets']]],
    ['gAccount', [['profile','user','profile'],['notifications','bell','notifications'],['settings','settings','settings'],['help','globe','help'],['privacy','shield','privacy']]]
  ];
  /* 16.0.0 : Transfert international (seulement si le serveur le propose) ; groupe Administration pour les administrateurs */
  const intlOn = (typeof LiveX !== 'undefined' && LiveX.caps.intl === true);   /* 21.3.0 : section dédiée « Transferts internationaux » (plus mêlée aux autres services) */
  G.splice(1, 0, ['v18.g.grow', [['invest','trend','v18.boost'],['kyc','shield','v19.kyc'],['withdraw','bank','v19.withdraw'],['credit','coins','v18.credit'],['chat','chat','v18.chat'],['yaser','bot','v18.yaser'],['cinema','film','v18.cinema']]]);   /* 18.0.0 */
  const adminTile = (typeof LiveX !== 'undefined' && Runtime.ctx && Runtime.ctx.role === 'admin');
  /* groupe Blockchain (YOR-USDT, réseau de test) : administrateurs uniquement */
  if (FEATURES.crypto && typeof canUseChain === 'function' && canUseChain()) G.splice(1, 0, ['gChain', [['chain','wallet','chainTile']]]);
  /* 21.3.0 — le groupe Crypto est masqué avec le reste de la section crypto (ses lignes mèneraient à une page vide).
     Le code d'origine retirait « G.splice(1, 1) », qui retirait en réalité le groupe « Croissance » (Boost, vérification d'identité, retrait, crédit, chat, Amal, cinéma) et laissait le groupe Crypto affiché.
     Comportement visible CONSERVÉ pour le groupe « Croissance » (toujours masqué, décision du propriétaire en attente : STATUT_SANAD_PAY.md) ; le groupe Crypto, lui, n'est plus affiché quand la section crypto est désactivée. */
  const GROW_IN_MENU = false;
  if (!FEATURES.crypto){ const i = G.findIndex(g => g[0] === 'gCrypto'); if (i >= 0) G.splice(i, 1); }
  if (!GROW_IN_MENU){ const i = G.findIndex(g => g[0] === 'v18.g.grow'); if (i >= 0) G.splice(i, 1); }
  /* Sanad Pay 21.0.0 — liste groupée (tuile carrée arrondie + libellé + chevron) ; mêmes data-nav qu'avant */
  const lab = s => (/^(lx|v18)\./.test(s[2]) ? t(s[2]) : yt(s[2]));
  /* section dédiée : régions, services de retrait disponibles (noms du catalogue), une seule action */
  const intlBlock = !intlOn ? '' : (() => {
    const cnt = {}; INTL_CATALOG.forEach(c => Object.keys(c.providers || {}).forEach(m => (c.providers[m] || []).forEach(n => { cnt[n] = (cnt[n] || 0) + 1; })));
    const first = ['Orange Money', 'Wave'], rest = Object.keys(cnt).filter(n => first.indexOf(n) < 0).sort((a, b) => cnt[b] - cnt[a]).slice(0, 5);
    const names = first.filter(n => cnt[n]).concat(rest);
    const regions = INTL_GROUPS.map(g => '<span class="svc-tag">' + escapeHtml(IntlX.e('g.' + g.id)) + '</span>').join('');
    return '<section class="sx-grp svc-intl" data-svc-keep="1"><h2 class="sx-grp-h">' + escapeHtml(t('set21.intl')) + '</h2>' +
      '<div class="svc-intl-card"><div class="svc-intl-top"><span class="tile">' + icon('globe', 22) + '</span><span class="svc-intl-t"><b>' + escapeHtml(IntlX.e('title')) + '</b><small>' + escapeHtml(IntlX.e('sub').replace('{n}', String(INTL_CATALOG.length))) + '</small></span></div>' +
      '<div class="svc-tags" aria-label="' + escapeHtml(t('set21.intlRegions')) + '">' + regions + '</div>' +
      '<div class="svc-meth"><small>' + escapeHtml(t('set21.intlVia')) + '</small><div class="svc-tags">' + names.map(n => '<span class="svc-tag is-svc">' + escapeHtml(n) + '</span>').join('') + '</div></div>' +
      '<button class="btn btn-primary" data-nav="intl">' + escapeHtml(IntlX.e('promoC')) + '</button></div></section>';
  })();
  return '<div class="screen-body sx-svc"><h1 class="sx-title">' + yt('svcTitle') + '</h1>' +
    '<div class="svc-search field-box"><span aria-hidden="true">' + icon('search', 18) + '</span><input type="search" id="svc-q" autocomplete="off" aria-label="' + escapeHtml(t('set21.svcSearch')) + '" placeholder="' + escapeHtml(t('set21.svcSearch')) + '"></div>' + intlBlock +
    G.map(g => '<section class="sx-grp"><h2 class="sx-grp-h">' + (g[0].indexOf('v18.') === 0 ? t(g[0]) : yt(g[0])) + '</h2><div class="sx-list">' +
      g[1].map(s => '<button class="settings-row sx-svc-row" data-nav="' + s[0] + '"><span class="tile">' + icon(s[1], 22) + '</span><span class="settings-row-body"><span class="settings-row-title">' + lab(s) + '</span></span><span class="settings-row-chev dir-flip">' + icon('chev', 18) + '</span></button>').join('') + '</div></section>').join('') +
    (adminTile ? '<section class="sx-grp"><h2 class="sx-grp-h">' + escapeHtml(t('lx.svc.gAdmin')) + '</h2><div class="sx-list"><button class="settings-row sx-svc-row" data-nav="admin-hub"><span class="tile">' + icon('admin', 22) + '</span><span class="settings-row-body"><span class="settings-row-title">' + escapeHtml(t('lx.svc.admin')) + '</span></span><span class="settings-row-chev dir-flip">' + icon('chev', 18) + '</span></button></div></section>' : '') +
    '<div class="sx-end"></div></div>';
}
