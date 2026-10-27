"""Sanad Pay — génère les SVG de marque de l'application à partir du PACK DE MARQUE livré (logo/svg/*.svg).
Le logo n'est PAS redessiné : le carré arrondi dégradé + la coche + le trait viennent tels quels du pack.
Seuls les mots-symboles (marque + texte « Sanad Pay » / « سند باي », texte converti en contours) sont composés ici.
Usage : python3 scripts/dev/sanad-assets.py <dossier-du-pack-extrait>"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from text2svg import outline

pack = sys.argv[1]
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
rd = lambda p: open(os.path.join(pack, p), encoding='utf8').read().strip()
wr = lambda p, s: (os.makedirs(os.path.dirname(os.path.join(root, p)), exist_ok=True), open(os.path.join(root, p), 'w', encoding='utf8').write(s.strip() + '\n'))

MARK = rd('logo/svg/sanad-pay-mark.svg')            # carré arrondi dégradé ciel + coche blanche + trait clair (256 x 256)
SYMBOL = rd('logo/svg/sanad-pay-symbol-transparent.svg')
INK, WHITE = '#102C4C', '#FFFFFF'
INTER = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
TAJ = os.path.join(root, 'assets/fonts/tajawal-arabic-800.woff2')

def inner(svg):  # contenu sans la balise <svg> englobante
    return re.sub(r'^<svg[^>]*>|</svg>$', '', svg).strip()

# marque seule (mêmes fichiers que ceux référencés par l'application)
for p in ('assets/brand/logo-mark.svg', 'assets/brand/logo-mark-ar.svg', 'assets/brand/logo-mark-dark.svg', 'assets/icons/icon.svg'):
    wr(p, MARK)
wr('assets/brand/mark-blue.svg', SYMBOL)
wr('assets/brand/mark-white.svg', SYMBOL.replace('#2596DE', '#FFFFFF').replace('#7ED8F6', '#DBF7FF'))

def wordmark(text, font, color, rtl, name):
    H = 120
    d, w, _ = outline(text, font, 56, rtl=rtl)
    gap = 18; ms = 104; pad = 8
    W = pad + ms + gap + w + pad
    ty = (H - 56 * (1.21 if not rtl else 1.0)) / 2 + (0 if not rtl else 6)
    mark = f'<g transform="translate({pad if not rtl else W - pad - ms} 8) scale({ms/256:.5f})">{inner(MARK)}</g>'
    tx = pad + ms + gap if not rtl else pad
    txt = f'<path transform="translate({tx:.2f} {ty:.2f})" fill="{color}" d="{d}"/>'
    wr(name, f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H}" width="{W:.0f}" height="{H}" role="img" aria-label="{text}">{mark}{txt}</svg>')

wordmark('Sanad Pay', INTER, INK, False, 'assets/brand/logo-wordmark-dark.svg')
wordmark('Sanad Pay', INTER, WHITE, False, 'assets/brand/logo-wordmark-white.svg')
wordmark('سند باي', TAJ, INK, True, 'assets/brand/logo-wordmark-ar-dark.svg')
wordmark('سند باي', TAJ, WHITE, True, 'assets/brand/logo-wordmark-ar-white.svg')

# texte seul, blanc (utilisé sur le dos des cartes : <img class="rv-wm">)
d, w, h = outline('Sanad Pay', INTER, 40)
wr('assets/brand/wordmark-white.svg', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w+4:.0f} 64" width="{w+4:.0f}" height="64" role="img" aria-label="Sanad Pay"><path transform="translate(0 {(64-40*1.21)/2:.2f})" fill="#fff" d="{d}"/></svg>')
print('SVG de marque écrits')
