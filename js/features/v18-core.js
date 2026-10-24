'use strict';

/* ============================================================
   V18 CORE (18.0.0) — briques communes des nouveaux modules (crédit, coffre Boost, chat, YASER, cinéma, centre de contrôle).
   - Hooks   : un module s'accroche à un écran sans toucher à wire.js : Hooks.on('chat', (root) => { ... }) ; appelé par LiveX.onScreen.
   - Strings : Strings.add({ en:{}, fr:{}, ar:{} }) ajoute des textes dans les trois langues.
   - Fx      : effets (confettis dorés, compteur animé, compteur qui grandit en direct, onde, secousse) — aucun emoji, aucune image.
   - Cfg     : réglages serveur (crédit min/max, taux du coffre), lus une fois par minute au plus, avec valeurs de repli.
   - Money   : formatage OMR à 3 décimales, chiffres latins.
   ============================================================ */
const Hooks = (() => {
  const map = {};
  function on(id, fn){ (map[id] || (map[id] = [])).push(fn); }
  function run(id, root){ (map[id] || []).concat(map['*'] || []).forEach(fn => { try { fn(root, id); } catch(e){ console.error('[hook]', id, e); if (typeof Guardian !== 'undefined') Guardian.note('hook:' + id, e); } }); }
  return { on, run };
})();

const Strings = {
  add(m){ ['en', 'fr', 'ar'].forEach(l => { if (m && m[l] && TR[l]) Object.assign(TR[l], m[l]); }); }
};

const Money = {
  fmt(n, cur){ try { return CurrencyEngine.format(Number(n) || 0, cur || 'OMR'); } catch(e){ return (Number(n) || 0).toFixed(3) + ' ' + (cur || 'OMR'); } },
  num(n, dec){ try { return new Intl.NumberFormat('en-US', { minimumFractionDigits: dec == null ? 3 : dec, maximumFractionDigits: dec == null ? 3 : dec }).format(Number(n) || 0); } catch(e){ return String(n); } },
  int(n){ try { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0); } catch(e){ return String(n); } }
};

const Fx = (() => {
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } };
  const COLORS = ['#6ee7b7', '#a7f3d0', '#EAF5FF', '#a7f3d0', '#ffffff', '#6ee7b7'];
  let cv = null, cx = null, parts = [], raf = 0;
  function ensure(){
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999';
    document.body.appendChild(cv); cx = cv.getContext('2d');
    const fit = () => { const d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); };
    fit(); window.addEventListener('resize', fit);
  }
  function loop(){
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    parts.forEach(p => {
      p.vy += p.g; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30);
      cx.fillStyle = p.c;
      if (p.round){ cx.beginPath(); cx.arc(0, 0, p.s / 2, 0, 6.283); cx.fill(); } else cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      cx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(loop); else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  /* confettis dorés : confetti(x, y) ou confetti(element) */
  function confetti(at, o){
    if (reduced()) return;
    try {
      o = o || {}; ensure();
      let x = innerWidth / 2, y = innerHeight * 0.4;
      if (at && at.getBoundingClientRect){ const r = at.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      else if (at && typeof at.x === 'number'){ x = at.x; y = at.y; }
      const n = o.n || 70;
      for (let i = 0; i < n; i++){
        const a = (o.spread != null ? -Math.PI / 2 + (Math.random() - 0.5) * o.spread : Math.random() * 6.283), v = (o.power || 7) * (0.4 + Math.random() * 0.8);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: 0.18 + Math.random() * 0.06, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 7, c: COLORS[i % COLORS.length], round: Math.random() < 0.3, life: 70 + Math.random() * 50 });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    } catch(e){ /* un effet ne casse rien */ }
  }
  /* onde dorée qui part d'un élément */
  function pulse(el){
    if (reduced() || !el) return;
    try {
      const r = el.getBoundingClientRect(), d = document.createElement('span');
      d.className = 'fx-pulse'; d.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px';
      document.body.appendChild(d); setTimeout(() => d.remove(), 900);
    } catch(e){ /* rien */ }
  }
  function shake(el){ if (!el || reduced()) return; el.classList.remove('fx-shake'); void el.offsetWidth; el.classList.add('fx-shake'); setTimeout(() => el.classList.remove('fx-shake'), 500); }
  /* nombre qui monte de from à to */
  function countUp(el, to, o){
    if (!el) return;
    o = o || {}; const from = o.from != null ? o.from : 0, ms = o.ms || 900, dec = o.dec == null ? 3 : o.dec;
    if (reduced() || from === to){ el.textContent = Money.num(to, dec); return; }
    const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = Money.num(from + (to - from) * e, dec); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  /* compteur qui grandit en direct : ticker(el, valeurDeDépart, gainParSeconde) -> stop() */
  function ticker(el, base, perSec, o){
    o = o || {}; const dec = o.dec == null ? 6 : o.dec; let stop = false; const t0 = performance.now();
    const step = (t) => { if (stop || !el.isConnected) return; el.textContent = Money.num(base + perSec * (t - t0) / 1000, dec); setTimeout(() => requestAnimationFrame(step), 90); };
    requestAnimationFrame(step);
    return () => { stop = true; };
  }
  /* apparition en cascade des enfants d'un conteneur */
  function stagger(root, sel, step){ try { root.querySelectorAll(sel).forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('fx-in'); el.style.animationDelay = (i * (step || 55)) + 'ms'; }); } catch(e){ /* rien */ } }
  function haptic(kind){ try { UIKit.haptic(kind || 'tap'); } catch(e){ try { navigator.vibrate && navigator.vibrate(kind === 'success' ? [12, 40, 18] : 8); } catch(x){ /* rien */ } } }
  return { confetti, pulse, shake, countUp, ticker, stagger, haptic, reduced };
})();

const Cfg = (() => {
  let c = { credit_enabled: true, credit_min: 5000, credit_max: 500000, vault_enabled: true, vault_rate_pct_day: 0.2, vault_min: 1 }, at = 0, p = null;
  async function load(force){
    if (!force && Date.now() - at < 60000) return c;
    if (p) return p;
    p = (async () => {
      const r = await Guardian.rpc('get_app_config', {});
      if (r.ok && r.data && typeof r.data === 'object') { c = Object.assign({}, c, r.data); at = Date.now(); }
      p = null; return c;
    })();
    return p;
  }
  return { load, get: () => c };
})();

/* ---------- aides d'écran partagées ---------- */
function v18Top(title, rightHtml){
  return '<div class="topbar v18-top"><button class="topbar-back" data-action="back" aria-label="' + escapeHtml(t('ui.back')) + '"><span class="dir-flip" style="display:inline-flex">' + icon('back', 20) + '</span></button>' +
    '<span class="topbar-title">' + escapeHtml(title) + '</span>' + (rightHtml || '<span style="width:calc(44px*var(--ui))"></span>') + '</div>';
}
function v18Time(ts){
  try { const d = new Date(ts), n = new Date(); const same = d.toDateString() === n.toDateString();
    return same ? d.toLocaleTimeString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString(LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG, { hour: '2-digit', minute: '2-digit' });
  } catch(e){ return ''; }
}

Strings.add({
  en: { 'op.CREDIT_GRANT': 'Credit granted', 'op.EARN_YIELD': 'Boost earnings', 'op.VAULT_IN': 'Moved to Boost', 'op.VAULT_OUT': 'Moved from Boost' },
  fr: { 'op.CREDIT_GRANT': 'Crédit accordé', 'op.EARN_YIELD': 'Gains Boost', 'op.VAULT_IN': 'Placé dans Boost', 'op.VAULT_OUT': 'Retiré de Boost' },
  ar: { 'op.CREDIT_GRANT': 'تم منح الائتمان', 'op.EARN_YIELD': 'أرباح بوست', 'op.VAULT_IN': 'تحويل إلى بوست', 'op.VAULT_OUT': 'سحب من بوست' }
});

/* ---------- icônes ajoutées en 18.0.0 (ajoutées seulement si le nom n'existe pas déjà) ---------- */
(function(){
  const p = d => '<path d="' + d + '"/>', c = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  const N = {
    chat: p('M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-7.5L7 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z') + p('M8 9.5h8M8 12.5h5'),
    coins: c(9, 9.5, 5.5) + p('M14.2 5.4a5.5 5.5 0 0 1 3.9 8.6M7.6 9.5h2.3a1.1 1.1 0 0 1 0 2.2H8.3a1.1 1.1 0 0 0 0 2.2h2.4M9 7.6v1.2M9 14.2v1.2'),
    vault: p('M12 3.2 19 6v5.6c0 4.2-2.9 7.3-7 9-4.1-1.7-7-4.8-7-9V6z') + p('M8.8 13.6l2.3-2.3 1.7 1.7 3-3.2M13.8 9.8H16v2.2'),
    mic: p('M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3z') + p('M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9 20.5h6'),
    camera: p('M4 8h3l1.5-2h7L17 8h3v11H4z') + c(12, 13, 3.5),
    clip: p('M19 11.5l-6.8 6.8a4.5 4.5 0 0 1-6.4-6.4l7.2-7.2a3 3 0 0 1 4.2 4.2l-7.2 7.2a1.5 1.5 0 0 1-2.1-2.1l6.5-6.5'),
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
    check2: p('M2.8 12.8l4 4 7.5-8.6M10 15.6l1.2 1.2 8-9'),
    film: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/>' + p('M8 4.5v15M16 4.5v15M3.5 9h4.5M3.5 15h4.5M16 9h4.5M16 15h4.5'),
    bot: c(12, 12, 8.5) + p('M9 10.5v1.2M15 10.5v1.2M8.8 14.6c1 1.4 2.2 2 3.2 2s2.2-.6 3.2-2'),
    trend: p('M3.5 17l5-5 3.5 3.5 8-8M15 7.5h5v5'),
    hourglass: p('M7 3.5h10M7 20.5h10M8 3.5c0 4.5 4 5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5-4 8.5s4 4 4 8.5'),
    image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/>' + c(9, 10, 1.6) + p('M4 17l5-4.5 4 3.5 3-2.5 4 3.5'),
    trash: p('M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7M10.2 11v5M13.8 11v5'),
    megaphone: p('M4 10v4h3l8 4V6L7 10zM18 9.5a3.5 3.5 0 0 1 0 5'),
    list: p('M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01')
  };
  try { Object.keys(N).forEach(k => { if (typeof IC !== 'undefined' && !IC[k]) IC[k] = N[k]; }); } catch(e){ /* rien */ }
})();
