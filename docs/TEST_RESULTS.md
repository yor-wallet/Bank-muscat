# TEST_RESULTS — Sanad Pay 21.0.0

Tout ce qui suit a été **exécuté** dans cette session (Chromium + Playwright, serveur Supabase simulé, **toute écriture refusée et journalisée**). Rien ici ne vaut test sur appareil réel ni en production. Commandes reproductibles depuis la racine (`npm i` puis build : `node scripts/build.mjs`).

## Résumé
| Banc | Commande | Résultat |
|---|---|---|
| Non-régression (inventaire vs 20.3.0) | `node tests/characterization/compare.mjs` | **15/15** — 85 écrans, 59 RPC, 13 tables, 4 fonctions serveur, 6 clés de stockage, configuration : identiques ; 0 symbole retiré ; 2 fichiers ajoutés (`sanad-engine.js`, `depth.js`) |
| Contrôles automatiques de l'interface | `node tests/ui/checks.mjs dist` | **19/19** (EN, FR, AR sur 24 écrans) : titre/`lang`/`dir`, aucun mot interdit visible (ancienne marque, « test », banque tierce), aucun défilement horizontal, aucune erreur console, aucune ressource locale en 4xx/5xx, manifeste (nom, #2596DE, #EAF8FF, icônes dont maskable), aucune requête vers un autre site pour les polices, images de lancement iOS déclarées |
| Face ID / code | `node tests/ui/faceid.mjs dist` | **8/8** avec authentificateur WebAuthn virtuel (voir détail) |
| SanadEngine | `node tests/ui/engine.mjs dist` | **7/7** |
| Captures (iPhone 390, SE 320, Android 412, tablette 820 ; EN/FR/AR) | `node tests/ui/capture.mjs dist <sortie>` | 42 captures, **0 défilement horizontal, 0 erreur** |
| Parcours d'envoi piloté par l'état | `node tests/ui/flow.mjs dist <sortie> en` | exécuté jusqu'au bout : saisie du numéro → montant → confirmation → glissement → code → traitement → **échec réel** (le serveur simulé refuse l'écriture) ; aucun succès simulé |
| Ouverture (3 cas) | `node tests/ui/opening.mjs dist <sortie>` | pellicules dans `docs/screenshots/opening/` : 1ʳᵉ ouverture, suivantes, mouvement réduit |
| Performance | `node tests/perf/measure.mjs dist docs/perf-after.json 3` | tableau ci-dessous |

## Détail — Face ID / code (`tests/ui/faceid.mjs`)
- C — appareil sans Face ID : l'écran du **code** s'ouvre — OK.
- Face ID activé après la saisie du code (clé WebAuthn créée par l'invite système directe, sans feuille intermédiaire) — OK ; le code est rangé dans le coffre — OK.
- A — Face ID activé, coffre prêt : le transfert part **sans aucun écran de code** ; la demande `fiat_send_external` atteint le serveur (refusée par le banc) — OK.
- B — coffre vidé : **le code seul** est demandé (jamais Face ID + code), puis le coffre est rempli pour que la fois suivante soit Face ID seul — OK.
- **Limite** : authentificateur logiciel de Chromium, pas le Face ID d'un iPhone ; le comportement sous Safari/iOS n'est pas éprouvé.

## Détail — SanadEngine (`tests/ui/engine.mjs`)
Défini ; `data-sx-tab` suit la route ; passage en arrière-plan → état d'interface enregistré (`sanad_ui_<uid>`) ; retour → aucun écran vidé ; **aucune écriture nouvelle** (seuls les 2 POST d'enregistrement appareil/session existant déjà en 20.3.0, constatés sur la version d'origine) ; rechargement → l'onglet « Historique » est restauré ; aucune erreur console.

## Performance (banc : iPhone 390×844 @2×, CPU ×4 plus lent, 1,6 Mbit/s, 150 ms RTT, gzip, 3 passes, médiane — service worker bloqué, données simulées)
| Écran | FCP ms (avant → après) | LCP ms | CLS | TBT ms | INP ms | Poids transféré (Ko) |
|---|---|---|---|---|---|---|
| Connexion (démarrage à froid) | 2116 → 1684 | — → 2868 | 0 → 0 | 143 → 79 | 88 → 96 | JS 369.2 → 364.9 · CSS 85.8 → 55.1 · polices 71.8 → 47.3 |
| Accueil (session ouverte, code saisi) | 2120 → 1684 | 3636 → 2868 | 0 → 0 | 122 → 123 | 80 → 88 | JS 369.2 → 364.9 · CSS 85.8 → 55.1 · polices 71.8 → 47.3 |

Lecture honnête : INP (< 200 ms) et CLS (< 0,1) sont dans les objectifs ; **le LCP reste au-dessus de 2,5 s sous ce profil volontairement sévère** (avant : 3636 ms, après : 2868 ms, −21 %). Gains : première image de l'ouverture dessinée par un script en ligne, CSS transféré 85,8 → 55,1 Ko, polices 71,8 → 47,3 Ko. Le JS (≈ 365 Ko transférés) est inchangé et domine. Lighthouse officiel **non exécuté**.

## Échecs rencontrés pendant le travail (et corrigés)
- Écran Profil planté (`kycOf is not defined`) après un remplacement trop large → fonctions restaurées.
- `normId` perdait un préfixe hérité après le renommage → liste d'alternatives rétablie.
- Pastilles « en cours / échec » teintées sur toute la ligne → règle restreinte à `.st.st-*`.
- Collision de classe `.sx-to` entre carte destinataire et ancien écran de traitement → renommée.
- Première version de `faceid.mjs` : faux échec (scénario non naturel, puis domaine `127.0.0.1` refusé par WebAuthn) → banc corrigé (`localhost`).
- Régression de performance transitoire (FCP 2768 ms) due au retrait du splash en ligne → première image rétablie en ligne (FCP 1684 ms).
- Mot « Friendly » trouvé dans un nom de carte par défaut arabe (`js/features/v12.js`) par le rapport de marque, absent des captures → corrigé.
- Initiale « F » restée dans le reçu exporté (`receipt-export.js`) → remplacée par le sigle du pack.

## Non vérifié / hors périmètre
Safari/WebKit et appareils réels ; installation PWA et notifications push réelles ; envoi réel de SMS/e-mail (aucun envoi n'est fait par ce projet côté client et rien n'a été envoyé) ; déploiement des fonctions Edge ; PDF exporté ouvert dans un lecteur ; écrans crypto/administration (hérités, non repris visuellement) ; Lighthouse ; Figma.
