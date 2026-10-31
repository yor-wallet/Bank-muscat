'use strict';

/* ============================================================
   SEND ANIMATION — scène « Anneau » (Sanad Pay 21.3.0 ; « Courbe » en 21.2.0, « Horizon » en 21.0.0), affichée pendant un transfert.
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
    /* 21.3.0 — anneau de progression autour du logo. Il avance par ÉTAPES RÉELLES (préparation, traitement, finalisation, confirmation) :
       aucun pourcentage de durée, aucune progression simulée ; en attente prolongée, une lumière tourne pour montrer que l'opération est vivante. */
    const ring = 'M160 22a78 78 0 1 1 0 156a78 78 0 1 1 0-156';
    return '<svg class="hz-svg sa" viewBox="0 0 320 200" focusable="false" aria-hidden="true">' +
      '<defs><clipPath id="sa-clip"><rect x="110" y="50" width="100" height="100" rx="24"/></clipPath></defs>' +
      '<g class="sa-ring">' +
        '<path class="sa-track" d="' + ring + '"/>' +
        '<path class="sa-lit-soft" d="' + ring + '" pathLength="100"/>' +
        '<path class="sa-lit" d="' + ring + '" pathLength="100"/>' +
        '<g class="sa-spin"><path class="sa-light" d="' + ring + '" pathLength="100"/></g>' +
      '</g>' +
      '<g class="sa-plate"><rect x="110" y="50" width="100" height="100" rx="24" fill="#fff"/><rect x="110" y="50" width="100" height="100" rx="24" fill="none" stroke="rgba(16,44,76,.1)"/>' +
        '<image href="assets/brand/sanad-s-192.png" x="110" y="50" width="100" height="100" clip-path="url(#sa-clip)" preserveAspectRatio="xMidYMid slice"/></g>' +
      '<g class="sa-badge"><circle class="sa-b-bg" cx="204" cy="144" r="17"/>' +
        '<g class="sa-b-lock"><rect x="197" y="144" width="14" height="11" rx="3"/><path d="M200 144v-3a4 4 0 0 1 8 0v3"/></g>' +
        '<path class="sa-b-ck" d="M196 144l5.5 5.5L212 138" pathLength="100"/>' +
        '<g class="sa-b-x"><path d="M197 137l14 14M211 137l-14 14" pathLength="100"/></g>' +
        '<g class="sa-b-dots"><circle cx="197" cy="144" r="2.4"/><circle cx="204" cy="144" r="2.4"/><circle cx="211" cy="144" r="2.4"/></g></g>' +
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
