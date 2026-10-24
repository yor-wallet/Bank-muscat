/* Freindi Pay — génère tous les visuels de marque (SVG + PNG + ICO + écrans de lancement iOS + images de partage).
   Usage : node scripts/dev/brand-assets.mjs   (nécessite playwright + un Chromium ; Pillow pour favicon.ico : python3 -m pip install pillow)
   Les SVG sont écrits à la main ici : une seule source pour le monogramme.

   Identité : bleu bancaire. Le monogramme est un « F » dont la barre centrale est suivie d'un chevron
   vers l'avant : la lettre de Freindi, et le mouvement d'un paiement. Rien n'imite une autre marque. */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const W = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };

const SKY = '#38BDF8', BLUE = '#007AFF', BANK = '#0057D9', DEEP = '#003B8E', INK = '#14243A', PAPER = '#F5F9FF';
/* monogramme : « F » + chevron de paiement (extrémités rondes), centré dans 512 × 512 */
const GLYPH = (stroke, sw = 54) => `<g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M164 148V364"/><path d="M164 148H324"/><path d="M164 254H268"/><path d="M300 206L348 254L300 302"/></g>`;
const DEFS = `<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset=".5" stop-color="${BLUE}"/><stop offset="1" stop-color="${DEEP}"/></linearGradient></defs>`;
const TILE = (glyph = '#FFFFFF') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH(glyph)}</svg>`;
const TILE_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" rx="120" fill="#060D1A"/><rect x="6" y="6" width="500" height="500" rx="114" fill="none" stroke="url(#lg)" stroke-width="6" opacity=".85"/>${GLYPH('url(#lg)')}</svg>`;
const MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}<rect width="512" height="512" fill="url(#lg)"/><g transform="translate(76.8 76.8) scale(.7)">${GLYPH('#FFFFFF')}</g></svg>`;
/* marque seule, fond transparent (pour les en-têtes, les reçus et les e-mails) */
const MARK = (stroke = BANK) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${DEFS}${GLYPH(stroke)}</svg>`;
W('assets/brand/logo-mark.svg', TILE()); W('assets/brand/logo-mark-ar.svg', TILE()); W('assets/icons/icon.svg', TILE()); W('assets/brand/logo-mark-dark.svg', TILE_DARK);
W('assets/brand/mark-blue.svg', MARK(BANK)); W('assets/brand/mark-white.svg', MARK('#FFFFFF'));

const FONT = 'Inter,SF Pro Display,Helvetica,Arial,sans-serif';
const AFONT = 'Tajawal,IBM Plex Sans Arabic,Noto Sans Arabic,Geeza Pro,Arial,sans-serif';
const wm = (fill, sub, h = 120) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 ${h}">${DEFS}<g transform="scale(.2)"><rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH('#FFFFFF')}</g><text x="128" y="58" font-family="${FONT}" font-weight="800" font-size="52" letter-spacing="-.5" fill="${fill}">FREINDI</text><text x="130" y="94" font-family="${FONT}" font-weight="500" font-size="23" letter-spacing="13.5" fill="${sub}">PAY</text></svg>`;
const wmAr = (fill, sub) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120">${DEFS}<g transform="translate(458 0) scale(.2)"><rect width="512" height="512" rx="120" fill="url(#lg)"/>${GLYPH('#FFFFFF')}</g><text x="440" y="58" text-anchor="end" font-family="${AFONT}" font-weight="800" font-size="46" fill="${fill}">فريندي</text><text x="440" y="98" text-anchor="end" font-family="${AFONT}" font-weight="500" font-size="26" fill="${sub}">باي</text></svg>`;
W('assets/brand/logo-wordmark-dark.svg', wm(INK, BANK)); W('assets/brand/logo-wordmark-white.svg', wm('#FFFFFF', SKY));
W('assets/brand/logo-wordmark-ar-dark.svg', wmAr(INK, BANK)); W('assets/brand/logo-wordmark-ar-white.svg', wmAr('#FFFFFF', SKY));
/* mot-symbole des cartes (blanc, sans tuile) */
W('assets/brand/wordmark-white.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 64"><text x="0" y="40" font-family="${FONT}" font-weight="800" font-size="40" letter-spacing="-.5" textLength="180" lengthAdjust="spacingAndGlyphs" fill="#fff">FREINDI</text><text x="1" y="60" font-family="${FONT}" font-weight="500" font-size="15" letter-spacing="9" fill="#fff" fill-opacity=".82">PAY</text></svg>`);

/* ---------- rendu PNG / JPG ---------- */
const b = await chromium.launch({ executablePath: process.env.FP_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
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
  await shot(`<div style="width:180px;height:180px;background:${DEEP}"><div style="padding:0">${svgImg(MASKABLE, 180, 180)}</div></div>`, 180, 180, f);
for (const s of [16, 32, 48]) await shot(svgImg(TILE(), s, s), s, s, `assets/icons/favicon-${s}.png`, { omitBg: true });
for (const [n, svg] of [['en-dark', wm(INK, BANK)], ['en-white', wm('#fff', SKY)], ['ar-dark', wmAr(INK, BANK)], ['ar-white', wmAr('#fff', SKY)]])
  await shot(svgImg(svg, 1560, 335), 1560, 335, `assets/brand/png/logo-wordmark-${n}.png`, { omitBg: true });

/* écrans de lancement iPhone / iPad */
const sizes = fs.readdirSync(path.join(ROOT, 'assets/splash')).map(f => f.match(/ios-(\d+)x(\d+)-(light|dark)/)).filter(Boolean);
for (const [, w, h, mode] of sizes) {
  const W_ = +w, H_ = +h, bg = mode === 'dark' ? '#060D1A' : PAPER, ink = mode === 'dark' ? '#fff' : INK, sub = mode === 'dark' ? SKY : BANK;
  const m = Math.round(Math.min(W_, H_) * 0.26);
  const html = `<div style="position:relative;width:${W_}px;height:${H_}px;background:${bg};overflow:hidden;font-family:${FONT}">
    <div style="position:absolute;left:50%;top:44%;width:${m * 3.2}px;height:${m * 3.2}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(0,122,255,${mode === 'dark' ? .34 : .26}),transparent 70%)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:${m}px;height:${m}px;filter:drop-shadow(0 ${m * .1}px ${m * .22}px rgba(0,59,142,.5))">${svgImg(TILE(), m, m)}</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * .78}px);text-align:center;color:${ink};font-weight:800;font-size:${m * .27}px;letter-spacing:-.01em">FREINDI</div>
    <div style="position:absolute;left:0;right:0;top:calc(44% + ${m * 1.12}px);text-align:center;color:${sub};font-weight:500;font-size:${m * .115}px;letter-spacing:.56em;padding-left:.56em">PAY</div></div>`;
  await shot(html, W_, H_, `assets/splash/ios-${w}x${h}-${mode}.jpg`, { type: 'jpeg' });
}

/* images de partage 1200 × 630 */
const og = { en: ['Send money. Simply.', 'Transfers, accounts and cards — secure digital finance in your pocket.'], fr: ['Envoyez de l\'argent. Simplement.', 'Transferts, comptes et cartes — la finance digitale sécurisée dans votre poche.'], ar: ['أرسل الأموال ببساطة.', 'تحويلات وحسابات وبطاقات — تمويل رقمي آمن في جيبك.'] };
for (const [l, [t1, t2]] of Object.entries(og)) {
  const rtl = l === 'ar';
  await shot(`<div dir="${rtl ? 'rtl' : 'ltr'}" style="position:relative;width:1200px;height:630px;background:radial-gradient(60% 90% at 85% 10%,rgba(0,122,255,.38),transparent 60%),#060D1A;color:#fff;font-family:${rtl ? AFONT : FONT}">
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:84px;width:128px;height:128px">${svgImg(TILE(), 128, 128)}</div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:250px;max-width:720px;font-size:${rtl ? 66 : 62}px;font-weight:800;line-height:1.12">${t1.replace(/\.$/, '')}<span style="color:${SKY}">.</span></div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;top:430px;max-width:700px;font-size:30px;line-height:1.4;color:#9FB6D4">${t2}</div>
    <div style="position:absolute;${rtl ? 'right' : 'left'}:84px;bottom:70px;font-size:26px;font-weight:800;letter-spacing:.14em;color:${SKY}">FREINDI PAY</div></div>`, 1200, 630, `assets/share/og-${l}.png`);
}
await b.close();
console.log('ok');
