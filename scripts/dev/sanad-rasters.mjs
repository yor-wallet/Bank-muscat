/* Sanad Pay — rasters de marque (PNG / JPG / ICO) rendus par Chromium depuis les SVG du pack.
   Usage : node scripts/dev/sanad-rasters.mjs   (après scripts/dev/sanad-assets.py)
   Produit : icônes PWA, favicons, apple-touch-icon, tuile maskable, mots-symboles PNG, 24 écrans de lancement iOS, 3 images de partage (EN / FR / AR). */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const R = f => path.join(ROOT, f);
const MARK = fs.readFileSync(R('assets/brand/logo-mark.svg'), 'utf8');
const innerOf = s => s.replace(/^<svg[^>]*>|<\/svg>$/g, '');
const GLYPH = innerOf(MARK).replace(/<defs>[\s\S]*?<\/defs>/, '').replace(/<rect[^>]*\/>/, '');
const GRAD = '<defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#79DEFF"/><stop offset="1" stop-color="#238CDF"/></linearGradient></defs>';
const BLEED = (extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${GRAD}<rect width="256" height="256" fill="url(#sky)"/>${extra}${GLYPH}</svg>`;
const FONTS = `@font-face{font-family:Inter;src:url(file://${R('assets/fonts/inter-latin-var.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Tajawal;src:url(file://${R('assets/fonts/tajawal-arabic-800.woff2')}) format('woff2');font-weight:800}
@font-face{font-family:Tajawal;src:url(file://${R('assets/fonts/tajawal-arabic-500.woff2')}) format('woff2');font-weight:500}`;

const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const shot = async (html, w, h, file, { type = 'png', omitBg = false, quality = 86 } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(`<html><head><style>${FONTS}html,body{margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:Inter,Tajawal,system-ui}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(R(file)), { recursive: true });
  await p.screenshot({ path: R(file), type, ...(type === 'jpeg' ? { quality } : {}), omitBackground: omitBg });
  await p.close();
};
const img = (svg, w, h) => `<div style="width:${w}px;height:${h}px">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div>`;

/* 1–3 : anciennes sorties (icônes carré/coche, mots-symboles, écrans de lancement) — remplacées par scripts/dev/logo-assets.py et scripts/dev/splash.py ; n'exécuter que `ONLY=og` */
if (!process.env.ONLY) {
/* 1. icônes (carré arrondi transparent = « any » ; pleine tuile = maskable / apple-touch) */
for (const [f, s] of [['assets/icons/icon-512.png', 512], ['assets/icons/icon-192.png', 192], ['assets/brand/png/logo-mark-512.png', 512], ['assets/brand/png/logo-mark-ar-512.png', 512], ['assets/icons/ar/icon-512.png', 512], ['assets/icons/ar/icon-192.png', 192], ['assets/icons/favicon-16.png', 16], ['assets/icons/favicon-32.png', 32], ['assets/icons/favicon-48.png', 48]])
  await shot(img(MARK, s, s), s, s, f, { omitBg: true });
await shot(img(BLEED(), 512, 512), 512, 512, 'assets/icons/icon-maskable-512.png');
for (const f of ['assets/icons/apple-touch-icon.png', 'assets/icons/ar/apple-touch-icon.png']) await shot(img(BLEED(), 180, 180), 180, 180, f);

/* 2. mots-symboles PNG (2x) depuis les SVG de contours */
for (const [n, file] of [['en-dark', 'logo-wordmark-dark'], ['en-white', 'logo-wordmark-white'], ['ar-dark', 'logo-wordmark-ar-dark'], ['ar-white', 'logo-wordmark-ar-white']]) {
  const svg = fs.readFileSync(R(`assets/brand/${file}.svg`), 'utf8'); const [, vw, vh] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  await shot(img(svg, vw * 2, vh * 2), vw * 2, vh * 2, `assets/brand/png/logo-wordmark-${n}.png`, { omitBg: true });
}

/* 3. écrans de lancement iPhone / iPad : ciel clair (clair) ou bleu nuit (sombre), marque centrée, nom dessous */
const sizes = [...fs.readFileSync(R('index.html'), 'utf8').matchAll(/ios-(\d+)x(\d+)-(light)/g)].map(m => [+m[1], +m[2]]);
for (const [w, h] of sizes) for (const mode of ['light', 'dark']) {
  const m = Math.round(Math.min(w, h) * 0.24), dark = mode === 'dark';
  const bg = dark ? 'linear-gradient(180deg,#0F2A4A 0%,#102C4C 55%,#0B2140 100%)' : 'linear-gradient(180deg,#EAF8FF 0%,#DDEFFF 55%,#D9EBFF 100%)';
  const halo = dark ? 'rgba(37,150,222,.34)' : 'rgba(126,216,246,.55)';
  const html = `<div style="position:relative;width:${w}px;height:${h}px;background:${bg};overflow:hidden">
    <div style="position:absolute;left:50%;top:44%;width:${m * 3}px;height:${m * 3}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,${halo},transparent)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);filter:drop-shadow(0 ${m * .08}px ${m * .16}px rgba(19,79,145,.28))">${img(MARK, m, m)}</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * .78}px);text-align:center;font-weight:800;font-size:${m * .27}px;letter-spacing:-.01em;color:${dark ? '#fff' : '#102C4C'}">Sanad Pay</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * 1.14}px);text-align:center;font-family:Tajawal,Inter;font-weight:500;font-size:${m * .2}px;color:${dark ? '#7ED8F6' : '#134F91'}">سند باي</div></div>`;
  await shot(html, w, h, `assets/splash/ios-${w}x${h}-${mode}.jpg`, { type: 'jpeg', quality: 86 });
}

}
/* 4. images de partage (Open Graph / Twitter) */
const OG = { en: ['Send money to a mobile number in Oman. Simple and secure.', 'ltr', 'Sanad Pay'], fr: ['Envoyez de l’argent vers un numéro mobile à Oman. Simple et sûr.', 'ltr', 'Sanad Pay'], ar: ['أرسل الأموال إلى رقم هاتف في عُمان. بسيط وآمن.', 'rtl', 'سند باي'] };
for (const [lang, [tag, dir, name]] of Object.entries(OG)) {
  const html = `<div dir="${dir}" style="position:relative;width:1200px;height:630px;background:linear-gradient(135deg,#EAF8FF 0%,#CFEBFF 55%,#BFE3FA 100%);overflow:hidden;font-family:${dir === 'rtl' ? 'Tajawal' : 'Inter'},Inter,system-ui">
    <div style="position:absolute;${dir === 'rtl' ? 'left' : 'right'}:-120px;top:-140px;width:620px;height:620px;border-radius:50%;background:radial-gradient(closest-side,rgba(126,216,246,.7),transparent)"></div>
    <div style="position:absolute;${dir === 'rtl' ? 'right' : 'left'}:84px;top:96px;filter:drop-shadow(0 18px 34px rgba(19,79,145,.25))"><img src="data:image/png;base64,${fs.readFileSync(R('assets/brand/sanad-s-320.png')).toString('base64')}" width="170" height="170" style="border-radius:28%;box-shadow:0 20px 40px -14px rgba(19,79,145,.4)"></div>
    <div style="position:absolute;${dir === 'rtl' ? 'right' : 'left'}:84px;top:290px;font-size:104px;font-weight:800;color:#102C4C;letter-spacing:${dir === 'rtl' ? '0' : '-.02em'};line-height:1.1">${name}</div>
    <div style="position:absolute;${dir === 'rtl' ? 'right' : 'left'}:84px;${dir === 'rtl' ? 'left' : 'right'}:84px;top:430px;font-size:40px;font-weight:500;color:#134F91;line-height:1.35">${tag}</div></div>`;
  await shot(html, 1200, 630, `assets/share/og-${lang}.png`);
}
await b.close();
console.log('rasters de marque écrits');
