'use strict';

/* ============================================================
   TRANSFERT INTERNATIONAL (16.0.0) — Golfe, Afrique (Nord, Ouest, Centre, Est, Australe), États-Unis, Canada.
   Écrans : intl (destination) → intl-method (moyen de retrait) → intl-details (bénéficiaire) → intl-amount → intl-review → [PIN / Face ID]
            → processing (animation d'envoi existante) → receipt (reçu existant) ; intl-result : « statut à vérifier » ou échec.
   - Chaque pays a SES moyens de retrait (compte bancaire, mobile money avec ses services, retrait en espèces, Interac) : js/data/intl-catalog.js.
   - Délai de retrait : toujours 48 h à 72 h (2 à 3 jours). Le statut avance côté serveur (PROCESSING → UNDER_REVIEW → COMPLETED).
   - Les montants sont débités du compte OMR ; la saisie se fait dans la devise d'affichage (USD par défaut) ou en OMR. Aucun frais.
   - Montant « à recevoir » : seulement avec un taux CONFIGURÉ (table fx_rates) ; sans taux, rien n'est inventé.
   - Sécurité : la fonction serveur intl_send exige le code PIN (grant à usage unique), une clé d'idempotence, et refuse tout pays / moyen absent de
     sa table intl_countries. Une requête sans réponse lisible n'est JAMAIS renvoyée automatiquement (écran « statut à vérifier »).
   - Le service n'apparaît que si le serveur répond avec sa table de pays (LiveX.caps.intl).
   ============================================================ */
const IntlX = (() => {
  const E = {
    en: {
      title: 'International transfer', sub: 'Send to {n} countries · bank, mobile money or cash', eta: '48–72 h', etaLong: 'Arrives in 48 to 72 hours (2–3 days)',
      'g.GULF': 'Gulf', 'g.AFRICA': 'Africa', 'g.USA': 'USA', 'g.CANADA': 'Canada',
      'r.ALL': 'All', 'r.NORTH_AFRICA': 'North', 'r.WEST_AFRICA': 'West', 'r.CENTRAL_AFRICA': 'Central', 'r.EAST_AFRICA': 'East', 'r.SOUTH_AFRICA': 'Southern',
      search: 'Search a country', none: 'No country found', how: 'How will they receive it?', who: 'Who is receiving?',
      'm.BANK': 'Bank account', 'm.MOBILE_MONEY': 'Mobile money', 'm.CASH_PICKUP': 'Cash pickup', 'm.INTERAC': 'Interac e-Transfer',
      'md.BANK': 'Straight to their bank account', 'md.MOBILE_MONEY': 'To their mobile wallet', 'md.CASH_PICKUP': 'They collect cash at a partner counter', 'md.INTERAC': 'Sent to their e-mail address',
      first: 'First name', last: 'Last name', bank: 'Bank name', acct: 'Account number / IBAN', routing: 'Routing number (9 digits)', provider: 'Mobile money service', phone: 'Recipient mobile number',
      city: 'City where they will collect', email: 'Recipient e-mail', next: 'Continue', check: 'Please check: {f}',
      amount: 'Amount to send', youPay: 'You pay', fees: 'Fees', free: 'None', theyGet: 'They receive (estimate)', localRate: 'Paid out in {c} at the payout rate', avail: 'Available',
      min: 'Minimum {a}', max: 'Maximum {a} per transfer', insuff: 'Not enough balance', review: 'Review', to: 'To', country: 'Country', method: 'Payout method', service: 'Service', account: 'Account',
      total: 'Total debited', arrives: 'Arrives', confirm: 'Confirm and send', note: 'The amount leaves your wallet now. Payout takes 48 to 72 hours.', rate: 'Rate (configured)',
      uncertain: 'Status to check', uncertainD: 'We did not get an answer in time. Your transfer may have been recorded. Check your history before trying again.', checkSt: 'Check status', hist: 'Open history',
      fail: 'Transfer not completed', retry: 'Try again', notReady: 'International transfer is not available yet.', recorded: 'Transfer recorded', recordedD: 'Your transfer is recorded. Payout takes 48 to 72 hours.',
      offline: 'You are offline: nothing was sent.', promoT: 'Send money around the world', promoB: 'Gulf, Africa, USA and Canada — bank, mobile money or cash pickup.', promoC: 'Send abroad',
      from: 'From', convert: 'Switch currency',
    },
    fr: {
      title: 'Transfert international', sub: 'Envoyez vers {n} pays · banque, mobile money ou espèces', eta: '48–72 h', etaLong: 'Arrive sous 48 à 72 heures (2 à 3 jours)',
      'g.GULF': 'Golfe', 'g.AFRICA': 'Afrique', 'g.USA': 'USA', 'g.CANADA': 'Canada',
      'r.ALL': 'Tous', 'r.NORTH_AFRICA': 'Nord', 'r.WEST_AFRICA': 'Ouest', 'r.CENTRAL_AFRICA': 'Centre', 'r.EAST_AFRICA': 'Est', 'r.SOUTH_AFRICA': 'Australe',
      search: 'Rechercher un pays', none: 'Aucun pays trouvé', how: 'Comment le recevra-t-il ?', who: 'Qui reçoit ?',
      'm.BANK': 'Compte bancaire', 'm.MOBILE_MONEY': 'Mobile money', 'm.CASH_PICKUP': 'Retrait en espèces', 'm.INTERAC': 'Virement Interac',
      'md.BANK': 'Directement sur son compte bancaire', 'md.MOBILE_MONEY': 'Sur son portefeuille mobile', 'md.CASH_PICKUP': 'Il retire les espèces chez un partenaire', 'md.INTERAC': 'Envoyé à son adresse e-mail',
      first: 'Prénom', last: 'Nom', bank: 'Nom de la banque', acct: 'Numéro de compte / IBAN', routing: 'Numéro de routage (9 chiffres)', provider: 'Service mobile money', phone: 'Numéro de mobile du bénéficiaire',
      city: 'Ville de retrait', email: 'E-mail du bénéficiaire', next: 'Continuer', check: 'À vérifier : {f}',
      amount: 'Montant à envoyer', youPay: 'Vous payez', fees: 'Frais', free: 'Aucun', theyGet: 'Il reçoit (estimation)', localRate: 'Versé en {c} au taux du jour de versement', avail: 'Disponible',
      min: 'Minimum {a}', max: 'Maximum {a} par transfert', insuff: 'Solde insuffisant', review: 'Vérification', to: 'À', country: 'Pays', method: 'Moyen de retrait', service: 'Service', account: 'Compte',
      total: 'Total débité', arrives: 'Arrivée', confirm: 'Confirmer et envoyer', note: 'Le montant quitte votre portefeuille maintenant. Le versement prend 48 à 72 heures.', rate: 'Taux (configuré)',
      uncertain: 'Statut à vérifier', uncertainD: 'Nous n’avons pas reçu de réponse à temps. Votre transfert a peut-être été enregistré. Consultez votre historique avant de réessayer.', checkSt: 'Vérifier le statut', hist: 'Ouvrir l’historique',
      fail: 'Transfert non abouti', retry: 'Réessayer', notReady: 'Le transfert international n’est pas encore disponible.', recorded: 'Transfert enregistré', recordedD: 'Votre transfert est enregistré. Le versement prend 48 à 72 heures.',
      offline: 'Vous êtes hors ligne : rien n’a été envoyé.', promoT: 'Envoyez de l’argent dans le monde', promoB: 'Golfe, Afrique, USA et Canada — banque, mobile money ou retrait en espèces.', promoC: 'Envoyer à l’étranger',
      from: 'De', convert: 'Changer de devise',
    },
    ar: {
      title: 'التحويل الدولي', sub: 'أرسل إلى {n} دولة · بنك أو محفظة هاتف أو نقداً', eta: '48–72 ساعة', etaLong: 'يصل خلال 48 إلى 72 ساعة (2–3 أيام)',
      'g.GULF': 'الخليج', 'g.AFRICA': 'أفريقيا', 'g.USA': 'أمريكا', 'g.CANADA': 'كندا',
      'r.ALL': 'الكل', 'r.NORTH_AFRICA': 'الشمال', 'r.WEST_AFRICA': 'الغرب', 'r.CENTRAL_AFRICA': 'الوسط', 'r.EAST_AFRICA': 'الشرق', 'r.SOUTH_AFRICA': 'الجنوب',
      search: 'ابحث عن دولة', none: 'لا توجد دولة مطابقة', how: 'كيف سيستلم المبلغ؟', who: 'من سيستلم؟',
      'm.BANK': 'حساب بنكي', 'm.MOBILE_MONEY': 'محفظة هاتف', 'm.CASH_PICKUP': 'استلام نقدي', 'm.INTERAC': 'تحويل إنتراك',
      'md.BANK': 'مباشرة إلى حسابه البنكي', 'md.MOBILE_MONEY': 'إلى محفظته على الهاتف', 'md.CASH_PICKUP': 'يستلم النقد من نقطة شريكة', 'md.INTERAC': 'يُرسل إلى بريده الإلكتروني',
      first: 'الاسم الأول', last: 'اسم العائلة', bank: 'اسم البنك', acct: 'رقم الحساب / IBAN', routing: 'رقم التوجيه (9 أرقام)', provider: 'خدمة محفظة الهاتف', phone: 'رقم هاتف المستفيد',
      city: 'مدينة الاستلام', email: 'البريد الإلكتروني للمستفيد', next: 'متابعة', check: 'يرجى التحقق من: {f}',
      amount: 'المبلغ المراد إرساله', youPay: 'تدفع', fees: 'الرسوم', free: 'لا توجد', theyGet: 'يستلم (تقدير)', localRate: 'يُدفع بعملة {c} بسعر يوم الدفع', avail: 'المتاح',
      min: 'الحد الأدنى {a}', max: 'الحد الأقصى {a} للتحويل', insuff: 'الرصيد غير كافٍ', review: 'مراجعة', to: 'إلى', country: 'الدولة', method: 'طريقة الاستلام', service: 'الخدمة', account: 'الحساب',
      total: 'إجمالي المبلغ المخصوم', arrives: 'الوصول', confirm: 'تأكيد وإرسال', note: 'يخرج المبلغ من محفظتك الآن. يستغرق الدفع من 48 إلى 72 ساعة.', rate: 'السعر (مُعدّ)',
      uncertain: 'الحالة تحتاج إلى تحقق', uncertainD: 'لم نتلقَّ رداً في الوقت المناسب. ربما تم تسجيل تحويلك. راجع السجل قبل المحاولة مجدداً.', checkSt: 'التحقق من الحالة', hist: 'فتح السجل',
      fail: 'لم يكتمل التحويل', retry: 'حاول مجدداً', notReady: 'التحويل الدولي غير متاح بعد.', recorded: 'تم تسجيل التحويل', recordedD: 'تم تسجيل تحويلك. يستغرق الدفع من 48 إلى 72 ساعة.',
      offline: 'أنت غير متصل: لم يُرسل أي شيء.', promoT: 'أرسل الأموال حول العالم', promoB: 'الخليج وأفريقيا وأمريكا وكندا — بنك أو محفظة هاتف أو استلام نقدي.', promoC: 'إرسال إلى الخارج',
      from: 'من', convert: 'تغيير العملة',
    },
  };
  const e = k => (E[LANG] && E[LANG][k]) || E.en[k] || k;
  const ef = (k, v) => e(k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));
  const S = { group: 'AFRICA', region: 'ALL', q: '', iso: null, method: null, provider: '', f: {}, dial: '', amtStr: '', inCur: null, key: null, busy: false, last: null };
  const reset = () => { Object.assign(S, { iso: null, method: null, provider: '', f: {}, dial: '', amtStr: '', inCur: null, key: null, busy: false, last: null }); };

  /* ---------- données ---------- */
  const entry = iso => INTL_CATALOG.find(c => c.iso === iso) || null;
  const cur = () => entry(S.iso);
  const flag = iso => String.fromCodePoint(...[...iso].map(ch => 127397 + ch.charCodeAt(0)));
  const cname = iso => { try { return new Intl.DisplayNames([LANG], { type: 'region' }).of(iso) || iso; } catch(err){ return iso; } };
  const curName = c => { try { return new Intl.DisplayNames([LANG], { type: 'currency' }).of(c) || c; } catch(err){ return c; } };
  const omrBalance = () => { const a = (Runtime.accounts || []).find(x => x.type === 'MAIN' && x.currency === 'OMR') || (Runtime.accounts || []).find(x => x.currency === 'OMR'); return a ? Number(a.availableBalance != null ? a.availableBalance : a.balance) || 0 : 0; };
  const dispCur = () => { try { return displayCurrency(); } catch(err){ return 'USD'; } };
  const rate = (from, to) => { try { const r = ExchangeEngine.rate(from, to); return r != null && isFinite(r) && r > 0 ? r : null; } catch(err){ return null; } };
  const fmt = (n, c) => { try { return CurrencyEngine.format(n, c); } catch(err){ return n + ' ' + c; } };
  const toOmr = (x, c) => { if (!isFinite(x) || x <= 0) return 0; if (c === 'OMR') return Math.round(x * 1000) / 1000; const r = rate('OMR', c); return r ? Math.round((x / r) * 1000) / 1000 : 0; };
  const inCur = () => S.inCur || dispCur();
  const idemKey = () => (S.key = S.key || (typeof uuid === 'function' ? uuid() : (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))));

  function groupList(){
    const g = INTL_GROUPS.find(x => x.id === S.group) || INTL_GROUPS[1];
    let l = INTL_CATALOG.filter(c => g.regions.indexOf(c.region) >= 0 && (!g.only || g.only.indexOf(c.iso) >= 0));
    if (S.group === 'AFRICA' && S.region !== 'ALL') l = l.filter(c => c.region === S.region);
    const q = S.q.trim().toLowerCase();
    if (q) l = INTL_CATALOG.filter(c => (cname(c.iso) + ' ' + c.iso + ' ' + c.cur).toLowerCase().indexOf(q) >= 0);
    return l.slice().sort((a, b) => cname(a.iso).localeCompare(cname(b.iso), LANG));
  }

  /* ---------- gabarits ---------- */
  const top = (title, back) => '<div class="topbar px-topbar"><button class="topbar-back" data-action="back" aria-label="' + escapeHtml(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button>' +
    '<span class="topbar-title">' + escapeHtml(title) + '</span><span style="width:calc(44px*var(--ui))"></span></div>';
  const eta = () => '<span class="ix-eta">' + icon('clock', 13) + escapeHtml(e('eta')) + '</span>';
  const mIcon = { BANK: 'bank', MOBILE_MONEY: 'mobile', CASH_PICKUP: 'banknote', INTERAC: 'mail' };
  const crumb = () => { const c = cur(); return c ? '<div class="ix-crumb"><span class="ix-flag">' + flag(c.iso) + '</span><b>' + escapeHtml(cname(c.iso)) + '</b><small class="ltr" dir="ltr">' + c.cur + '</small></div>' : ''; };

  function rowHtml(c){
    return '<button type="button" class="ix-row" data-ix="pick" data-iso="' + c.iso + '"><span class="ix-flag">' + flag(c.iso) + '</span>' +
      '<span class="ix-row-b"><b>' + escapeHtml(cname(c.iso)) + '</b><small>' + escapeHtml(c.cur + ' · ' + c.methods.map(m => e('m.' + m)).join(' · ')) + '</small></span>' + eta() + '<span class="ix-chev">' + icon('chev', 16) + '</span></button>';
  }
  function listHtml(){
    const l = groupList();
    return l.length ? l.map(rowHtml).join('') : '<div class="ix-none">' + icon('globe', 28) + '<span>' + escapeHtml(e('none')) + '</span></div>';
  }
  function globe(){
    return '<svg class="ix-globe" viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="ixg" cx="35%" cy="30%"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#FFC83D"/><stop offset="1" stop-color="#B07A08"/></radialGradient></defs>' +
      '<circle cx="60" cy="60" r="38" fill="url(#ixg)"/><g fill="none" stroke="#14110A" stroke-opacity=".55" stroke-width="1.6"><ellipse cx="60" cy="60" rx="38" ry="14"/><ellipse cx="60" cy="60" rx="14" ry="38"/><path d="M22 60h76M60 22v76"/></g>' +
      '<g class="ix-orbit"><circle cx="60" cy="14" r="5" fill="#fff"/><circle cx="104" cy="70" r="4" fill="#FFE08A"/><circle cx="20" cy="84" r="3.5" fill="#fff"/></g>' +
      '<circle class="ix-ring" cx="60" cy="60" r="52" fill="none" stroke="#FFC83D" stroke-opacity=".5" stroke-dasharray="2 5"/></svg>';
  }

  /* ---------- écrans ---------- */
  function renderIntl(){
    const g = INTL_GROUPS.find(x => x.id === S.group) || INTL_GROUPS[1];
    return top(e('title')) + '<div class="screen-body ix-body">' +
      '<div class="ix-hero"><div class="ix-hero-t"><b>' + escapeHtml(e('title')) + '</b><span>' + escapeHtml(ef('sub', { n: INTL_CATALOG.length })) + '</span>' + eta() + '</div>' + globe() + '</div>' +
      '<div class="ix-seg" role="tablist">' + INTL_GROUPS.map(x => '<button type="button" role="tab" data-ix="group" data-g="' + x.id + '" aria-selected="' + (x.id === S.group) + '">' + escapeHtml(e('g.' + x.id)) + '</button>').join('') + '</div>' +
      (g.id === 'AFRICA' ? '<div class="ix-regions">' + ['ALL'].concat(g.regions).map(r => '<button type="button" class="chip" data-ix="region" data-r="' + r + '" aria-pressed="' + (r === S.region) + '">' + escapeHtml(e('r.' + r)) + '</button>').join('') + '</div>' : '') +
      '<div class="field-box ix-search">' + icon('search', 16) + '<input type="search" id="ix-q" autocomplete="off" placeholder="' + escapeHtml(e('search')) + '" value="' + escapeHtml(S.q) + '" aria-label="' + escapeHtml(e('search')) + '"></div>' +
      '<div class="ix-list" id="ix-list">' + listHtml() + '</div><div style="height:calc(96px + var(--safe-b))"></div></div>';
  }
  function renderMethod(){
    const c = cur(); if (!c){ R.go('intl'); return ''; }
    return top(e('how')) + '<div class="screen-body ix-body">' + crumb() +
      c.methods.map(m => '<button type="button" class="ix-card" data-ix="method" data-m="' + m + '"><span class="ix-card-i">' + icon(mIcon[m], 24) + '</span>' +
        '<span class="ix-card-b"><b>' + escapeHtml(e('m.' + m)) + '</b><small>' + escapeHtml(e('md.' + m)) + '</small>' +
        (m === 'MOBILE_MONEY' && c.providers.MOBILE_MONEY ? '<span class="ix-provs">' + c.providers.MOBILE_MONEY.map(p => '<i>' + escapeHtml(p) + '</i>').join('') + '</span>' : '') + '</span>' + eta() + '</button>').join('') +
      '<div style="height:calc(96px + var(--safe-b))"></div></div>';
  }
  const field = (id, label, o) => { o = o || {}; return '<div class="field"><label class="field-label" for="' + id + '">' + escapeHtml(label) + '</label><div class="field-box' + (o.ltr ? ' ltr' : '') + '">' +
    (o.prefix ? '<span class="ix-prefix ltr" dir="ltr">+' + escapeHtml(o.prefix) + '</span>' : '') +
    '<input type="' + (o.type || 'text') + '" id="' + id + '" autocomplete="' + (o.ac || 'off') + '"' + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + (o.ltr ? ' dir="ltr"' : '') + ' value="' + escapeHtml(S.f[id] || '') + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + '></div></div>'; };
  function renderDetails(){
    const c = cur(); if (!c || !S.method){ R.go('intl'); return ''; }
    const m = S.method, dial = INTL_DIAL[c.iso] || '';
    let h = top(e('who')) + '<div class="screen-body ix-body">' + crumb() + '<div class="ix-chosen">' + icon(mIcon[m], 18) + '<b>' + escapeHtml(e('m.' + m)) + '</b>' + eta() + '</div>';
    h += '<div class="ix-two">' + field('ix-first', e('first'), { ac: 'given-name', max: 40 }) + field('ix-last', e('last'), { ac: 'family-name', max: 40 }) + '</div>';
    if (m === 'BANK'){
      h += field('ix-bank', e('bank'), { max: 60 }) + field('ix-acct', e('acct'), { ltr: true, max: 40, ac: 'off' });
      if (c.iso === 'US') h += field('ix-routing', e('routing'), { ltr: true, inputmode: 'numeric', max: 9 });
    } else if (m === 'MOBILE_MONEY'){
      h += '<div class="field"><div class="field-label">' + escapeHtml(e('provider')) + '</div><div class="chips ix-chips" id="ix-provs">' +
        (c.providers.MOBILE_MONEY || []).map(p => '<button type="button" class="chip" data-ix="prov" data-p="' + escapeHtml(p) + '" aria-pressed="' + (S.provider === p) + '">' + escapeHtml(p) + '</button>').join('') + '</div></div>' +
        field('ix-phone', e('phone'), { ltr: true, type: 'tel', inputmode: 'tel', prefix: dial, ac: 'tel-national', max: 18 });
    } else if (m === 'CASH_PICKUP'){
      h += field('ix-phone', e('phone'), { ltr: true, type: 'tel', inputmode: 'tel', prefix: dial, ac: 'tel-national', max: 18 }) + field('ix-city', e('city'), { max: 60 });
    } else if (m === 'INTERAC'){
      h += field('ix-email', e('email'), { ltr: true, type: 'email', ac: 'email', max: 80 });
    }
    h += '<div class="field-err" id="ix-err" role="alert"></div><button type="button" class="btn btn-primary" id="ix-go" data-ix="details-next">' + escapeHtml(e('next')) + '</button><div style="height:calc(40px + var(--safe-b))"></div></div>';
    return h;
  }
  /* valeurs saisies → bénéficiaire (mêmes règles que le serveur) ; rend { ok, p } ou { ok:false, f } */
  function collect(root){
    const c = cur(), m = S.method, v = id => { const el = root.querySelector('#' + id); const x = el ? el.value.trim() : ''; S.f[id] = x; return x; };
    const p = { firstName: v('ix-first'), lastName: v('ix-last') };
    if (!p.firstName) return { ok: false, f: e('first') };
    if (!p.lastName) return { ok: false, f: e('last') };
    if (m === 'BANK'){
      p.bankName = v('ix-bank'); p.account = v('ix-acct').replace(/[\s-]/g, '').toUpperCase();
      if (p.bankName.length < 2) return { ok: false, f: e('bank') };
      if (!/^[A-Z0-9]{6,34}$/.test(p.account)) return { ok: false, f: e('acct') };
      if (c.iso === 'US'){ p.routing = v('ix-routing'); if (!/^[0-9]{9}$/.test(p.routing)) return { ok: false, f: e('routing') }; }
    } else if (m === 'MOBILE_MONEY' || m === 'CASH_PICKUP'){
      if (m === 'MOBILE_MONEY' && !S.provider) return { ok: false, f: e('provider') };
      const ph = signupPhone('+' + (INTL_DIAL[c.iso] || ''), v('ix-phone'));
      if (!ph) return { ok: false, f: e('phone') };
      p.phone = ph;
      if (m === 'CASH_PICKUP'){ p.city = v('ix-city'); if (p.city.length < 2) return { ok: false, f: e('city') }; }
    } else if (m === 'INTERAC'){
      p.email = v('ix-email'); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return { ok: false, f: e('email') };
    }
    return { ok: true, p };
  }
  function amountCalc(){
    const c = cur(), cc = inCur(), x = parseFloat(String(S.amtStr).replace(',', '.')), omr = toOmr(x, cc);
    const bal = omrBalance(), min = 0.5, max = 3000;
    let err = '';
    if (!(x > 0)) err = ''; else if (omr < min) err = ef('min', { a: fmt(min, 'OMR') }); else if (omr > max) err = ef('max', { a: fmt(max, 'OMR') }); else if (omr > bal + 1e-9) err = e('insuff');
    const r = c ? rate('OMR', c.cur) : null;
    return { x, cc, omr, err, valid: x > 0 && !err && omr > 0, dest: r && omr > 0 ? omr * r : null, bal };
  }
  function summaryRows(a){
    const c = cur();
    return '<div class="ix-sum">' +
      '<div><span>' + escapeHtml(e('youPay')) + '</span><b class="ltr" dir="ltr" id="ix-pay">' + (a.omr > 0 ? escapeHtml(fmt(a.omr, 'OMR')) : '—') + '</b></div>' +
      '<div><span>' + escapeHtml(e('fees')) + '</span><b>' + escapeHtml(e('free')) + '</b></div>' +
      '<div><span>' + escapeHtml(e('theyGet')) + '</span><b class="ltr" dir="ltr" id="ix-get">' + (a.dest != null ? '≈ ' + escapeHtml(fmt(a.dest, c.cur)) : '<small>' + escapeHtml(ef('localRate', { c: c.cur })) + '</small>') + '</b></div>' +
      '<div><span>' + escapeHtml(e('arrives')) + '</span><b>' + escapeHtml(e('eta')) + '</b></div></div>';
  }
  function renderAmount(){
    const c = cur(); if (!c || !S.method || !S.f['ix-first']){ R.go('intl'); return ''; }
    const a = amountCalc(), cc = a.cc, other = cc === 'OMR' ? dispCur() : 'OMR';
    return top(e('amount')) + '<div class="screen-body ix-body">' + crumb() +
      '<div class="ix-amt"><button type="button" class="ix-cur" data-ix="cur" aria-label="' + escapeHtml(e('convert')) + '"><b>' + escapeHtml(cc) + '</b>' + icon('swap', 14) + '</button>' +
        '<input type="text" id="ix-amt" inputmode="decimal" autocomplete="off" dir="ltr" placeholder="0" value="' + escapeHtml(S.amtStr) + '" aria-label="' + escapeHtml(e('amount')) + '"></div>' +
      '<div class="ix-avail">' + escapeHtml(e('avail')) + ' · <b class="ltr" dir="ltr">' + escapeHtml(fmt(a.bal, 'OMR')) + '</b></div>' +
      '<div class="ix-quick">' + [10, 25, 50, 100].map(n => '<button type="button" class="chip" data-ix="quick" data-n="' + n + '">' + n + '</button>').join('') + '</div>' +
      '<div class="field-err" id="ix-aerr" role="alert">' + escapeHtml(a.err) + '</div><div id="ix-sum">' + summaryRows(a) + '</div>' +
      '<button type="button" class="btn btn-primary" id="ix-go" data-ix="amount-next"' + (a.valid ? '' : ' disabled') + '>' + escapeHtml(e('next')) + '</button><div style="height:calc(40px + var(--safe-b))"></div></div>';
  }
  function benName(){ return (S.f['ix-first'] + ' ' + S.f['ix-last']).trim(); }
  function renderReview(){
    const c = cur(), a = amountCalc(); if (!c || !S.method || !a.valid){ R.go('intl'); return ''; }
    const row = (k, v, ltr) => '<div class="ix-rv"><span>' + escapeHtml(k) + '</span><b' + (ltr ? ' class="ltr" dir="ltr"' : '') + '>' + escapeHtml(v) + '</b></div>';
    const bd = S.last || {};
    let acct = '';
    if (S.method === 'BANK') acct = '••••' + String(S.f['ix-acct'] || '').replace(/[\s-]/g, '').slice(-4);
    else if (S.method === 'MOBILE_MONEY' || S.method === 'CASH_PICKUP') acct = formatPhoneIntl(signupPhone('+' + (INTL_DIAL[c.iso] || ''), S.f['ix-phone']) || '');
    else if (S.method === 'INTERAC') acct = S.f['ix-email'] || '';
    const approx = a.cc !== 'OMR' ? ' (' + fmt(a.x, a.cc) + ')' : '';
    idemKey();
    return top(e('review')) + '<div class="screen-body ix-body">' +
      '<div class="ix-flow"><div><small>' + escapeHtml(e('from')) + '</small><b>' + escapeHtml(((Runtime.profile && Runtime.profile.firstName) || '') + ' ' + ((Runtime.profile && Runtime.profile.lastName) || '')) + '</b></div>' +
        '<span class="ix-arrow">' + icon('arrowRight', 20) + '</span><div><small>' + escapeHtml(e('to')) + '</small><b>' + escapeHtml(benName()) + '</b></div></div>' +
      '<div class="ix-big ltr" dir="ltr">' + escapeHtml(fmt(a.omr, 'OMR')) + '<small>' + escapeHtml(approx) + '</small></div>' +
      '<div class="ix-card-s">' +
        row(e('country'), flag(c.iso) + ' ' + cname(c.iso)) + row(e('method'), e('m.' + S.method)) + (S.provider ? row(e('service'), S.provider) : '') + (acct ? row(e('account'), acct, true) : '') +
        row(e('fees'), e('free')) + row(e('total'), fmt(a.omr, 'OMR'), true) +
        (a.dest != null ? row(e('theyGet'), '≈ ' + fmt(a.dest, c.cur), true) : row(e('theyGet'), ef('localRate', { c: c.cur }))) + row(e('arrives'), e('etaLong')) + '</div>' +
      '<p class="ix-note">' + icon('info', 15) + '<span>' + escapeHtml(e('note')) + '</span></p>' +
      '<button type="button" class="btn btn-primary ix-confirm" id="ix-confirm" data-ix="confirm">' + icon('lock', 18) + '<span>' + escapeHtml(e('confirm')) + '</span></button><div style="height:calc(40px + var(--safe-b))"></div></div>';
  }
  function renderResult(){
    const r = S.last || {};
    const unc = r.kind === 'uncertain';
    return top(unc ? e('uncertain') : e('fail')) + '<div class="screen-body ix-body ix-result"><div class="ix-res-i ' + (unc ? 'unc' : 'bad') + '">' + icon(unc ? 'clock' : 'warn', 34) + '</div>' +
      '<h2>' + escapeHtml(unc ? e('uncertain') : e('fail')) + '</h2><p>' + escapeHtml(unc ? e('uncertainD') : t(r.error || 'errors.UNKNOWN_ERROR')) + '</p>' +
      (unc ? '<button type="button" class="btn btn-primary" data-ix="verify">' + escapeHtml(e('checkSt')) + '</button><button type="button" class="btn btn-secondary" data-nav="history">' + escapeHtml(e('hist')) + '</button>' :
        '<button type="button" class="btn btn-primary" data-ix="retry">' + escapeHtml(e('retry')) + '</button><button type="button" class="btn btn-ghost" data-nav="home">' + escapeHtml(t('ui.home') === 'ui.home' ? 'OK' : t('ui.home')) + '</button>') +
      '</div>';
  }

  /* ---------- envoi ---------- */
  function errKey(error){
    const m = String(error && error.message || '').toLowerCase();
    if (m.includes('pin_required')) return 'errors.PIN_REQUIRED';
    if (m.includes('insufficient') || m.includes('accounts_balance_check') || m.includes('accounts_available_balance_check')) return 'errors.INSUFFICIENT_BALANCE';
    if (m.includes('missing_field') || m.includes('invalid_account') || m.includes('invalid_phone') || m.includes('invalid_email') || m.includes('invalid_routing')) return 'errors.MISSING_FIELD';
    if (m.includes('limit_')) return 'errors.LIMIT';
    return 'errors.UNKNOWN_ERROR';
  }
  async function rpcSend(grant){
    const c = cur(), a = amountCalc();
    const p = collectedBeneficiary();
    return sb.rpc('intl_send', { p_country: c.iso, p_method: S.method, p_provider: S.provider || null, p_amount: a.omr, p_beneficiary: p, p_idempotency_key: idemKey(), p_pin_grant: grant || null });
  }
  let _ben = null;
  const collectedBeneficiary = () => _ben || {};
  async function send(){
    if (S.busy) return;
    if (navigator.onLine === false){ toast(e('offline'), 'error'); return; }
    const c = cur(), a = amountCalc(); if (!c || !a.valid) return;
    S.busy = true;
    const pin = await PinEngine.authorize();
    if (!pin.ok){ S.busy = false; if (pin.error) toast(t(pin.error), 'error'); return; }
    if (!ProcessingEngine.acquireLock()){ S.busy = false; return; }
    TX_STATE.breakdown = { amount: a.omr, fee: 0, vat: 0, total: a.omr };
    TX_STATE.beneficiary = { name: benName(), phone: _ben && _ben.phone ? _ben.phone : '' };
    R.go('processing');
    const out = await ProcessingEngine.run(async () => {
      let res0;
      try { res0 = await rpcSend(pin.grant); } catch(err){ console.error(err); return { ok: false, uncertain: true, error: 'errors.UNCERTAIN' }; }
      const data = res0 && res0.data, error = res0 && res0.error;
      if (error && TransferEngine.isUncertain(error, res0.status)) return { ok: false, uncertain: true, error: 'errors.UNCERTAIN' };
      if (error){ console.error('intl_send', error); return { ok: false, error: errKey(error) }; }
      if (!data || !data.transaction_id) return { ok: false, error: 'errors.DUPLICATE' };
      try { await AuthEngine.hydrateRuntime(); } catch(err){ /* rien */ }
      const receipt = {
        id: ID.receipt(), transactionId: data.transaction_id, status: 'PROCESSING', amount: data.amount, currency: 'OMR', fee: 0, vat: 0, total: data.amount,
        destinationAmount: data.destination_amount, destinationCurrency: data.destination_currency,
        beneficiary: { name: benName(), phone: _ben && _ben.phone ? _ben.phone : '', country: c.iso, networkName: cname(c.iso) + ' · ' + (S.provider || e('m.' + S.method)) },
        network: S.provider || e('m.' + S.method), reference: data.reference, createdAt: Date.now(), kind: 'FIAT_EXTERNAL', flow: 'INTL_TRANSFER', direction: 'OUT'
      };
      try { await recordLocalReceipt(receipt); } catch(err){ console.error(err); Runtime.receipts.push(receipt); Runtime.lastReceipt = receipt; }
      return { ok: true, receipt };
    });
    S.busy = false;
    if (!out.ok){ S.last = { kind: out.uncertain ? 'uncertain' : 'failed', error: out.error }; R.go('intl-result'); return; }
    S.last = null; reset(); _ben = null;
    try { InAppNotif.showCall({ title: t('notif.fiat_sent'), message: out.receipt.beneficiary.name, amount: fmt(out.receipt.amount, 'OMR'), status: 'success' }); } catch(err){ /* rien */ }
    R.go('receipt');
  }
  /* « statut à vérifier » : relit le résultat de LA MÊME requête (même clé) SANS grant : le serveur rejoue la clé avant toute autorisation ; sans enregistrement il refuse (pin_required) : rien n'est créé. */
  async function verify(){
    if (S.busy) return; S.busy = true;
    try {
      const res = await rpcSend(null);
      if (res && res.data && res.data.transaction_id){ try { await AuthEngine.hydrateRuntime(); } catch(err){ /* rien */ } toast(e('recorded'), 'success'); S.busy = false; reset(); R.go('history'); return; }
      toast(e('uncertainD'), 'error');
    } catch(err){ toast(t('errors.UNCERTAIN'), 'error'); }
    S.busy = false;
  }

  /* ---------- câblage ---------- */
  function wire(id, root){
    if (id === 'intl'){
      const q = root.querySelector('#ix-q');
      if (q) q.oninput = () => { S.q = q.value; const l = root.querySelector('#ix-list'); if (l) l.innerHTML = listHtml(); };
    }
    if (id === 'intl-details'){
      const set = () => { const el = root.querySelector('#ix-first'); if (el && !el.value) { try { el.focus({ preventScroll: true }); } catch(err){ /* rien */ } } };
      setTimeout(set, 350);
      root.querySelectorAll('input').forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter'){ ev.preventDefault(); const b = root.querySelector('#ix-go'); if (b) b.click(); } }));
    }
    if (id === 'intl-amount'){
      const inp = root.querySelector('#ix-amt');
      const upd = () => {
        const a = amountCalc(), s = root.querySelector('#ix-sum'), er = root.querySelector('#ix-aerr'), go = root.querySelector('#ix-go');
        if (s) s.innerHTML = summaryRows(a); if (er) er.textContent = a.err; if (go) go.disabled = !a.valid;
      };
      if (inp){
        inp.oninput = () => { inp.value = inp.value.replace(/[^\d.,]/g, '').replace(',', '.').replace(/(\..*)\./g, '$1'); S.amtStr = inp.value; upd(); };
        inp.addEventListener('keydown', ev => { if (ev.key === 'Enter'){ ev.preventDefault(); const b = root.querySelector('#ix-go'); if (b && !b.disabled) b.click(); } });
        setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch(err){ /* rien */ } }, 350);
      }
    }
    root.onclick = (ev) => {
      const el = ev.target.closest && ev.target.closest('[data-ix]'); if (!el) return;
      const k = el.getAttribute('data-ix');
      try { Sfx.play('tap'); } catch(err){ /* rien */ }
      if (k === 'group'){ S.group = el.getAttribute('data-g'); S.region = 'ALL'; S.q = ''; R.go('intl', { force: true, replace: true }); }
      else if (k === 'region'){ S.region = el.getAttribute('data-r'); R.go('intl', { force: true, replace: true }); }
      else if (k === 'pick'){ if (S.iso !== el.getAttribute('data-iso')){ reset(); S.iso = el.getAttribute('data-iso'); } R.go('intl-method'); }
      else if (k === 'method'){ if (S.method !== el.getAttribute('data-m')){ S.method = el.getAttribute('data-m'); S.provider = ''; S.f = {}; } R.go('intl-details'); }
      else if (k === 'prov'){ S.provider = el.getAttribute('data-p'); root.querySelectorAll('[data-ix="prov"]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); }
      else if (k === 'details-next'){
        const r = collect(root), er = root.querySelector('#ix-err');
        if (!r.ok){ if (er) er.textContent = ef('check', { f: r.f }); try { UIKit.haptic('error'); } catch(err){ /* rien */ } return; }
        _ben = r.p; R.go('intl-amount');
      }
      else if (k === 'cur'){ S.inCur = inCur() === 'OMR' ? dispCur() : 'OMR'; if (S.inCur === 'OMR' && dispCur() === 'OMR') S.inCur = 'USD'; S.amtStr = ''; R.go('intl-amount', { force: true, replace: true }); }
      else if (k === 'quick'){ S.amtStr = el.getAttribute('data-n'); R.go('intl-amount', { force: true, replace: true }); }
      else if (k === 'amount-next'){ if (amountCalc().valid) R.go('intl-review'); }
      else if (k === 'confirm') send();
      else if (k === 'verify') verify();
      else if (k === 'retry') R.go('intl-review');
    };
  }
  const startFresh = () => { reset(); _ben = null; S.q = ''; };
  return { renderIntl, renderMethod, renderDetails, renderAmount, renderReview, renderResult, wire, startFresh, e, E };
})();
