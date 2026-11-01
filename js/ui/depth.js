"use strict";
/* Barq 21.0.0 — profondeur : l'interface réagit à l'inclinaison de l'appareil (si déjà autorisée) ou au pointeur.
   Fournit --dx / --dy (-1..1) sur <html> ; le CSS ne déplace que transform. Aucun effet si l'utilisateur réduit les animations,
   si l'onglet est masqué ou si l'appareil est en économie d'énergie. N'ouvre jamais de demande d'autorisation. */
const Depth = (() => {
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, on = false;
  const root = document.documentElement;
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const clamp = v => Math.max(-1, Math.min(1, v));
  function frame(){
    raf = 0;
    cx += (tx - cx) * .12; cy += (ty - cy) * .12;
    if (Math.abs(tx - cx) < .002) cx = tx; if (Math.abs(ty - cy) < .002) cy = ty;
    root.style.setProperty('--dx', cx.toFixed(3)); root.style.setProperty('--dy', cy.toFixed(3));
    if (cx !== tx || cy !== ty) raf = requestAnimationFrame(frame);
  }
  function aim(x, y){ if (reduced() || document.hidden) return; tx = clamp(x); ty = clamp(y); if (!raf) raf = requestAnimationFrame(frame); }
  function start(){
    if (on || reduced()) return; on = true;
    addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.pressure > 0) aim((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); }, { passive: true });
    addEventListener('pointerleave', () => aim(0, 0), { passive: true });
    /* gyroscope : seulement s'il est disponible sans demande (Android / navigateurs sans permission) */
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      addEventListener('deviceorientation', e => { if (e.gamma == null || e.beta == null) return; aim(e.gamma / 30, (e.beta - 55) / 30); }, { passive: true });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) aim(0, 0); });
  }
  return { start, aim };
})();
