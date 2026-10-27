/* Exports du reçu (PNG et PDF) : nets, statiques, fidèles aux données (montant, statut, référence), avec le logo officiel.
   Usage : node tests/ui/export-shots.mjs <site> <dossier> [lang] */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(900);
const res = [];
for (const st of ['CONFIRMED', 'PENDING', 'FAILED']) {
  await page.evaluate(status => { document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove()); window.__blobs = []; const o = URL.createObjectURL.bind(URL); URL.createObjectURL = b => { window.__blobs.push(b); return o(b); };
    Runtime.lastReceipt = { id: 'r-' + status, transactionId: null, reference: 'SP-TX-100001', status, direction: 'OUT', kind: 'FIAT_EXTERNAL', amount: 25, currency: 'OMR', fee: 0, total: 25, createdAt: Date.now() - 6e4, beneficiary: { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' } }; R.go('receipt', { force: true }); }, st);
  await page.waitForTimeout(900);
  for (const kind of ['png', 'pdf']) {
    await page.evaluate(() => { window.__blobs.length = 0; });
    await page.evaluate(k => ReceiptExport.run(k), kind); await page.waitForTimeout(900);
    const info = await page.evaluate(async () => { const bl = window.__blobs[0]; if (!bl) return null; const buf = new Uint8Array(await bl.arrayBuffer()); let head = String.fromCharCode(...buf.slice(0, 8)); return { type: bl.type, size: bl.size, head: head.replace(/[^\x20-\x7e]/g, '.'), b64: bl.type === 'image/png' ? await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(bl); }) : '' }; });
    res.push([st, kind, info && info.type, info && info.size, info && info.head]);
    if (info && info.b64) fs.writeFileSync(path.join(out, `export-${lang}-${st.toLowerCase()}.png`), Buffer.from(info.b64.split(',')[1], 'base64'));
  }
}
console.log(res.map(r => r.join(' | ')).join('\n')); console.log('erreurs:', (page.__errors || []).join('|') || 'aucune');
await ctx.close(); await b.close(); srv.close();
