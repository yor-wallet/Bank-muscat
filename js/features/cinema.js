'use strict';

/* ============================================================
   CINÉMA (18.0.0) — le film publicitaire de l'application : des scènes animées qui défilent toutes seules, comme des stories.
   100 % CSS / SVG / JS : aucune vidéo, aucune image, aucun emoji. Chaque scène : fond mouvant (lueurs, anneaux, faisceaux, particules dorées),
   titre qui apparaît mot par mot, chiffres qui défilent, illustration animée, bouton d'appel à l'action.
   - Bannière intégrée   : Cinema.homeHtml() (à insérer dans une page) puis Cinema.mountAll(root) — ou rien : un hook monte tout seul les [data-cinema].
   - Plein écran         : Cinema.open(i) -> écran « cinema » (toucher gauche/droite, maintenir = pause, glisser vers le bas = fermer).
   - Scènes              : annonces actives de l'administrateur (table announcements) puis Boost, Crédit, Chat, YASER, Transferts, Face ID.
   - Les nombres (taux Boost, minimum / maximum du crédit) viennent de Cfg (get_app_config).
   - Sons doux (Sfx), haptique ; « réduire les animations » : scènes fixes, avance par minuterie seulement.
   ============================================================ */
Strings.add({
  en: {
    'cin.aria': 'Promotional film', 'cin.close': 'Close', 'cin.pause': 'Pause', 'cin.play': 'Play', 'cin.next': 'Next', 'cin.prev': 'Previous', 'cin.intl': 'International',
    'cin.ann.k': 'ANNOUNCEMENT', 'cin.ann.c': 'Continue',
    'cin.boost.k': 'BOOST', 'cin.boost.t': 'Earn every *second* with Boost', 'cin.boost.s': 'Put your money in the Boost vault and watch it grow. Collect your earnings at any time.', 'cin.boost.c': 'Discover Boost', 'cin.boost.cap': '{rate}% per day on your Boost balance', 'cin.boost.ex': 'Example: 1,000 OMR placed today',
    'cin.credit.k': 'CREDIT', 'cin.credit.t': 'A credit from *{min}* to *{max}* OMR', 'cin.credit.s': 'Send your request in one minute. Our team reviews it and answers you quickly.', 'cin.credit.c': 'Request a credit', 'cin.credit.up': 'up to',
    'cin.chat.k': 'SUPPORT', 'cin.chat.t': 'Deposit simply through our *team* in the chat', 'cin.chat.s': 'Send your request, a photo of your receipt or a voice message. We credit your account right away.', 'cin.chat.c': 'Open the chat',
    'cin.chat.b1': 'Hello, I would like to deposit', 'cin.chat.b2': 'Of course, send us the receipt', 'cin.chat.b3': 'Done. Your account is credited.',
    'cin.yaser.k': 'ASSISTANT', 'cin.yaser.t': '*YASER*, your assistant, answers right away', 'cin.yaser.s': 'Ask about credit, Boost or transfers, any time of the day or night.', 'cin.yaser.c': 'Talk to YASER', 'cin.yaser.hi': 'How can I help you today?',
    'cin.send.k': 'TRANSFERS', 'cin.send.t': '*Instant* and international transfers', 'cin.send.s': 'Send money to a mobile number in seconds, or abroad in 48 to 72 hours.', 'cin.send.c': 'Send money', 'cin.send.a': 'Always on', 'cin.send.b': '48-72 h abroad',
    'cin.face.k': 'SECURITY', 'cin.face.t': 'Secured by *Face&nbsp;ID*', 'cin.face.s': 'Confirm in a glance. No code to type once Face ID is on.', 'cin.face.c': 'Open settings'
  },
  fr: {
    'cin.aria': 'Film publicitaire', 'cin.close': 'Fermer', 'cin.pause': 'Pause', 'cin.play': 'Lecture', 'cin.next': 'Suivant', 'cin.prev': 'Précédent', 'cin.intl': 'International',
    'cin.ann.k': 'ANNONCE', 'cin.ann.c': 'Continuer',
    'cin.boost.k': 'BOOST', 'cin.boost.t': 'Gagnez chaque *seconde* avec Boost', 'cin.boost.s': 'Placez votre argent dans le coffre Boost et regardez-le grandir. Récupérez vos gains à tout moment.', 'cin.boost.c': 'Découvrir Boost', 'cin.boost.cap': '{rate} % par jour sur votre solde Boost', 'cin.boost.ex': 'Exemple : 1 000 OMR placés aujourd’hui',
    'cin.credit.k': 'CRÉDIT', 'cin.credit.t': 'Un crédit de *{min}* à *{max}* OMR', 'cin.credit.s': 'Envoyez votre demande en une minute. Notre équipe l’étudie et vous répond vite.', 'cin.credit.c': 'Demander un crédit', 'cin.credit.up': 'jusqu’à',
    'cin.chat.k': 'ASSISTANCE', 'cin.chat.t': 'Déposez simplement via notre *équipe* dans le chat', 'cin.chat.s': 'Envoyez votre demande, la photo de votre reçu ou un message vocal. Nous créditons votre compte aussitôt.', 'cin.chat.c': 'Ouvrir le chat',
    'cin.chat.b1': 'Bonjour, je souhaite faire un dépôt', 'cin.chat.b2': 'Bien sûr, envoyez-nous le reçu', 'cin.chat.b3': 'C’est fait. Votre compte est crédité.',
    'cin.yaser.k': 'ASSISTANT', 'cin.yaser.t': '*YASER*, votre assistant, répond tout de suite', 'cin.yaser.s': 'Posez vos questions sur le crédit, Boost ou les transferts, de jour comme de nuit.', 'cin.yaser.c': 'Parler à YASER', 'cin.yaser.hi': 'Comment puis-je vous aider ?',
    'cin.send.k': 'TRANSFERTS', 'cin.send.t': 'Transferts *instantanés* et internationaux', 'cin.send.s': 'Envoyez de l’argent vers un numéro de mobile en quelques secondes, ou à l’étranger en 48 à 72 heures.', 'cin.send.c': 'Envoyer de l’argent', 'cin.send.a': 'Toujours actif', 'cin.send.b': '48-72 h à l’étranger',
    'cin.face.k': 'SÉCURITÉ', 'cin.face.t': 'Protégé par *Face&nbsp;ID*', 'cin.face.s': 'Confirmez d’un regard. Aucun code à saisir quand Face ID est actif.', 'cin.face.c': 'Ouvrir les réglages'
  },
  ar: {
    'cin.aria': 'فيلم دعائي', 'cin.close': 'إغلاق', 'cin.pause': 'إيقاف مؤقت', 'cin.play': 'تشغيل', 'cin.next': 'التالي', 'cin.prev': 'السابق', 'cin.intl': 'دولي',
    'cin.ann.k': 'إعلان', 'cin.ann.c': 'متابعة',
    'cin.boost.k': 'بوست', 'cin.boost.t': 'اربح كل *ثانية* مع بوست', 'cin.boost.s': 'ضع أموالك في خزنة بوست وراقبها وهي تنمو. اسحب أرباحك في أي وقت.', 'cin.boost.c': 'اكتشف بوست', 'cin.boost.cap': '{rate}% في اليوم على رصيد بوست', 'cin.boost.ex': 'مثال: 1,000 ر.ع مودعة اليوم',
    'cin.credit.k': 'ائتمان', 'cin.credit.t': 'ائتمان من *{min}* إلى *{max}* ر.ع', 'cin.credit.s': 'أرسل طلبك في دقيقة. يدرسه فريقنا ويردّ عليك بسرعة.', 'cin.credit.c': 'اطلب ائتماناً', 'cin.credit.up': 'حتى',
    'cin.chat.k': 'الدعم', 'cin.chat.t': 'أودِع بسهولة عبر *فريقنا* في المحادثة', 'cin.chat.s': 'أرسل طلبك وصورة الإيصال أو رسالة صوتية. نضيف الرصيد إلى حسابك فوراً.', 'cin.chat.c': 'افتح المحادثة',
    'cin.chat.b1': 'مرحباً، أريد إجراء إيداع', 'cin.chat.b2': 'بكل سرور، أرسل لنا الإيصال', 'cin.chat.b3': 'تم. أُضيف الرصيد إلى حسابك.',
    'cin.yaser.k': 'المساعد', 'cin.yaser.t': '*YASER* مساعدك يجيب فوراً', 'cin.yaser.s': 'اسأل عن الائتمان أو بوست أو التحويلات، ليلاً أو نهاراً.', 'cin.yaser.c': 'تحدّث مع YASER', 'cin.yaser.hi': 'كيف يمكنني مساعدتك اليوم؟',
    'cin.send.k': 'التحويلات', 'cin.send.t': 'تحويلات *فورية* ودولية', 'cin.send.s': 'أرسل المال إلى رقم هاتف خلال ثوانٍ، أو إلى الخارج خلال 48 إلى 72 ساعة.', 'cin.send.c': 'أرسل أموالاً', 'cin.send.a': 'متاح دائماً', 'cin.send.b': '48-72 ساعة للخارج',
    'cin.face.k': 'الأمان', 'cin.face.t': 'محمي بـ *Face&nbsp;ID*', 'cin.face.s': 'أكّد بنظرة واحدة. لا حاجة لكتابة الرمز عند تفعيل Face ID.', 'cin.face.c': 'افتح الإعدادات'
  }
});

const Cinema = (() => {
  const DUR = 5200;                                   /* durée d'une scène */
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const isRtl = () => { try { return document.documentElement.dir === 'rtl' || LANG === 'ar'; } catch(e){ return false; } };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const S = { ann: null, annAt: 0, annP: null, start: 0 };

  /* ---------- annonces de l'administrateur ---------- */
  async function loadAnn(force){
    if (!force && S.ann && Date.now() - S.annAt < 90000) return S.ann;
    if (S.annP) return S.annP;
    S.annP = (async () => {
      let r = { ok: false };
      try { r = await Guardian.query(() => sb.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false }).limit(3), { retries: 1 }); } catch(e){ /* repli : aucune annonce */ }
      const N = Guardian.norm;
      S.ann = r.ok ? N.arr(r.data).map(a => ({ id: N.id(a.id), title: N.str(a && a.title, 80), body: N.str(a && a.body, 240) })).filter(a => a.id && a.title) : (S.ann || []);
      S.annAt = Date.now(); S.annP = null; return S.ann;
    })();
    return S.annP;
  }

  /* ---------- illustrations animées ---------- */
  const rm = () => Fx.reduced();
  function artBoost(){
    const bars = [0.30, 0.46, 0.40, 0.66, 0.9].map((h, i) => '<rect class="cin-bar" style="--i:' + i + '" x="' + (34 + i * 38) + '" y="' + (150 - h * 110) + '" width="24" height="' + (h * 110) + '" rx="7" fill="url(#cbg)"/>').join('');
    const coins = [0, 1, 2].map(i => '<g class="cin-coin" style="--i:' + i + ';--tx:' + (60 + i * 62) + 'px"><circle r="15" cy="20" fill="url(#ccg)"/><circle r="9.5" cy="20" fill="none" stroke="#1771b2" stroke-opacity=".5" stroke-width="2"/></g>').join('');
    return '<svg class="cin-svg" viewBox="0 0 260 200" aria-hidden="true"><defs><linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C7E3FF"/><stop offset="1" stop-color="#aadcf0"/></linearGradient><radialGradient id="ccg" cx=".35" cy=".3"><stop offset="0" stop-color="#EAF5FF"/><stop offset=".6" stop-color="#aadcf0"/><stop offset="1" stop-color="#73c3e2"/></radialGradient></defs>' +
      '<ellipse cx="130" cy="168" rx="104" ry="12" fill="#aadcf0" opacity=".16"/>' + bars + coins +
      '<path class="cin-line" d="M30 128 L72 112 L112 120 L152 84 L196 66 L232 34" fill="none" stroke="#EAF5FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle class="cin-dot" cx="232" cy="34" r="7" fill="#EAF5FF"/></svg>';
  }
  function artCredit(){
    const c = Cfg.get();
    return '<div class="cin-cardwrap" aria-hidden="true"><div class="cin-card3d"><i class="cin-card-sheen"></i>' +
      '<svg class="cin-chip" viewBox="0 0 40 30"><rect x="1" y="1" width="38" height="28" rx="6" fill="#CFE7FF" stroke="#2081c7" stroke-width="1.5"/><path d="M1 10h38M1 20h38M14 1v28M26 1v28" stroke="#2081c7" stroke-width="1" fill="none" opacity=".7"/></svg>' +
      '<b class="cin-card-brand">SANAD PAY</b><span class="cin-card-line"></span><span class="cin-card-line s"></span></div>' +
      '<span class="cin-tag a">' + esc(Money.int(c.credit_min)) + '</span><span class="cin-tag b">' + esc(Money.int(c.credit_max)) + '</span></div>';
  }
  function artChat(){
    const tick = '<svg viewBox="0 0 18 12" class="cin-tk"><path d="M1 7l4 4L12 2M7 8l3 3L17 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<div class="cin-chat" aria-hidden="true"><div class="cin-bub me" style="--d:.5s">' + esc(t('cin.chat.b1')) + '</div>' +
      '<div class="cin-bub them typing" style="--d:1.6s"><i></i><i></i><i></i></div>' +
      '<div class="cin-bub them real" style="--d:2.7s">' + esc(t('cin.chat.b2')) + '</div>' +
      '<div class="cin-bub me ok" style="--d:3.8s">' + esc(t('cin.chat.b3')) + tick + '</div></div>';
  }
  function artYaser(){
    return '<div class="cin-yas" aria-hidden="true"><svg class="cin-svg" viewBox="0 0 200 200"><defs><radialGradient id="yog" cx=".4" cy=".3"><stop offset="0" stop-color="#d9d6ff"/><stop offset=".55" stop-color="#2b92dc"/><stop offset="1" stop-color="#2a2a9a"/></radialGradient></defs>' +
      '<circle class="cin-halo" cx="100" cy="104" r="70" fill="#2b92dc" opacity=".22"/><circle class="cin-halo h2" cx="100" cy="104" r="70" fill="none" stroke="#73c3e2" stroke-width="2"/>' +
      '<circle class="cin-orbit" cx="100" cy="104" r="86" fill="none" stroke="#73c3e2" stroke-width="2" stroke-dasharray="3 12" stroke-linecap="round"/>' +
      '<line x1="100" y1="34" x2="100" y2="20" stroke="#73c3e2" stroke-width="4" stroke-linecap="round"/><circle class="cin-ant" cx="100" cy="16" r="6" fill="#73c3e2"/>' +
      '<g class="cin-bot"><circle cx="100" cy="104" r="58" fill="url(#yog)"/><rect class="cin-eye" x="74" y="92" width="14" height="22" rx="7" fill="#fff"/><rect class="cin-eye e2" x="112" y="92" width="14" height="22" rx="7" fill="#fff"/><path d="M80 130 Q100 146 120 130" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g></svg>' +
      '<div class="cin-say"><span>' + esc(t('cin.yaser.hi')) + '</span></div></div>';
  }
  function artGlobe(){
    const mer = [0, 1, 2].map(i => '<ellipse class="cin-mer" style="--i:' + i + '" cx="100" cy="100" rx="78" ry="78" fill="none" stroke="#bfe3ff" stroke-opacity=".5" stroke-width="1.4"/>').join('');
    const mot = rm() ? '' : '<circle r="5" fill="#fff"><animateMotion dur="3.2s" repeatCount="indefinite" path="M40 120 Q100 10 168 70"/></circle><circle r="4" fill="#73c3e2"><animateMotion dur="4.2s" begin="1s" repeatCount="indefinite" path="M62 150 Q130 60 176 126"/></circle>';
    return '<svg class="cin-svg" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="glg" cx=".35" cy=".3"><stop offset="0" stop-color="#2b92dc"/><stop offset=".6" stop-color="#0b5990"/><stop offset="1" stop-color="#0b1d46"/></radialGradient></defs>' +
      '<circle cx="100" cy="100" r="82" fill="url(#glg)"/>' + mer + '<ellipse cx="100" cy="100" rx="78" ry="26" fill="none" stroke="#bfe3ff" stroke-opacity=".35"/><line x1="22" y1="100" x2="178" y2="100" stroke="#bfe3ff" stroke-opacity=".35"/>' +
      '<path class="cin-arc" d="M40 120 Q100 10 168 70" fill="none" stroke="#73c3e2" stroke-width="3" stroke-linecap="round"/><path class="cin-arc a2" d="M62 150 Q130 60 176 126" fill="none" stroke="#EAF5FF" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle class="cin-pin" cx="40" cy="120" r="5" fill="#73c3e2"/><circle class="cin-pin p2" cx="168" cy="70" r="5" fill="#73c3e2"/><circle class="cin-pin p3" cx="176" cy="126" r="4" fill="#EAF5FF"/>' + mot + '</svg>';
  }
  function artFace(){
    return '<svg class="cin-svg" viewBox="0 0 200 220" aria-hidden="true"><defs><linearGradient id="fsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9af0c6"/><stop offset="1" stop-color="#1f9d6e"/></linearGradient><clipPath id="fcl"><path d="M100 14 L176 42 V110 C176 156 142 192 100 206 C58 192 24 156 24 110 V42 Z"/></clipPath></defs>' +
      '<path class="cin-shield" d="M100 14 L176 42 V110 C176 156 142 192 100 206 C58 192 24 156 24 110 V42 Z" fill="rgba(26,105,162,.14)" stroke="url(#fsg)" stroke-width="5" stroke-linejoin="round"/>' +
      '<g class="cin-face" fill="none" stroke="#eaf8fe" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M62 78V66a4 4 0 0 1 4-4h12M138 78V66a4 4 0 0 0-4-4h-12M62 128v12a4 4 0 0 0 4 4h12M138 128v12a4 4 0 0 1-4 4h-12"/><path d="M84 92v8M116 92v8M100 96v14h-5M86 122q14 10 28 0"/></g>' +
      '<g clip-path="url(#fcl)"><rect class="cin-scan" x="20" y="40" width="160" height="14" fill="url(#fsg)" opacity=".55"/></g>' +
      '<circle class="cin-okc" cx="148" cy="166" r="22" fill="#1f9d6e"/><path class="cin-ok" d="M138 166l7 7 13-15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  const THEMES = { boost: 't-gold', credit: 't-ember', chat: 't-teal', yaser: 't-indigo', send: 't-sky', face: 't-emerald', ann: 't-gold' };
  const CORE = [
    { id: 'boost', route: 'invest', art: artBoost }, { id: 'credit', route: 'credit', art: artCredit }, { id: 'chat', route: 'chat', art: artChat },
    { id: 'yaser', route: 'yaser', art: artYaser }, { id: 'send', route: 'country-select', art: artGlobe }, { id: 'face', route: 'settings', art: artFace }
  ];
  const scenes = () => ((S.ann || []).map(a => ({ id: 'ann-' + a.id, type: 'ann', ann: a }))).concat(CORE);

  /* ---------- une scène ---------- */
  /* trusted = textes de l'application (peuvent contenir &nbsp; et *mise en valeur*) ; sinon (annonce d'un administrateur) tout est échappé */
  function titleHtml(txt, trusted){
    return String(txt).split(' ').filter(Boolean).map((w, i) => {
      const hl = trusted && /^\*.+\*[^*]*$/.test(w);
      const plain = hl ? w.replace(/\*/g, '') : w;
      return '<span class="w' + (hl ? ' hl' : '') + '" style="--w:' + i + '">' + (trusted && plain.indexOf('&nbsp;') >= 0 ? plain : esc(plain)) + '</span> ';
    }).join('');
  }
  function particles(){
    let h = '';
    for (let i = 0; i < 16; i++){ h += '<i class="cin-p" style="--x:' + Math.round(Math.random() * 100) + '%;--s:' + (3 + Math.round(Math.random() * 5)) + 'px;--d:' + (5 + Math.random() * 5).toFixed(1) + 's;--t:-' + (Math.random() * 8).toFixed(1) + 's"></i>'; }
    return h;
  }
  function copy(sc){
    const c = Cfg.get();
    if (sc.type === 'ann') return { k: t('cin.ann.k'), title: titleHtml(sc.ann.title, false), sub: sc.ann.body, cta: t('cin.ann.c'), num: '' };
    const id = sc.id, rate = (Number(c.vault_rate_pct_day) || 0).toLocaleString('en-US', { maximumFractionDigits: 3 });
    const fill = s => String(s).replace('{min}', Money.int(c.credit_min)).replace('{max}', Money.int(c.credit_max)).replace('{rate}', rate);
    let num = '';
    if (id === 'boost') num = '';   /* 19.0.0 : aucun rendement annoncé : pas de compteur de gains */
    else if (id === 'credit') num = '<div class="cin-num"><small>' + esc(t('cin.credit.up')) + '</small><b class="ltr" dir="ltr" data-cu="' + esc(Number(c.credit_max) || 0) + '">0</b><small>OMR</small></div>';
    else if (id === 'send') num = '<div class="cin-chips"><span>' + esc(t('cin.send.a')) + '</span><span>' + esc(t('cin.send.b')) + '</span></div>';
    return { k: t('cin.' + id + '.k'), title: titleHtml(fill(t('cin.' + id + '.t')), true), sub: t('cin.' + id + '.s'), cta: t('cin.' + id + '.c'), num };
  }
  function sceneHtml(sc, o){
    o = o || {};
    const c = copy(sc), th = THEMES[sc.type || sc.id] || 't-gold';
    const art = sc.art ? sc.art() : '<div class="cin-annart" aria-hidden="true"><svg class="cin-svg" viewBox="0 0 200 200"><circle class="cin-halo" cx="100" cy="100" r="64" fill="#aadcf0" opacity=".18"/><g transform="translate(-14 0)"><path d="M60 96v28h18l34 20V76L78 96z" fill="#73c3e2"/><path class="cin-wave" d="M128 84q14 16 0 32M142 72q24 28 0 56" fill="none" stroke="#EAF5FF" stroke-width="5" stroke-linecap="round"/></g></svg></div>';
    const secondary = (sc.id === 'send' && typeof LiveX !== 'undefined' && LiveX.caps && LiveX.caps.intl) ? '<button type="button" class="cin-cta2" data-cin-go="intl">' + esc(t('cin.intl')) + '</button>' : '';
    return '<div class="cin-scene ' + th + ' sc-' + esc(sc.type || sc.id) + '" data-id="' + esc(sc.id) + '">' +
      '<div class="cin-bg"><i class="cin-glow g1"></i><i class="cin-glow g2"></i><i class="cin-rings"></i><i class="cin-beams"></i>' + particles() + '</div>' +
      '<div class="cin-art">' + art + '</div>' +
      '<div class="cin-copy"><div class="cin-kicker">' + esc(c.k) + '</div><h2 class="cin-title" dir="auto">' + c.title + '</h2>' +
      '<p class="cin-sub" dir="auto">' + esc(c.sub) + '</p>' + c.num +
      '<div class="cin-acts"><button type="button" class="cin-cta" data-cin-go="' + esc(sc.route || '') + '">' + esc(c.cta) + '<span class="cin-cta-ic">' + icon('arrowRight', 18) + '</span></button>' + secondary + '</div></div></div>';
  }

  /* ---------- lecteur ---------- */
  function Player(host, o){
    o = o || {};
    const compact = !!o.compact;
    let list = scenes(), idx = clamp(o.start || 0, 0, list.length - 1), acc = 0, last = 0, held = false, paused = false, vis = true, dead = false, raf = 0, stops = [], io = null, shown = null;
    host.innerHTML = '<div class="cin ' + (compact ? 'cin-compact' : 'cin-full') + (rm() ? ' cin-rm' : '') + '" role="region" aria-roledescription="carousel" aria-label="' + esc(t('cin.aria')) + '" dir="' + (isRtl() ? 'rtl' : 'ltr') + '">' +
      '<div class="cin-stage"></div><div class="cin-bars" aria-hidden="true"></div>' +
      '<div class="cin-ctrl"><button type="button" class="cin-btn" data-cin-act="pause" aria-pressed="false" aria-label="' + esc(t('cin.pause')) + '">' + pauseIcon() + '</button>' +
      (compact ? '' : '<button type="button" class="cin-btn" data-cin-act="close" aria-label="' + esc(t('cin.close')) + '">' + icon('close', 20) + '</button>') + '</div></div>';
    const root = host.firstChild, stage = root.querySelector('.cin-stage'), bars = root.querySelector('.cin-bars'), pbtn = root.querySelector('[data-cin-act="pause"]');
    function pauseIcon(){ return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>'; }
    function playIcon(){ return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>'; }
    function buildBars(){ bars.innerHTML = list.map(() => '<span class="cin-bar-s"><i></i></span>').join(''); paintBars(); }
    function paintBars(p){
      const segs = bars.children;
      for (let i = 0; i < segs.length; i++){ const f = segs[i].firstChild; f.style.transform = 'scaleX(' + (i < idx ? 1 : i === idx ? (p == null ? 0 : p) : 0) + ')'; }
    }
    function stopFx(){ stops.forEach(f => { try { f(); } catch(e){ /* rien */ } }); stops = []; }
    function activate(el){
      stopFx();
      try {
        el.querySelectorAll('[data-cu]').forEach(b => { const to = Number(b.getAttribute('data-cu')) || 0; Fx.countUp(b, to, { from: 0, ms: 1600, dec: 0 }); });
        el.querySelectorAll('[data-tick]').forEach(b => { const base = Number(b.getAttribute('data-tick')) || 0, rate = Number(b.getAttribute('data-rate')) || 0; stops.push(Fx.ticker(b, base, base * rate / 100 / 86400, { dec: 6 })); });   /* vrai gain par seconde (exemple de 1 000 OMR) : visible à la 6e décimale */
      } catch(e){ /* un effet ne casse rien */ }
    }
    function show(i, quiet){
      if (dead) return;
      const n = list.length; idx = ((i % n) + n) % n; acc = 0;
      const sc = list[idx], wrap = document.createElement('div'); wrap.innerHTML = sceneHtml(sc);
      const el = wrap.firstChild; el.classList.add('is-on');
      const old = stage.firstChild;
      stage.appendChild(el);
      if (old){ old.classList.remove('is-on'); old.classList.add('is-out'); setTimeout(() => { if (old.parentNode) old.parentNode.removeChild(old); }, 420); }
      shown = sc.id; activate(el); paintBars(0);
      if (!quiet){ try { Sfx.play('tick'); } catch(e){ /* rien */ } }
    }
    function setList(nl){
      const cur = list[idx] && list[idx].id; list = nl;
      const k = list.findIndex(s => s.id === cur); idx = k >= 0 ? k : 0; buildBars(); paintBars(clamp(acc / DUR, 0, 1));
    }
    const next = () => show(idx + 1), prev = () => show(idx - 1);
    function frame(now){
      if (dead) return;
      if (!host.isConnected){ destroy(); return; }
      const dt = Math.min(100, now - (last || now)); last = now;
      if (!held && !paused && vis && !document.hidden){
        acc += dt; paintBars(clamp(acc / DUR, 0, 1));
        if (acc >= DUR) next();
      }
      raf = requestAnimationFrame(frame);
    }
    function go(route){
      try { Sfx.play('success'); Fx.haptic('success'); } catch(e){ /* rien */ }
      if (!route){ next(); return; }
      const sc = list[idx];
      if (sc && sc.type === 'ann'){ next(); return; }
      if (route === 'intl' && typeof LiveX !== 'undefined' && LiveX.guardIntl && !LiveX.guardIntl()) return;
      try { if (route === 'country-select' && typeof txReset === 'function') txReset(); } catch(e){ /* rien */ }
      try { R.go(route); } catch(e){ Guardian.note('cinema:go', e); }
    }
    /* gestes : appui = suivant / précédent (miroité en RTL), maintien = pause, glisser vers le bas = fermer */
    let g = null, holdT = 0;
    function onDown(e){
      if (e.target.closest && e.target.closest('button,a')) return;
      g = { x: e.clientX, y: e.clientY, t: Date.now(), dy: 0, dx: 0, moved: false };
      holdT = setTimeout(() => { if (g && !g.moved){ held = true; root.classList.add('is-held'); } }, 220);
      try { stage.setPointerCapture(e.pointerId); } catch(x){ /* rien */ }
    }
    function onMove(e){
      if (!g) return;
      g.dx = e.clientX - g.x; g.dy = e.clientY - g.y;
      if (Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10){ g.moved = true; clearTimeout(holdT); }
      if (!compact && g.dy > 0 && g.dy > Math.abs(g.dx)){ root.style.transform = 'translateY(' + g.dy * 0.8 + 'px)'; root.style.opacity = String(clamp(1 - g.dy / 420, 0.4, 1)); }
    }
    function onUp(e){
      clearTimeout(holdT);
      const was = g; g = null;
      if (held){ held = false; root.classList.remove('is-held'); root.style.transform = ''; root.style.opacity = ''; return; }
      if (!was) return;
      root.style.transform = ''; root.style.opacity = '';
      if (!compact && was.dy > 110 && was.dy > Math.abs(was.dx)){ close(); return; }
      if (was.moved && Math.abs(was.dx) > 60 && Math.abs(was.dx) > Math.abs(was.dy)){ (was.dx < 0) !== isRtl() ? next() : prev(); return; }
      if (was.moved) return;
      if (compact){ Fx.haptic('tap'); Cinema.open(idx); return; }
      const w = stage.getBoundingClientRect(), rel = (e.clientX - w.left) / Math.max(1, w.width), left = rel < 0.35, right = rel > 0.35;
      if (left){ isRtl() ? next() : prev(); } else if (right){ isRtl() ? prev() : next(); }
      try { Fx.haptic('tap'); } catch(x){ /* rien */ }
    }
    function onCancel(){ clearTimeout(holdT); g = null; if (held){ held = false; root.classList.remove('is-held'); } root.style.transform = ''; root.style.opacity = ''; }
    function onClick(e){
      const b = e.target.closest && e.target.closest('[data-cin-go],[data-cin-act]'); if (!b) return;
      e.stopPropagation();
      if (b.hasAttribute('data-cin-go')){ if (compact){ const sc = list[idx]; if (sc && sc.type !== 'ann'){ go(b.getAttribute('data-cin-go')); return; } Cinema.open(idx); return; } go(b.getAttribute('data-cin-go')); return; }
      const a = b.getAttribute('data-cin-act');
      if (a === 'pause'){ paused = !paused; b.setAttribute('aria-pressed', String(paused)); b.setAttribute('aria-label', t(paused ? 'cin.play' : 'cin.pause')); b.innerHTML = paused ? playIcon() : pauseIcon(); root.classList.toggle('is-paused', paused); try { Sfx.play('tap'); } catch(x){ /* rien */ } }
      else if (a === 'close') close();
    }
    function onKey(e){ if (compact) return; if (e.key === 'ArrowRight'){ isRtl() ? prev() : next(); } else if (e.key === 'ArrowLeft'){ isRtl() ? next() : prev(); } else if (e.key === 'Escape'){ close(); } }
    function close(){ try { Sfx.play('tap'); R.back(); } catch(e){ /* rien */ } }
    function destroy(){
      if (dead) return; dead = true; cancelAnimationFrame(raf); stopFx(); clearTimeout(holdT);
      document.removeEventListener('keydown', onKey); try { io && io.disconnect(); } catch(e){ /* rien */ }
      try { if (host.firstChild === root) host.innerHTML = ''; } catch(e){ /* rien */ }
    }
    stage.addEventListener('pointerdown', onDown); stage.addEventListener('pointermove', onMove); stage.addEventListener('pointerup', onUp); stage.addEventListener('pointercancel', onCancel);
    root.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
    if (compact && 'IntersectionObserver' in window){ io = new IntersectionObserver(es => { vis = es.some(x => x.isIntersecting); }, { threshold: 0.35 }); io.observe(root); }
    buildBars(); show(idx, true); raf = requestAnimationFrame(frame);
    return { destroy, setList, current: () => idx, next, prev, ids: () => list.map(x => x.id).join() };
  }

  /* ---------- API ---------- */
  function mount(el, o){
    if (!el) return () => {};
    if (el.__cin) return el.__cin.un;
    o = o || {};
    const pl = Player(el, { compact: o.compact !== false && !o.full, start: o.start || 0 });
    const un = () => { try { pl.destroy(); } catch(e){ /* rien */ } el.__cin = null; el.removeAttribute('data-cin-on'); };
    el.__cin = { pl, un }; el.setAttribute('data-cin-on', '1');
    try { R.onLeave(un); } catch(e){ /* rien */ }
    Cfg.load().then(() => { /* les chiffres des scènes suivantes sont rendus au moment d'être affichés */ }).catch(() => {});
    loadAnn().then(() => { if (!el.__cin) return; const nl = scenes(); if (nl.map(x => x.id).join() !== el.__cin.pl.ids()) el.__cin.pl.setList(nl); }).catch(() => {});
    return un;
  }
  function mountAll(root){ try { (root || document).querySelectorAll('[data-cinema]:not([data-cin-on])').forEach(el => mount(el, { compact: true })); } catch(e){ Guardian.note('cinema:mountAll', e); } }
  function homeHtml(){ return '<section class="cin-slot" data-cinema aria-label="' + esc(t('cin.aria')) + '"></section>'; }
  function open(i){ S.start = clamp(Number(i) || 0, 0, 20); try { R.go('cinema', { force: true }); } catch(e){ Guardian.note('cinema:open', e); } }
  function refresh(){ S.annAt = 0; return loadAnn(true).then(() => { document.querySelectorAll('[data-cin-on]').forEach(el => { if (el.__cin) el.__cin.pl.setList(scenes()); }); }); }
  /* aperçu statique d'une annonce (utilisé par l'écran admin-announce) : HTML d'une scène « annonce » déjà active */
  function previewHtml(title, body){ return '<div class="cin cin-compact cin-preview' + (rm() ? ' cin-rm' : '') + '" dir="' + (isRtl() ? 'rtl' : 'ltr') + '"><div class="cin-stage">' + sceneHtml({ id: 'ann-preview', type: 'ann', ann: { id: 'preview', title: String(title || '').slice(0, 80), body: String(body || '').slice(0, 240) } }).replace('class="cin-scene', 'class="cin-scene is-on') + '</div></div>'; }

  R.register({ cinema: () => '<div class="cin-host" data-cin-full></div>' });
  R.meta({ cinema: { parent: 'home', nav: 'home', nonav: true } });
  Hooks.on('cinema', root => {
    const host = root.querySelector('[data-cin-full]'); if (!host) return;
    mount(host, { full: true, compact: false, start: S.start });
    try { Sfx.play('open'); Fx.haptic('tap'); } catch(e){ /* rien */ }
  });
  /* l'accueil s'affiche d'abord ; le film (réseau + animations) se monte quand le navigateur est libre (la réserve de 190 px évite tout saut de page) */
  const idle = fn => { try { if (window.requestIdleCallback) return window.requestIdleCallback(fn, { timeout: 1200 }); } catch(e){ /* rien */ } return setTimeout(fn, 350); };
  Hooks.on('*', root => { if (root && root.querySelector && root.querySelector('[data-cinema]')) idle(() => { if (root.isConnected && root.classList.contains('active')) mountAll(root); }); });
  return { mount, mountAll, homeHtml, open, refresh, previewHtml, sceneHtml, scenes };
})();
