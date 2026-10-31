# Sanad Pay — préparation Android (Capacitor 8)

État au 31/10/2026. **Rien de ce qui suit n'est déclaré « fonctionnel » sans la preuve indiquée dans la colonne État.**

## Ce qui est en place (programmé)
| Élément | Fichier | État |
|---|---|---|
| Configuration Capacitor | `capacitor.config.json` (identifiant provisoire `com.sanadpay.app`, schéma `https`, page web = `dist/`) | programmé — **l'identifiant est à confirmer par le propriétaire avant toute publication (il ne se change plus ensuite sur le Play Store)** |
| Projet Android généré | `android/` (`npx cap add android`) | programmé |
| Sauvegarde système désactivée | `AndroidManifest.xml` : `allowBackup=false`, `fullBackupContent=false`, trafic non chiffré interdit | programmé |
| Clavier, orientation | `windowSoftInputMode=adjustResize`, portrait | programmé |
| Icônes adaptatives, rondes, écran de lancement | `scripts/dev/android-assets.py` (à partir du logo officiel) | programmé, images générées |
| Bouton Retour Android | `js/features/native.js` : ferme la feuille ouverte, revient en arrière, ne quitte que depuis l'accueil / l'entrée, jamais pendant un transfert | programmé — **non testé sur appareil** |
| Barre d'état suit le thème | `js/features/native.js` (plugin `@capacitor/status-bar`) | programmé — non testé sur appareil |
| Pas de service worker dans l'application | `js/boot.js` (les fichiers sont dans l'APK) | programmé |
| Zones système | `viewport-fit=cover` + variables `--safe-*` déjà utilisées par tout l'interface | programmé — non vérifié sur appareil |

## Commandes
```bash
npm install
npm run android:assets     # icônes et écran de lancement à partir du logo
npm run android:sync       # build du site + copie dans android/
cd android && ./gradlew assembleDebug      # APK de débogage (ANDROID_HOME doit pointer sur le SDK Android)
```
Pré-requis : JDK 21, SDK Android 36 (`platforms;android-36`, `build-tools;36.0.0`), licences acceptées.

## Ce qui n'est PAS fait
- **Aucun essai sur un appareil ou un émulateur** : le comportement réel (retour, clavier, zones système, WebView) reste à vérifier.
- **Signature de publication** (keystore), **Play Store** : non faits ; un APK de débogage n'est pas distribuable.
- **Notifications push Android** : demandent Firebase Cloud Messaging (clé fournisseur, `google-services.json`) : non configurées, donc non ajoutées. Les notifications dans l'application fonctionnent comme sur le web.
- **Face ID / biométrie** : la WebView Android ne garantit pas WebAuthn ; tant que ce n'est pas vérifié sur appareil, la confirmation d'un transfert se fait par le **code** (règle conservée : Face ID OU code, jamais les deux).
- **Stockage chiffré de la session** : la session Supabase reste dans le stockage privé de l'application (inaccessible aux autres applications, exclu des sauvegardes). Un coffre matériel (Keystore) demanderait un plugin supplémentaire : non ajouté.
- Permissions : seule `INTERNET` est déclarée. Les photos de vérification d'identité passent par le sélecteur de fichiers du système.
