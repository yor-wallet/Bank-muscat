'use strict';

/* ============================================================
   OPENING ART — séquence d'ouverture « Trait & Horizon » (Sanad Pay 21.0.0).
   Reprend le logo du pack tel quel : la COCHE se trace trait par trait, la LIGNE D'HORIZON s'étire d'un bord à l'autre, puis le carré arrondi
   se remplit derrière la coche et le nom se révèle par un masque horizontal.
   Sa première image est exactement l'écran de lancement iOS (ciel pâle, rien d'autre) : aucun saut visuel.
   Trois cas : premier lancement (complète, 1,8 s) · lancements suivants (courte, 0,6 s) · reprise depuis l'arrière-plan (aucune séquence, la page n'est pas rechargée).
   Elle est un HABILLAGE posé sur l'application qui démarre dessous : elle ne retarde ni le chargement, ni l'authentification, ni un flux métier,
   elle se termine quand l'application est prête ET que son dessin est joué, un toucher la saute, « réduire les animations » la remplace par un fondu.
   ============================================================ */
const OpeningArt = (() => {
  const KEY = 'sanad_opened';
  const FULL_MS = 1800, SHORT_MS = 600, REDUCED_MS = 320;
  const reduced = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch(e){ return false; } };
  const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch(e){ return false; } };
  const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch(e){ /* rien */ } };
  const wasReloaded = () => { try { const n = performance.getEntriesByType('navigation')[0]; return !!(n && n.type === 'reload'); } catch(e){ return false; } };

  /* mode : 'full' | 'short' | 'fade' */
  function mode(){
    if (reduced()) return 'fade';
    if (!seen()) return 'full';
    return 'short';
  }
  function splash(lang, m){
    lang = lang || (typeof LANG === 'string' ? LANG : 'en');
    m = m || mode();
    if (typeof window.__sxoSplash === 'function') return window.__sxoSplash(lang, m);      /* balisage défini une seule fois, dans index.html */
    const ar = lang === 'ar';
    return '<div class="sxo sxo-' + m + '" aria-hidden="true">' +
      '<i class="sxo-horizon"></i>' +
      '<div class="sxo-stage">' +
        '<img class="sxo-mark" src="assets/brand/sanad-s-320.png" width="148" height="148" alt="" decoding="async">' +
        '<div class="sxo-word' + (ar ? ' sxo-word-ar' : '') + '">' + (ar ? 'سند باي' : 'Sanad Pay') + '</div>' +
      '</div></div>';
  }
  /* Démarre la séquence. onDone() est appelé une fois : quand le dessin est joué (ou sauté) — le CALLER attend aussi que l'application soit prête. */
  function start(host, cb){
    /* la première image est déjà à l'écran (script en ligne de index.html) : on la garde, et la durée se compte depuis son apparition */
    const early = window.__sxoEarly && host.querySelector('.sxo') ? window.__sxoEarly : null;
    const m = early ? early.mode : mode();
    if (!early){ host.innerHTML = splash(LANG, m); host.setAttribute('data-sxo', m); }
    else if (early.lang !== LANG){ host.innerHTML = splash(LANG, m); }      /* langue différente de celle devinée : seul le nom change, l'animation est déjà jouée */
    const t0 = early ? early.t0 : performance.now();
    const dur = m === 'full' ? FULL_MS : m === 'short' ? SHORT_MS : REDUCED_MS;
    let finished = false, skipped = false, timer = 0;
    const finish = () => { if (finished) return; finished = true; clearTimeout(timer); host.removeEventListener('pointerdown', skip); cb && cb(skipped); };
    const skip = () => { skipped = true; finish(); };
    host.addEventListener('pointerdown', skip, { passive: true });
    if (m === 'full') markSeen();
    timer = setTimeout(finish, Math.max(0, dur - (performance.now() - t0)));
    return { mode: m, duration: dur, elapsed: () => performance.now() - t0, skip };
  }
  return { splash, start, mode, seen, FULL_MS, SHORT_MS };
})();
