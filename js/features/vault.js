'use strict';

/* ============================================================
   VAULT « BOOST » (18.0.0) — l'utilisateur gagne de l'argent sur les fonds qu'il place dans son coffre.
   - Écran « vault » : solde du coffre, gains qui GRANDISSENT EN DIRECT (calculés avec le gain par seconde du serveur), récolte, placer / retirer,
     comment ça marche (le dépôt passe par l'administrateur dans le chat), projection 7 / 30 / 90 jours avec le vrai taux, opérations récentes.
   - Écran « admin-boost » : vue d'ensemble + réglages (taux %/jour, minimum, interrupteurs Boost et crédit, min / max du crédit), chaque changement
     demandé avec confirmation puis appliqué par admin_set_setting (is_admin() côté serveur).
   - Honnêteté : les gains dépendent du taux fixé par l'administrateur et peuvent changer. Aucun gain n'est inventé côté écran : tout vient de vault_status().
   ============================================================ */
Strings.add({
  en: {
    'vt.title': 'Boost', 'vt.svc': 'Boost', 'vt.svcD': 'Earn every second on your money',
    'vt.inBoost': 'In Boost', 'vt.live': 'Earned right now', 'vt.rate': '{r}% per day', 'vt.month': 'about {m}% per month',
    'vt.collect': 'Collect earnings', 'vt.place': 'Add to Boost', 'vt.take': 'Withdraw', 'vt.total': 'Total earned', 'vt.avail': 'Available balance',
    'vt.how': 'How it works', 'vt.s1T': 'Deposit through the administrator', 'vt.s1D': 'Ask for a deposit in the app chat. The administrator credits your balance.',
    'vt.s2T': 'Add it to Boost', 'vt.s2D': 'Move the amount you want from your balance into your Boost vault.', 'vt.s3T': 'Earn every second', 'vt.s3D': 'Your earnings grow live. Collect them whenever you like.',
    'vt.toChat': 'Open the chat to deposit', 'vt.proj': 'Projection', 'vt.projD': 'Simple estimate at today’s rate, on {amt} OMR', 'vt.example': 'Example with {amt} OMR',
    'vt.d': '{n} days', 'vt.recent': 'Recent activity', 'vt.noAct': 'No activity yet', 'vt.noActD': 'Your Boost moves and earnings will show here.',
    'vt.off': 'Boost is paused by the administrator.', 'vt.offD': 'Your funds stay safe. Earnings are paused until it resumes.',
    'vt.disc': 'Earnings depend on the rate set by the administrator and may change. Estimates are not a promise.',
    'vt.sheetIn': 'Add to Boost', 'vt.sheetOut': 'Withdraw from Boost', 'vt.amount': 'Amount in OMR', 'vt.max': 'Up to {amt} OMR', 'vt.min': 'Minimum {amt} OMR',
    'vt.go': 'Confirm', 'vt.movedIn': '{amt} OMR added to Boost', 'vt.movedOut': '{amt} OMR back in your balance', 'vt.collected': '{amt} OMR collected',
    'vt.nothing': 'Nothing to collect yet', 'vt.err.amt': 'Enter a valid amount.', 'vt.err.max': 'This amount is higher than what you can use.', 'vt.err.min': 'The amount is below the minimum.',
    'vt.load': 'Could not load Boost.', 'vt.retry': 'Try again', 'vt.rise': 'rises every second',
    'vt.a.title': 'Boost and credit', 'vt.a.ov': 'Overview', 'vt.a.holders': 'Members in Boost', 'vt.a.principal': 'Money in Boost', 'vt.a.pending': 'Earnings waiting',
    'vt.a.earned': 'Earnings paid', 'vt.a.cpend': 'Credit requests waiting', 'vt.a.cgrant': 'Credit granted',
    'vt.a.boost': 'Boost', 'vt.a.vaultOn': 'Boost enabled', 'vt.a.vaultOnD': 'When off, members cannot add money and earnings stop.', 'vt.a.rate': 'Daily rate (%)',
    'vt.a.rateD': 'Applied to the money in every Boost vault.', 'vt.a.perMonth': 'about {m}% per month', 'vt.a.min': 'Minimum to add (OMR)',
    'vt.a.credit': 'Credit', 'vt.a.creditOn': 'Credit requests enabled', 'vt.a.creditOnD': 'When off, members cannot send a new request.', 'vt.a.cmin': 'Smallest credit (OMR)', 'vt.a.cmax': 'Largest credit (OMR)',
    'vt.a.apply': 'Apply', 'vt.a.confirm': 'Apply this change?', 'vt.a.confirmRate': 'The new rate applies to every member right away.', 'vt.a.confirmOn': 'Turn this on for every member?',
    'vt.a.confirmOff': 'Turn this off for every member?', 'vt.a.saved': 'Saved', 'vt.a.bad': 'This value is not valid.', 'vt.a.range': 'The smallest credit must be below the largest.', 'vt.a.rateRange': 'Choose between 0 and 5.',
    'vt.a.err': 'Could not load. Try again.', 'vt.a.confirmVal': 'Set to {v}?'
  },
  fr: {
    'vt.title': 'Boost', 'vt.svc': 'Boost', 'vt.svcD': 'Gagnez chaque seconde sur votre argent',
    'vt.inBoost': 'Dans Boost', 'vt.live': 'Gagné à l’instant', 'vt.rate': '{r} % par jour', 'vt.month': 'environ {m} % par mois',
    'vt.collect': 'Récolter les gains', 'vt.place': 'Placer dans Boost', 'vt.take': 'Retirer', 'vt.total': 'Total gagné', 'vt.avail': 'Solde disponible',
    'vt.how': 'Comment ça marche', 'vt.s1T': 'Déposez via l’administrateur', 'vt.s1D': 'Demandez un dépôt dans le chat de l’application. L’administrateur crédite votre solde.',
    'vt.s2T': 'Placez dans Boost', 'vt.s2D': 'Déplacez le montant voulu de votre solde vers votre coffre Boost.', 'vt.s3T': 'Gagnez chaque seconde', 'vt.s3D': 'Vos gains grandissent en direct. Récoltez-les quand vous voulez.',
    'vt.toChat': 'Ouvrir le chat pour déposer', 'vt.proj': 'Projection', 'vt.projD': 'Estimation simple au taux du jour, sur {amt} OMR', 'vt.example': 'Exemple avec {amt} OMR',
    'vt.d': '{n} jours', 'vt.recent': 'Activité récente', 'vt.noAct': 'Aucune activité', 'vt.noActD': 'Vos placements et gains Boost apparaîtront ici.',
    'vt.off': 'Boost est suspendu par l’administrateur.', 'vt.offD': 'Vos fonds restent en sécurité. Les gains sont en pause jusqu’à la reprise.',
    'vt.disc': 'Les gains dépendent du taux fixé par l’administrateur et peuvent changer. Les estimations ne sont pas une promesse.',
    'vt.sheetIn': 'Placer dans Boost', 'vt.sheetOut': 'Retirer de Boost', 'vt.amount': 'Montant en OMR', 'vt.max': 'Jusqu’à {amt} OMR', 'vt.min': 'Minimum {amt} OMR',
    'vt.go': 'Confirmer', 'vt.movedIn': '{amt} OMR placés dans Boost', 'vt.movedOut': '{amt} OMR de retour sur votre solde', 'vt.collected': '{amt} OMR récoltés',
    'vt.nothing': 'Rien à récolter pour l’instant', 'vt.err.amt': 'Saisissez un montant valide.', 'vt.err.max': 'Ce montant dépasse ce que vous pouvez utiliser.', 'vt.err.min': 'Le montant est sous le minimum.',
    'vt.load': 'Impossible de charger Boost.', 'vt.retry': 'Réessayer', 'vt.rise': 'monte chaque seconde',
    'vt.a.title': 'Boost et crédit', 'vt.a.ov': 'Vue d’ensemble', 'vt.a.holders': 'Membres dans Boost', 'vt.a.principal': 'Argent dans Boost', 'vt.a.pending': 'Gains en attente',
    'vt.a.earned': 'Gains versés', 'vt.a.cpend': 'Demandes de crédit en attente', 'vt.a.cgrant': 'Crédits accordés',
    'vt.a.boost': 'Boost', 'vt.a.vaultOn': 'Boost activé', 'vt.a.vaultOnD': 'Désactivé, les membres ne peuvent plus placer d’argent et les gains s’arrêtent.', 'vt.a.rate': 'Taux par jour (%)',
    'vt.a.rateD': 'Appliqué à l’argent de chaque coffre Boost.', 'vt.a.perMonth': 'environ {m} % par mois', 'vt.a.min': 'Minimum à placer (OMR)',
    'vt.a.credit': 'Crédit', 'vt.a.creditOn': 'Demandes de crédit activées', 'vt.a.creditOnD': 'Désactivé, les membres ne peuvent plus envoyer de nouvelle demande.', 'vt.a.cmin': 'Plus petit crédit (OMR)', 'vt.a.cmax': 'Plus grand crédit (OMR)',
    'vt.a.apply': 'Appliquer', 'vt.a.confirm': 'Appliquer ce changement ?', 'vt.a.confirmRate': 'Le nouveau taux s’applique tout de suite à tous les membres.', 'vt.a.confirmOn': 'Activer pour tous les membres ?',
    'vt.a.confirmOff': 'Désactiver pour tous les membres ?', 'vt.a.saved': 'Enregistré', 'vt.a.bad': 'Cette valeur n’est pas valide.', 'vt.a.range': 'Le plus petit crédit doit être inférieur au plus grand.', 'vt.a.rateRange': 'Choisissez entre 0 et 5.',
    'vt.a.err': 'Chargement impossible. Réessayez.', 'vt.a.confirmVal': 'Fixer à {v} ?'
  },
  ar: {
    'vt.title': 'بوست', 'vt.svc': 'بوست', 'vt.svcD': 'اربح كل ثانية على أموالك',
    'vt.inBoost': 'في بوست', 'vt.live': 'المكسب الآن', 'vt.rate': '{r}% يومياً', 'vt.month': 'نحو {m}% شهرياً',
    'vt.collect': 'تحصيل الأرباح', 'vt.place': 'إضافة إلى بوست', 'vt.take': 'سحب', 'vt.total': 'إجمالي الأرباح', 'vt.avail': 'الرصيد المتاح',
    'vt.how': 'كيف يعمل', 'vt.s1T': 'أودع عبر المسؤول', 'vt.s1D': 'اطلب الإيداع في دردشة التطبيق. يضيف المسؤول المبلغ إلى رصيدك.',
    'vt.s2T': 'أضفه إلى بوست', 'vt.s2D': 'انقل المبلغ الذي تريده من رصيدك إلى خزنة بوست.', 'vt.s3T': 'اربح كل ثانية', 'vt.s3D': 'ترتفع أرباحك مباشرة. حصّلها متى شئت.',
    'vt.toChat': 'افتح الدردشة للإيداع', 'vt.proj': 'التوقعات', 'vt.projD': 'تقدير بسيط بسعر اليوم على {amt} ر.ع', 'vt.example': 'مثال على {amt} ر.ع',
    'vt.d': '{n} يوماً', 'vt.recent': 'النشاط الأخير', 'vt.noAct': 'لا يوجد نشاط', 'vt.noActD': 'ستظهر هنا عمليات بوست وأرباحك.',
    'vt.off': 'بوست متوقف مؤقتاً من المسؤول.', 'vt.offD': 'أموالك في أمان. تتوقف الأرباح حتى الاستئناف.',
    'vt.disc': 'تعتمد الأرباح على السعر الذي يحدده المسؤول وقد تتغير. التقديرات ليست وعداً.',
    'vt.sheetIn': 'إضافة إلى بوست', 'vt.sheetOut': 'سحب من بوست', 'vt.amount': 'المبلغ بالريال العُماني', 'vt.max': 'حتى {amt} ر.ع', 'vt.min': 'الحد الأدنى {amt} ر.ع',
    'vt.go': 'تأكيد', 'vt.movedIn': 'تمت إضافة {amt} ر.ع إلى بوست', 'vt.movedOut': 'عاد {amt} ر.ع إلى رصيدك', 'vt.collected': 'تم تحصيل {amt} ر.ع',
    'vt.nothing': 'لا يوجد ما يُحصَّل بعد', 'vt.err.amt': 'أدخل مبلغاً صحيحاً.', 'vt.err.max': 'المبلغ أكبر مما يمكنك استخدامه.', 'vt.err.min': 'المبلغ أقل من الحد الأدنى.',
    'vt.load': 'تعذّر تحميل بوست.', 'vt.retry': 'إعادة المحاولة', 'vt.rise': 'يرتفع كل ثانية',
    'vt.a.title': 'بوست والائتمان', 'vt.a.ov': 'نظرة عامة', 'vt.a.holders': 'أعضاء في بوست', 'vt.a.principal': 'الأموال في بوست', 'vt.a.pending': 'أرباح بالانتظار',
    'vt.a.earned': 'أرباح مدفوعة', 'vt.a.cpend': 'طلبات ائتمان بالانتظار', 'vt.a.cgrant': 'ائتمان ممنوح',
    'vt.a.boost': 'بوست', 'vt.a.vaultOn': 'تفعيل بوست', 'vt.a.vaultOnD': 'عند الإيقاف لا يستطيع الأعضاء إضافة أموال وتتوقف الأرباح.', 'vt.a.rate': 'النسبة اليومية (%)',
    'vt.a.rateD': 'تُطبَّق على الأموال في كل خزنة بوست.', 'vt.a.perMonth': 'نحو {m}% شهرياً', 'vt.a.min': 'الحد الأدنى للإضافة (ر.ع)',
    'vt.a.credit': 'الائتمان', 'vt.a.creditOn': 'تفعيل طلبات الائتمان', 'vt.a.creditOnD': 'عند الإيقاف لا يستطيع الأعضاء إرسال طلب جديد.', 'vt.a.cmin': 'أصغر ائتمان (ر.ع)', 'vt.a.cmax': 'أكبر ائتمان (ر.ع)',
    'vt.a.apply': 'تطبيق', 'vt.a.confirm': 'تطبيق هذا التغيير؟', 'vt.a.confirmRate': 'تُطبَّق النسبة الجديدة فوراً على جميع الأعضاء.', 'vt.a.confirmOn': 'التفعيل لجميع الأعضاء؟',
    'vt.a.confirmOff': 'الإيقاف لجميع الأعضاء؟', 'vt.a.saved': 'تم الحفظ', 'vt.a.bad': 'هذه القيمة غير صالحة.', 'vt.a.range': 'يجب أن يكون أصغر ائتمان أقل من الأكبر.', 'vt.a.rateRange': 'اختر بين 0 و5.',
    'vt.a.err': 'تعذّر التحميل. حاول مجدداً.', 'vt.a.confirmVal': 'تعيين القيمة إلى {v}؟'
  }
});

const Vault = (() => {
  const esc = escapeHtml;
  const N = Guardian.norm;
  const S = { s: { principal: 0, pending: 0, total_earned: 0, rate_pct_day: 0.2, per_second: 0, available: 0, enabled: true, min: 1 }, loaded: false, error: false, busy: false, stopTick: null,
    ov: null, ovError: false, abusy: false };
  const KINDS = ['VAULT_IN', 'VAULT_OUT', 'EARN_YIELD'];
  const floor3 = (v) => Math.floor((Number(v) || 0) * 1000 + 1e-6) / 1000;
  const parseNum = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

  function normStatus(d){
    d = N.obj(d);
    return { principal: N.num(d.principal), pending: N.num(d.pending), total_earned: N.num(d.total_earned), rate_pct_day: N.num(d.rate_pct_day, 0.2), per_second: N.num(d.per_second),
      available: N.num(d.available), enabled: d.enabled !== false, min: N.num(d.min, 1) };
  }
  async function loadStatus(){
    const r = await Guardian.rpc('vault_status', {});
    if (r.ok && r.data){ S.s = normStatus(r.data); S.error = false; } else S.error = true;
    S.loaded = true; return S.s;
  }
  const status = () => Object.assign({}, S.s);

  /* ---------- écran utilisateur ---------- */
  function render(){
    return v18Top(t('vt.title')) + '<div class="screen-body vt-body" id="vt-body">' + body() + '</div>';
  }
  function body(){
    const s = S.s;
    return '<section class="vt-hero' + (s.enabled ? '' : ' is-off') + '" id="vt-hero"><div class="vt-glow"></div><div class="vt-rays"></div>' +
      '<div class="vt-top"><span class="vt-tag">' + CrUI.svgI('vault', 16) + esc(t('vt.title')) + '</span><span class="vt-rate" id="vt-rate"></span></div>' +
      '<p class="vt-lab">' + esc(t('vt.inBoost')) + '</p>' +
      '<div class="vt-bal ltr" dir="ltr"><b id="vt-pr">' + CrUI.dec(s.principal, 3) + '</b><span>OMR</span></div>' +
      '<div class="vt-live"><i class="vt-bolt">' + CrUI.svgI('bolt', 18) + '</i><div class="vt-live-t"><small>' + esc(t('vt.live')) + '</small><b id="vt-pd" class="ltr" dir="ltr">' + Money.num(s.pending, 6) + '</b></div><span class="vt-live-u">OMR</span></div>' +
      '<p class="vt-month" id="vt-month"></p>' +
      '<button type="button" class="btn btn-primary vt-collect" id="vt-collect"><span class="vt-shine"></span>' + CrUI.svgI('coin', 20) + '<span>' + esc(t('vt.collect')) + '</span></button>' +
      '<div class="vt-acts"><button type="button" class="vt-act" id="vt-in">' + icon('plus', 18) + '<span>' + esc(t('vt.place')) + '</span></button><button type="button" class="vt-act" id="vt-out">' + icon('minus', 18) + '<span>' + esc(t('vt.take')) + '</span></button></div>' +
      '<div class="vt-coins" id="vt-coins" aria-hidden="true"></div></section>' +
      '<div class="vt-offbar" id="vt-offbar"' + (s.enabled ? ' hidden' : '') + '>' + CrUI.svgI('lock', 20) + '<div><b>' + esc(t('vt.off')) + '</b><small>' + esc(t('vt.offD')) + '</small></div></div>' +
      '<section class="vt-stats"><div><small>' + esc(t('vt.avail')) + '</small><b class="ltr" dir="ltr" id="vt-av">' + CrUI.dec(s.available, 3) + '</b><em>OMR</em></div><div><small>' + esc(t('vt.total')) + '</small><b class="ltr" dir="ltr" id="vt-te">' + CrUI.dec(s.total_earned, 3) + '</b><em>OMR</em></div></section>' +
      '<section class="vt-how"><h3 class="vt-h">' + esc(t('vt.how')) + '</h3><ol class="vt-steps">' +
        [['deposit', 's1T', 's1D'], ['vault', 's2T', 's2D'], ['bolt', 's3T', 's3D']].map((x, i) => '<li style="--i:' + i + '"><span class="vt-sn">' + (i + 1) + '</span><i>' + CrUI.svgI(x[0], 22) + '</i><div><b>' + esc(t('vt.' + x[1])) + '</b><small>' + esc(t('vt.' + x[2])) + '</small></div></li>').join('') +
      '</ol><button type="button" class="btn btn-secondary vt-chat" id="vt-chat">' + CrUI.svgI('chat', 18) + '<span>' + esc(t('vt.toChat')) + '</span></button></section>' +
      '<section class="vt-proj"><h3 class="vt-h">' + esc(t('vt.proj')) + '</h3><p class="vt-projd" id="vt-projd"></p><div class="vt-bars" id="vt-bars"></div></section>' +
      '<section class="vt-recent"><h3 class="vt-h">' + esc(t('vt.recent')) + '</h3><div id="vt-act"></div></section>' +
      '<p class="vt-disc">' + CrUI.svgI('info', 15) + '<span>' + esc(t('vt.disc')) + '</span></p>';
  }
  function paintStatic(root, animate){
    const s = S.s;
    const set = (id, v) => { const el = root.querySelector(id); if (el) el.textContent = v; };
    const rate = root.querySelector('#vt-rate'); if (rate) rate.textContent = tf('vt.rate', { r: CrUI.pct(s.rate_pct_day) });
    set('#vt-month', tf('vt.month', { m: CrUI.pct(s.rate_pct_day * 30) }));
    const pr = root.querySelector('#vt-pr');
    if (pr){ if (animate) { const from = Number(pr.getAttribute('data-v')) || 0; Fx.countUp(pr, s.principal, { from, dec: 3, ms: 800 }); setTimeout(() => { pr.textContent = CrUI.dec(s.principal, 3); }, 840); } else pr.textContent = CrUI.dec(s.principal, 3); pr.setAttribute('data-v', String(s.principal)); }
    set('#vt-av', CrUI.dec(s.available, 3)); set('#vt-te', CrUI.dec(s.total_earned, 3));
    const hero = root.querySelector('#vt-hero'); if (hero) hero.classList.toggle('is-off', !s.enabled);
    const ob = root.querySelector('#vt-offbar'); if (ob) ob.hidden = !!s.enabled;
    ['#vt-in', '#vt-collect'].forEach(i => { const b = root.querySelector(i); if (b) b.disabled = !s.enabled; });
    const out = root.querySelector('#vt-out'); if (out) out.disabled = !(s.principal > 0);
    startTick(root); paintProj(root);
  }
  function startTick(root){
    if (S.stopTick){ try { S.stopTick(); } catch(e){ /* rien */ } S.stopTick = null; }
    const el = root.querySelector('#vt-pd'); if (!el) return;
    const s = S.s;
    el.textContent = Money.num(s.pending, 6);
    if (s.enabled && s.per_second > 0) S.stopTick = Fx.ticker(el, s.pending, s.per_second, { dec: 6 });
  }
  function paintProj(root){
    const s = S.s, box = root.querySelector('#vt-bars'), d = root.querySelector('#vt-projd'); if (!box) return;
    const base = s.principal > 0 ? s.principal : (s.available > 0 ? s.available : 1000);
    const gain = (days) => base * s.rate_pct_day / 100 * days;
    const g = [7, 30, 90].map(n => ({ n, v: gain(n) })), top = Math.max(g[2].v, 0.000001);
    if (d) d.textContent = s.principal > 0 ? tf('vt.projD', { amt: CrUI.grp(Math.round(base * 1000) / 1000) }) : tf('vt.example', { amt: CrUI.grp(Math.round(base)) });
    box.innerHTML = g.map((x, i) => '<div class="vt-bar" style="--i:' + i + '"><b class="ltr" dir="ltr">+' + CrUI.dec(x.v, x.v < 10 ? 3 : 2) + '</b><span class="vt-col"><i data-h="' + Math.max(8, Math.round(x.v / top * 100)) + '"></i></span><small>' + esc(tf('vt.d', { n: x.n })) + '</small></div>').join('');
    requestAnimationFrame(() => requestAnimationFrame(() => { box.querySelectorAll('.vt-col i').forEach(el => { el.style.height = el.getAttribute('data-h') + '%'; }); }));
  }
  function paintAct(root){
    const box = root.querySelector('#vt-act'); if (!box) return;
    const rows = (Runtime.transactions || []).filter(x => KINDS.indexOf(x.kind) !== -1).slice(0, 8);
    if (!rows.length){ box.innerHTML = '<div class="cr-empty">' + CrUI.svgI('chart', 28) + '<b>' + esc(t('vt.noAct')) + '</b><p>' + esc(t('vt.noActD')) + '</p></div>'; return; }
    box.innerHTML = rows.map((x, i) => {
      const inn = x.direction === 'IN', ic = x.kind === 'EARN_YIELD' ? 'bolt' : (x.kind === 'VAULT_IN' ? 'vault' : 'deposit');
      return '<div class="vt-row ' + (inn ? 'is-in' : 'is-out') + (x.kind === 'EARN_YIELD' ? ' is-yield' : '') + '" style="--i:' + i + '"><i>' + CrUI.svgI(ic, 20) + '</i><div><b>' + esc(opLabel(x) || x.kind) + '</b><small>' + esc(CrUI.ago(x.createdAt)) + '</small></div><span class="ltr" dir="ltr">' + (inn ? '+' : '−') + CrUI.dec(x.amount, 3) + ' OMR</span></div>';
    }).join('');
  }
  function coinsFx(root){
    const box = root.querySelector('#vt-coins'); if (!box || Fx.reduced()) return;
    for (let i = 0; i < 9; i++){
      const c = document.createElement('i'); c.className = 'vt-coin';
      c.style.cssText = '--dx:' + Math.round((Math.random() - 0.5) * 220) + 'px;--dy:' + Math.round(-90 - Math.random() * 120) + 'px;--r:' + Math.round(Math.random() * 540 - 270) + 'deg;animation-delay:' + (i * 55) + 'ms';
      box.appendChild(c); setTimeout(() => c.remove(), 1700);
    }
  }
  function mergeStatus(d){
    if (!d || typeof d !== 'object') return;
    const n = normStatus(Object.assign({}, S.s, d)); S.s = n;
  }
  /* réponse perdue (réseau coupé après l'envoi) : on relit l'état réel pour que l'écran dise la vérité avant tout nouvel essai */
  async function reconcile(root){ try { await loadStatus(); if (root.isConnected) paintStatic(root, false); CrUI.refreshMoney().then(() => { if (root.isConnected) paintAct(root); }); } catch(e){ /* rien */ } }
  async function collect(root){
    if (S.busy) return; const btn = root.querySelector('#vt-collect'); if (!btn || btn.disabled) return;
    S.busy = true; UIKit.loading(btn, true);
    const r = await Guardian.rpc('vault_collect', {}, { read: false });
    S.busy = false; UIKit.loading(btn, false);
    if (!root.isConnected) return;
    if (!r.ok){ CrUI.snd('error'); Fx.haptic('error'); toast(CrUI.srvErr(r.error), 'error'); if (r.error && r.error.retryable) reconcile(root); return; }
    const d = r.data || {};
    if (d.ok){
      const got = N.num(d.collected); mergeStatus(d);
      CrUI.snd('collect'); Fx.haptic('success'); coinsFx(root); Fx.confetti(btn, { n: 60, power: 7 }); Fx.pulse(btn);
      const pd = root.querySelector('#vt-pd'); if (pd){ pd.classList.remove('vt-drop'); void pd.offsetWidth; pd.classList.add('vt-drop'); }
      toast(tf('vt.collected', { amt: CrUI.dec(got, 3) }), 'success');
      paintStatic(root, true);
      CrUI.refreshMoney().then(() => { if (root.isConnected){ paintAct(root); } });
    } else { mergeStatus(d); CrUI.snd('pop'); Fx.shake(btn); toast(t('vt.nothing')); paintStatic(root, false); }
  }
  /* feuille « placer / retirer » */
  function moveSheet(root, dir){
    const s = S.s, inn = dir === 'in';
    if (inn && !s.enabled){ CrUI.snd('error'); return; }
    const max = floor3(inn ? s.available : s.principal), min = inn ? s.min : 0.001;
    CrUI.snd('open');
    CrUI.sheet('<h2 class="cr-sh-t">' + esc(t(inn ? 'vt.sheetIn' : 'vt.sheetOut')) + '</h2>' +
      '<p class="vt-mv-max">' + esc(tf('vt.max', { amt: CrUI.dec(max, 3) })) + (inn ? ' · ' + esc(tf('vt.min', { amt: CrUI.dec(min, 3) })) : '') + '</p>' +
      '<label class="cr-l" for="vt-mv-a">' + esc(t('vt.amount')) + '</label><div class="cr-field ltr" dir="ltr"><input id="vt-mv-a" type="text" inputmode="decimal" autocomplete="off" placeholder="0.000"><em>OMR</em></div>' +
      '<div class="cr-slider ltr" dir="ltr"><input id="vt-mv-r" type="range" min="0" max="100" step="1" value="0" aria-label="' + esc(t('vt.amount')) + '"></div>' +
      '<div class="cr-chips" role="group">' + [25, 50, 75, 100].map(p => '<button type="button" class="cr-chip" data-p="' + p + '">' + p + '%</button>').join('') + '</div>' +
      '<div class="cr-err" id="vt-mv-e" role="alert"></div><button type="button" class="btn btn-primary" id="vt-mv-ok"><span>' + esc(t('vt.go')) + '</span></button>', (sh, close) => {
      const a = sh.querySelector('#vt-mv-a'), r = sh.querySelector('#vt-mv-r'), e = sh.querySelector('#vt-mv-e'), ok = sh.querySelector('#vt-mv-ok');
      const setPct = (p) => { r.value = String(p); r.style.setProperty('--p', p + '%'); a.value = p ? floor3(max * p / 100).toFixed(3) : ''; sh.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-p')) === p))); };
      let tk = 0;
      r.oninput = () => { setPct(Number(r.value)); const n = Date.now(); if (n - tk > 70){ tk = n; CrUI.snd('tick'); } };
      sh.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { CrUI.snd('pop'); Fx.haptic('tap'); setPct(Number(b.getAttribute('data-p'))); }; });
      a.oninput = () => { a.value = a.value.replace(/[^\d.,]/g, '').replace(',', '.'); const n = parseNum(a.value); const p = max > 0 && n > 0 ? Math.min(100, Math.round(n / max * 100)) : 0; r.value = String(p); r.style.setProperty('--p', p + '%'); sh.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', 'false')); };
      let busy = false;
      ok.onclick = async () => {
        if (busy) return; const n = floor3(parseNum(a.value)); e.textContent = '';
        if (!(n > 0)){ e.textContent = t('vt.err.amt'); CrUI.snd('error'); Fx.shake(ok); return; }
        if (n > max + 1e-9){ e.textContent = t('vt.err.max'); CrUI.snd('error'); Fx.shake(ok); return; }
        if (inn && n < min){ e.textContent = t('vt.err.min'); CrUI.snd('error'); Fx.shake(ok); return; }
        busy = true; UIKit.loading(ok, true);
        const res = await Guardian.rpc('vault_move', { p_amount: n, p_direction: dir }, { read: false });
        busy = false; UIKit.loading(ok, false);
        if (!res.ok){ e.textContent = CrUI.srvErr(res.error); CrUI.snd('error'); Fx.haptic('error'); Fx.shake(ok); if (res.error && res.error.retryable) reconcile(root); return; }
        mergeStatus(res.data); close();
        CrUI.snd(inn ? 'success' : 'pop'); Fx.haptic('success');
        toast(tf(inn ? 'vt.movedIn' : 'vt.movedOut', { amt: CrUI.dec(n, 3) }), 'success');
        if (root.isConnected){ if (inn) Fx.confetti(root.querySelector('#vt-hero'), { n: 40, power: 6 }); Fx.pulse(root.querySelector('#vt-pr')); paintStatic(root, true); }
        CrUI.refreshMoney().then(() => { if (root.isConnected) paintAct(root); });
      };
    });
  }
  function openChat(){
    CrUI.snd('open');
    try { if (typeof Chat !== 'undefined' && Chat.openSupport){ Chat.openSupport('deposit'); return; } } catch(e){ /* rien */ }
    try { R.go('chat'); } catch(e){ /* rien */ }
  }
  function wire(root){
    try {
      paintStatic(root, false); paintAct(root);
      const b = (id, fn) => { const el = root.querySelector(id); if (el) el.onclick = fn; };
      b('#vt-collect', () => collect(root)); b('#vt-in', () => moveSheet(root, 'in')); b('#vt-out', () => moveSheet(root, 'out')); b('#vt-chat', openChat);
      loadStatus().then(() => { if (!root.isConnected) return; if (S.error && !S.loaded) return; paintStatic(root, true); });
      CrUI.refreshMoney().then(() => { if (root.isConnected) paintAct(root); });
      Cfg.load();
      const stop = Guardian.every(async () => { if (!root.isConnected || S.busy) return; await loadStatus(); if (root.isConnected && !document.querySelector('.cr-sheet')) paintStatic(root, false); }, 30000);
      R.onLeave(() => { stop(); if (S.stopTick){ try { S.stopTick(); } catch(e){ /* rien */ } S.stopTick = null; } });
    } catch(e){ console.error('[vault]', e); }
  }

  /* ---------- administrateur : réglages + vue d'ensemble ---------- */
  function adminRender(){
    const k = Cfg.get();
    const num = (id, key, label, val) => '<div class="vt-set"><label class="cr-l" for="' + id + '">' + esc(t(label)) + '</label><div class="vt-set-row"><div class="cr-field ltr" dir="ltr"><input id="' + id + '" type="text" inputmode="decimal" data-key="' + key + '" value="' + esc(String(val)) + '"><em>OMR</em></div><button type="button" class="btn btn-secondary vt-apply" data-apply="' + key + '">' + esc(t('vt.a.apply')) + '</button></div></div>';
    const sw = (key, label, desc, on) => '<div class="vt-sw-row"><div><b>' + esc(t(label)) + '</b><small>' + esc(t(desc)) + '</small></div><button type="button" class="vt-sw" role="switch" data-sw="' + key + '" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' + esc(t(label)) + '"><i></i></button></div>';
    const card = (id, ic, label) => '<div class="vt-ov" data-ov="' + id + '"><i>' + CrUI.svgI(ic, 18) + '</i><b class="ltr" dir="ltr">—</b><span>' + esc(t(label)) + '</span></div>';
    return v18Top(t('vt.a.title')) + '<div class="screen-body vt-body vt-adm">' +
      '<h3 class="vt-h">' + esc(t('vt.a.ov')) + '</h3><div class="vt-ovg" id="vta-ov">' +
        card('holders', 'users', 'vt.a.holders') + card('principal', 'vault', 'vt.a.principal') + card('pending', 'clock', 'vt.a.pending') + card('earned', 'bolt', 'vt.a.earned') + card('credit_pending', 'hourglass', 'vt.a.cpend') + card('credit_granted', 'coin', 'vt.a.cgrant') +
      '</div>' +
      '<section class="cr-card vt-a-sec"><h3 class="vt-h">' + esc(t('vt.a.boost')) + '</h3>' +
        sw('vault_enabled', 'vt.a.vaultOn', 'vt.a.vaultOnD', k.vault_enabled) +
        '<div class="vt-set"><label class="cr-l" for="vta-rate">' + esc(t('vt.a.rate')) + '</label><p class="cr-hint">' + esc(t('vt.a.rateD')) + '</p>' +
          '<div class="cr-slider ltr" dir="ltr"><input id="vta-rng" type="range" min="0" max="5" step="0.05" value="' + k.vault_rate_pct_day + '" aria-label="' + esc(t('vt.a.rate')) + '"></div>' +
          '<div class="vt-set-row"><div class="cr-field ltr" dir="ltr"><input id="vta-rate" type="text" inputmode="decimal" value="' + esc(String(k.vault_rate_pct_day)) + '"><em>%</em></div><button type="button" class="btn btn-secondary vt-apply" data-apply="vault_rate_pct_day">' + esc(t('vt.a.apply')) + '</button></div>' +
          '<p class="vt-permonth" id="vta-pm"></p></div>' +
        num('vta-vmin', 'vault_min', 'vt.a.min', k.vault_min) + '</section>' +
      '<section class="cr-card vt-a-sec"><h3 class="vt-h">' + esc(t('vt.a.credit')) + '</h3>' +
        sw('credit_enabled', 'vt.a.creditOn', 'vt.a.creditOnD', k.credit_enabled) + num('vta-cmin', 'credit_min', 'vt.a.cmin', k.credit_min) + num('vta-cmax', 'credit_max', 'vt.a.cmax', k.credit_max) + '</section></div>';
  }
  async function loadOverview(){
    const r = await Guardian.rpc('admin_vault_overview', {});
    if (r.ok && r.data){ S.ov = N.obj(r.data); S.ovError = false; } else S.ovError = true;
  }
  function paintOverview(root){
    const o = S.ov; if (!o) return;
    root.querySelectorAll('[data-ov]').forEach(el => {
      const k = el.getAttribute('data-ov'), b = el.querySelector('b'), v = N.num(o[k]);
      const money = (k === 'principal' || k === 'pending' || k === 'earned' || k === 'credit_granted');
      const prev = Number(b.getAttribute('data-v')) || 0; b.setAttribute('data-v', String(v));
      if (money){ Fx.countUp(b, v, { from: prev, dec: 3, ms: 900 }); } else { Fx.countUp(b, v, { from: prev, dec: 0, ms: 700 }); }
      el.classList.add('is-live');
    });
  }
  function adminWire(root){
    try {
      const rng = root.querySelector('#vta-rng'), rate = root.querySelector('#vta-rate'), pm = root.querySelector('#vta-pm');
      const month = () => { const v = parseNum(rate.value); pm.textContent = Number.isFinite(v) ? tf('vt.a.perMonth', { m: CrUI.pct(v * 30) }) : ''; };
      const fillRng = () => rng.style.setProperty('--p', (Number(rng.value) / 5 * 100).toFixed(1) + '%');
      fillRng(); month();
      let tk = 0;
      rng.oninput = () => { rate.value = String(Math.round(Number(rng.value) * 100) / 100); fillRng(); month(); const n = Date.now(); if (n - tk > 70){ tk = n; CrUI.snd('tick'); } };
      rate.oninput = () => { rate.value = rate.value.replace(/[^\d.,]/g, '').replace(',', '.'); const v = parseNum(rate.value); if (Number.isFinite(v) && v >= 0 && v <= 5){ rng.value = String(v); fillRng(); } month(); };
      const refreshForm = () => {
        const k = Cfg.get();
        root.querySelectorAll('[data-sw]').forEach(b => b.setAttribute('aria-checked', String(!!k[b.getAttribute('data-sw')])));
        root.querySelectorAll('input[data-key]').forEach(i => { if (document.activeElement !== i) i.value = String(k[i.getAttribute('data-key')]); });
        if (document.activeElement !== rate){ rate.value = String(k.vault_rate_pct_day); rng.value = String(k.vault_rate_pct_day); fillRng(); month(); }
      };
      const save = async (key, value, okCb) => {
        if (S.abusy) return false; S.abusy = true;
        const r = await Guardian.rpc('admin_set_setting', { p_key: key, p_value: value }, { read: false });
        S.abusy = false;
        if (!r.ok){ CrUI.snd('error'); Fx.haptic('error'); toast(CrUI.srvErr(r.error), 'error'); return false; }
        await Cfg.load(true); if (root.isConnected) refreshForm();
        CrUI.snd('success'); Fx.haptic('success'); toast(t('vt.a.saved'), 'success'); if (okCb) okCb();
        return true;
      };
      const bad = (btn) => { CrUI.snd('error'); Fx.shake(btn); toast(t('vt.a.bad'), 'error'); };
      root.querySelectorAll('[data-sw]').forEach(b => { b.onclick = () => {
        const key = b.getAttribute('data-sw'), now = b.getAttribute('aria-checked') === 'true'; CrUI.snd('open');
        CrUI.confirm({ title: t('vt.a.confirm'), body: t(now ? 'vt.a.confirmOff' : 'vt.a.confirmOn'), ok: t('vt.a.apply'), cancel: t('cr.keep'), icon: 'bolt' }, async (close) => { const ok = await save(key, !now); if (ok) close(); });
      }; });
      root.querySelectorAll('[data-apply]').forEach(b => { b.onclick = () => {
        const key = b.getAttribute('data-apply'); const src = key === 'vault_rate_pct_day' ? rate : root.querySelector('input[data-key="' + key + '"]');
        const v = parseNum(src.value);
        if (!Number.isFinite(v) || v <= 0 && key !== 'vault_rate_pct_day' || v < 0) return bad(b);
        if (key === 'vault_rate_pct_day' && v > 5){ CrUI.snd('error'); Fx.shake(b); toast(t('vt.a.rateRange'), 'error'); return; }
        const k = Cfg.get();
        if (key === 'credit_min' && v >= k.credit_max || key === 'credit_max' && v <= k.credit_min){ CrUI.snd('error'); Fx.shake(b); toast(t('vt.a.range'), 'error'); return; }
        CrUI.snd('open');
        CrUI.confirm({ title: t('vt.a.confirm'), body: key === 'vault_rate_pct_day' ? t('vt.a.confirmRate') : tf('vt.a.confirmVal', { v: String(v) }), ok: t('vt.a.apply'), cancel: t('cr.keep'), icon: 'bolt' }, async (close) => { const ok = await save(key, v); if (ok) close(); });
      }; });
      Cfg.load(true).then(() => { if (root.isConnected) refreshForm(); });
      loadOverview().then(() => { if (root.isConnected) paintOverview(root); });
      const stop = Guardian.every(async () => { if (!root.isConnected) return; await loadOverview(); if (root.isConnected) paintOverview(root); }, 20000);
      R.onLeave(stop);
    } catch(e){ console.error('[admin-boost]', e); }
  }
  return { open: () => R.go('vault'), adminOpen: () => R.go('admin-boost'), status, render, wire, adminRender, adminWire, load: loadStatus };
})();

R.register({ vault: () => Vault.render(), 'admin-boost': () => Vault.adminRender() });
R.meta({ vault: { parent: 'services', nav: 'services' }, 'admin-boost': { parent: 'admin-hub', nav: 'services', admin: true } });
Hooks.on('vault', root => Vault.wire(root));
Hooks.on('admin-boost', root => Vault.adminWire(root));
