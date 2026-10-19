/* Live X Digitale — génère tous les visuels de marque (SVG + PNG + ICO + écrans de lancement iOS + images de partage).
   Usage : node scripts/dev/brand-assets.mjs   (nécessite playwright + un Chromium ; Pillow pour favicon.ico : python3 -m pip install pillow)
   Les SVG sont écrits à la main ici : une seule source pour le monogramme. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const W = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };

const GOLD1 = '#FFD866', GOLD2 = '#F2B21B', GOLD3 = '#C98A0E', INK = '#0A0A0B';
/* monogramme : L et X tracés (extrémités rondes), centrés dans 512 × 512 */
const GLYPH = (stroke, sw = 54) => `<g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M132 150V362H222"/><path d="M268 150L384 362M384 150L268 362"/></g>`;
const DEFS = `<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GOLD1}"/><stop offset=".55" stop-color="${GOLD2}"/><stop offset="1" stop-color="${GOLD3}"/></linearGradient></defs>`;
const TILE = (glyph = INK) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH(glyph)}</svg>`;
const TILE_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" rx="120" fill="${INK}"/><rect x="6" y="6" width="500" height="500" rx="114" fill="none" stroke="url(#lg)" stroke-width="6" opacity=".85"/>${GLYPH('url(#lg)')}</svg>`;
const MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" fill="url(#lg)"/><g transform="translate(76.8 76.8) scale(.7)">${GLYPH(INK)}</g></svg>`;
W('assets/brand/logo-mark.svg', TILE()); W('assets/brand/logo-mark-ar.svg', TILE()); W('assets/icons/icon.svg', TILE()); W('assets/brand/logo-mark-dark.svg', TILE_DARK);

const FONT = 'Inter,SF Pro Display,Helvetica,Arial,sans-serif';
const wm = (fill, sub, h = 120) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 ${h}">${DEFS}<g transform="scale(.2)"><rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH(INK)}</g><text x="128" y="58" font-family="${FONT}" font-weight="800" font-size="52" letter-spacing="1" fill="${fill}">LIVE X</text><text x="130" y="94" font-family="${FONT}" font-weight="500" font-size="23" letter-spacing="9.5" fill="${sub}">DIGITALE</text></svg>`;
const wmAr = (fill, sub) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120">${DEFS}<g transform="translate(458 0) scale(.2)"><rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH(INK)}</g><text x="440" y="58" text-anchor="end" font-family="Noto Sans Arabic,Geeza Pro,Arial,sans-serif" font-weight="800" font-size="46" fill="${fill}">لايف إكس</text><text x="440" y="98" text-anchor="end" font-family="Noto Sans Arabic,Geeza Pro,Arial,sans-serif" font-weight="500" font-size="26" fill="${sub}">ديجيتال</text></svg>`;
W('assets/brand/logo-wordmark-dark.svg', wm(INK, '#7A5A0C')); W('assets/brand/logo-wordmark-white.svg', wm('#FFFFFF', GOLD1));
W('assets/brand/logo-wordmark-ar-dark.svg', wmAr(INK, '#7A5A0C')); W('assets/brand/logo-wordmark-ar-white.svg', wmAr('#FFFFFF', GOLD1));
/* mot-symbole des cartes (blanc, sans tuile) */
W('assets/brand/wordmark-white.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 64"><text x="0" y="40" font-family="${FONT}" font-weight="800" font-size="40" letter-spacing=".5" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#fff">LIVE X</text><text x="1" y="60" font-family="${FONT}" font-weight="500" font-size="15" letter-spacing="6.4" fill="#fff" fill-opacity=".82">DIGITALE</text></svg>`);

/* ---------- rendu PNG / JPG ---------- */
const b = await chromium.launch();
const shot = async (html, w, h, file, { type = 'png', scale = 1, omitBg = false } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await p.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;${omitBg ? '' : 'background:#000'}">${html}</body></html>`);
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  await p.screenshot({ path: path.join(ROOT, file), type, ...(type === 'jpeg' ? { quality: 90 } : {}), omitBackground: omitBg });
  await p.close();
};
const svgImg = (svg, w, h) => `<div style="width:${w}px;height:${h}px">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div>`;
for (const [f, s] of [['assets/icons/icon-512.png', 512], ['assets/icons/icon-192.png', 192], ['assets/brand/png/logo-mark-512.png', 512], ['assets/brand/png/logo-mark-ar-512.png', 512], ['assets/icons/ar/icon-512.png', 512], ['assets/icons/ar/icon-192.png', 192]])
  await shot(svgImg(TILE(), s, s), s, s, f, { omitBg: true });
await shot(svgImg(MASKABLE, 512, 512), 512, 512, 'assets/icons/icon-maskable-512.png');
for (const f of ['assets/icons/apple-touch-icon.png', 'assets/icons/ar/apple-touch-icon.png'])
  await shot(`<div style="width:180px;height:180px;background:${INK}"><div style="padding:0">${svgImg(MASKABLE, 180, 180)}</div></div>`, 180, 180, f);
for (const s of [16, 32, 48]) await shot(svgImg(TILE(), s, s), s, s, `assets/icons/favicon-${s}.png`, { omitBg: true });
for (const [n, svg] of [['en-dark', wm(INK, '#7A5A0C')], ['en-white', wm('#fff', GOLD1)], ['ar-dark', wmAr(INK, '#7A5A0C')], ['ar-white', wmAr('#fff', GOLD1)]])
  await shot(svgImg(svg, 1560, 335), 1560, 335, `assets/brand/png/logo-wordmark-${n}.png`, { omitBg: true });

/* écrans de lancement iPhone / iPad */
const sizes = fs.readdirSync(path.join(ROOT, 'assets/splash')).map(f => f.match(/ios-(\d+)x(\d+)-(light|dark)/)).filter(Boolean);
for (const [, w, h, mode] of sizes) {
  const W_ = +w, H_ = +h, bg = mode === 'dark' ? INK : '#F5F4F1', ink = mode === 'dark' ? '#fff' : INK, sub = mode === 'dark' ? GOLD1 : '#7A5A0C';
  const m = Math.round(Math.min(W_, H_) * 0.26);
  const html = `<div style="position:relative;width:${W_}px;height:${H_}px;background:${bg};overflow:hidden;font-family:${FONT}">
    <div style="position:absolute;left:50%;top:44%;width:${m * 3.2}px;height:${m * 3.2}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(255,200,61,${mode === 'dark' ? .32 : .28}),transparent 70%)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:${m}px;height:${m}px;filter:drop-shadow(0 ${m * .1}px ${m * .22}px rgba(201,138,14,.5))">${svgImg(TILE(), m, m)}</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * .78}px);text-align:center;color:${ink};font-weight:800;font-size:${m * .27}px;letter-spacing:.02em">LIVE X</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * 1.12}px);text-align:center;color:${sub};font-weight:500;font-size:${m * .115}px;letter-spacing:.42em;padding-left:.42em">DIGITALE</div></div>`;
  await shot(html, W_, H_, `assets/splash/ios-${w}x${h}-${mode}.jpg`, { type: 'jpeg' });
}

/* images de partage 1200 × 630 */
const og = { en: ['Send money. Earn rewards.', 'Digital finance in your pocket — transfers, cards and more.'], fr: ['Envoyez de l\'argent. Gagnez des récompenses.', 'La finance digitale dans votre poche — transferts, cartes et plus.'], ar: ['أرسل الأموال. اربح المكافآت.', 'التمويل الرقمي في جيبك — تحويلات وبطاقات والمزيد.'] };
for (const [l, [t1, t2]] of Object.entries(og)) {
  const rtl = l === 'ar';
  await shot(`<div dir="${rtl ? 'rtl' : 'ltr'}" style="position:relative;width:1200px;height:630px;background:radial-gradient(60% 90% at 85% 10%,rgba(255,200,61,.30),transparent 60%),${INK};color:#fff;font-family:${rtl ? "'Noto Sans Arabic',Arial" : FONT}">
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:84px;width:128px;height:128px">${svgImg(TILE(), 128, 128)}</div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:250px;max-width:720px;font-size:${rtl ? 66 : 62}px;font-weight:800;line-height:1.12">${t1.replace(/\.$/, '')}<span style="color:${GOLD1}">.</span></div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:430px;max-width:700px;font-size:30px;line-height:1.4;color:#B9B4A6">${t2}</div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;bottom:70px;font-size:26px;font-weight:800;letter-spacing:.14em;color:${GOLD1}">LIVE X DIGITALE</div></div>`, 1200, 630, `assets/share/og-${l}.png`);
}
await b.close();
console.log('ok');
