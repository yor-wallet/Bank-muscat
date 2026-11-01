# STATUT — Barq 22.0.0 (01/11/2026)

> Les blocs plus bas décrivent les versions précédentes (Sanad Pay 21.2 et 21.3) ; celui-ci les met à jour pour **Barq 22.0.0**.

## Résultats exécutés sur le build 22.0.0
| Contrôle | Résultat |
|---|---|
| `npm run build` | OK — cache `fp-shell-v22.0.0-…` |
| `npm run test:agents` | 24/24 |
| Interface EN/FR/AR (`checks`, mot « Sanad / سند » désormais interdit à l'écran) | 19/19 |
| SanadEngine · Face ID ou code | 7/7 · 8/8 |
| Mouvement | 28/28 |
| Amal · agents · nettoyage · site | 16/16 · 8/8 · 4/4 · 10/10 |
| `@keyframes` sans définition | 0 (172) |
| Non-régression métier vs 20.3.0 | **0 échec** |
| Balayage des 83 écrans à 320, 375 et 430 px (430 en arabe) | aucun débordement horizontal, aucune erreur |
| Android `assembleDebug` | BUILD SUCCESSFUL — APK `deliverables/barq-22.0.0-debug.apk`, **non lancé** |

## État
| Domaine | Programmé | Testé | Déployé |
|---|---|---|---|
| Nom Barq / برق, logo éclair, palette, préfixe `BQ-` | oui | oui (captures, contrôles) | voir « Publication » |
| iPhone : PWA durcie, écrans de lancement, projet Xcode | oui | émulation Chromium seulement | PWA : avec le site ; **IPA : non produit (pas de Mac)** |
| Android | oui | compilé, non lancé | non |
| Figma | planche des jetons (version précédente) | — | — |

## À savoir / non fait
1. **Aucun test sur un vrai iPhone ni Safari.** Le projet Xcode est préparé (`docs/IOS.md`) mais non compilé.
2. E-mails et notifications **déjà déployés** côté Supabase : ancien nom tant que `send-email` et `push-send` ne sont pas redéployés ; nom d'expéditeur des SMS : réglage chez le fournisseur.
3. Adresse web, nom du projet Vercel / du dépôt : inchangés.
4. La migration `sanad_agent_log` n'est toujours pas appliquée, `sanad-agents` toujours pas déployée.
5. Groupe « Croissance » du menu Services toujours masqué (erreur d'index du code d'origine) : décision du propriétaire en attente.
6. Identifiants d'application `com.barq.app` (Android et iOS) provisoires.

---

# STATUT — Sanad Pay 21.3.0 (mise à jour du 31/10/2026)

> Les sections numérotées plus bas décrivent 21.2.0 ; ce bloc les met à jour pour 21.3.0 (« une banque, pas un jeu »).

## Production et publication
- **Production : 21.2.0** (fusionnée dans `main` le 28/10, déploiement Vercel prêt). **21.3.0 n'est PAS en production** : elle est sur la branche `claude/zealous-darwin-ojhlbt` (aperçu Vercel de branche). Publication seulement sur demande explicite.
- **Supabase** : la migration `sanad_agent_log` n'a **pas** été appliquée (la demande de confirmation côté Supabase est restée sans réponse) ; la fonction `sanad-agents` n'est **pas** déployée. Inchangé depuis la 21.2.0.

## Résultats exécutés sur le build 21.3.0 (31/10/2026)
| Contrôle | Résultat |
|---|---|
| `npm run build` | OK — cache `fp-shell-v21.3.0-…` |
| `npm run test:agents` | 24/24 |
| Interface EN/FR/AR (`checks`) | 19/19 |
| SanadEngine / Face ID ou code | 7/7 · 8/8 |
| Mouvement (`motion`, mis à jour : accueil, ligne de navigation, carte immobile) | 28/28 |
| Amal / agents / nettoyage / site | 16/16 · 8/8 · 4/4 · 10/10 |
| `@keyframes` appelés mais absents | 0 (172 vérifiés) |
| Non-régression métier vs 20.3.0 (`compare.mjs`) | **0 échec** |
| Android : `./gradlew assembleDebug` | **BUILD SUCCESSFUL** (APK de débogage, `deliverables/sanad-pay-21.3.0-debug.apk`) — **non lancé sur appareil** |

## Tableau d'état 21.3.0
| Domaine | Programmé | Testé | Connecté | Déployé |
|---|---|---|---|---|
| Sobriété (sons discrets, plus de confettis / pièces / compteurs / rebonds) | oui | oui (contrôles + captures) | n/a | non |
| Surfaces pleines, nouveaux boutons, navigation à ligne d'horizon | oui | oui | n/a | non |
| Accueil, réglages par catégories, services + section internationale, notifications filtrées, progression du transfert (anneau), présentation | oui | oui (captures, `motion`, `proc-frames`) | données simulées | non |
| Écrans « restylés » (voir `docs/METAMORPHOSE.md` §2) | oui | captures | données simulées | non |
| Android (Capacitor 8) | oui | compilé ; **non lancé** | non | non |
| Figma | jetons seulement | — | — | — |

## À décider / non fait (nouveautés 21.3.0)
1. **Groupe « Croissance » du menu Services** (Boost, vérification d'identité, retrait, crédit, chat, Amal, cinéma) : masqué par le code d'origine (décalage d'index). Non affiché sans votre accord (`GROW_IN_MENU` dans `js/screens/crypto-market.js`).
2. « Échanger » absent (section crypto désactivée) ; quatrième action = « Plus ».
3. Écrans seulement restylés, pas recomposés : voir `docs/METAMORPHOSE.md` §2.
4. Figma : composants et écrans non construits (quota d'appels du plan Starter atteint).
5. Android : essai sur appareil, signature, push (FCM), biométrie et stockage chiffré de session : voir `docs/ANDROID.md`.
6. Identifiant d'application Android `com.sanadpay.app` : provisoire, à confirmer.
7. Optimisation technique (audit mémoire / réseau) : non menée au-delà des allègements visuels (flous retirés, boucles décoratives retirées).

---

# STATUT — Sanad Pay 21.2.0

Quatre mots, quatre sens. Rien n'est écrit « fait » sans l'exécution qui le prouve.
- **Programmé** : le code existe dans le dépôt, sur la branche `claude/zealous-darwin-ojhlbt`.
- **Testé** : exécuté dans le banc isolé (Chromium + Playwright, Supabase simulé, **toute écriture refusée**, aucune donnée ni opération réelle).
- **Connecté** : relié au vrai service (base, fonction serveur, fournisseur).
- **Déployé** : en ligne en production.

**Production** : toujours **21.0.0** (branche `main`). Rien de 21.1.0 ni 21.2.0 n'y est publié ; aucun déploiement ni fusion n'a été fait. Aucun transfert réel n'a été effectué.

## 1. Tableau d'état
| Domaine | Programmé | Testé | Connecté | Déployé |
|---|---|---|---|---|
| Logo officiel (app, icônes, partage, reçus, notifications, pages statiques, `site.html`) | oui | oui (captures + contrôles) | n/a | non |
| Système de mouvement (jetons, `Motion`, niveaux full/lite, hors écran, reduced-motion) | oui | oui | n/a | non |
| Ouverture, présentation en 5 scènes, connexion, tableau de bord, navigation, panneaux | oui | oui | données simulées | non |
| Transfert : scène « courbe » pilotée par l'état réel | oui | oui (7 états, refus serveur réel du banc) | **non** : aucun transfert réel | non |
| Cartes, historique, reçus par statut, exports PNG/PDF | oui | oui (PNG relu ; **PDF non ouvert dans un lecteur**) | données simulées | non |
| Notifications (identité Sanad) | oui | oui | non (aucune notification réelle reçue) | non |
| Amal : états, consentement, tri urgence / sensible | oui | oui (16/16, serveur simulé) | **non** | non |
| Fonction `supabase/functions/sanad-agents` | oui | oui (24 tests du noyau + gestionnaire, dépendances simulées) | **non** | **non déployée** |
| Migration `20261101_sanad_agent_log.sql` | oui | non (jamais jouée sur une base) | **non** | **non appliquée** |
| Cinq rôles (assistance/contenu, données, supervision, diagnostic, maintenance) : écran admin et états | oui | oui (8/8) | **non** : tant que la fonction n'est pas déployée, l'écran affiche « non configuré » | non |
| Nettoyages automatiques (périmètre, protections) | oui | oui (4/4) | n/a | non |
| `site.html` | oui | oui (10/10 : mobile / bureau, FR / EN / AR, mouvement réduit) | n/a | non |

## 2. Résultats exécutés sur le build 21.2.0 (27/10/2026)
| Contrôle | Commande | Résultat |
|---|---|---|
| Build | `npm run build` | OK — cache `fp-shell-v21.2.0-d58abccb47`, 30 fichiers préchargés |
| Agents (noyau, gestionnaire, rôles) | `npm run test:agents` | **24/24** |
| Interface EN/FR/AR | `node tests/ui/checks.mjs dist` | **19/19** |
| SanadEngine | `node tests/ui/engine.mjs dist` | **7/7** |
| Face ID **ou** code | `node tests/ui/faceid.mjs dist` | **8/8** |
| Mouvement (jetons dans les bornes, états, repli, nettoyage, RTL) | `node tests/ui/motion.mjs dist` | **29/29** |
| Amal | `node tests/ui/amal.mjs dist <dossier>` | **16/16** |
| Écran des agents | `node tests/ui/agents.mjs dist <dossier>` | **8/8** |
| Nettoyage automatique | `node tests/ui/janitor.mjs dist` | **4/4** |
| Site | `node tests/ui/site-shots.mjs dist <dossier>` | **10/10** |
| `@keyframes` appelés mais absents | `node tests/static/css-keyframes.mjs` | OK — 172, aucun orphelin |
| Non-régression métier vs 20.3.0 | `node tests/characterization/compare.mjs` | **0 échec** (voir §3) |

Les écritures vers Supabase sont refusées et comptées par le banc : aucun test ne peut déplacer d'argent.

## 3. Comparaison des fichiers métier avec le départ (20.3.0)
`compare.mjs` compare écrans, symboles de premier niveau, RPC, tables, fonctions serveur, clés de stockage, événements, traductions et configuration.
- 74 → 80 fichiers JS, 85 → 86 écrans, 59 → 59 RPC, 13 → 13 tables, 4 → 5 fonctions serveur appelées, 2 → 3 migrations, 4 → 5 fonctions Edge (ajouts uniquement).
- Configuration (frais, taux, limites, durées de transfert) : **identique** (hors numéro de version).
- Fichiers de logique métier modifiés depuis 20.3.0, à relire sur demande : `js/core/domain.js` (texte de marque et préfixe d'identifiant affiché `SP-`), `js/features/transfer-engine.js` (un commentaire), `js/core/router.js` (barre de navigation masquée sur les écrans plein écran de transfert / reçu), `js/screens/transfer-flow.js` (habillage ; confirmation par **Face ID OU code**, jamais les deux, décidée en 21.0.0), `js/features/pin.js` (même règle).
- Deux écarts de symboles, documentés dans `compare.mjs` : compteurs `chGid` / `yGid` (logo vectoriel remplacé par l'image officielle) ; lecture de `friendly_pin_vault_v1` retirée du nettoyage automatique (la clé reste utilisée par `pin.js`).

## 4. Mesures de fluidité (`tests/perf/motion.mjs`, rapport `tests/perf/motion.json`)
Méthode : intervalles `requestAnimationFrame` pendant l'ouverture, 8 changements d'écran, 6 ouvertures / fermetures de panneau ; 3 passes. **Banc Chromium sans carte graphique ; ce n'est pas un appareil réel.** Un intervalle de 16,7 ms = 60 images/s.

| Profil | Ouverture (médiane / pire) | Changements d'écran (médiane / % > 20 ms) | Panneau (médiane / % > 20 ms) |
|---|---|---|---|
| Mobile 390 px, CPU ×4 | 16,7 ms / 133–317 ms | 16,7 ms / 2,6–3 % | 16,7 ms / 3–9 % |
| Mobile 390 px arabe (RTL), CPU ×4 | 16,7 ms / 83–133 ms | 16,7 ms / 2,6–3,3 % | 16,7 ms / 8–16 % |
| Bureau 1280 px, niveau « full » imposé | 16,7 ms / 33–50 ms | 16,7 ms / **27 %** | **33,4 ms / ~68 %** |
| Bureau 1280 px, niveau « lite » | 16,7 ms / 33 ms | 16,7 ms / 0 % | 16,7 ms / 0 % |
| Bureau 1280 px, niveau automatique | niveau obtenu : **lite** | 16,7 ms / 0–0,6 % | 16,7 ms / 0 % |

Lecture honnête :
- Sur le banc, mobile et arabe tiennent 60 images/s en médiane ; la pire image de l'ouverture est une pause isolée de 83–317 ms (premier rendu, processeur ralenti ×4) : **à surveiller sur un vrai téléphone**.
- Le bureau en niveau « full » ne tient pas la cadence à l'ouverture d'un panneau **en rendu logiciel** (flous de fond redessinés sur le processeur). Constaté, pas corrigé dans le niveau « full » : le niveau « lite » le résout, et il est maintenant choisi **automatiquement** quand le navigateur annonce un rendu logiciel (SwiftShader / llvmpipe). Sur un bureau avec carte graphique, le niveau « full » n'a **pas** été mesuré.
- Reduced-motion : 0 animation en cours et 0 boucle infinie sur l'accueil. Navigation : 120 changements d'écran, 0 écouteur supplémentaire sur `window` / `document`, nœuds du DOM stables (1077 → 1072). Pause hors écran : mise en pause et reprise vérifiées.
- Non mesuré : consommation de batterie, mémoire sur appareil, Safari / WebKit, Android bas de gamme.
- Mesures de chargement (LCP, INP, CLS) : `docs/perf-after.json` (21.0.0, profil 1,6 Mbit/s CPU ×4), **non refaites** pour 21.2.0.

## 5. Captures
`docs/screenshots/motion/` : ouverture, présentation en 5 scènes (EN, AR), traitement du transfert (sécurisation, envoi, attente, succès, échec, statut à vérifier), cartes, reçus par statut, notifications, Amal, agents. Ce sont des images fixes pilotées par les scripts de `tests/ui/` ; **aucune vidéo** n'a été produite.

## 6. Liste exacte de ce qui n'est pas terminé ou pas vérifié
1. `sanad-agents` non déployée, migration non appliquée, aucune clé de modèle configurée : Amal répond avec ses sujets guidés et l'écran des agents affiche « non configuré ». Déploiement à ne faire que sur demande explicite.
2. Aucun test sur appareil réel (iPhone, Android, Safari, Face ID matériel, notifications push réelles).
3. Après un `fill`, un clic immédiat est parfois perdu dans le banc (perte de focus pendant l'appui). Reproduit aussi sur 21.1.0, donc **pas causé par ces changements** ; à vérifier sur un appareil.
4. Pas de fondu enchaîné entre l'écran de connexion et l'accueil après un succès de connexion.
5. Le tiroir latéral (`drawer`) n'est pas atteignable dans la navigation actuelle ; sa mise en mouvement n'a donc pas été vérifiée.
6. L'ancien CSS (`.hz-*`, 21.0.0) est en grande partie **recouvert** par la nouvelle couche plutôt que supprimé.
7. L'historique n'a pas d'état « chargement » réel (les données arrivent avec l'écran).
8. Planche Figma « Screens » : vide (le compte connecté n'a pas les droits d'écriture demandés).
9. Domaine, nom de projet Vercel et URL de partage portent encore les anciens noms.
10. « Sanad Pay ID » est conservé comme terme de service (le format `YOR-…` accepté est inchangé).
11. L'export PDF des reçus n'a pas été ouvert dans un lecteur (seul le PNG a été relu).
12. Marchés / crypto : masqués par le drapeau d'origine ; habillage non revérifié.
13. Mise en ligne de 21.1.0 / 21.2.0 : en attente de votre demande explicite. Un aperçu 21.1.0 existe sur Vercel (branche), pas 21.2.0.
