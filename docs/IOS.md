# Barq sur iPhone

État au 01/11/2026. Deux voies, avec ce qui est réellement fait et ce qui ne peut pas l'être ici.

## 1. Application web installée (PWA) — utilisable dès maintenant
Barq s'ouvre dans Safari et s'installe sur l'écran d'accueil : **Partager → « Sur l'écran d'accueil »**. Elle se lance alors en plein écran, avec sa propre icône, comme une application. L'application affiche elle-même ces trois étapes sur iPhone (carte « Installer », aussi dans Réglages → Application).
Ce qui est en place (programmé) :
- icône d'écran d'accueil (`apple-touch-icon`, carré plein), nom « Barq », mode plein écran, barre d'état claire ;
- **écrans de lancement pour 24 tailles d'iPhone et d'iPad**, clair et sombre, de la même couleur que le fond de l'application (le passage au premier écran est invisible) ;
- zones sûres (encoche, île dynamique, barre d'accueil) appliquées aux barres fixes ;
- champs à 16 px minimum sur iPhone (Safari ne zoome plus la page quand on tape) ;
- pas de sélection ni de menu contextuel sur les boutons, pas de zoom par double toucher ;
- confirmation d'un transfert par **Face ID ou code, jamais les deux** (Face ID via WebAuthn, iOS 16 ou plus, application installée) ;
- notifications : iOS 16.4 ou plus, application installée, fournisseur configuré (inchangé).

Vérifié (banc Chromium, émulation iPhone) : aucun débordement horizontal ni erreur sur les 83 écrans à 375, 320 et 430 px. **Non vérifié : un vrai iPhone / Safari / WebKit** (non disponibles dans cet environnement).

## 2. Application native (App Store) — projet préparé, non compilé
`ios/` contient le projet Xcode généré par Capacitor 8 (`npx cap add ios`) : nom « Barq », icône 1024 (carré plein, sans transparence), écran de lancement uni + logo, iPhone en portrait, `ITSAppUsesNonExemptEncryption=false`.
**Aucun fichier IPA n'a été produit** : compiler pour iPhone exige un Mac avec Xcode et un compte Apple Developer, ce qui n'existe pas ici. Pour le faire sur un Mac :
```bash
npm install
node scripts/dev/barq-assets.mjs && python3 scripts/dev/ios-patch.py   # images et Info.plist
npm run build && npx cap sync ios
npx cap open ios                                                        # puis Signing & Capabilities → votre équipe → Run
```
À décider avant publication : identifiant d'application `com.barq.app` (provisoire), équipe de signature, fiche App Store, notifications push natives (APNs, non configurées).
