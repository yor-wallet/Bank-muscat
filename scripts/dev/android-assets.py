"""Barq — icônes adaptatives et écran de lancement Android, à partir du logo (design/barq/barq-mark.svg rendu par scripts/dev/barq-assets.mjs).
Usage : node scripts/dev/barq-assets.mjs && python3 scripts/dev/android-assets.py   (après `npx cap add android`). Réécrit uniquement des images sous android/app/src/main/res."""
import os, glob
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RES = os.path.join(ROOT, 'android/app/src/main/res')
MARK = Image.open(os.path.join(ROOT, 'assets/brand/barq-mark-512.png')).convert('RGBA')
BOLT = Image.open(os.path.join(ROOT, 'design/barq/barq-bolt-white-512.png')).convert('RGBA')
BG = (243, 246, 250)
def fit(im, size): return im.resize((size, size), Image.LANCZOS)
dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for d, k in dens.items():
    base = os.path.join(RES, 'mipmap-' + d)
    # premier plan adaptatif : l'éclair blanc (108 dp, ~58 % = zone sûre) sur transparent ; le fond adaptatif est le bleu Barq
    fg = int(round(108 * k)); canvas = Image.new('RGBA', (fg, fg), (0, 0, 0, 0)); s = int(fg * 0.58)
    canvas.paste(fit(BOLT, s), ((fg - s) // 2, (fg - s) // 2), fit(BOLT, s)); canvas.save(os.path.join(base, 'ic_launcher_foreground.png'))
    px = int(round(48 * k)); sq = fit(MARK, px); sq.save(os.path.join(base, 'ic_launcher.png'))
    mr = Image.new('L', (px, px), 0); ImageDraw.Draw(mr).ellipse([0, 0, px - 1, px - 1], fill=255)
    rd = Image.new('RGBA', (px, px), (0, 0, 0, 0)); sq2 = Image.new('RGBA', (px, px), (31, 79, 216, 255)); b2 = fit(BOLT, int(px * .62)); sq2.paste(b2, ((px - b2.width) // 2, (px - b2.height) // 2), b2); rd.paste(sq2, (0, 0), mr); rd.save(os.path.join(base, 'ic_launcher_round.png'))
# fond de l'icône adaptative : bleu électrique Barq
for f in glob.glob(os.path.join(RES, 'values', 'ic_launcher_background.xml')):
    open(f, 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1F4FD8</color>\n</resources>\n')
# écran de lancement : fond uni de l'application, logo au centre
for f in glob.glob(os.path.join(RES, 'drawable*', 'splash.png')):
    w, h = Image.open(f).size; im = Image.new('RGB', (w, h), BG); s = int(min(w, h) * 0.3); lg = MARK.resize((s, s), Image.LANCZOS)
    im.paste(lg, ((w - s) // 2, (h - s) // 2), lg); im.save(f)
print('ok')
