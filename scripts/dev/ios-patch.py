"""Barq — réglages iOS appliqués après `npx cap add ios` : icône 1024 (carré plein), écran de lancement (fond uni + logo), Info.plist (iPhone en portrait, chiffrement standard).
Usage : node scripts/dev/barq-assets.mjs && python3 scripts/dev/ios-patch.py. Ne compile rien : un IPA exige macOS + Xcode (voir docs/IOS.md)."""
import os, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
I = lambda *p: os.path.join(ROOT, 'ios', 'App', *p)
icon = Image.open(os.path.join(ROOT, 'design/barq/barq-icon-1024.png')).convert('RGB'); icon.save(I('App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'))
mark = Image.open(os.path.join(ROOT, 'assets/brand/barq-mark-512.png')).convert('RGBA')
for f in os.listdir(I('App/Assets.xcassets/Splash.imageset')):
    if f.endswith('.png'):
        w = 2732; im = Image.new('RGB', (w, w), (243, 246, 250)); s = int(w * .17); lg = mark.resize((s, s), Image.LANCZOS); im.paste(lg, ((w - s) // 2, (w - s) // 2), lg); im.save(I('App/Assets.xcassets/Splash.imageset', f))
pl = open(I('App/Info.plist')).read()
pl = pl.replace('<string>armv7</string>', '<string>arm64</string>')
# iPhone : portrait seulement (l'iPad garde ses orientations)
pl = re.sub(r'(<key>UISupportedInterfaceOrientations</key>\s*<array>)\s*<string>UIInterfaceOrientationPortrait</string>\s*<string>UIInterfaceOrientationLandscapeLeft</string>\s*<string>UIInterfaceOrientationLandscapeRight</string>', r'\1\n\t\t<string>UIInterfaceOrientationPortrait</string>', pl, count=1)
if 'ITSAppUsesNonExemptEncryption' not in pl: pl = pl.replace('</dict>\n</plist>', '\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n</dict>\n</plist>')
open(I('App/Info.plist'), 'w').write(pl)
print('ios patché')
