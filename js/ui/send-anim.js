'use strict';

/* ============================================================
   SEND ANIMATION — scène « Horizon » (Sanad Pay 21.0.0), affichée pendant un transfert.
   Remplace la scène « deux téléphones + pièce » de Freindi Pay. Même interface : svg(), setPhase(p) -> Promise, stop().
   Chaque état est le VRAI état (ProcessingEngine.run) — rien ici n'est décoratif :
   - « secure »    : le transfert est protégé (cadenas dans le carré arrondi, la ligne d'horizon se trace) ;
   - « send »      : la requête est partie ; une impulsion court le long de la ligne tant que le serveur n'a pas répondu ;
   - « success »   : SEULEMENT après la réponse confirmée du serveur : l'impulsion arrive, le carré se remplit, la coche du logo se trace ;
   - « fail »      : le serveur a refusé : la ligne se brise, une croix apparaît, rien n'indique « envoyé » ;
   - « uncertain » : aucune réponse lue : l'impulsion s'arrête, trois points — jamais de coche.
   Tout est dessiné en SVG + CSS (transform / opacity / dash) ; aucun script ne pilote l'animation (arabe : miroir par le sens du texte).
   « Réduire les animations » : chaque état est montré sans mouvement.
   ============================================================ */
const SendAnim = (() => {
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  const KEYS = { secure:'sx.secure', send:'sx.send', success:'sx.success', fail:'sx.fail', uncertain:'sx.uncertain' };
  function svg(){
    return '<svg class="hz-svg" viewBox="0 0 320 200" focusable="false" aria-hidden="true">' +
      '<defs><linearGradient id="hzg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#79DEFF"/><stop offset="1" stop-color="#238CDF"/></linearGradient></defs>' +
      '<g class="hz-halo"><circle cx="160" cy="78" r="74"/></g>' +
      '<rect class="hz-sq-bg" x="112" y="34" width="96" height="96" rx="28" fill="url(#hzg)"/>' +
      '<rect class="hz-sq-ring" x="112" y="34" width="96" height="96" rx="28" pathLength="100"/>' +
      '<g class="hz-lock"><rect x="145" y="76" width="30" height="24" rx="7"/><path d="M151 76v-6a9 9 0 0 1 18 0v6"/></g>' +
      '<path class="hz-ck" d="M138 84l16 17 30-33" pathLength="100"/>' +
      '<g class="hz-x"><path d="M142 66l36 36M178 66l-36 36" pathLength="100"/></g>' +
      '<g class="hz-dots"><circle cx="146" cy="82" r="4"/><circle cx="160" cy="82" r="4"/><circle cx="174" cy="82" r="4"/></g>' +
      '<path class="hz-line" d="M40 160H280" pathLength="100"/>' +
      '<path class="hz-line-lit" d="M40 160H280" pathLength="100"/>' +
      '<g class="hz-pulse"><rect x="40" y="157" width="34" height="6" rx="3"/></g>' +
      '<path class="hz-line-broken" d="M40 160H150M170 160H280"/>' +
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
