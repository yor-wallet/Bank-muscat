'use strict';

/* ============================================================
   PHONE ART → scènes de la présentation (Sanad Pay 21.2.0).
   Cinq scènes originales, une par page, dans l'ordre : compte et tableau de bord · avantages déjà présents · transferts · cartes · sécurité.
   Règles : aucune valeur chiffrée, aucun montant, aucun délai, aucun nom de service qui n'existe pas ; les états montrés (en cours, confirmé, échoué,
   actif, gelé) sont ceux de l'application. Le logo est le fichier officiel, jamais redessiné. Pas de texte dans les dessins (la langue vient de la page).
   Mouvement : classes .sc-* déclenchées par « .ob-slide.on » (css/s-scenes.css) ; état final = état normal, donc lisible sans animation.
   Profondeur : trois plans (fond, objet, reflet) décalés de quelques pixels, jamais d'effet 3D lourd.
   ============================================================ */
const PhoneArt = (() => {
  const LOGO = 'assets/brand/sanad-s-192.png';
  /* 21.3.0 — style « interface de banque » : aplats, angles de 10 à 16, filets fins, aucun halo, aucun reflet, aucune bulle.
     Les noms de classes (.sc-*) sont conservés : ils pilotent seulement l'ENTRÉE des éléments (fondu + glissement), css/s-scenes.css. */
  const NAVY = '#134F91', NAVY2 = '#0F3F77', LINE = '#D5E3F0', INK = '#C3D5E6', SOFT = '#EAF2FA', BLUE = '#2596DE';
  const DEFS = '';
  const scene = (cls, inner) => '<svg class="ob-art sc ' + cls + '" viewBox="0 0 320 280" focusable="false" aria-hidden="true">' + inner + '</svg>';
  /* icônes sur grille 24 : tracé blanc ou bleu, bouts ronds */
  const I = {
    send: 'M21 3 3 10.4l6.8 2.8L12.6 21z M9.8 13.2 21 3',
    down: 'M12 4v12m0 0-5-5m5 5 5-5M5 20h14',
    clock: 'M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    cross: 'M6 6l12 12M18 6 6 18',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z M10 20.5a2 2 0 0 0 4 0',
    pause: 'M9 6v12 M15 6v12',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3 M5 11h14v9H5z',
    shield: 'M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z M8.8 12l2.4 2.4 4.2-4.6'
  };
  const ic = (name, cx, cy, s, stroke, w, cls) => '<g class="' + (cls || '') + '" transform="translate(' + (cx - s / 2) + ' ' + (cy - s / 2) + ') scale(' + (s / 24) + ')"><path d="' + I[name] + '" fill="none" stroke="' + stroke + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"/></g>';
  const plate = (x, y, w, id, cls) => '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="' + (w * .22) + '"/></clipPath><g class="' + (cls || '') + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="' + (w * .22) + '" fill="#fff"/><image href="' + LOGO + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" clip-path="url(#' + id + ')" preserveAspectRatio="xMidYMid slice"/></g>';
  const bar = (x, y, w, h, fill, cls) => '<rect class="' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + Math.min(4, h / 2) + '" fill="' + fill + '"/>';
  const box = (x, y, w, h, r, fill, stroke, cls) => '<rect class="' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2"' : '') + '/>';
  const ribbon = (id, x, y, w, h, r) => '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '"/></clipPath><g clip-path="url(#' + id + ')" opacity=".9"><path d="M' + (x - 10) + ' ' + (y + h * .9) + 'C' + (x + w * .3) + ' ' + (y + h * .9) + ' ' + (x + w * .5) + ' ' + (y + h * .4) + ' ' + (x + w * .75) + ' ' + (y + h * .5) + 'S' + (x + w + 20) + ' ' + (y + h * .8) + ' ' + (x + w + 20) + ' ' + (y + h * .7) + '" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="16" stroke-linecap="round"/><path d="M' + (x - 10) + ' ' + (y + h * .9) + 'C' + (x + w * .3) + ' ' + (y + h * .9) + ' ' + (x + w * .5) + ' ' + (y + h * .4) + ' ' + (x + w * .75) + ' ' + (y + h * .5) + 'S' + (x + w + 20) + ' ' + (y + h * .8) + ' ' + (x + w + 20) + ' ' + (y + h * .7) + '" fill="none" stroke="#7ED8F6" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/></g>';

  const S = [
    /* 1 — compte et tableau de bord : carte de compte (sans chiffre), quatre actions, activité récente */
    () => scene('sc-dash',
      '<g class="sc-back">' + box(64, 40, 192, 112, 16, NAVY2, null) + '</g>' +
      '<g class="sc-card">' + box(56, 32, 208, 112, 16, NAVY, null) + ribbon('scr1', 56, 32, 208, 112, 16) +
        plate(70, 46, 28, 'scp1') + bar(108, 54, 66, 6, '#fff', 'sc-lb') + bar(108, 66, 40, 5, '#fff') +
        bar(70, 96, 112, 14, '#fff', 'sc-amt') + bar(70, 120, 56, 5, '#fff') + '</g>' +
      '<g class="sc-acts">' +
        [['send', 1], ['down', 0], ['clock', 0], ['grid', 0]].map((a, k) => { const x = 56 + k * 54; return box(x, 162, 46, 46, 12, a[1] ? NAVY : '#fff', a[1] ? null : LINE, 'sc-a' + (k + 1)) + ic(a[0], x + 23, 185, 20, a[1] ? '#fff' : NAVY, 2, 'sc-a' + (k + 1)); }).join('') +
      '</g>' +
      '<g class="sc-rows">' + box(56, 222, 208, 22, 8, '#fff', LINE, 'sc-r1') + bar(68, 230, 84, 6, INK, 'sc-r1') + bar(212, 230, 40, 6, INK, 'sc-r1') +
        box(56, 250, 208, 22, 8, '#fff', LINE, 'sc-r2') + bar(68, 258, 62, 6, INK, 'sc-r2') + bar(220, 258, 32, 6, INK, 'sc-r2') + '</g>'),

    /* 2 — avantages déjà présents : instantané entre comptes, la personne est prévenue, états réels */
    () => scene('sc-adv',
      '<g class="sc-t1">' + box(28, 44, 96, 84, 14, '#fff', LINE) + plate(42, 58, 34, 'scp2') + bar(42, 104, 56, 6, INK) + bar(42, 114, 34, 5, LINE) + '</g>' +
      '<g class="sc-t2">' + box(196, 44, 96, 84, 14, '#fff', LINE) + plate(210, 58, 34, 'scp3') + bar(210, 104, 56, 6, INK) + bar(210, 114, 34, 5, LINE) + '</g>' +
      '<path class="sc-link" d="M130 86H190" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="sc-flow" d="M130 86H190" fill="none" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round" pathLength="100"/>' +
      '<g class="sc-bell">' + box(262, 26, 30, 30, 9, '#fff', LINE) + ic('bell', 277, 41, 16, NAVY, 2) + '<circle cx="288" cy="30" r="4.5" fill="#E84D65"/></g>' +
      '<g class="sc-st">' +
        '<g class="sc-p1">' + box(28, 160, 88, 44, 12, '#FFF6E6', '#F1C27A') + box(38, 172, 20, 20, 6, '#E08A12') + ic('clock', 48, 182, 13, '#fff', 2.2) + bar(66, 178, 36, 7, '#F1C27A') + '</g>' +
        '<g class="sc-p2">' + box(122, 160, 88, 44, 12, '#E8F7F1', '#8FD3BC') + box(132, 172, 20, 20, 6, '#14A879') + ic('check', 142, 182, 13, '#fff', 2.6) + bar(160, 178, 36, 7, '#8FD3BC') + '</g>' +
        '<g class="sc-p3">' + box(216, 160, 76, 44, 12, '#FDECEF', '#F0A8B5') + box(226, 172, 20, 20, 6, '#E84D65') + ic('cross', 236, 182, 11, '#fff', 2.6) + bar(254, 178, 28, 7, '#F0A8B5') + '</g>' +
      '</g>' +
      bar(28, 232, 150, 6, INK) + bar(28, 246, 110, 5, LINE)),

    /* 3 — transferts : un numéro, le nom vérifié, la confirmation par glissement */
    () => scene('sc-tx',
      '<g class="sc-field">' + box(40, 34, 240, 54, 14, '#fff', LINE) + box(52, 48, 26, 26, 8, SOFT) + ic('send', 65, 61, 14, NAVY, 2) +
        [0, 1, 2, 3].map(k => bar(92 + k * 44, 56, 34, 10, k < 3 ? INK : BLUE, 'sc-d d' + k)).join('') + '</g>' +
      '<g class="sc-who">' + box(56, 108, 208, 52, 12, '#fff', LINE) + plate(68, 118, 32, 'scp4') + bar(110, 124, 80, 7, INK) + bar(110, 138, 50, 5, LINE) + box(232, 124, 20, 20, 6, '#14A879') + ic('check', 242, 134, 13, '#fff', 2.6) + '</g>' +
      '<g class="sc-swipe">' + box(44, 188, 232, 56, 14, SOFT, LINE) + '<rect class="sc-fill" x="44" y="188" width="232" height="56" rx="14" fill="' + NAVY + '" opacity=".12"/>' +
        '<g class="sc-thumb">' + box(52, 196, 40, 40, 11, NAVY) + ic('send', 72, 216, 18, '#fff', 2.1) + '</g></g>'),

    /* 4 — cartes : une carte virtuelle, une seconde derrière, états actif et gelé */
    () => scene('sc-card',
      '<g class="sc-c2">' + box(64, 40, 200, 124, 16, '#2F6FB5', null) + '</g>' +
      '<g class="sc-c1">' + box(48, 52, 216, 128, 16, NAVY, null) + ribbon('scr4', 48, 52, 216, 128, 16) +
        box(68, 80, 34, 26, 6, '#D9BE78') + '<path d="M68 93h34M85 80v26" stroke="#A98A3E" stroke-width="1.1"/>' +
        '<path d="M118 84a13 13 0 0 1 0 18M125 80a19 19 0 0 1 0 26" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.2" stroke-linecap="round"/>' +
        [0, 1, 2, 3].map(k => [0, 1, 2, 3].map(j => '<circle cx="' + (74 + k * 40 + j * 8) + '" cy="134" r="2.1" fill="#fff" fill-opacity=".9"/>').join('')).join('') +
        bar(68, 154, 78, 6, '#fff', 'sc-hold') + plate(222, 144, 28, 'scp5', 'sc-brand') + '</g>' +
      '<g class="sc-states"><g class="sc-s1">' + box(52, 210, 104, 36, 12, '#E8F7F1', '#8FD3BC') + box(62, 220, 16, 16, 5, '#14A879') + ic('check', 70, 228, 10, '#fff', 2.6) + bar(88, 224, 44, 7, '#8FD3BC') + '</g>' +
        '<g class="sc-s2">' + box(168, 210, 104, 36, 12, SOFT, LINE) + box(178, 220, 16, 16, 5, BLUE) + ic('pause', 186, 228, 10, '#fff', 2.6) + bar(204, 224, 44, 7, INK) + '</g></g>'),

    /* 5 — sécurité : bouclier, vérification, code à six chiffres */
    () => scene('sc-sec',
      '<g class="sc-shield"><path d="M160 30l72 30v52c0 44-30 80-72 96-42-16-72-52-72-96V60z" fill="#fff" stroke="' + LINE + '" stroke-width="2"/>' +
        '<path d="M160 50l54 22v40c0 32-22 58-54 72-32-14-54-40-54-72V72z" fill="' + NAVY + '" opacity=".08"/>' +
        ic('lock', 160, 112, 38, NAVY, 2.2, 'sc-lock') + '<rect class="sc-scan" x="136" y="150" width="48" height="4" rx="2" fill="' + BLUE + '" opacity=".0"/></g>' +
      '<g class="sc-code">' + [0, 1, 2, 3, 4, 5].map(k => box(92 + k * 24, 228, 18, 24, 6, k < 6 ? NAVY : '#fff', null, 'sc-k k' + k)).join('') + '</g>')
  ];
  function slide(i) { return (S[i] || S[0])(); }
  return { slide, count: S.length };
})();
