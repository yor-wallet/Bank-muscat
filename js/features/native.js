'use strict';

/* ============================================================
   NATIVE (21.3.0) — pont Android (Capacitor). INACTIF sur le web : rien ne s'exécute si la page n'est pas dans l'application native.
   - bouton Retour d'Android : ferme d'abord la feuille ouverte, puis revient à l'écran précédent, et ne quitte l'application que depuis l'accueil
     ou l'entrée (jamais au milieu d'un transfert : l'écran « traitement » ne se quitte pas par Retour) ;
   - barre d'état : suit le thème clair / sombre de l'application ;
   - aucune requête, aucune écriture, aucune donnée : ce fichier ne touche à aucune règle métier.
   Les plugins Capacitor sont lus dans window.Capacitor.Plugins (application sans bundler).
   ============================================================ */
(function native(){
  const C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return;
  const P = C.Plugins || {};
  document.documentElement.classList.add('is-native');
  const ROOTS = ['home', 'login', 'signup', 'reset'];
  const NO_BACK = ['processing'];
  if (P.App && typeof P.App.addListener === 'function'){
    P.App.addListener('backButton', () => {
      try {
        if (R.overlay.isOpen()) { R.overlay.close(); return; }
        const cur = R.current();
        if (NO_BACK.indexOf(cur) >= 0) return;
        if (ROOTS.indexOf(cur) >= 0) { if (P.App.exitApp) P.App.exitApp(); return; }
        R.back();
      } catch (e) { try { P.App.exitApp(); } catch (x) { /* rien */ } }
    });
  }
  const bar = () => {
    if (!P.StatusBar) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    try { P.StatusBar.setStyle({ style: dark ? 'DARK' : 'LIGHT' }); } catch (e) { /* rien */ }
    try { P.StatusBar.setBackgroundColor({ color: dark ? '#08131F' : '#F3F6FA' }); } catch (e) { /* rien */ }
  };
  bar();
  try { new MutationObserver(bar).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { /* rien */ }
})();
