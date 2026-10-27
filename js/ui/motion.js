"use strict";
/* ============================================================
   MOTION — chorégraphie commune (Sanad Pay 21.2.0).
   - lit les durées VISUELLES déclarées dans css/s-tokens.css (--mo-*) : une seule source, pas de chiffre recopié ici ;
   - choisit le niveau d'effets : « full » ou « lite » (appareil modeste, économie de données, ou choix de la personne) ;
   - note d'où vient un panneau (le dernier toucher) pour qu'il naisse de cet endroit ;
   - met en pause les animations des éléments qui ne sont plus à l'écran ;
   - fournit l'inclinaison douce (tilt) d'une carte, avec son nettoyage.
   Ne touche à aucune durée métier, ne retarde aucune action, n'écoute que des événements passifs.
   API : Motion = { start, reduced, tier, setTier, ms, watch, tilt, D }
   ============================================================ */
const Motion = (() => {
  const root = document.documentElement;
  const KEY = 'sanad_fx';
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const ms = (name, fallback) => {
    try { const v = getComputedStyle(root).getPropertyValue(name).trim(); const n = parseFloat(v); if (!isFinite(n)) return fallback; return /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n; } catch (e) { return fallback; }
  };
  /* durées visuelles (ms), lues dans le CSS */
  const D = { get press() { return ms('--mo-press', 90); }, get release() { return ms('--mo-release', 180); }, get screen() { return ms('--mo-screen', 340); }, get panel() { return ms('--mo-panel', 320); }, get panelOut() { return ms('--mo-panel-out', 240); }, get reveal() { return ms('--mo-reveal', 420); }, get stagger() { return ms('--mo-stagger', 40); } };

  /* niveau d'effets : choix explicite > économie de données > appareil modeste */
  function autoTier() {
    try {
      const n = navigator, mem = n.deviceMemory || 4, cores = n.hardwareConcurrency || 4, c = n.connection;
      return (mem <= 2 || cores <= 2 || (c && c.saveData)) ? 'lite' : 'full';
    } catch (e) { return 'full'; }
  }
  function tier() { let v = ''; try { v = localStorage.getItem(KEY) || ''; } catch (e) { /* stockage indisponible */ } return v === 'lite' || v === 'full' ? v : autoTier(); }
  function setTier(v) { try { if (v === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, v === 'lite' ? 'lite' : 'full'); } catch (e) { /* rien */ } apply(); }
  function apply() { root.setAttribute('data-fx', tier()); }

  /* hors écran : on met en pause (classe .mo-off) ce qui n'est pas visible */
  let io = null;
  const watched = new WeakSet();
  function watch(el) {
    if (!el || watched.has(el) || typeof IntersectionObserver === 'undefined') return;
    if (!io) io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('mo-off', !e.isIntersecting)), { rootMargin: '48px' });
    watched.add(el); io.observe(el);
  }
  const WATCH = ['.sx-hero', '.yas-hero', '.sx-pend', '.px-card', '.mo-watch'];
  function watchAll(scope) { try { (scope || document).querySelectorAll(WATCH.join(',')).forEach(watch); } catch (e) { /* rien */ } }

  /* origine d'un panneau : le dernier toucher ; fixée à l'ouverture, en pixels relatifs au panneau (offset* ne dépend pas de la transformation en cours) */
  let last = null;
  function mark(e) { last = { x: e.clientX, y: e.clientY, t: performance.now() }; }
  function origin(wrap) {
    const panel = wrap.querySelector('.ov-panel'); if (!panel || !last || performance.now() - last.t > 1500) return;
    const bottomSheet = !wrap.classList.contains('is-modal') && innerWidth < 1024;
    const ox = Math.max(0, Math.min(panel.offsetWidth, last.x - panel.offsetLeft));
    panel.style.setProperty('--mo-ox', ox + 'px');
    if (!bottomSheet) panel.style.setProperty('--mo-oy', Math.max(0, Math.min(panel.offsetHeight, last.y - panel.offsetTop)) + 'px');
  }

  /* inclinaison douce d'un élément (carte) : pointeur ou doigt ; rien si « réduire les animations » ou rendu léger ; se nettoie seule */
  function tilt(el, o) {
    if (!el || reduced() || root.getAttribute('data-fx') === 'lite') return () => {};
    o = o || {}; const max = o.max == null ? 8 : o.max; let raf = 0, rect = null, dead = false;
    el.classList.add('mo-tilt');
    const set = (rx, ry, gx, gy) => { el.style.setProperty('--tx', rx.toFixed(2) + 'deg'); el.style.setProperty('--ty', ry.toFixed(2) + 'deg'); el.style.setProperty('--gx', gx.toFixed(1) + '%'); el.style.setProperty('--gy', gy.toFixed(1) + '%'); };
    function move(e) {
      if (dead) return; if (!el.isConnected) { stop(); return; }
      if (!rect) rect = el.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)), py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; set((.5 - py) * max * 2, (px - .5) * max * 2, px * 100, py * 100); });
    }
    function leave() { rect = null; if (raf) { cancelAnimationFrame(raf); raf = 0; } el.classList.add('mo-tilt-rest'); set(0, 0, 50, 30); setTimeout(() => el.classList.remove('mo-tilt-rest'), D.release + 40); }
    function stop() { if (dead) return; dead = true; if (raf) cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.removeEventListener('pointercancel', leave); el.removeEventListener('pointerup', leave); try { el.classList.remove('mo-tilt'); ['--tx', '--ty', '--gx', '--gy'].forEach(k => el.style.removeProperty(k)); } catch (e) { /* rien */ } }
    el.addEventListener('pointermove', move, { passive: true }); el.addEventListener('pointerleave', leave, { passive: true }); el.addEventListener('pointercancel', leave, { passive: true }); el.addEventListener('pointerup', leave, { passive: true });
    try { if (typeof R !== 'undefined' && R.onLeave) R.onLeave(stop); } catch (e) { /* rien */ }
    return stop;
  }


  /* saisie invalide : quand le code existant écrit un message dans un « .field-err » d'un écran d'accès, on rend la réaction lisible
     (champ concerné encadré + léger tremblement + aria-invalid) ; rien n'est validé ni bloqué ici, c'est le même message qu'avant. */
  function invalidFields(sheet) {
    const all = [...sheet.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])')].filter(i => i.offsetParent !== null);
    const empty = all.filter(i => !String(i.value || '').trim());
    return empty.length ? empty : all;
  }
  function flagInvalid(err) {
    const sheet = err.closest('.sx-auth-sheet'); if (!sheet || !String(err.textContent || '').trim()) return;
    invalidFields(sheet).forEach(i => {
      i.setAttribute('aria-invalid', 'true'); if (err.id) i.setAttribute('aria-describedby', err.id);
      const box = i.closest('.field-box'); if (!box) return;
      box.classList.add('has-err');
      if (!reduced()) { box.classList.remove('mo-shake'); void box.offsetWidth; box.classList.add('mo-shake'); setTimeout(() => box.classList.remove('mo-shake'), 360); }
    });
  }
  function clearInvalid(e) {
    const i = e.target; if (!i || !i.matches || !i.matches('[aria-invalid="true"]')) return;
    i.removeAttribute('aria-invalid'); const box = i.closest('.field-box'); if (box) box.classList.remove('has-err');
  }


  /* historique : on ne rejoue l'animation des lignes que si la recomposition vient d'une action sur un filtre / la recherche (pas d'un rafraîchissement de fond) ;
     détail d'une opération : l'écran naît du point touché */
  let filterAt = 0, rowTimer = 0;
  function onPress(e) {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest('[data-filter],[data-hp],[data-hd],#hist-q')) filterAt = performance.now();
    const row = t.closest('[data-action="view-tx"],.tx-row[data-tx],.tx-row');
    if (row && !reduced()) {
      document.documentElement.setAttribute('data-mo-row', '1'); root.style.setProperty('--mo-px', Math.round(e.clientX) + 'px'); root.style.setProperty('--mo-py', Math.round(e.clientY) + 'px');
      clearTimeout(rowTimer); rowTimer = setTimeout(() => root.removeAttribute('data-mo-row'), D.screen + 200);
    }
  }
  function onList(ms) {
    if (performance.now() - filterAt > 900) return;
    const list = document.getElementById('history-list'); if (!list || !ms.some(m => m.target === list || list.contains(m.target))) return;
    if (list.classList.contains('mo-refilter')) return; list.classList.add('mo-refilter'); setTimeout(() => list.classList.remove('mo-refilter'), 700);
  }

  let started = false;
  function start() {
    if (started) return; started = true;
    apply();
    document.addEventListener('pointerdown', mark, { passive: true, capture: true });
    document.addEventListener('pointerdown', onPress, { passive: true, capture: true });
    document.addEventListener('input', e => { if (e.target && e.target.id === 'hist-q') filterAt = performance.now(); }, { passive: true, capture: true });
    const rootOv = () => document.getElementById('ov-root');
    const obs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('ov')) origin(n); })));
    const attach = () => { const r = rootOv(); if (r) { obs.observe(r, { childList: true }); r.querySelectorAll(':scope > .ov').forEach(origin); } return !!r; };
    if (!attach()) { const bo = new MutationObserver(() => { if (attach()) bo.disconnect(); }); bo.observe(document.body, { childList: true }); }
    /* éléments surveillés : ceux présents, puis ceux que les écrans ajoutent */
    watchAll();
    const scr = document.getElementById('screens'); let pend = 0;
    if (scr) new MutationObserver(() => { if (!pend) pend = requestAnimationFrame(() => { pend = 0; watchAll(scr); }); }).observe(scr, { childList: true, subtree: true });
    if (scr) {
      new MutationObserver(onList).observe(scr, { childList: true, subtree: true });
      new MutationObserver(ms => { const seen = new Set(); ms.forEach(m => { const n = m.target.nodeType === 3 ? m.target.parentElement : m.target; const err = n && n.closest && n.closest('.field-err'); if (err && !seen.has(err)) { seen.add(err); flagInvalid(err); } }); }).observe(scr, { childList: true, characterData: true, subtree: true });
      scr.addEventListener('input', clearInvalid, true);
    }
    try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', apply); } catch (e) { /* rien */ }
  }
  return { start, reduced, tier, setTier, ms, watch, tilt, D };
})();
