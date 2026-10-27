# PROJECT_RULES — Transformation Sanad Pay 2026

Document de règles, créé AVANT toute modification du code (état de départ : Freindi Pay 20.3.0, commit `6d181ad`).
Il est tenu à jour à chaque étape ; l'historique détaillé est dans `CHANGELOG_SANAD_PAY.md`.

## 1. Arbre source canonique
| Élément | Statut |
|---|---|
| Racine du dépôt (`index.html`, `css/`, `js/`, `assets/`, `sw.js`, `manifest.webmanifest`, `scripts/`, `supabase/`) | **Source canonique.** C'est ici que se font les modifications. |
| `dist/` | **Généré** par `npm run build` (`scripts/build.mjs`, esbuild). Netlify le publie tel quel (`netlify.toml`, `command = ""`) : il est donc régénéré et committé après chaque changement de source. Le build de départ a été vérifié **reproductible** (octet pour octet identique au `dist/` livré). |
| `reew-wallet-integrated.zip` | ZIP imbriqué historique (prototype `index.html` + icônes, jamais chargé par l'application). **Laissé intact**, non réécrit, non supprimé. |
| `walletconnect/` | Sources du bundle `js/vendor/reown-appkit.js` (chargé à la demande, désactivé par `FEATURES.crypto=false`). Inchangé. |
| `supabase/` | Migrations SQL, fonctions Edge, tests SQL. **Aucune migration n'est ajoutée ni modifiée** par cette transformation. |
| Archive d'origine `freindi-pay-20.3.0-complet(7).zip` | Non fournie dans la session : le dépôt `yor-wallet/bank-muscat` (HEAD `6d181ad`, version 20.3.0) est le même projet ; sauvegarde du `dist/` d'origine conservée hors dépôt pour comparaison. |

## 2. Règle n°1 — le cœur ne bouge pas
Sont **conservés tels quels** : flux, schémas, API, RPC, fonctions Edge, modules, validations, calculs financiers, transactions, authentification, rôles, routes, traductions (clés), configuration, intégrations, logique métier, temporisations métier (`CONFIG.PROCESSING`, `SPLASH_MIN`, délais de relecture, délai d'incertitude 30 s, etc.).

Le renommage de l'application ne déclenche **aucune migration de base de données**.

### Identifiants techniques protégés (jamais renommés)
- Objets / fonctions JS : `CONFIG`, `FEATURES`, `Runtime`, `AuthEngine`, `PinEngine`, `FeeEngine`, `ProcessingEngine`, `TransferEngine`, `LiveX`, `NexWC`, `YorChain`, `Guardian`, tous les `render*`, `R.register` / `R.go`, etc.
- Clés de stockage : `fp_theme`, `fp.swheal`, `friendly_pin_vault_v1`, `friendly_faceid_v1`, `yor_device_lang`, `yor_lang_chosen`, `yor_layout_mode`, `yor_device_id`, `yor_session_id`, `lx_inst_seen`, `lx_set_*`. (Les renommer déconnecterait les utilisateurs ou ferait perdre le coffre du PIN / la clé Face ID.)
- Base de données : tables, colonnes, RPC, types de transaction (`FIAT_EXTERNAL`…), identifiants `YOR-XXXXXX` (contrainte `profiles_yor_id_check`), préfixes de référence internes.
- Intégrations : URL / clé publique Supabase, clé VAPID publique, identifiant de projet Reown, nom de cache du service worker (un nouveau nom *est* attendu à chaque livraison, voir §5), `data-*` et `id` utilisés par les gestionnaires.
- Fichiers dont le nom est référencé par le code (`js/features/livex.js`, `js/features/yor-chain.js`, `js/i18n/livex.js`…) : **non renommés**. Les anciennes feuilles de style (22 fichiers) ont été supprimées et remplacées par la pile `css/s-*.css`.

### Changements de comportement acceptés (liste complète : `CHANGELOG_SANAD_PAY.md` §5–6)
- Exceptions demandées par le propriétaire : (1) une seule confirmation par transfert (Face ID **ou** code, jamais les deux) ; (2) retrait du bouton de notification de démonstration et du mot « test » dans les textes visibles ; (3) ajout de `SanadEngine` (données d'ouverture / fermeture / reprise).
Uniquement : (a) correction de défaut reproductible, (b) amélioration non régressive, (c) fonction nouvelle n'altérant pas l'existant. Toute exception est inscrite dans `BEFORE_AFTER_FEATURE_MATRIX.md` (colonne « Écart ») et dans le changelog.

## 3. Règles de marque
- Nom : **Sanad Pay** ; arabe : **سند باي**. Palette et jetons : `brand/design-tokens.css` du pack, repris dans `css/s-tokens.css`.
- Pas de remplacement global aveugle. Chaque occurrence est classée : *texte visible de marque* (remplacé), *identifiant technique* (conservé), *banque / bénéficiaire / donnée d'opération externe* (conservé — ex. « Bank Muscat » dans la liste des banques `reference-data.js`), *commentaire de code* (conservé ou neutralisé sans risque).
- Le vert disparaît **de l'identité visuelle** ; le vert sémantique de succès (`#14A879`) reste réservé au succès. Rouge / ambre : erreur / avertissement uniquement.
- Aucun symbole bancaire tiers, aucune marque, signature, reçu ou expéditeur de banque réelle. Un reçu Sanad Pay n'est pas un document bancaire (mention déjà présente, conservée). Aucun expéditeur « Bank Muscat » n'est jamais inventé.
- L'identité du pack est « originale » et ne prétend à aucune licence réglementaire (README du pack) : aucun texte ne la prétend.

## 4. Règles d'intégrité financière / transactionnelle
1. Aucun solde, transfert, notification ou reçu n'est présenté comme confirmé sans l'état réel renvoyé par le serveur (`txState` / statut `CONFIRMED`). États distincts : **initié → en cours → réussi / échoué / incertain**.
2. Les animations suivent l'état réel (`ProcessingEngine.run`, `SendAnim.setPhase`) ; elles ne le précèdent jamais, ne déclenchent aucune opération et n'ajoutent aucun `setTimeout` sur un flux métier.
3. Aucun SMS / e-mail n'est émis depuis le client. Les déclencheurs d'envoi restent côté serveur (fonctions Edge, fournisseurs configurés). Les textes d'e-mail / push de marque sont mis à jour **dans le code source** ; leur effet réel exige un déploiement des fonctions par le propriétaire (non effectué ici).
4. Les tests n'écrivent jamais en production : le banc de test (`tests/ui/harness.mjs`) intercepte tout trafic Supabase, répond avec des données fictives et **refuse et journalise toute écriture** ; le trafic vers des hôtes externes est coupé.

## 5. Caches et service worker
`scripts/build.mjs` régénère la liste `SHELL` et le nom du cache (`fp-shell-v<version>-<hash du contenu>`). Toute modification de CSS / JS / HTML / assets de coquille change donc le nom du cache et l'ancien est supprimé à l'activation (déjà codé dans `sw.js`). Les ressources ajoutées (`css/sanad.css`, nouveaux logos / icônes) sont ajoutées à `SHELL` et le build échoue si un fichier listé est absent de `dist/`. La version applicative passe de 20.3.0 à **21.0.0** (`package.json`, `CONFIG.APP.version`).

## 6. Méthode et garde-fous de non-régression
- `scripts/dev/inventory.mjs` → instantané des écrans, symboles, clés de stockage, RPC, fonctions serveur, tables, événements, paramètres critiques. Instantané **avant** : `tests/characterization/inventory.baseline.json`.
- `tests/characterization/compare.mjs` compare l'instantané **après** : tout symbole / RPC / table / clé de stockage / écran disparu fait échouer le contrôle. Seuls les ajouts sont tolérés.
- `tests/ui/capture.mjs` : captures iPhone 390 px, iPhone SE 320 px, Android 412 px, tablette 820 px ; EN / FR / AR (RTL). Avant : `docs/screenshots/before/`. Après : `docs/screenshots/after/`.
- `tests/ui/checks.mjs` : contrôles automatisés (marque visible, manifeste, RTL, absence de débordement horizontal, cibles tactiles ≥ 44 px, `prefers-reduced-motion`, aucun appel d'écriture, service worker).
- Les résultats réels (réussites **et** échecs) sont consignés dans `docs/TEST_RESULTS.md`. Rien n'y est déclaré « fait » sans exécution.

## 7. Limites de l'environnement (à ne pas contourner)
- **Figma** : aucun outil Figma n'est disponible dans cette session. La planche (`01cum4RMZ1Z3uyEwNaWmUi`) n'a pas pu être modifiée ; à la place, les jetons et exports sont livrés en fichiers prêts à importer (`design/`). Voir `CHANGELOG_SANAD_PAY.md` § Limitations.
- Pas de production, pas de fournisseur SMS / e-mail réel, pas de déploiement : rien de tout cela n'est effectué ni affirmé.
- Tests sur Chromium (WebKit / Safari réel et appareils physiques non disponibles) : l'émulation iPhone ne remplace pas un test sur appareil.

## 8. Mouvement, assistance IA et nettoyages (ajouté en 21.2.0)
1. **Le mouvement suit l'état réel.** Pas de compteur depuis 0, pas de pourcentage inventé, pas de coche de succès avant la confirmation du serveur, pas d'indicateur d'écriture sans requête réelle, pas de « support humain connecté » sans confirmation du système. Les durées métier (sécurisation 900 ms, minimum 2400 ms, maintien du succès 1300 ms…) ne se modifient pas pour une raison visuelle.
2. **Une seule source de durées visuelles** : les jetons `--mo-*` de `css/s-tokens.css`. Un nouveau fichier CSS les utilise, il n'écrit pas de durée en dur. Bornes : appui 80–110 ms, retour 150–200 ms, écran 280–420 ms, panneau 240–360 ms. Seulement `transform` / `opacity` (plus `clip-path` et `stroke-dashoffset` pour les révélations). Chaque `@keyframes` appelé doit exister : `node tests/static/css-keyframes.mjs`.
3. **Toute animation a un repli** : `prefers-reduced-motion` (contenu visible tout de suite, rien en boucle) et `data-fx="lite"` (sans flou de fond). Une animation infinie se met en pause hors écran (`.mo-off`) et ses écouteurs se nettoient.
4. **Logo officiel** : le ruban en S, jamais déformé ni recoloré ; dérivés produits par `scripts/dev/logo-assets.py`. Aucune imitation de banque.
5. **Assistance IA (Amal)** : consentement explicite avant tout appel au modèle ; les urgences et les sujets sensibles reçoivent un texte fixe, **sans appel au modèle**, avec renvoi vers le support humain ; le journal des agents ne contient jamais le contenu des messages ; la fonction `supabase/functions/sanad-agents` ne se déploie qu'à la demande explicite du propriétaire. Le tri côté client est **généré** depuis le noyau (`npm run sync:triage`), jamais écrit à la main.
6. **Nettoyages automatiques (`Janitor`, `js/core/store19.js`)** : périmètre limité aux caches temporaires identifiés, énumérés en en-tête du fichier. Ne jamais toucher transactions, sessions, journaux, sauvegardes, coffre du code (`friendly_pin_vault_v1`) ni consentements (`amal_ai_*`). `node tests/ui/janitor.mjs dist` le vérifie.
7. **Correctifs** : testés dans l'environnement isolé du banc (`tests/ui/harness.mjs`, écritures refusées) avant toute mise en production ; aucun déploiement ni fusion sur `main` sans demande explicite.
