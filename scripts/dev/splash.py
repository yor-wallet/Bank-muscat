"""Sanad Pay — images de démarrage iOS : l'aurore EXACTE de la première image de la séquence d'ouverture (#splash dans css/s-glass.css),
sans logo ni texte, pour que le passage de l'image système à l'ouverture animée soit invisible. Usage : python3 scripts/dev/splash.py"""
import glob, re
import numpy as np
from PIL import Image
# (cx %, cy %, rx % de la largeur, ry % de la hauteur, (r,g,b), alpha au centre) — mêmes valeurs que --aurora-l / --aurora-d
LIGHT = dict(base=(0xE7, 0xEF, 0xF8), blobs=[(8, -2, 62, 38, (126, 216, 246), .85), (104, 12, 58, 36, (37, 150, 222), .34), (-6, 104, 70, 42, (56, 185, 190), .30), (106, 96, 60, 40, (19, 79, 145), .20)])
DARK = dict(base=(0x05, 0x0E, 0x1B), blobs=[(6, -4, 60, 36, (37, 150, 222), .55), (104, 14, 56, 34, (56, 185, 190), .30), (-8, 104, 70, 44, (19, 79, 145), .65), (106, 98, 60, 40, (126, 216, 246), .16)])
def render(spec, w, h):
    sw, sh = max(8, w // 6), max(8, h // 6)
    ys, xs = np.mgrid[0:sh, 0:sw]
    X, Y = (xs + .5) / sw * 100, (ys + .5) / sh * 100
    img = np.ones((sh, sw, 3)) * np.array(spec['base'], float)
    for cx, cy, rx, ry, col, a in spec['blobs']:      # les dégradés CSS se superposent dans l'ordre : le premier est au-dessus
        pass
    for cx, cy, rx, ry, col, a in reversed(spec['blobs']):
        d = np.sqrt(((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2)
        alpha = np.clip(1 - d / .72, 0, 1) * a
        img = img * (1 - alpha[..., None]) + np.array(col, float) * alpha[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype('uint8')).resize((w, h), Image.BICUBIC)
for f in sorted(glob.glob('assets/splash/ios-*.jpg')):
    m = re.search(r'ios-(\d+)x(\d+)-(light|dark)', f); w, h, th = int(m[1]), int(m[2]), m[3]
    render(LIGHT if th == 'light' else DARK, w, h).save(f, quality=92, optimize=True)
