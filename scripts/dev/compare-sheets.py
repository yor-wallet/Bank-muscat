"""Sanad Pay — planches « avant | après » : même écran, même largeur, Freindi Pay 20.3.0 à gauche, Sanad Pay 21.0.0 à droite.
Usage : python3 scripts/dev/compare-sheets.py <dossier-captures-après-png>   (avant : docs/screenshots/before/*.webp ; sorties : docs/screenshots/after/*.webp et docs/screenshots/compare/*.webp)"""
import sys, os, glob
from PIL import Image, ImageDraw
src = sys.argv[1]; R = os.path.join(os.path.dirname(__file__), '..', '..')
bef, aft, cmp_ = (os.path.join(R, 'docs/screenshots', d) for d in ('before', 'after', 'compare'))
os.makedirs(aft, exist_ok=True); os.makedirs(cmp_, exist_ok=True)
H = 1000
def fit(im): return im.convert('RGB').resize((int(im.width * H / im.height), H))
n = 0
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    name = os.path.basename(f)[:-4]
    a = Image.open(f); a.convert('RGB').save(os.path.join(aft, name + '.webp'), quality=82)
    bf = os.path.join(bef, name + '.webp')
    if not os.path.exists(bf): continue
    b = fit(Image.open(bf)); a2 = fit(a); gap = 24; top = 44
    sheet = Image.new('RGB', (b.width + a2.width + gap, H + top), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    sheet.paste(b, (0, top)); sheet.paste(a2, (b.width + gap, top))
    d.text((12, 14), 'Freindi Pay 20.3.0 (avant)  —  ' + name, fill=(90, 90, 90)); d.text((b.width + gap + 12, 14), 'Sanad Pay 21.0.0 (après)', fill=(19, 79, 145))
    sheet.save(os.path.join(cmp_, name + '.webp'), quality=80); n += 1
print(n, 'planches')
