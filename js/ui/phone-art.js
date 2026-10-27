'use strict';

/* ============================================================
   PHONE ART → scènes de la présentation (Sanad Pay 21.0.0).
   Quatre scènes « horizon » : deux ou trois aplats, le carré arrondi et la coche du logo, la ligne d'horizon. Aucun personnage, aucun téléphone dessiné.
   Les scènes ne montrent que ce qui existe réellement dans l'application.
   ============================================================ */
const PhoneArt = (() => {
  const G = '<defs><linearGradient id="oba" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#79DEFF"/><stop offset="1" stop-color="#238CDF"/></linearGradient></defs>';
  const sq = (x, y, w, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="' + (w * .26) + '" fill="' + c + '"/>';
  const scene = (inner) => '<svg class="ob-art" viewBox="0 0 320 280" focusable="false" aria-hidden="true">' + G + inner + '</svg>';
  const S = [
    /* 1 — le logo posé sur l'horizon */
    () => scene('<circle class="ob-halo" cx="160" cy="116" r="104" fill="#BFE9FB" fill-opacity=".55"/><g class="ob-float"><rect x="96" y="52" width="128" height="128" rx="36" fill="url(#oba)"/><path class="ob-ck" d="M126 118l22 22 40-44" pathLength="100" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="M126 160h62" stroke="#DBF7FF" stroke-width="6" stroke-linecap="round"/></g><path class="ob-hz" d="M30 214H290" pathLength="100" stroke="#7ED8F6" stroke-width="4" stroke-linecap="round" fill="none"/>'),
    /* 2 — deux comptes reliés par l'horizon : l'argent arrive tout de suite */
    () => scene('<path class="ob-hz" d="M80 150H240" pathLength="100" stroke="#CFE6F5" stroke-width="5" stroke-linecap="round" fill="none"/><path class="ob-hz2" d="M80 150H240" pathLength="100" stroke="#2596DE" stroke-width="5" stroke-linecap="round" fill="none"/><g class="ob-a">' + sq(30, 102, 96, '#fff') + '<rect x="30" y="102" width="96" height="96" rx="25" fill="none" stroke="#CFE6F5" stroke-width="3"/><circle cx="78" cy="136" r="14" fill="#7ED8F6"/><path d="M52 176c4-14 14-20 26-20s22 6 26 20" fill="#BFE9FB"/></g><g class="ob-b">' + sq(194, 102, 96, 'url(#oba)') + '<path class="ob-ck" d="M222 150l16 16 30-33" pathLength="100" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></g><rect class="ob-pulse" x="80" y="146" width="34" height="8" rx="4" fill="#fff"/>'),
    /* 3 — trois états réels : en cours, confirmé, échoué */
    () => scene('<g class="ob-s1">' + sq(24, 92, 80, '#F4A43B') + '<path d="M64 112v20l12 8" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g><g class="ob-s2">' + sq(120, 76, 80, 'url(#oba)') + '<path class="ob-ck" d="M142 118l14 14 26-30" pathLength="100" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g><g class="ob-s3">' + sq(216, 92, 80, '#E84D65') + '<path d="M240 116l32 32M272 116l-32 32" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/></g><path class="ob-hz" d="M30 214H290" pathLength="100" stroke="#7ED8F6" stroke-width="4" stroke-linecap="round" fill="none"/>'),
    /* 4 — Face ID et code */
    () => scene('<g class="ob-float"><rect x="92" y="40" width="136" height="136" rx="38" fill="#fff" stroke="#CFE6F5" stroke-width="3"/><path d="M118 80v-6a8 8 0 0 1 8-8h6M188 66h6a8 8 0 0 1 8 8v6M202 136v6a8 8 0 0 1-8 8h-6M132 150h-6a8 8 0 0 1-8-8v-6" fill="none" stroke="#2596DE" stroke-width="6" stroke-linecap="round"/><path d="M142 98v10M178 98v10M160 98v22h-5M140 138c6 8 12 11 20 11s14-3 20-11" fill="none" stroke="#134F91" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect class="ob-scan" x="112" y="104" width="96" height="4" rx="2" fill="#7ED8F6"/></g><g class="ob-dots"><circle cx="124" cy="214" r="7" fill="#2596DE"/><circle cx="148" cy="214" r="7" fill="#2596DE"/><circle cx="172" cy="214" r="7" fill="#2596DE"/><circle cx="196" cy="214" r="7" fill="#CFE6F5"/></g>')
  ];
  function slide(i){ return (S[i] || S[0])(); }
  return { slide, count: S.length };
})();
