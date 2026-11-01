'use strict';

/* ============================================================
   CHARTS (19.0.0) — graphiques financiers en SVG pur : aucune dépendance, animés, accessibles, clair / sombre, RTL, chiffres latins.
   Ils n'inventent JAMAIS de données : liste vide -> état vide propre.
   Charts.donut(el, items[{label,value,color?}], {center:{label,value}, legend:true, format})
   Charts.bars(el, items[{label,value}|{label,values:[a,b]}], {height, format, series:[{label,color?}]})
   Charts.line(el, points[{x:Date|number, y:number}], {area:true, format, height})
   Charts.spark(el, values[], {color, height})    Charts.progress(el, ratio, {label, format})
   Charts.legend(el, items[{label,color,value?}])  Charts.monthly(el, transactions, {months:6, currency})
   ============================================================ */
const Charts = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } };
  const rtl = () => document.documentElement.getAttribute('dir') === 'rtl';
  const COLORS = ['var(--ch-1,#2F6BFF)', 'var(--ch-2,#ffffff)', 'var(--ch-3,#8e8e98)', 'var(--ch-4,#9EE6FF)', 'var(--ch-5,#4a4a52)'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const defFmt = v => { try { return new Intl.NumberFormat('en-US', { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 3 }).format(v); } catch(e){ return String(v); } };
  const L = k => { try { return (typeof t === 'function') ? t(k) : k; } catch(e){ return k; } };
  let registered = false;
  function reg(){
    if (registered || typeof Strings === 'undefined') return; registered = true;
    Strings.add({ en: { 'ch.empty': 'No data yet', 'ch.sent': 'Sent', 'ch.recv': 'Received' }, fr: { 'ch.empty': 'Pas encore de données', 'ch.sent': 'Envoyé', 'ch.recv': 'Reçu' }, ar: { 'ch.empty': 'لا توجد بيانات بعد', 'ch.sent': 'المرسل', 'ch.recv': 'المستلم' } });
  }
  function empty(el, h){ reg(); el.innerHTML = '<div class="ch-empty" style="min-height:' + (h || 96) + 'px" role="img" aria-label="' + esc(L('ch.empty')) + '"><span>' + esc(L('ch.empty')) + '</span></div>'; }
  function mk(tag, attrs, parent){ const n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k])); if (parent) parent.appendChild(n); return n; }
  function legendHtml(items){
    return '<ul class="ch-legend">' + items.map((it, i) => '<li><i style="background:' + (it.color || COLORS[i % COLORS.length]) + '"></i><span>' + esc(it.label) + '</span>' + (it.value != null ? '<b class="ltr">' + esc(it.value) + '</b>' : '') + '</li>').join('') + '</ul>';
  }
  function legend(el, items){ if (el) el.innerHTML = legendHtml(items || []); }
  const raf2 = fn => requestAnimationFrame(() => requestAnimationFrame(fn));

  /* ---------- anneau ---------- */
  function donut(el, items, o){
    if (!el) return; o = o || {}; const fmt = o.format || defFmt;
    const data = (items || []).map((it, i) => ({ label: it.label, value: Math.max(0, num(it.value)), color: it.color || COLORS[i % COLORS.length] })).filter(d => d.value > 0);
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total){ empty(el, 160); return; }
    const R = 52, C = 2 * Math.PI * R, S = 120;
    const svg = mk('svg', { viewBox: '0 0 ' + S + ' ' + S, class: 'ch-donut', role: 'img', 'aria-label': data.map(d => d.label + ' ' + fmt(d.value)).join(', ') });
    mk('circle', { cx: 60, cy: 60, r: R, fill: 'none', stroke: 'var(--border-2)', 'stroke-width': 12, opacity: .5 }, svg);
    let acc = 0; const gap = data.length > 1 ? 2.5 : 0; const arcs = [];
    data.forEach(d => {
      const len = Math.max(0, d.value / total * C - gap);
      const c = mk('circle', { cx: 60, cy: 60, r: R, fill: 'none', stroke: d.color, 'stroke-width': 12, 'stroke-linecap': 'butt', 'stroke-dasharray': (reduced() ? len : 0) + ' ' + C, 'stroke-dashoffset': -acc, transform: 'rotate(-90 60 60)' }, svg);
      arcs.push([c, len]); acc += d.value / total * C;
    });
    el.innerHTML = '<div class="ch-donut-wrap"></div>';
    const wrap = el.firstChild; wrap.appendChild(svg);
    if (o.center){ const c = document.createElement('div'); c.className = 'ch-center'; c.innerHTML = '<small>' + esc(o.center.label || '') + '</small><b class="ltr">' + esc(o.center.value == null ? fmt(total) : o.center.value) + '</b>'; wrap.appendChild(c); }
    if (o.legend !== false) el.insertAdjacentHTML('beforeend', legendHtml(data.map(d => ({ label: d.label, color: d.color, value: fmt(d.value) + ' · ' + Math.round(d.value / total * 100) + '%' }))));
    if (!reduced()) raf2(() => arcs.forEach(([c, len], i) => { c.style.transition = 'stroke-dasharray .9s cubic-bezier(.22,1,.36,1) ' + (i * 90) + 'ms'; c.setAttribute('stroke-dasharray', len + ' ' + C); }));
  }

  /* ---------- barres (une ou deux séries) ---------- */
  function bars(el, items, o){
    if (!el) return; o = o || {}; const fmt = o.format || defFmt, H = o.height || 160;
    let data = (items || []).map(it => ({ label: it.label, values: (it.values || [it.value]).map(num) }));
    const max = Math.max.apply(null, data.map(d => Math.max.apply(null, d.values)).concat([0]));
    if (!data.length || !max){ empty(el, H); return; }
    if (rtl()) data = data.slice().reverse();
    const n = data.length, k = data[0].values.length, W = Math.max(240, n * 44), pad = 22, ih = H - pad;
    const gw = W / n, bw = Math.min(22, (gw - 12) / k);
    const series = o.series || [];
    const svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ch-bars', role: 'img', preserveAspectRatio: 'xMidYMid meet', 'aria-label': data.map(d => d.label + ' ' + d.values.map(fmt).join(' / ')).join(', ') });
    [0.5, 1].forEach(f => mk('line', { x1: 0, x2: W, y1: ih - ih * f, y2: ih - ih * f, stroke: 'var(--border)', 'stroke-dasharray': '3 4' }, svg));
    const rects = [];
    data.forEach((d, i) => {
      const x0 = i * gw + (gw - bw * k - (k - 1) * 3) / 2;
      d.values.forEach((v, j) => {
        const h = Math.max(v > 0 ? 3 : 0, v / max * (ih - 6));
        const r = mk('rect', { x: x0 + j * (bw + 3), y: ih - (reduced() ? h : 0), width: bw, height: reduced() ? h : 0, rx: 4, fill: (series[j] && series[j].color) || COLORS[j % COLORS.length] }, svg);
        const ti = mk('title', {}, r); ti.textContent = d.label + ' · ' + fmt(v);
        rects.push([r, h, i]);
      });
      const tx = mk('text', { x: i * gw + gw / 2, y: H - 5, 'text-anchor': 'middle', class: 'ch-lbl' }, svg); tx.textContent = d.label;
    });
    el.innerHTML = ''; el.appendChild(svg);
    if (series.length) el.insertAdjacentHTML('beforeend', legendHtml(series.map((s, i) => ({ label: s.label, color: s.color || COLORS[i % COLORS.length] }))));
    if (!reduced()) raf2(() => rects.forEach(([r, h, i]) => { r.style.transition = 'y .7s cubic-bezier(.22,1,.36,1) ' + (i * 50) + 'ms,height .7s cubic-bezier(.22,1,.36,1) ' + (i * 50) + 'ms'; r.setAttribute('y', ih - h); r.setAttribute('height', h); }));
  }

  /* ---------- courbe lissée ---------- */
  function smooth(pts){
    if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join('');
    let d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2, s = 0.18;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) * s) + ' ' + (p1[1] + (p2[1] - p0[1]) * s) + ',' + (p2[0] - (p3[0] - p1[0]) * s) + ' ' + (p2[1] - (p3[1] - p1[1]) * s) + ',' + p2[0] + ' ' + p2[1];
    }
    return d;
  }
  function line(el, points, o){
    if (!el) return; o = o || {}; const fmt = o.format || defFmt, H = o.height || 150, W = 320, pl = 6, pr = 6, pt = 10, pb = 18;
    let data = (points || []).map(p => ({ x: +new Date(p.x), y: num(p.y), raw: p.x })).filter(p => Number.isFinite(p.x)).sort((a, b) => a.x - b.x);
    if (data.length < 2){ empty(el, H); return; }
    const xs = data.map(p => p.x), ys = data.map(p => p.y); let y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys); if (y0 === y1){ y0 -= 1; y1 += 1; }
    const sx = x => pl + (x - xs[0]) / (xs[xs.length - 1] - xs[0] || 1) * (W - pl - pr), sy = y => pt + (1 - (y - y0) / (y1 - y0)) * (H - pt - pb);
    let P = data.map(p => [sx(p.x), sy(p.y)]); if (rtl()) P = P.map(p => [W - p[0], p[1]]);
    const gid = 'chg' + Math.random().toString(36).slice(2, 7);
    const svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ch-line', role: 'img', preserveAspectRatio: 'none', 'aria-label': fmt(ys[0]) + ' → ' + fmt(ys[ys.length - 1]) });
    const defs = mk('defs', {}, svg), g = mk('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: '0%', 'stop-color': 'var(--ch-1,#2F6BFF)', 'stop-opacity': .32 }, g); mk('stop', { offset: '100%', 'stop-color': 'var(--ch-1,#2F6BFF)', 'stop-opacity': 0 }, g);
    [0.25, 0.5, 0.75].forEach(f => mk('line', { x1: 0, x2: W, y1: pt + (H - pt - pb) * f, y2: pt + (H - pt - pb) * f, stroke: 'var(--border)', 'stroke-dasharray': '3 4' }, svg));
    const dPath = smooth(P);
    if (o.area !== false) mk('path', { d: dPath + 'L' + P[P.length - 1][0] + ' ' + (H - pb) + 'L' + P[0][0] + ' ' + (H - pb) + 'Z', fill: 'url(#' + gid + ')', class: 'ch-area' }, svg);
    const path = mk('path', { d: dPath, fill: 'none', stroke: 'var(--ch-1,#2F6BFF)', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, svg);
    const dot = mk('circle', { r: 4.5, fill: 'var(--ch-1,#2F6BFF)', stroke: 'var(--bg)', 'stroke-width': 2, opacity: 0 }, svg);
    el.innerHTML = '<div class="ch-line-wrap"></div>'; const wrap = el.firstChild; wrap.appendChild(svg);
    const tip = document.createElement('div'); tip.className = 'ch-tip'; tip.hidden = true; wrap.appendChild(tip);
    function show(ev){
      const r = svg.getBoundingClientRect(); const px = (ev.clientX - r.left) / r.width * W; let bi = 0, bd = 1e9;
      P.forEach((p, i) => { const dd = Math.abs(p[0] - px); if (dd < bd){ bd = dd; bi = i; } });
      const q = P[bi]; dot.setAttribute('cx', q[0]); dot.setAttribute('cy', q[1]); dot.setAttribute('opacity', 1);
      let when = ''; try { when = new Date(data[bi].x).toLocaleDateString(typeof LANG !== 'undefined' && LANG === 'ar' ? 'ar-OM-u-nu-latn' : (typeof LANG !== 'undefined' ? LANG : 'en'), { day: '2-digit', month: 'short' }); } catch(e){ /* rien */ }
      tip.innerHTML = '<small>' + esc(when) + '</small><b class="ltr">' + esc(fmt(data[bi].y)) + '</b>'; tip.hidden = false;
      tip.style.left = Math.min(Math.max(q[0] / W * 100, 14), 86) + '%';
    }
    function hide(){ dot.setAttribute('opacity', 0); tip.hidden = true; }
    svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show); svg.addEventListener('pointerleave', hide); svg.addEventListener('pointerup', () => setTimeout(hide, 1400));
    if (!reduced()){ try { const len = path.getTotalLength ? path.getTotalLength() : 0; if (len){ path.style.strokeDasharray = len; path.style.strokeDashoffset = len; raf2(() => { path.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)'; path.style.strokeDashoffset = 0; }); } } catch(e){ /* rien */ } }
  }

  /* ---------- mini courbe ---------- */
  function spark(el, values, o){
    if (!el) return; o = o || {}; const v = (values || []).map(num); const H = o.height || 28, W = 80;
    if (v.length < 2){ el.innerHTML = ''; return; }
    const a = Math.min.apply(null, v), b = Math.max.apply(null, v) || 1, rng = (b - a) || 1;
    let P = v.map((y, i) => [i / (v.length - 1) * W, 2 + (1 - (y - a) / rng) * (H - 4)]); if (rtl()) P = P.map(p => [W - p[0], p[1]]);
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ch-spark" aria-hidden="true" preserveAspectRatio="none"><path d="' + smooth(P) + '" fill="none" stroke="' + (o.color || 'var(--ch-1,#2F6BFF)') + '" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
  }

  /* ---------- progression ---------- */
  function progress(el, ratio, o){
    if (!el) return; o = o || {}; const r = Math.max(0, Math.min(1, num(ratio))); const pct = Math.round(r * 100);
    el.innerHTML = '<div class="ch-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"' + (o.label ? ' aria-label="' + esc(o.label) + '"' : '') + '><i style="width:' + (reduced() ? pct : 0) + '%"></i></div>' + (o.label ? '<div class="ch-prog-l"><span>' + esc(o.label) + '</span><b class="ltr">' + (o.format ? esc(o.format(r)) : pct + '%') + '</b></div>' : '');
    if (!reduced()) raf2(() => { const i = el.querySelector('.ch-prog i'); if (i){ i.style.transition = 'width .9s cubic-bezier(.22,1,.36,1)'; i.style.width = pct + '%'; } });
  }

  /* ---------- envoyé / reçu par mois, calculé sur les vraies opérations ---------- */
  function monthly(el, txs, o){
    if (!el) return; reg(); o = o || {}; const n = o.months || 6, cur = o.currency || 'OMR';
    const lang = typeof LANG !== 'undefined' ? (LANG === 'ar' ? 'ar-OM-u-nu-latn' : LANG) : 'en';
    const now = new Date(), buckets = [];
    for (let i = n - 1; i >= 0; i--){ const d = new Date(now.getFullYear(), now.getMonth() - i, 1); let lb = ''; try { lb = d.toLocaleDateString(lang, { month: 'short' }); } catch(e){ lb = String(d.getMonth() + 1); } buckets.push({ key: d.getFullYear() * 12 + d.getMonth(), label: lb, values: [0, 0] }); }
    let any = false;
    (txs || []).forEach(tx => {
      if (!tx || (tx.status && String(tx.status).toUpperCase() !== 'SUCCESS' && String(tx.status).toUpperCase() !== 'CONFIRMED') || (tx.currency && tx.currency !== cur) || tx.asset) return;
      const d = new Date(tx.createdAt || tx.created_at); if (isNaN(d)) return; const b = buckets.find(x => x.key === d.getFullYear() * 12 + d.getMonth()); if (!b) return;
      const a = num(tx.amount); if (a <= 0) return; b.values[tx.direction === 'IN' ? 1 : 0] += a; any = true;
    });
    if (!any){ empty(el, o.height || 150); return; }
    bars(el, buckets, { height: o.height || 150, series: [{ label: L('ch.sent') }, { label: L('ch.recv'), color: 'var(--ch-2,#ffffff)' }], format: v => defFmt(v) + ' ' + cur });
  }

  return { donut, bars, line, spark, progress, legend, monthly };
})();
