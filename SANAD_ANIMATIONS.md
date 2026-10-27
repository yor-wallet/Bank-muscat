# SANAD_ANIMATIONS — système visuel et animations de Sanad Pay 21.2.0

Ce document décrit **ce qui existe dans le code**, où le trouver, ce qui le déclenche et comment c'est vérifié.
Il ne promet rien qui n'ait été exécuté : l'état de chaque point est donné dans `STATUT_SANAD_PAY.md` (programmé / testé / connecté / déployé).

Règle qui prime sur tout le reste : **le mouvement suit l'état réel, il ne le fabrique pas.** Aucune animation ne change une durée métier, ne retarde une action, ne simule un chargement, un pourcentage, un solde, une confirmation, une écoute ou un transfert à un agent humain.

## 1. Identité
- Logo officiel : le ruban en S sur le château d'Oman, **jamais déformé** (rapport conservé, `object-fit:contain`, carré à coins arrondis). Sources : `design/brand/sanad-logo-officiel-1536.jpg`, `sanad-symbole-512.png`. Dérivés générés par `scripts/dev/logo-assets.py` : `assets/brand/sanad-s-192.png`, `sanad-s-320.png`, `sanad-s-full.jpg`, icônes d'application, favicons, `icon.svg`, `favicon.ico`, `assets/share/og-*.png`.
- Palette : bleu ciel, bleu profond, blanc ; verre discret (`css/s-glass.css`), relief et lumière inspirés des rubans du logo. Aucun emoji dans l'interface (icônes SVG de `js/ui/icons.js`, illustrations SVG/PNG de `assets/`).
- Langues : AR (RTL), FR, EN. Les éléments directionnels (indicateur de navigation, révélations, tracés) ont une variante RTL (`sxSheenRtl`, `scSlideXr`, `sxRevealXr`, `clip-path` inversé du mot-symbole…).

## 2. Chorégraphie centralisée
Une seule source de durées : `css/s-tokens.css` (`--mo-*`). `js/ui/motion.js` les lit (`Motion.D`), il ne recopie aucun chiffre.

| Jeton | Valeur | Bornes demandées | Usage |
|---|---|---|---|
| `--mo-press` | 90 ms | 80–110 | appui sur un bouton / une carte |
| `--mo-release` | 180 ms | 150–200 | retour au repos |
| `--mo-screen` | 340 ms | 280–420 | entrée d'un écran |
| `--mo-screen-tab` | 220 ms | — | changement d'onglet principal |
| `--mo-panel` / `--mo-panel-out` | 320 / 240 ms | 240–360 | ouverture / fermeture d'un panneau |
| `--mo-backdrop` | 280 ms | — | fond de panneau, progressif |
| `--mo-reveal` | 420 ms | — | révélations (reçu, scènes) |
| `--mo-stagger` | 40 ms | « court » | décalage de la cascade |
| `--mo-ease`, `--mo-out`, `--mo-in`, `--mo-spring` | courbes | — | communes à tous les fichiers `s-*.css` |

Les bornes sont vérifiées par `tests/ui/motion.mjs` (lecture des valeurs calculées, pas des déclarations).

`Motion` (`js/ui/motion.js`) : `start`, `reduced`, `tier`, `setTier`, `ms`, `watch`, `tilt`, `D`.
- **Niveau d'effets** `data-fx="full" | "lite"` sur `<html>`. Choix de la personne (clé `sanad_fx`) > économie de données > appareil modeste (≤ 2 Go ou ≤ 2 cœurs) > **rendu logiciel détecté** (WebGL « SwiftShader / llvmpipe / software ») > `full`. En `lite` : plus de flou de fond, inclinaison coupée, mêmes écrans et mêmes actions.
- **Hors écran** : `Motion.watch(el)` met `.mo-off` quand l'élément sort de la vue (rayon 48 px) ; le CSS met alors ses animations en pause (`.sx-hero`, `.yas-hero`, `.cin`, `.mo-watch`).
- **Panneaux depuis leur origine** : le dernier toucher (≤ 1,5 s) fixe `--mo-ox / --mo-oy` ; le panneau naît de là. Aucun toucher récent → origine centrée.
- **Inclinaison** `Motion.tilt(el)` : pointeur ou doigt, retourne une fonction de nettoyage ; rien en `lite` ou « réduire les animations ».
- Seules les propriétés `transform` et `opacity` sont animées (plus `clip-path` pour la révélation du mot-symbole et `stroke-dashoffset` pour les tracés SVG). Les `@keyframes` sont contrôlés par `tests/static/css-keyframes.mjs` (172 au dernier passage).

## 3. Inventaire des animations par parcours
`Réel` = ce qui conditionne l'animation. « durée » = durée VISUELLE ; aucune durée métier n'est touchée.

| Parcours | Ce qui se passe | Déclencheur réel | Fichiers |
|---|---|---|---|
| **Ouverture** | Apparition douce du logo (620 ms), lumière bleu ciel qui parcourt les courbes du ruban (tracé SVG en `mix-blend-mode:screen`, 760 ms), mot-symbole révélé (480 ms), stabilisation. 3 variantes : première ouverture (complète), suivantes (courte, ~0,5 s), « réduire les animations » (fondu 240 ms). Aucune attente artificielle : l'écran suivant apparaît dès que l'application est prête. En cas d'erreur de démarrage : sortie vers l'écran d'erreur illustré avec actions de reprise. | démarrage réel de l'application | `index.html` (inline), `js/ui/opening-art.js`, `css/s-screens.css` (`.sxo-*`), `js/features/resilience.js` |
| **Présentation initiale** | 5 scènes : compte / tableau de bord, avantages existants, transferts, cartes, sécurité. Textes limités aux fonctions réelles, aucun montant ni délai inventé. Suivant, Passer, Connexion, Inscription et choix de langue conservés. | action de la personne | `js/features/onboarding.js`, `js/ui/phone-art.js`, `css/s-scenes.css` |
| **Connexion / inscription** | Entrée coordonnée des champs, champ actif mis en valeur, secousse sur saisie invalide, indicateur de chargement tant que la requête dure, transition vers l'accueil. | clic, validation, réponse réelle | `js/screens/auth.js`, `css/s-motion.css` (`moShake`, `moRise`) |
| **Tableau de bord** | Cascade des blocs (40 ms), carte de solde avec reflet qui suit le pointeur (`Motion.tilt`) et lueur de ruban. **Le solde est affiché à sa valeur exacte dès le premier rendu** : plus de compteur depuis 0. Un léger rebond (`pxBump`/`moBump`) ne s'applique qu'à la mise à jour réelle du solde. | données chargées | `js/features/premium.js` (`BalanceFx`), `css/s-home.css` |
| **Navigation** | Indicateur glissant sous l'onglet actif, aligné en LTR **et** RTL (écart mesuré 0 px) ; entrée d'écran 340 ms ; changement d'onglet 220 ms. | navigation réelle (`R.go`) | `js/features/v12.js` (`buildNav`, `nav-ind`), `css/s-shell.css` |
| **Panneaux** | Naissance depuis l'endroit touché, fond qui s'assombrit progressivement, contenu en cascade, fermeture plus brève. | ouverture / fermeture réelle | `js/ui/motion.js`, `css/s-motion.css` |
| **Transfert** | Chaque étape (numéro, montant, confirmation, glissière, code ou Face ID, traitement, résultat) a sa composition. Traitement : scène « courbe » inspirée du logo, **indéterminée** (aucun pourcentage). Phases `secure → send → wait → success / fail / uncertain` posées par `SendAnim.setPhase` à partir de l'état réel du moteur. Durées métier intactes : sécurisation 900 ms, minimum 2400 ms, maintien du succès 1300 ms. | état de `ProcessingEngine` | `js/ui/send-anim.js`, `css/s-transfer.css`, `js/screens/transfer-flow.js` |
| **Cartes virtuelles** | Inclinaison et reflet, profondeur au défilement (`animation-timeline:view()` quand disponible), états visuels actif / gelée / en attente. | état réel de la carte | `js/features/v12.js`, `css/s-cards.css` |
| **Historique et reçus** | Transitions de filtres, détail qui naît de la ligne touchée (`moFromRow`), états vide / recherche vide / erreur illustrés (`assets/illustrations/*.svg`). Reçu : coche animée **uniquement** pour une opération confirmée ; en attente ou échouée, état correspondant et pastille « Confirmé et approuvé » **absente**. Exports PNG/PDF statiques avec le logo officiel. | statut réel de la transaction | `js/screens/receipt.js`, `js/ui/receipt-export.js`, `js/core/helpers.js` |
| **Notifications** | Bannière avec le logo, icône SVG par type, entrée / sortie discrètes. Jamais simulée : aucune bannière sans notification réelle. | notification reçue | `js/core/notifications.js`, `css/s-motion.css` (`notifIn/Out`) |
| **Amal (assistance)** | États : accueil, saisie, **traitement** (indicateur d'écriture seulement si une requête IA part réellement), réponse, indisponible, passage au support humain. Pas de synchronisation labiale (aucun audio réel). Le passage au support humain n'est annoncé qu'après confirmation du système ; une urgence préremplit l'écriture sans rien envoyer. | accord de la personne + réponse réelle | `js/features/chat.js`, `js/features/amal-ai.js`, `js/features/amal-triage.js`, `css/s-assist.css` |
| **Services, publicités, site** | Apparition au défilement, aperçus, thèmes bleus de marque (fini l'or / émeraude). Pas de compteur depuis 0. `site.html` : logo, aperçu, mobile / bureau / RTL. | défilement, action | `js/features/cinema.js`, `css/s-film.css`, `site.html` |
| **Paramètres, profil, appareils, aide** | Habillage et entrée communs, aide à chevron unique. | navigation | `css/s-screens.css`, `css/s-motion.css` |
| **Écrans d'erreur et hors ligne** | Illustrations SVG, bannière réseau aux couleurs d'état (ambre / vert), pages `offline.html`, `404.html`, `install.html` à l'identité Sanad. | état réseau / erreur réelle | `js/features/resilience.js`, pages statiques |
| **Agents (admin)** | Voyant par rôle : non configuré / disponible / occupé / erreur, lu depuis la fonction `sanad-agents` (mode `status`). Si la fonction n'est pas déployée, l'écran dit « non configuré » : il n'invente pas de disponibilité. | réponse réelle de la fonction | `js/features/agents-admin.js`, `css/s-agents.css` |

## 4. Accessibilité et sobriété
- **`prefers-reduced-motion: reduce`** : écrans et contenu visibles immédiatement, aucune animation en boucle. Mesuré : 0 animation en cours, 0 boucle infinie sur l'accueil (`tests/perf/motion.mjs`).
- **`data-fx="lite"`** : sans flou de fond, sans inclinaison ; automatique sur appareil modeste, économie de données ou rendu logiciel.
- **Utilisable sans animation** : aucun contrôle n'est caché derrière une animation ; le contenu est à son état final si l'animation ne se joue pas (`fill: backwards` pour les cascades, jamais `both`).
- Hors écran : pause automatique (`.mo-off`). Fond d'écran, cartes et reflets sont stoppés quand ils ne sont pas visibles.
- Écouteurs : passifs, et nettoyés quand l'écran est quitté (inclinaison : fonction de nettoyage retournée).

## 5. Mesures (banc Chromium, serveur simulé)
Voir `STATUT_SANAD_PAY.md` §Mesures et `tests/perf/motion.json`. Le banc mesure les intervalles entre images (`requestAnimationFrame`) pendant l'ouverture, 8 changements d'écran et 6 ouvertures / fermetures de panneau. **Ce sont des mesures du banc (Chromium sans carte graphique, processeur ralenti ×4 pour le profil mobile), pas des mesures d'appareils réels.** Aucune affirmation de fluidité sur iPhone ou Android n'est faite.

## 6. Écarts assumés par rapport à 20.3.0 (voir aussi `CHANGELOG_SANAD_PAY.md`)
- `friendly_pin_vault_v1` : la clé est toujours utilisée par le code de verrouillage ; seule la lecture faite par le nettoyage automatique a été retirée (ce coffre est un secret, pas un cache).
- `chGid`, `yGid` : compteurs d'identifiants de dégradés du logo vectoriel d'Amal ; remplacés par l'image officielle.
- Barre de navigation masquée aussi sur `country-select`, `tx-*`, `receipt*` (flux plein écran) — hérité de 21.0.0.
- Préfixe d'identifiant affiché `FP-` → `SP-` (affichage ; le format `YOR-…` accepté par la validation est inchangé).
