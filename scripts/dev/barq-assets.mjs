/* Barq — toutes les images de marque, rendues par Chromium à partir de design/barq/barq-mark.svg (le logo : un éclair blanc sur tuile bleu électrique).
   Usage : node scripts/dev/barq-assets.mjs   (puis python3 scripts/dev/barq-assets-ico.py pour favicon.ico, python3 scripts/dev/android-assets.py pour Android)
   Produit : marque PNG, icônes PWA / apple-touch-icon / maskable, favicons, écrans de lancement iOS (fond uni, identique au fond de l'application),
   images de partage (EN / FR / AR). Le logo est dessiné ici même : aucune image tierce. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const R = f => path.join(ROOT, f);
const MARK = fs.readFileSync(R('design/barq/barq-mark.svg'), 'utf8');
/* variante pleine tuile (sans coins arrondis) : apple-touch-icon et maskable ; `scale` réduit l'éclair pour rester dans la zone sûre */
const BLEED = (scale = 1) => MARK.replace('<rect width="512" height="512" rx="116" fill="url(#bg)"/>', '<rect width="512" height="512" fill="url(#bg)"/>').replace('<clipPath id="tile"><rect width="512" height="512" rx="116"/></clipPath>', '<clipPath id="tile"><rect width="512" height="512"/></clipPath>')
  .replace('<path d="M300 78', `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)"><path d="M300 78`).replace('stroke-linejoin="round"/>\n</svg>', 'stroke-linejoin="round"/></g>\n</svg>');
const FONTS = `@font-face{font-family:Inter;src:url(file://${R('assets/fonts/inter-latin-var.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Tajawal;src:url(file://${R('assets/fonts/tajawal-arabic-800.woff2')}) format('woff2');font-weight:800}
@font-face{font-family:Tajawal;src:url(file://${R('assets/fonts/tajawal-arabic-500.woff2')}) format('woff2');font-weight:500}`;
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const shot = async (html, w, h, file, { type = 'png', omitBg = false, quality = 88 } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(`<html><head><style>${FONTS}html,body{margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:Inter,Tajawal,system-ui}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(R(file)), { recursive: true });
  await p.screenshot({ path: R(file), type, ...(type === 'jpeg' ? { quality } : {}), omitBackground: omitBg });
  await p.close();
};
const img = (svg, w, h) => `<div style="width:${w}px;height:${h}px;line-height:0">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div>`;

/* 1. marque dans l'application et icônes */
for (const n of [192, 320, 512]) await shot(img(MARK, n, n), n, n, `assets/brand/barq-mark-${n}.png`, { omitBg: true });
for (const f of ['assets/brand/png/logo-mark-512.png', 'assets/brand/png/logo-mark-ar-512.png', 'assets/icons/icon-512.png', 'assets/icons/ar/icon-512.png']) await shot(img(MARK, 512, 512), 512, 512, f, { omitBg: true });
for (const f of ['assets/icons/icon-192.png', 'assets/icons/ar/icon-192.png']) await shot(img(MARK, 192, 192), 192, 192, f, { omitBg: true });
for (const f of ['assets/icons/apple-touch-icon.png', 'assets/icons/ar/apple-touch-icon.png']) await shot(img(BLEED(1), 180, 180), 180, 180, f);
await shot(img(BLEED(0.78), 512, 512), 512, 512, 'assets/icons/icon-maskable-512.png');
await shot(img(BLEED(1), 1024, 1024), 1024, 1024, 'design/barq/barq-icon-1024.png');   /* icône iOS : carré plein, sans transparence (iOS arrondit lui-même) */
for (const s of [16, 32, 48]) await shot(img(MARK, s, s), s, s, `assets/icons/favicon-${s}.png`, { omitBg: true });
const BOLT_WHITE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M300 78 L158 276 H236 L206 436 L356 226 H276 Z" fill="#fff" stroke="#fff" stroke-width="22" stroke-linejoin="round"/></svg>';
await shot(img(BOLT_WHITE, 512, 512), 512, 512, 'design/barq/barq-bolt-white-512.png', { omitBg: true });
fs.copyFileSync(R('design/barq/barq-mark.svg'), R('assets/icons/icon.svg')); fs.copyFileSync(R('design/barq/barq-mark.svg'), R('assets/brand/barq-mark.svg')); fs.copyFileSync(R('design/barq/barq-bolt.svg'), R('assets/brand/barq-bolt.svg'));

/* 2. écrans de lancement iOS : fond UNI, identique au fond de l'application (#F3F6FA clair, #08131F sombre) : le passage à l'ouverture animée est invisible */
const sizes = [...fs.readFileSync(R('index.html'), 'utf8').matchAll(/ios-(\d+)x(\d+)-(light)/g)].map(m => [+m[1], +m[2]]);
for (const [w, h] of sizes) for (const mode of ['light', 'dark']) await shot(`<div style="width:${w}px;height:${h}px;background:${mode === 'dark' ? '#08131F' : '#F3F6FA'}"></div>`, w, h, `assets/splash/ios-${w}x${h}-${mode}.jpg`, { type: 'jpeg', quality: 90 });

/* 3. images de partage */
const OG = { en: ['Send money to a mobile number in Oman. Simple and secure.', 'ltr', 'Barq'], fr: ['Envoyez de l’argent vers un numéro mobile à Oman. Simple et sûr.', 'ltr', 'Barq'], ar: ['أرسل الأموال إلى رقم هاتف في عُمان. بسيط وآمن.', 'rtl', 'برق'] };
const side = d => (d === 'rtl' ? 'right' : 'left');
const markUri = 'data:image/svg+xml;base64,' + Buffer.from(MARK).toString('base64');
for (const [lang, [tag, dir, name]] of Object.entries(OG)) {
  const html = `<div dir="${dir}" style="position:relative;width:1200px;height:630px;background:linear-gradient(135deg,#0B1B3A 0%,#10307D 55%,#1F4FD8 100%);overflow:hidden;font-family:${dir === 'rtl' ? 'Tajawal' : 'Inter'},Inter,system-ui;color:#fff">
    <svg style="position:absolute;inset:0" width="1200" height="630" viewBox="0 0 1200 630"><path d="M-40 520C220 520 330 330 560 372c200 36 300 190 700 40" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="64" stroke-linecap="round"/><path d="M-40 520C220 520 330 330 560 372c200 36 300 190 700 40" fill="none" stroke="#38D4FF" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></svg>
    <img src="${markUri}" width="170" height="170" style="position:absolute;${side(dir)}:84px;top:96px;border-radius:28%;box-shadow:0 24px 50px -14px rgba(0,0,0,.5)">
    <div style="position:absolute;${side(dir)}:84px;top:290px;font-size:112px;font-weight:800;letter-spacing:${dir === 'rtl' ? '0' : '-.03em'};line-height:1.1">${name}</div>
    <div style="position:absolute;${side(dir)}:84px;${dir === 'rtl' ? 'left' : 'right'}:84px;top:440px;font-size:40px;font-weight:500;color:#CFE0FF;line-height:1.35">${tag}</div></div>`;
  await shot(html, 1200, 630, `assets/share/og-${lang}.png`);
}
await b.close();
console.log('images de marque Barq écrites');
