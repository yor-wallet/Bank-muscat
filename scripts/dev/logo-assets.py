#!/usr/bin/env python3
"""Sanad Pay — déclinaisons du logo officiel (ruban « S »), à partir des sources de design/brand/.
Usage : python3 scripts/dev/logo-assets.py    (puis  ONLY=og node scripts/dev/sanad-rasters.mjs  pour les images de partage)
Le logo n'est jamais redessiné : seulement mis à l'échelle. Fond blanc d'origine conservé (le logo est posé sur une plaquette arrondie dans l'interface)."""
import base64, io, os
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
R = lambda *p: os.path.join(ROOT, *p)
sym = Image.open(R('design/brand/sanad-symbole-512.png')).convert('RGB')
full = Image.open(R('design/brand/sanad-logo-officiel-1536.jpg')).convert('RGB')
def save(im, path, **kw):
    os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, optimize=True, **kw)
def quant(im): return im.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
def pad(im, scale, size):
    c = Image.new('RGB', (size, size), (255, 255, 255)); s = int(size * scale)
    c.paste(im.resize((s, s), Image.LANCZOS), ((size - s) // 2, (size - s) // 2)); return c
rs = lambda n: sym.resize((n, n), Image.LANCZOS)
# marque dans l'application (palette 256 couleurs : 16 à 36 Ko)
for n in (192, 320): save(quant(rs(n)), R(f'assets/brand/sanad-s-{n}.png'))
save(full.resize((768, 768), Image.LANCZOS), R('assets/brand/sanad-s-full.jpg'), quality=88)
# icônes d'application
for d in ('assets/icons', 'assets/icons/ar'):
    save(rs(512), R(d, 'icon-512.png')); save(rs(192), R(d, 'icon-192.png')); save(rs(180), R(d, 'apple-touch-icon.png'))
save(pad(sym, .74, 512), R('assets/icons/icon-maskable-512.png'))
for s in (16, 32, 48): save(rs(s), R(f'assets/icons/favicon-{s}.png'))
for f in ('logo-mark-512.png', 'logo-mark-ar-512.png'): save(rs(512), R('assets/brand/png', f))
b = io.BytesIO(); rs(128).save(b, 'PNG', optimize=True)
open(R('assets/icons/icon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><image width="128" height="128" href="data:image/png;base64,' + base64.b64encode(b.getvalue()).decode() + '"/></svg>')
rs(48).save(R('favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('logo officiel décliné')
