# Barq — préparation Android (Capacitor 8)

État au 01/11/2026. **Rien de ce qui suit n'est déclaré « fonctionnel » sans la preuve indiquée.**

## Résultat du build (réel)
- **Compilé : oui.** `./gradlew assembleDebug` → `BUILD SUCCESSFUL` (JDK 21, SDK Android 36, Gradle 8.14.3, plugin Android 8.13). APK de **débogage** : `deliverables/barq-22.0.0-debug.apk` (≈ 8 Mo, SHA-256 `51defd7fad09d1044e60d150665890ff9084e03b29c850a1989a2d4b517be165`).
- Contenu vérifié avec `aapt2` : paquet `com.barq.app`, nom « Barq », version `22.0.0` (code 220000), `targetSdk` 36, **seule permission : `INTERNET`** ; le site Barq est dans l'APK (`assets/public/`).
- **Testé : non.** L'APK n'a été ni installé ni lancé (ni appareil, ni émulateur ici). **Ne pas le déclarer fonctionnel avant un essai sur appareil.** Il n'est pas signé pour publication.
- Reproductible : `npx cap add android`, puis `python3 scripts/dev/android-patch.py`, puis `npm run android:sync`, puis `cd android && ./gradlew assembleDebug` (`ANDROID_HOME` doit pointer sur le SDK).

## Ce qui est en place (programmé)
| Élément | Fichier | État |
|---|---|---|
| Configuration Capacitor | `capacitor.config.json` (identifiant provisoire `com.barq.app`, schéma `https`, page web = `dist/`) | programmé — **identifiant à confirmer avant toute publication (il ne se change plus ensuite sur le Play Store)** |
| Projet Android | `android/` (généré, puis `scripts/dev/android-patch.py`) | programmé, compilé |
| Sauvegarde système désactivée, trafic non chiffré interdit | `AndroidManifest.xml` | programmé |
| Clavier, orientation | `windowSoftInputMode=adjustResize`, portrait | programmé |
| Icônes adaptatives (éclair blanc sur fond bleu électrique), icônes rondes, écran de lancement | `scripts/dev/android-assets.py` | programmé, images générées |
| Bouton Retour Android | `js/features/native.js` : ferme la feuille ouverte, revient en arrière, ne quitte que depuis l'accueil / l'entrée, jamais pendant un transfert | programmé — **non testé sur appareil** |
| Barre d'état suit le thème | `js/features/native.js` | programmé — non testé sur appareil |
| Pas de service worker dans l'application | `js/boot.js` | programmé |
| Zones système | `viewport-fit=cover` + variables `--safe-*` | programmé — non vérifié sur appareil |

## Ce qui n'est PAS fait
- **Aucun essai sur appareil ou émulateur.**
- **Signature de publication** (keystore) et **Play Store** : non faits ; un APK de débogage n'est pas distribuable.
- **Notifications push Android** : demandent Firebase Cloud Messaging (clé fournisseur, `google-services.json`) : non configurées, donc non ajoutées. Les notifications dans l'application fonctionnent comme sur le web.
- **Face ID / biométrie** : la WebView Android ne garantit pas WebAuthn ; tant que ce n'est pas vérifié sur appareil, la confirmation d'un transfert se fait par le **code** (règle conservée : Face ID OU code, jamais les deux).
- **Stockage chiffré de la session** : la session reste dans le stockage privé de l'application (inaccessible aux autres applications, exclu des sauvegardes). Un coffre matériel demanderait un plugin supplémentaire : non ajouté.
- Permissions : seule `INTERNET`. Les photos de vérification d'identité passent par le sélecteur de fichiers du système.
