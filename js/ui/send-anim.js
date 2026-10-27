'use strict';

/* ============================================================
   SEND ANIMATION — scène « Courbe » (Sanad Pay 21.2.0, précédemment « Horizon » 21.0.0), affichée pendant un transfert.
   Remplace la scène « deux téléphones + pièce » de Freindi Pay. Même interface : svg(), setPhase(p) -> Promise, stop().
   Chaque état est le VRAI état (ProcessingEngine.run) — rien ici n'est décoratif ni chronométré à part :
   - « secure »    : le transfert est protégé (cadenas sur le logo, la courbe se trace une fois) ;
   - « send »      : la requête est partie ; une lumière parcourt la courbe tant que le serveur n'a pas répondu (mouvement indéterminé) ;
   - « success »   : SEULEMENT après la réponse confirmée du serveur : la lumière arrive, la coche apparaît sur le logo et au point d'arrivée ;
   - « fail »      : le serveur a refusé : la courbe se brise, une croix apparaît, rien n'indique « envoyé » ;
   - « uncertain » : aucune réponse lue : la lumière s'arrête, trois points — jamais de coche.
   Aucun pourcentage, aucune barre de progression, aucune étape « terminée » avant la réponse. Dessin SVG + CSS (css/s-transfer.css) ; l'arabe inverse la courbe.
   « Réduire les animations » : chaque état est montré sans mouvement.
   ============================================================ */
const SendAnim = (() => {
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  const KEYS = { secure:'sx.secure', send:'sx.send', success:'sx.success', fail:'sx.fail', uncertain:'sx.uncertain' };
  /* Scène « Courbe » (Sanad Pay 21.2.0) : le logo officiel, et la courbe du « S » tracée entre l'envoi et la réception.
     Une lumière parcourt la courbe TANT QUE le serveur n'a pas répondu (mouvement indéterminé : aucun pourcentage, aucune étape inventée) ;
     le badge sur le logo ne devient « coche » qu'après la réponse confirmée. */
  function svg(){
    return '<svg class="hz-svg sa" viewBox="0 0 320 210" focusable="false" aria-hidden="true">' +
      '<defs><clipPath id="sa-clip"><rect x="112" y="22" width="96" height="96" rx="27"/></clipPath></defs>' +
      '<g class="hz-halo"><circle cx="160" cy="70" r="74"/></g>' +
      '<g class="sa-curve">' +
        '<path class="sa-base" d="M44 176C104 176 112 140 160 140S216 104 276 104"/>' +
        '<path class="sa-lit" d="M44 176C104 176 112 140 160 140S216 104 276 104" pathLength="100"/>' +
        '<path class="sa-glow" d="M44 176C104 176 112 140 160 140S216 104 276 104" pathLength="100"/>' +
        '<path class="sa-light" d="M44 176C104 176 112 140 160 140S216 104 276 104" pathLength="100"/>' +
        '<circle class="sa-n sa-n1" cx="44" cy="176" r="9"/><circle class="sa-n sa-n2" cx="276" cy="104" r="9"/>' +
        '<path class="sa-n2-ck" d="M271 104l3.6 3.6 6.4-7.4" pathLength="100"/>' +
        '<g class="sa-dots"><circle cx="146" cy="140" r="4"/><circle cx="160" cy="140" r="4"/><circle cx="174" cy="140" r="4"/></g>' +
        '<g class="sa-x"><circle cx="160" cy="140" r="14"/><path d="M154 134l12 12M166 134l-12 12" pathLength="100"/></g>' +
      '</g>' +
      '<g class="sa-plate"><rect class="sa-shadow" x="114" y="34" width="92" height="92" rx="27"/><rect x="112" y="22" width="96" height="96" rx="27" fill="#fff"/>' +
        '<image href="assets/brand/sanad-s-192.png" x="112" y="22" width="96" height="96" clip-path="url(#sa-clip)" preserveAspectRatio="xMidYMid slice"/></g>' +
      '<g class="sa-badge"><circle class="sa-b-bg" cx="204" cy="112" r="17"/>' +
        '<g class="sa-b-lock"><rect x="197" y="112" width="14" height="11" rx="3"/><path d="M200 112v-3a4 4 0 0 1 8 0v3"/></g>' +
        '<path class="sa-b-ck" d="M196 112l5.5 5.5L212 106" pathLength="100"/>' +
        '<g class="sa-b-x"><path d="M197 105l14 14M211 105l-14 14" pathLength="100"/></g>' +
        '<g class="sa-b-dots"><circle cx="197" cy="112" r="2.4"/><circle cx="204" cy="112" r="2.4"/><circle cx="211" cy="112" r="2.4"/></g></g>' +
    '</svg>';
  }
  function stop(){ /* rien à arrêter : l'animation est déclarative (CSS) */ }
  /* Fixe l'état affiché. Résout quand l'état est réellement montré (l'arrivée de l'impulsion dure un instant). */
  function setPhase(p){
    const root = document.querySelector('.proc-view');
    if (!root) return Promise.resolve();
    if (p === 'process') p = 'send';
    if (!KEYS[p]){ root.setAttribute('data-phase', p); return Promise.resolve(); }
    const label = root.querySelector('#sx-label');
    const apply = q => { root.setAttribute('data-phase', q); if (label) label.textContent = t(KEYS[q]); };
    if (p === 'success' && !reduced() && root.getAttribute('data-phase') === 'send'){
      root.classList.add('hz-landing');
      return new Promise(res => setTimeout(() => { root.classList.remove('hz-landing'); apply('success'); res(); }, 420));
    }
    apply(p);
    return Promise.resolve();
  }
  return { svg, setPhase, stop };
})();
