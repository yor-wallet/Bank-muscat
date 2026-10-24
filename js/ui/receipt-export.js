'use strict';

/* ===== RECEIPT EXPORT — light, print-friendly poster rendered to PNG / PDF, shared as a real file =====
   12.4.0: the poster is drawn from the REAL status (success / pending / failed) exactly like the receipt screen: a failed or pending
   operation is never exported as a success. Every line comes from the receipt data; a line without data is not drawn. */
const ReceiptExport = (() => {
  const W = 1080, BG = '#F5F5F5', FONT = "-apple-system,'SF Pro Display','Segoe UI',Roboto,'Noto Sans Arabic','Noto Sans',Arial,sans-serif";
  const PAL = {
    success: { fg:'#0F7B4A', bg:'#E3F4EB', icon:'M-20 2l14 15 28-32' },
    pending: { fg:'#8A5300', bg:'#FDF0D5', icon:'M0 -24v26l17 11' },
    failed:  { fg:'#B42318', bg:'#FCE4E1', icon:'M-17 -17l34 34M17 -17l-34 34' }
  };
  const stateOf = (r, v) => (v && v.state) || txState(r.status);
  function rows(r, v){
    const st = stateOf(r, v), out = [];
    if (v.who) out.push([v.partyLabel || t('receipt.beneficiary'), v.who]);
    if (v.fromPhone) out.push([t('receipt.from'), v.fromPhone, 'mono']);
    out.push([t(v.isIn ? 'receipt.amountReceived' : 'receipt.amountSent'), v.amtFmt]);
    if (v.destFmt) out.push([t('transfer.receiving'), v.destFmt, 'acc']);
    if (v.rate) out.push([t('transfer.rate'), v.rate]);
    if (!v.isIn && st !== 'failed'){      /* a failed operation draws no debit line: nothing was debited by it */
      if (r.fee) out.push([t('receipt.fees'), v.feeFmt]);
      if (v.vatFmt) out.push([t('receipt.vat'), v.vatFmt]);
      if (v.hasCost !== false) out.push([t('receipt.totalDebit'), v.totalFmt, 'bold']);
    }
    out.push([t('receipt.date'), v.date]);
    out.push([t('receipt.hour'), v.time]);
    out.push([t('receipt.status'), v.statusTxt, 'st']);
    out.push([t('receipt.id'), String(r.transactionId || r.id || '—'), 'mono']);
    out.push([t('receipt.reference'), dispId(String(r.reference || '—')), 'mono']);
    return out;
  }
  /* word wrap for the SVG (no automatic wrapping there); at most 3 lines */
  function wrap(text, max){
    const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur){ lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }
  function svg(r, v){
    const rtl = document.documentElement.dir === 'rtl', st = stateOf(r, v), pal = PAL[st];
    const list = rows(r, v), rowH = 84;
    const xL = rtl ? W - 90 : 90, xV = rtl ? 90 : W - 90, aL = rtl ? 'end' : 'start', aV = rtl ? 'start' : 'end';
    const cx = W / 2;
    const HDR = 300;   /* bandeau bleu profond : identité bancaire */
    /* hero: status disc, amount, converted amount, title, operation, explanation (failed / pending) */
    let y = 540;
    let hero = '<text x="' + cx + '" y="' + y + '" font-size="80" font-weight="800" fill="' + (st === 'failed' ? '#6B6B6B' : '#111111') + '" text-anchor="middle" direction="ltr">' + escapeHtml(v.amtFmt) + '</text>';
    if (v.destFmt){ y += 56; hero += '<text x="' + cx + '" y="' + y + '" font-size="32" font-weight="600" fill="#6B6B6B" text-anchor="middle" direction="ltr">≈ ' + escapeHtml(v.destFmt) + '</text>'; }
    y += 88; hero += '<text x="' + cx + '" y="' + y + '" font-size="44" font-weight="800" fill="#111111" text-anchor="middle">' + escapeHtml(v.title || '') + '</text>';
    if (v.eyebrow){ y += 46; hero += '<text x="' + cx + '" y="' + y + '" font-size="24" font-weight="700" fill="#8A8A8A" text-anchor="middle"' + (rtl ? '' : ' letter-spacing="3"') + '>' + escapeHtml(rtl ? String(v.eyebrow) : String(v.eyebrow).toUpperCase()) + '</text>'; }
    wrap(v.sub, 46).forEach(line => { y += 40; hero += '<text x="' + cx + '" y="' + y + '" font-size="27" fill="#6B6B6B" text-anchor="middle">' + escapeHtml(line) + '</text>'; });
    const top = y + 56;                                           /* the dashed tear line */
    const H = top + list.length * rowH + 240;
    let ry = top;
    const body = list.map((x, i) => {
      ry += rowH;
      const val = String(x[1]); const fs = val.length > 34 ? 22 : (val.length > 24 ? 26 : 32);
      const isSt = x[2] === 'st', c = isSt ? pal.fg : x[2] === 'acc' ? '#0057D9' : '#151411', w = (x[2] === 'bold' || isSt) ? 800 : 600;
      return '<text x="' + xL + '" y="' + (ry - 26) + '" font-size="28" fill="#6B6B6B" text-anchor="' + aL + '">' + escapeHtml(x[0]) + '</text>' +
        '<text x="' + xV + '" y="' + (ry - 26) + '" font-size="' + (x[2] === 'bold' ? 36 : fs) + '" font-weight="' + w + '" fill="' + c + '" text-anchor="' + aV + '" direction="ltr"' + (x[2] === 'mono' ? ' font-family="ui-monospace,Menlo,Consolas,monospace"' : '') + '>' + escapeHtml(val) + '</text>' +
        (i < list.length - 1 ? '<line x1="90" x2="' + (W - 90) + '" y1="' + (ry - 4) + '" y2="' + (ry - 4) + '" stroke="#EAEAEA" stroke-width="2"/>' : '');
    }).join('');
    const BRAND = rtl ? 'فريندي باي' : 'Freindi Pay';      /* reçu exporté en PNG : mot-symbole arabe, sans espacement des lettres */
    const docType = (typeof t === 'function' && t('rc.docType') !== 'rc.docType') ? t('rc.docType') : 'TRANSACTION RECEIPT';
    const note = (typeof t === 'function' && t('rc.note') !== 'rc.note') ? t('rc.note') : 'Freindi Pay transaction receipt — not a bank-issued document.';
    /* bandeau : logo + mot-symbole à un bord, type de document à l'autre */
    const bx = rtl ? W - 90 : 90, btxt = rtl ? 'end' : 'start';
    const tx = rtl ? 90 : W - 90, ttxt = rtl ? 'start' : 'end';
    const head =
      '<rect x="40" y="40" width="' + (W - 80) + '" height="' + HDR + '" rx="56" fill="url(#hdr)"/>' +
      '<rect x="40" y="' + (HDR - 16) + '" width="' + (W - 80) + '" height="56" fill="url(#hdr)"/>' +
      '<rect x="' + (rtl ? W - 90 - 76 : 90) + '" y="104" width="76" height="76" rx="22" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.5)" stroke-width="2"/>' +
      '<text x="' + (rtl ? W - 90 - 38 : 128) + '" y="156" font-size="40" font-weight="800" fill="#FFFFFF" text-anchor="middle">F</text>' +
      '<text x="' + (rtl ? W - 182 : 182) + '" y="152" font-size="38" font-weight="800" fill="#FFFFFF" text-anchor="' + btxt + '"' + (rtl ? '' : ' letter-spacing=".5"') + '>' + BRAND + '</text>' +
      '<text x="' + tx + '" y="128" font-size="23" font-weight="700" fill="rgba(255,255,255,.82)" text-anchor="' + ttxt + '"' + (rtl ? '' : ' letter-spacing="2.5"') + '>' + escapeHtml(docType) + '</text>' +
      '<text x="' + tx + '" y="166" font-size="24" font-weight="600" fill="rgba(255,255,255,.95)" text-anchor="' + ttxt + '" direction="ltr">' + escapeHtml(dispId(String(r.reference || r.transactionId || r.id || '—'))) + '</text>' +
      '<circle cx="' + cx + '" cy="' + (HDR + 40) + '" r="72" fill="#FFFFFF" stroke="' + pal.bg + '" stroke-width="10"/>' +
      '<circle cx="' + cx + '" cy="' + (HDR + 40) + '" r="50" fill="none" stroke="' + pal.fg + '" stroke-width="7"/>' +
      '<g transform="translate(' + cx + ' ' + (HDR + 40) + ')"><path d="' + pal.icon + '" stroke="' + pal.fg + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="' + FONT + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38BDF8"/><stop offset="1" stop-color="#0057D9"/></linearGradient>' +
      '<linearGradient id="hdr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0057D9"/><stop offset=".55" stop-color="#004AB5"/><stop offset="1" stop-color="#003B8E"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>' +
      '<rect x="40" y="40" width="' + (W - 80) + '" height="' + (H - 80) + '" rx="56" fill="#FFFFFF" stroke="#E6E6E6" stroke-width="2"/>' +
      head +
      hero +
      '<line x1="90" x2="' + (W - 90) + '" y1="' + top + '" y2="' + top + '" stroke="#D6D6D6" stroke-width="3" stroke-dasharray="14 12"/>' +
      '<circle cx="40" cy="' + top + '" r="26" fill="' + BG + '"/><circle cx="' + (W - 40) + '" cy="' + top + '" r="26" fill="' + BG + '"/>' +
      body +
      '<text x="' + cx + '" y="' + (H - 136) + '" font-size="26" font-weight="700" fill="#0057D9" text-anchor="middle">' + BRAND + '</text>' +
      '<text x="' + cx + '" y="' + (H - 100) + '" font-size="22" fill="#8A8A8A" text-anchor="middle">' + escapeHtml(v.date + ' · ' + v.time) + '</text>' +
      '<text x="' + cx + '" y="' + (H - 64) + '" font-size="19" fill="#A0A0A0" text-anchor="middle">' + escapeHtml(note) + '</text></svg>';
  }
  function canvasOf(r, v){
    return new Promise((resolve, reject) => {
      const s = svg(r, v), img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = img.naturalWidth || W; c.height = img.naturalHeight;
        const x = c.getContext('2d'); x.fillStyle = BG; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
        resolve(c);
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    });
  }
  const blobOf = (c, type, q) => new Promise(res => c.toBlob(res, type, q));
  /* PDF A4 (595 × 842 pt) : le reçu est centré sur la page avec des marges, comme un document bancaire à imprimer.
     Si le reçu est plus haut que la zone imprimable, il est réduit pour tenir sur une page. */
  async function pdfBlob(c){
    const jpg = new Uint8Array(await (await blobOf(c, 'image/jpeg', 0.95)).arrayBuffer());
    const pw = 595, ph = 842, margin = 36, enc = new TextEncoder();   /* A4 portrait */
    const availW = pw - margin * 2, availH = ph - margin * 2;
    let iw = availW, ih = availW * c.height / c.width;
    if (ih > availH){ ih = availH; iw = availH * c.width / c.height; }
    const ix = (pw - iw) / 2, iy = (ph - ih) / 2;                     /* centré */
    const parts = []; const offs = []; let len = 0;
    const push = (u) => { parts.push(u); len += u.length; };
    const str = (s) => push(enc.encode(s));
    const obj = (n, fn) => { offs[n] = len; str(n + ' 0 obj\n'); fn(); str('\nendobj\n'); };
    str('%PDF-1.4\n');
    obj(1, () => str('<</Type/Catalog/Pages 2 0 R>>'));
    obj(2, () => str('<</Type/Pages/Kids[3 0 R]/Count 1>>'));
    obj(3, () => str('<</Type/Page/Parent 2 0 R/MediaBox[0 0 ' + pw + ' ' + ph + ']/Resources<</XObject<</I 4 0 R>>>>/Contents 5 0 R>>'));
    obj(4, () => { str('<</Type/XObject/Subtype/Image/Width ' + c.width + '/Height ' + c.height + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ' + jpg.length + '>>\nstream\n'); push(jpg); str('\nendstream'); });
    const cs = 'q ' + iw.toFixed(2) + ' 0 0 ' + ih.toFixed(2) + ' ' + ix.toFixed(2) + ' ' + iy.toFixed(2) + ' cm /I Do Q';
    obj(5, () => str('<</Length ' + cs.length + '>>\nstream\n' + cs + '\nendstream'));
    const xr = len; str('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) str(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
    str('trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n' + xr + '\n%%EOF');
    const out = new Uint8Array(len); let p = 0; parts.forEach(u => { out.set(u, p); p += u.length; });
    return new Blob([out], { type:'application/pdf' });
  }
  function save(blob, name){
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }
  async function run(kind){
    const r = window.__YOR_LAST_RECEIPT__, v = window.__YOR_LAST_RECEIPT_VIEW__;
    if (!r || !v) return;
    const base = 'FREINDI-PAY-' + dispId(String(r.reference || r.transactionId || r.id || 'receipt')).replace(/[^\w-]/g, '');
    try {
      const c = await canvasOf(r, v);
      if (kind === 'pdf'){ save(await pdfBlob(c), base + '.pdf'); toast(t('action.download'), 'success'); return; }
      const png = await blobOf(c, 'image/png');
      if (kind === 'png'){ save(png, base + '.png'); toast(t('action.download'), 'success'); return; }
      const file = new File([png], base + '.png', { type:'image/png' });
      if (navigator.canShare && navigator.canShare({ files:[file] })){ try { await navigator.share({ files:[file], title: (LANG === 'ar' ? 'فريندي باي' : 'Freindi Pay') }); return; } catch(e){ if (e && e.name === 'AbortError') return; } }
      save(png, base + '.png'); toast(t('action.download'), 'success');
    } catch(e){ console.error(e); toast(t('errors.UNKNOWN_ERROR'), 'error'); }
  }
  return { run, svg };
})();

