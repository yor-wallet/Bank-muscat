"""Icônes adaptatives et écran de lancement Android, à partir du logo officiel (design/brand/sanad-symbole-512.png, assets/brand/sanad-s-320.png).
Usage : python3 scripts/dev/android-assets.py   (après `npx cap add android`). Réécrit uniquement des images sous android/app/src/main/res."""
import os, glob
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RES = os.path.join(ROOT, 'android/app/src/main/res')
SYM = Image.open(os.path.join(ROOT, 'design/brand/sanad-symbole-512.png')).convert('RGB')
TILE = Image.open(os.path.join(ROOT, 'assets/brand/sanad-s-320.png')).convert('RGBA')
BG = (243, 246, 250)
def fit(im, size):
    return im.resize((size, size), Image.LANCZOS)
dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for d, k in dens.items():
    base = os.path.join(RES, 'mipmap-' + d)
    # premier plan adaptatif : 108 dp, le symbole occupe ~62 % (zone sûre), fond blanc fondu avec le fond de l'icône
    fg = int(round(108 * k)); canvas = Image.new('RGB', (fg, fg), (255, 255, 255)); s = int(fg * 0.62)
    canvas.paste(fit(SYM, s), ((fg - s) // 2, (fg - s) // 2)); canvas.save(os.path.join(base, 'ic_launcher_foreground.png'))
    # icônes d'ancien format : carré arrondi, puis rond
    px = int(round(48 * k)); sq = Image.new('RGBA', (px, px), (0, 0, 0, 0)); m = Image.new('L', (px, px), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, px - 1, px - 1], radius=int(px * 0.22), fill=255)
    tile = Image.new('RGBA', (px, px), (255, 255, 255, 255)); tile.paste(fit(SYM, int(px * 0.82)).convert('RGBA'), (int(px * 0.09), int(px * 0.09)))
    sq.paste(tile, (0, 0), m); sq.save(os.path.join(base, 'ic_launcher.png'))
    mr = Image.new('L', (px, px), 0); ImageDraw.Draw(mr).ellipse([0, 0, px - 1, px - 1], fill=255)
    rd = Image.new('RGBA', (px, px), (0, 0, 0, 0)); t2 = Image.new('RGBA', (px, px), (255, 255, 255, 255)); t2.paste(fit(SYM, int(px * 0.74)).convert('RGBA'), (int(px * 0.13), int(px * 0.13))); rd.paste(t2, (0, 0), mr); rd.save(os.path.join(base, 'ic_launcher_round.png'))
# fond de l'icône adaptative : blanc
for f in glob.glob(os.path.join(RES, 'values', 'ic_launcher_background.xml')):
    open(f, 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n')
# écran de lancement : fond uni de l'application, logo au centre
for f in glob.glob(os.path.join(RES, 'drawable*', 'splash.png')):
    w, h = Image.open(f).size; im = Image.new('RGB', (w, h), BG); s = int(min(w, h) * 0.3); lg = TILE.resize((s, s), Image.LANCZOS)
    im.paste(lg, ((w - s) // 2, (h - s) // 2), lg); im.save(f)
print('ok')
