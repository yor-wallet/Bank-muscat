/* Reçu dans ses trois états réels (confirmé, en cours, échoué). Le statut vient de la donnée, jamais de l'écran. Usage : node tests/ui/receipt-shots.mjs <site> <dossier> [lang] [theme] */
import fs from 'node:fs'; import path from 'node:path';
import { serve, newPage, launch } from './harness.mjs';
const [site, out, lang = 'en', theme = 'light'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve(path.resolve(site)); const b = await launch();
const { ctx, page } = await newPage(b, url, { loggedIn: true, lang, theme });
await page.goto(url + '/index.html', { waitUntil: 'load' }); await page.waitForTimeout(2800);
for (let i = 0; i < 6; i++) { const k = page.locator('.yl [data-k="1"]').first(); if (await k.count()) await k.click({ delay: 20 }).catch(() => {}); }
await page.waitForTimeout(1000);
for (const st of ['CONFIRMED', 'PENDING', 'FAILED']) {
  await page.evaluate(status => {
    document.querySelectorAll('#lang-picker,#splash,.ov-root').forEach(e => e.remove());
    Runtime.lastReceipt = { id: 'r-' + status, transactionId: null, reference: 'SP-TX-100001', status, direction: 'OUT', kind: 'FIAT_EXTERNAL', amount: 25, currency: 'OMR', fee: 0, total: 25, createdAt: Date.now() - 6e4, beneficiary: { name: 'Salim Al Harthy', phone: '+96891234567', country: 'OM' } };
    R.go('receipt', { force: true });
  }, st);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, `rc-${lang}-${theme}-${st.toLowerCase()}.png`) });
}
console.log((page.__errors || []).join('|') || 'ok'); await ctx.close(); await b.close(); srv.close();
