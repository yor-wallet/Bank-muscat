'use strict';

/* ============================================================
   PHONE ART (16.0.0) — maquettes de téléphone des pages de présentation (style « captures de l'App Store » : grand titre,
   téléphone réaliste à cadre métal, écran de l'application, bulles flottantes).
   Tout est dessiné en HTML / CSS / SVG : aucune image, aucune requête. Les tailles sont en « em » : une seule variable (--phw) règle la taille.
   Les écrans montrent de VRAIES fonctions de l'application (accueil, récompense, transfert international, carte Visa, code + Face ID).
   Les noms, montants et pays sont des exemples d'illustration.
   `PhoneArt.slide(k, lang)` → HTML ; `PhoneArt.count` → nombre de pages.
   ============================================================ */
const PhoneArt = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const I = {
    send: '<path d="M4 12l16-8-6 16-3-7z"/>', recv: '<path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"/>', hist: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>', gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9v11M3 9h18v3H3zM12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2.2 2.2L15 10"/>', clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.5 3 13.5 0 17M12 3.5c-3 3.5-3 13.5 0 17"/>', face: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v1.5M15 10v1.5M9.5 15c1.5 1.4 3.5 1.4 5 0M12 10v3h-1"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', card: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18"/>', globeOn: '<circle cx="12" cy="12" r="8.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
  };
  const ic = (n, s) => '<svg class="ph-i" viewBox="0 0 24 24" width="' + (s || 24) + '" height="' + (s || 24) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>';
  const T = {
    en: { hi: 'Good evening', name: 'Your name', friend: 'Friend', bal: 'Available balance', acts: ['Send', 'Receive', 'History', 'More'], recent: 'Recent activity', rw: 'Welcome reward', rwSub: 'Today', toastT: 'Money received', toastM: 'A friend sent you 25 OMR',
      earned: 'You earned', cong: 'Welcome reward added to your wallet', cta: 'Awesome!', intl: 'International transfer', regions: ['Gulf', 'Africa', 'USA', 'Canada'], days: '48–72 h', meth: ['Bank', 'Mobile money', 'Cash pickup'],
      arrives: 'Arrives in 2–3 days', cards: 'Cards', online: 'Online payments', contactless: 'Contactless', atm: 'ATM withdrawals', code: 'Enter your code', fid: 'Face ID recognised', holder: 'YOUR NAME' },
    fr: { hi: 'Bonsoir', name: 'Votre nom', friend: 'Ami', bal: 'Solde disponible', acts: ['Envoyer', 'Recevoir', 'Historique', 'Plus'], recent: 'Activité récente', rw: 'Récompense de bienvenue', rwSub: 'Aujourd’hui', toastT: 'Argent reçu', toastM: 'Un ami vous a envoyé 25 OMR',
      earned: 'Vous avez gagné', cong: 'Récompense de bienvenue ajoutée à votre portefeuille', cta: 'Génial !', intl: 'Transfert international', regions: ['Golfe', 'Afrique', 'USA', 'Canada'], days: '48–72 h', meth: ['Banque', 'Mobile money', 'Retrait en espèces'],
      arrives: 'Arrive sous 2 à 3 jours', cards: 'Cartes', online: 'Paiements en ligne', contactless: 'Sans contact', atm: 'Retraits DAB', code: 'Saisissez votre code', fid: 'Face ID reconnu', holder: 'YOUR NAME' },
    ar: { hi: 'مساء الخير', name: 'اسمك', friend: 'صديق', bal: 'الرصيد المتاح', acts: ['إرسال', 'استلام', 'السجل', 'المزيد'], recent: 'النشاط الأخير', rw: 'مكافأة الترحيب', rwSub: 'اليوم', toastT: 'تم استلام مبلغ', toastM: 'أرسل لك صديق 25 ر.ع',
      earned: 'لقد ربحت', cong: 'تمت إضافة مكافأة الترحيب إلى محفظتك', cta: 'رائع!', intl: 'التحويل الدولي', regions: ['الخليج', 'أفريقيا', 'أمريكا', 'كندا'], days: '48–72 ساعة', meth: ['بنك', 'محفظة هاتف', 'استلام نقدي'],
      arrives: 'يصل خلال 2–3 أيام', cards: 'البطاقات', online: 'الدفع عبر الإنترنت', contactless: 'الدفع اللاتلامسي', atm: 'السحب من الصراف', code: 'أدخل رمزك', fid: 'تم التعرف بـ Face ID', holder: 'YOUR NAME' },
  };
  const FACES = [['#73c3e2', '#2A1A15'], ['#2081c7', '#1E120D'], ['#CFE7FF', '#6A4029'], ['#2081c7', '#2A1A15'], ['#6E4228', '#120A06'], ['#aadcf0', '#5B3622']];
  /* avatar illustré : tête, cheveux, épaules (SVG) */
  function face(k, size){
    const [skin, hair] = FACES[k % FACES.length];
    return '<svg class="ph-face" viewBox="0 0 40 40" width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#d1eefa"/><path d="M5 40c1-9 7-13 15-13s14 4 15 13z" fill="#122439"/><rect x="17" y="21" width="6" height="8" rx="3" fill="' + skin + '"/><circle cx="20" cy="16" r="8" fill="' + skin + '"/><path d="M11.5 15.5c0-6 3.6-8.8 8.5-8.8s8.5 2.8 8.5 8.8c-2-3-4.6-4.2-8.5-4.2s-6.5 1.2-8.5 4.2z" fill="' + hair + '"/></svg>';
  }
  const regionName = (c, lang) => { try { return new Intl.DisplayNames([lang], { type: 'region' }).of(c); } catch(e){ return c; } };
  const flag = c => String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt(0)));
  const status = () => '<div class="ph-status" aria-hidden="true"><b>9:41</b><span class="ph-sys"><svg viewBox="0 0 18 12" width="1.5em" height="1em"><g fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8" opacity=".4"/></g></svg><svg viewBox="0 0 26 12" width="2em" height="1em"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5"/></svg></span></div>';
  function shell(inner, chips){
    return '<div class="ph" aria-hidden="true"><i class="ph-b ph-b1"></i><i class="ph-b ph-b2"></i><i class="ph-b ph-b3"></i><i class="ph-b ph-b4"></i>' +
      '<div class="ph-bezel"><div class="ph-screen"><i class="ph-island"></i>' + status() + inner + '<i class="ph-home"></i></div></div><i class="ph-glare"></i>' + (chips || '') + '</div>';
  }
  const chip = (cls, inner) => '<div class="ph-chip ' + cls + '">' + inner + '</div>';

  const S = [
    /* 0 — accueil */
    (t, lang) => shell(
      '<div class="ph-ui ph-home-ui">' +
        '<div class="ph-hd"><span class="ph-ava">FP</span><span class="ph-hello"><small>' + esc(t.hi) + '</small><b>' + esc(t.name) + '</b></span><span class="ph-ic">' + ic('search', 18) + '</span><span class="ph-ic">' + ic('bell', 18) + '<i class="ph-dot"></i></span></div>' +
        '<div class="ph-bal"><small>' + esc(t.bal) + '</small><div class="ph-amt"><span>USD</span><b>26.01</b></div><em>10.000 OMR</em><div class="ph-bal-f"><span>SP-XXXXXX</span><span>' + esc(t.acts[2]) + ' ' + ic('chev', 12) + '</span></div></div>' +
        '<div class="ph-acts">' + ['send', 'recv', 'hist', 'grid'].map((n, i) => '<span class="ph-act' + (i === 0 ? ' p' : '') + '"><i>' + ic(n, 22) + '</i><small>' + esc(t.acts[i]) + '</small></span>').join('') + '</div>' +
        '<div class="ph-sec">' + esc(t.recent) + '</div>' +
        '<div class="ph-row"><i class="ph-tile">' + ic('gift', 18) + '</i><span><b>' + esc(t.rw) + '</b><small>' + esc(t.rwSub) + '</small></span><em class="up">+10.000 OMR</em></div>' +
        '<div class="ph-row"><span class="ph-av">' + face(0, 28) + '</span><span><b>' + esc(t.friend) + '</b><small>' + esc(t.rwSub) + '</small></span><em>-25.000 OMR</em></div>' +
        '<div class="ph-sec">' + esc(t.cards) + '</div>' +
        '<div class="ph-strip"><span class="ph-mini g"><b>SANAD PAY</b><img src="assets/brand/network/visa-blue.svg" alt="" height="9"></span><span class="ph-mini k"><b>SANAD PAY</b><img src="assets/brand/network/visa-white.svg" alt="" height="9"></span></div>' +
      '</div>',
      chip('c1', '<span class="ph-av">' + face(0, 34) + '</span><span><b>' + esc(t.toastT) + '</b><small>' + esc(t.toastM) + '</small></span>')),
    /* 1 — récompense */
    (t) => shell(
      '<div class="ph-ui ph-rw-ui"><div class="ph-conf">' + Array.from({ length: 22 }, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div>' +
        '<div class="ph-rw-medal"><i class="ph-ring r1"></i><i class="ph-ring r2"></i><span class="ph-coin">' + ic('gift', 34) + '</span></div>' +
        '<small class="ph-rw-k">' + esc(t.earned) + '</small><div class="ph-rw-amt"><b>10</b><span>OMR</span></div><p class="ph-rw-p">' + esc(t.cong) + '</p>' +
        '<span class="ph-cta">' + esc(t.cta) + '</span></div>',
      chip('c2', '<i class="ph-tile">' + ic('check', 18) + '</i><span><b>+10.000 OMR</b><small>' + esc(t.rw) + '</small></span>')),
    /* 2 — transfert international */
    (t, lang) => shell(
      '<div class="ph-ui ph-in-ui"><div class="ph-top"><b>' + esc(t.intl) + '</b></div>' +
        '<div class="ph-chips">' + t.regions.map((r, i) => '<span class="' + (i === 1 ? 'on' : '') + '">' + esc(r) + '</span>').join('') + '</div>' +
        [['SN', 0, 1], ['CI', 1, 2], ['GH', 1, 2], ['KE', 1, 2], ['SA', 0, 2], ['US', 0, 0]].map(([c, a, b]) =>
          '<div class="ph-row ph-co"><span class="ph-fl">' + flag(c) + '</span><span><b>' + esc(regionName(c, lang)) + '</b><small>' + esc(t.meth[a]) + ' · ' + esc(t.meth[b]) + '</small></span><em class="ph-eta">' + esc(t.days) + '</em></div>').join('') +
      '</div>',
      chip('c3', '<i class="ph-tile">' + ic('clock', 18) + '</i><span><b>' + esc(t.arrives) + '</b><small>' + flag('SN') + ' → ' + flag('OM') + '</small></span>')),
    /* 3 — carte Visa en métal */
    (t) => shell(
      '<div class="ph-ui ph-cd-ui"><div class="ph-top"><b>' + esc(t.cards) + '</b></div>' +
        '<div class="ph-card"><i class="ph-card-sheen"></i><div class="ph-card-top"><b>SANAD</b><small>PAY</small></div><i class="ph-chip-emv"></i>' +
          '<div class="ph-card-num">•••• •••• •••• 4821</div><div class="ph-card-bot"><span>' + esc(t.holder) + '</span><img src="assets/brand/network/visa-blue.svg" alt="" height="14"></div></div>' +
        [['globeOn', t.online], ['card', t.contactless], ['hist', t.atm]].map(([n, l], i) => '<div class="ph-row ph-tg"><i class="ph-tile">' + ic(n === 'globeOn' ? 'globe' : n, 17) + '</i><span><b>' + esc(l) + '</b></span><i class="ph-sw on"></i></div>').join('') +
      '</div>',
      chip('c4', '<i class="ph-tile">' + ic('card', 18) + '</i><span><b>Visa</b><small>•••• 4821</small></span>')),
    /* 4 — sécurité */
    (t) => shell(
      '<div class="ph-ui ph-pin-ui"><span class="ph-shield">' + ic('shield', 30) + '</span><b class="ph-pin-t">' + esc(t.code) + '</b>' +
        '<div class="ph-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i><i></i></div>' +
        '<div class="ph-pad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => '<span class="' + (k ? '' : 'e') + '">' + k + '</span>').join('') + '</div></div>',
      chip('c5', '<i class="ph-tile">' + ic('face', 18) + '</i><span><b>Face ID</b><small>' + esc(t.fid) + '</small></span>')),
  ];
  function slide(k, lang){
    const t = T[lang] || T.en;
    return '<div class="ph-wrap" data-k="' + k + '">' + S[k % S.length](t, lang) + '</div>';
  }
  return { slide, count: S.length, face };
})();
