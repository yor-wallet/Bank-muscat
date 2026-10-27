"""Sanad Pay — transforme un texte en contours SVG (sans dépendre d'une police installée chez l'utilisateur).
Utilisé uniquement pour générer les mots-symboles (assets/brand/*.svg). Dépendances de développement : fonttools, brotli, uharfbuzz.
Usage (module) : from text2svg import outline"""
import io, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

def _load(path):
    f = TTFont(path)
    if path.endswith('.woff2'):
        buf = io.BytesIO(); f.flavor = None; f.save(buf); data = buf.getvalue(); f = TTFont(io.BytesIO(data))
    buf = io.BytesIO(); f.save(buf)
    return f, hb.Face(hb.Blob(buf.getvalue()))

def outline(text, font_path, size, rtl=False, features=None):
    """-> (path d, largeur, hauteur de ligne). Origine en haut à gauche, ligne de base à y = ascent."""
    f, face = _load(font_path)
    font = hb.Font(face)
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    if rtl: buf.direction = 'rtl'
    hb.shape(font, buf, features or {'kern': True, 'liga': True, 'calt': True})
    upem = f['head'].unitsPerEm; k = size / upem
    gs = f.getGlyphSet(); order = f.getGlyphOrder()
    asc = f['hhea'].ascent * k
    x = 0.0; parts = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
        tp = TransformPen(pen, (k, 0, 0, -k, x + pos.x_offset * k, asc - pos.y_offset * k))
        gs[name].draw(tp)
        d = pen.getCommands()
        if d: parts.append(d)
        x += pos.x_advance * k
    return ' '.join(parts), x, (f['hhea'].ascent - f['hhea'].descent) * k
