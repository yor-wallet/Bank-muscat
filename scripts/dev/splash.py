"""Sanad Pay — images de démarrage iOS : le dégradé EXACT de la première image de la séquence d'ouverture (#splash dans css/s-screens.css),
sans logo ni texte, pour que le passage de l'image système à l'ouverture animée soit invisible. Usage : python3 scripts/dev/splash.py"""
import glob, re
from PIL import Image
LIGHT = [(0, (0xEA, 0xF8, 0xFF)), (.55, (0xDD, 0xEF, 0xFF)), (1, (0xD9, 0xEB, 0xFF))]
DARK = [(0, (0x0F, 0x2A, 0x4A)), (.55, (0x10, 0x2C, 0x4C)), (1, (0x0B, 0x21, 0x40))]
def at(stops, t):
    for a, b in zip(stops, stops[1:]):
        if a[0] <= t <= b[0]:
            u = (t - a[0]) / (b[0] - a[0]); return tuple(round(a[1][k] + (b[1][k] - a[1][k]) * u) for k in range(3))
for f in sorted(glob.glob('assets/splash/ios-*.jpg')):
    m = re.search(r'ios-(\d+)x(\d+)-(light|dark)', f); w, h, th = int(m[1]), int(m[2]), m[3]
    col = Image.new('RGB', (1, h)); col.putdata([at(LIGHT if th == 'light' else DARK, y / (h - 1)) for y in range(h)])
    col.resize((w, h)).save(f, quality=90, optimize=True)
