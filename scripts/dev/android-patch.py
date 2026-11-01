"""Barq — réglages Android appliqués après `npx cap add android` (manifeste durci, version, icônes). Usage : python3 scripts/dev/android-patch.py"""
import os, re, subprocess, sys, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
A = lambda *p: os.path.join(ROOT, 'android', *p)
pkg = json.load(open(os.path.join(ROOT, 'package.json')))
ver = pkg['version']; maj, mi, pa = (int(x) for x in ver.split('.'))
m = open(A('app/src/main/AndroidManifest.xml')).read()
m = m.replace('android:allowBackup="true"', 'android:allowBackup="false"\n        android:fullBackupContent="false"\n        android:usesCleartextTraffic="false"') if 'allowBackup="false"' not in m else m
if 'windowSoftInputMode' not in m: m = m.replace('android:launchMode="singleTask"', 'android:launchMode="singleTask"\n            android:windowSoftInputMode="adjustResize"\n            android:screenOrientation="portrait"')
open(A('app/src/main/AndroidManifest.xml'), 'w').write(m)
g = open(A('app/build.gradle')).read()
g = re.sub(r'versionCode \d+', 'versionCode %d' % (maj * 10000 + mi * 100 + pa), g); g = re.sub(r'versionName "[^"]*"', 'versionName "%s"' % ver, g)
open(A('app/build.gradle'), 'w').write(g)
sdk = os.environ.get('ANDROID_HOME') or os.path.expanduser('~/android-sdk')
if os.path.isdir(sdk): open(A('local.properties'), 'w').write('sdk.dir=%s\n' % sdk)
subprocess.run([sys.executable, os.path.join(ROOT, 'scripts/dev/android-assets.py')], check=True)
print('android patché', ver)
