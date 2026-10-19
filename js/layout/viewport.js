'use strict';

/* ============================================================
   FULLSCREEN
   ============================================================ */
function requestFullscreen(){
  try {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (fn && !document.fullscreenElement && !document.webkitFullscreenElement){ fn.call(el).catch(() => {}); }
  } catch(e){}
}

/* ============================================================
   VIEWPORT ENGINE
   ============================================================ */
const LayoutMode = (() => {
  const KEY = 'yor_layout_mode';   /* UI preference only: no sensitive data */
  const get = () => { try { return localStorage.getItem(KEY) === 'desktop' ? 'desktop' : 'mobile'; } catch(e){ return 'mobile'; } };
  const isDesktop = () => get() === 'desktop';
  function set(mode){
    try { if (mode === 'desktop') localStorage.setItem(KEY, 'desktop'); else localStorage.removeItem(KEY); } catch(e){}
    location.reload();   /* the viewport width is fixed before first paint; the route survives in the URL hash */
  }
  const toggle = () => set(isDesktop() ? 'mobile' : 'desktop');
  return { get, isDesktop, set, toggle };
})();

/* ============================================================
   PAGE LOCK (12.13.1) — la page ne reste jamais décalée de côté.
   Un champ qui prend le focus, un scrollIntoView, le clavier iPhone qui se ferme ou un geste à deux doigts peuvent pousser un conteneur qui
   « cache » son débordement : il reste alors décalé, sans moyen de revenir (la page « bouge un peu à gauche ou à droite, puis bugue »).
   Ici : tout décalage horizontal d'un conteneur non défilable est remis à zéro dans l'instant, le zoom par pincement est refusé,
   et on recale la page quand le clavier se ferme, quand l'écran tourne et quand l'application revient au premier plan.
   Les bandeaux voulus (overflow-x auto / scroll) ne sont pas touchés.
   ============================================================ */
const PageLock = (() => {
  const scrolls = el => { try { const o = getComputedStyle(el).overflowX; return o === 'auto' || o === 'scroll'; } catch(e){ return false; } };
  function fix(el){ try { if (el && el.scrollLeft !== 0 && !scrolls(el)) el.scrollLeft = 0; } catch(e){} }
  function snap(resetY){
    try {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement && document.activeElement.tagName) || '');   /* un champ est actif : le clavier est ouvert, on ne remonte pas la page */
      const up = resetY === true && !typing;
      if (window.scrollX || (up && window.scrollY)) window.scrollTo(0, up ? 0 : window.scrollY);   /* en haut seulement quand on le demande (clavier fermé) */
      fix(document.documentElement); fix(document.body);
      ['app', 'main', 'screens'].forEach(id => fix(document.getElementById(id)));
      document.querySelectorAll('.screen').forEach(fix);
    } catch(e){}
  }
  function onScroll(ev){
    const t = ev && ev.target;
    if (!t || t === document || t === document.documentElement || t === document.body || t === document.scrollingElement){
      if (window.scrollX) { try { window.scrollTo(0, window.scrollY); } catch(e){} }
      return;
    }
    if (t.nodeType === 1) fix(t);
  }
  const stop = ev => { if (ev.cancelable) ev.preventDefault(); };
  function init(){
    document.addEventListener('scroll', onScroll, true);                                  /* « scroll » ne remonte pas : on l'écoute en capture */
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, stop, { passive:false }));   /* pincement (Safari iPhone) */
    document.addEventListener('focusout', () => { setTimeout(() => snap(true), 80); setTimeout(() => snap(true), 400); });                          /* clavier fermé */
    window.addEventListener('orientationchange', () => { setTimeout(() => snap(true), 120); setTimeout(() => snap(true), 500); });
    window.addEventListener('pageshow', () => snap(true));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) snap(true); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => setTimeout(snap, 60));
    snap();
  }
  return { init, snap };
})();

const ViewportEngine = (() => {
  const root = document.documentElement;
  const vv = window.visualViewport || null;
  let kbOpen = false;
  function setVH(){
    const h = vv ? vv.height : window.innerHeight;
    root.style.setProperty('--vh', (h * 0.01) + 'px');
  }
  function onViewportChange(){
    setVH();
    if (!vv) return;
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty('--kb', kb + 'px');
    const open = kb > 80;
    if (open !== kbOpen){ kbOpen = open; document.body.classList.toggle('kb-open', kbOpen); }
  }
  function onFocusIn(e){
    const el = e.target;
    if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    setTimeout(() => { try { el.scrollIntoView({ block:'center', inline:'nearest', behavior:'smooth' }); } catch(err){} PageLock.snap(); }, 120);
  }
  function init(){
    PageLock.init();
    setVH();
    window.addEventListener('resize', onViewportChange, { passive:true });
    window.addEventListener('orientationchange', onViewportChange);
    if (vv){ vv.addEventListener('resize', onViewportChange); vv.addEventListener('scroll', onViewportChange); }
    document.addEventListener('focusin', onFocusIn);
  }
  return { init };
})();

