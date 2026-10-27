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
  const DEFS = '<defs>' +
    '<linearGradient id="scA" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7ED8F6"/><stop offset="1" stop-color="#2596DE"/></linearGradient>' +
    '<linearGradient id="scB" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2F6FB5"/><stop offset="1" stop-color="#102C4C"/></linearGradient>' +
    '<linearGradient id="scG" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".96"/><stop offset="1" stop-color="#EAF8FF" stop-opacity=".82"/></linearGradient>' +
    '<linearGradient id="scS" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="scH" cx="50%" cy="45%" r="55%"><stop stop-color="#BFE9FB" stop-opacity=".85"/><stop offset="1" stop-color="#BFE9FB" stop-opacity="0"/></radialGradient>' +
    '</defs>';
  const scene = (cls, inner) => '<svg class="ob-art sc ' + cls + '" viewBox="0 0 320 280" focusable="false" aria-hidden="true">' + DEFS + '<ellipse class="sc-halo" cx="160" cy="132" rx="150" ry="118" fill="url(#scH)"/>' + inner + '</svg>';
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
  const plate = (x, y, w, id, cls) => '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="' + (w * .28) + '"/></clipPath><g class="' + (cls || '') + '"><rect x="' + x + '" y="' + (y + w * .08) + '" width="' + w + '" height="' + w + '" rx="' + (w * .28) + '" fill="#134F91" opacity=".16"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="' + (w * .28) + '" fill="#fff"/><image href="' + LOGO + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" clip-path="url(#' + id + ')" preserveAspectRatio="xMidYMid slice"/></g>';
  const bar = (x, y, w, h, fill, cls) => '<rect class="' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (h / 2) + '" fill="' + fill + '"/>';

  const S = [
    /* 1 — compte et tableau de bord : carte de solde (sans chiffre), quatre actions, activité récente */
    () => scene('sc-dash',
      '<g class="sc-back"><rect x="70" y="34" width="190" height="104" rx="24" fill="url(#scB)" opacity=".9" transform="rotate(-5 165 86)"/></g>' +
      '<g class="sc-card">' +
        '<rect x="56" y="40" width="208" height="108" rx="24" fill="url(#scG)" stroke="#fff" stroke-width="1.5"/>' +
        plate(72, 54, 28, 'scp1') + bar(110, 60, 70, 7, '#B5D9EE') + bar(110, 73, 42, 6, '#D5E9F5') +
        bar(72, 108, 118, 16, 'url(#scA)', 'sc-amt') + bar(72, 130, 52, 6, '#B5D9EE') +
        '<clipPath id="scc1"><rect x="56" y="40" width="208" height="108" rx="24"/></clipPath><g clip-path="url(#scc1)"><rect class="sc-sheen" x="56" y="40" width="64" height="108" fill="url(#scS)" opacity=".7"/></g>' +
      '</g>' +
      '<g class="sc-acts">' +
        '<circle class="sc-a1" cx="92" cy="190" r="21" fill="url(#scA)"/>' + ic('send', 92, 190, 20, '#fff', 2.1, 'sc-a1') +
        '<circle class="sc-a2" cx="146" cy="190" r="21" fill="#fff" stroke="#CFE6F5"/>' + ic('down', 146, 190, 20, '#2596DE', 2, 'sc-a2') +
        '<circle class="sc-a3" cx="200" cy="190" r="21" fill="#fff" stroke="#CFE6F5"/>' + ic('clock', 200, 190, 20, '#2596DE', 2, 'sc-a3') +
        '<circle class="sc-a4" cx="254" cy="190" r="21" fill="#fff" stroke="#CFE6F5"/>' + ic('grid', 254, 190, 18, '#2596DE', 2, 'sc-a4') +
      '</g>' +
      '<g class="sc-rows"><rect class="sc-r1" x="56" y="226" width="208" height="20" rx="10" fill="#fff" opacity=".85"/>' + bar(72, 233, 88, 6, '#CFE6F5', 'sc-r1') + bar(206, 233, 42, 6, '#B5D9EE', 'sc-r1') +
      '<rect class="sc-r2" x="56" y="252" width="208" height="20" rx="10" fill="#fff" opacity=".6"/>' + bar(72, 259, 66, 6, '#CFE6F5', 'sc-r2') + bar(214, 259, 34, 6, '#B5D9EE', 'sc-r2') + '</g>'),

    /* 2 — avantages déjà présents : instantané entre comptes, la personne est prévenue, états réels */
    () => scene('sc-adv',
      '<g class="sc-t1">' + plate(34, 62, 72, 'scp2') + '</g>' +
      '<g class="sc-t2">' + plate(214, 62, 72, 'scp3') + '</g>' +
      '<path class="sc-link" d="M112 98H208" fill="none" stroke="#CFE6F5" stroke-width="5" stroke-linecap="round"/>' +
      '<path class="sc-flow" d="M112 98H208" fill="none" stroke="#2596DE" stroke-width="5" stroke-linecap="round" pathLength="100"/>' +
      '<g class="sc-bell"><circle cx="276" cy="64" r="17" fill="#fff" stroke="#CFE6F5"/>' + ic('bell', 276, 64, 18, '#2596DE', 2) + '<circle cx="287" cy="52" r="5" fill="#E84D65"/></g>' +
      '<g class="sc-st">' +
        '<g class="sc-p1"><rect x="28" y="168" width="82" height="42" rx="21" fill="#fff4e0" stroke="#F4A43B" stroke-width="1.5"/><circle cx="52" cy="189" r="12" fill="#F4A43B"/>' + ic('clock', 52, 189, 14, '#fff', 2.2) + bar(70, 185, 28, 7, '#F4C98A') + '</g>' +
        '<g class="sc-p2"><rect x="119" y="168" width="82" height="42" rx="21" fill="#e4f7f0" stroke="#14A879" stroke-width="1.5"/><circle cx="143" cy="189" r="12" fill="#14A879"/>' + ic('check', 143, 189, 14, '#fff', 2.6) + bar(161, 185, 28, 7, '#9ADBC4') + '</g>' +
        '<g class="sc-p3"><rect x="210" y="168" width="82" height="42" rx="21" fill="#fde9ed" stroke="#E84D65" stroke-width="1.5"/><circle cx="234" cy="189" r="12" fill="#E84D65"/>' + ic('cross', 234, 189, 12, '#fff', 2.6) + bar(252, 185, 28, 7, '#F2A9B6') + '</g>' +
      '</g>'),

    /* 3 — transferts : un numéro, le nom vérifié, la confirmation par glissement */
    () => scene('sc-tx',
      '<g class="sc-field"><rect x="40" y="36" width="240" height="56" rx="28" fill="url(#scG)" stroke="#fff" stroke-width="1.5"/>' +
        '<circle cx="72" cy="64" r="14" fill="#EAF8FF" stroke="#CFE6F5"/>' + ic('send', 72, 64, 14, '#2596DE', 2) +
        [0, 1, 2, 3].map(k => bar(100 + k * 42, 59, 32, 10, k < 3 ? '#9ED3EE' : '#2596DE', 'sc-d d' + k)).join('') + '</g>' +
      '<g class="sc-who"><rect x="60" y="112" width="200" height="50" rx="25" fill="#fff" stroke="#CFE6F5"/>' + plate(72, 120, 34, 'scp4') + bar(116, 129, 76, 8, '#B5D9EE') + bar(116, 144, 46, 6, '#D5E9F5') +
        '<circle cx="238" cy="137" r="12" fill="#14A879"/>' + ic('check', 238, 137, 14, '#fff', 2.6) + '</g>' +
      '<g class="sc-swipe"><rect x="44" y="190" width="232" height="62" rx="31" fill="#EAF8FF" stroke="#CFE6F5"/>' +
        '<rect class="sc-fill" x="44" y="190" width="232" height="62" rx="31" fill="url(#scA)" opacity=".28"/>' +
        '<g class="sc-thumb"><circle cx="76" cy="221" r="24" fill="url(#scA)"/>' + ic('send', 76, 221, 20, '#fff', 2.1) + '</g></g>'),

    /* 4 — cartes : une carte virtuelle avec reflet, une seconde derrière, états actif et gelé */
    () => scene('sc-card',
      '<g class="sc-c2"><rect x="60" y="42" width="204" height="124" rx="22" fill="url(#scA)" transform="rotate(7 162 104)"/></g>' +
      '<g class="sc-c1"><rect x="48" y="52" width="216" height="132" rx="24" fill="url(#scB)"/>' +
        '<rect x="48" y="52" width="216" height="132" rx="24" fill="none" stroke="#fff" stroke-opacity=".35"/>' +
        '<rect x="70" y="86" width="34" height="26" rx="6" fill="#E9C97A"/><path d="M70 99h34M87 86v26" stroke="#B8923C" stroke-width="1.2"/>' +
        '<path d="M120 90a14 14 0 0 1 0 18M127 86a20 20 0 0 1 0 26" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round"/>' +
        [0, 1, 2, 3].map(k => '<g>' + [0, 1, 2, 3].map(j => '<circle cx="' + (76 + k * 40 + j * 8) + '" cy="140" r="2.2" fill="#fff" fill-opacity=".9"/>').join('') + '</g>').join('') +
        bar(70, 158, 78, 7, '#fff', 'sc-hold') + plate(216, 150, 30, 'scp5', 'sc-brand') +
        '<clipPath id="scc4"><rect x="48" y="52" width="216" height="132" rx="24"/></clipPath><g clip-path="url(#scc4)"><rect class="sc-sheen" x="48" y="52" width="70" height="132" fill="url(#scS)" opacity=".5"/></g></g>' +
      '<g class="sc-states"><g class="sc-s1"><rect x="52" y="214" width="104" height="36" rx="18" fill="#e4f7f0" stroke="#14A879" stroke-width="1.5"/><circle cx="74" cy="232" r="9" fill="#14A879"/>' + ic('check', 74, 232, 11, '#fff', 2.6) + bar(92, 228, 44, 7, '#9ADBC4') + '</g>' +
        '<g class="sc-s2"><rect x="168" y="214" width="104" height="36" rx="18" fill="#e6f3fb" stroke="#7ED8F6" stroke-width="1.5"/><circle cx="190" cy="232" r="9" fill="#2596DE"/>' + ic('pause', 190, 232, 11, '#fff', 2.6) + bar(208, 228, 44, 7, '#B5D9EE') + '</g></g>'),

    /* 5 — sécurité : bouclier, balayage de vérification, code à six chiffres */
    () => scene('sc-sec',
      '<g class="sc-shield"><path d="M160 30l72 30v52c0 44-30 80-72 96-42-16-72-52-72-96V60z" fill="url(#scG)" stroke="#fff" stroke-width="2"/>' +
        '<path d="M160 52l52 22v38c0 32-21 58-52 72-31-14-52-40-52-72V74z" fill="url(#scA)" opacity=".16"/>' +
        '<g fill="none" stroke="#2596DE" stroke-width="5" stroke-linecap="round"><path d="M128 100v-8a8 8 0 0 1 8-8h8"/><path d="M176 84h8a8 8 0 0 1 8 8v8"/><path d="M192 132v8a8 8 0 0 1-8 8h-8"/><path d="M144 148h-8a8 8 0 0 1-8-8v-8"/></g>' +
        ic('lock', 160, 116, 36, '#134F91', 2.2, 'sc-lock') +
        '<rect class="sc-scan" x="128" y="108" width="64" height="5" rx="2.5" fill="#7ED8F6" opacity=".85"/></g>' +
      '<g class="sc-code">' + [0, 1, 2, 3, 4, 5].map(k => '<circle class="sc-k k' + k + '" cx="' + (100 + k * 24) + '" cy="236" r="8" fill="#2596DE"/>').join('') + '</g>')
  ];
  function slide(i) { return (S[i] || S[0])(); }
  return { slide, count: S.length };
})();
