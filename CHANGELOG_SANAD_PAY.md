# CHANGELOG — Freindi Pay 20.3.0 → Sanad Pay 21.3.0 → Barq 22.0.0

## 22.0.0 — Barq
Nouveau nom (**Barq / برق**), nouveau logo (éclair), palette bleu électrique, préfixe d'identifiant affiché `BQ-`, ouverture qui trace le contour de l'éclair, textes ludiques retirés (« Génial ! », « Vous avez gagné »). Couche « banque » de la 21.3.0 conservée. **Aucune règle métier modifiée** (`compare.mjs` : 0 échec). iPhone : PWA durcie (champs 16 px, zones sûres, écrans de lancement unis, icône pleine) + projet Xcode préparé (`ios/`, non compilé : pas de Mac) ; Android renommé (`com.barq.app`). Détail : `docs/BARQ.md`, `docs/IOS.md`, `docs/ANDROID.md`.

---

## 21.3.0 — « une banque, pas un jeu » : sobriété, recomposition, Android
Demande du propriétaire : l'application doit se voir comme une banque ; plus rien de « jeu d'enfants » (sons, effets) ; tout autour du logo ; des animations familières. **Présentation uniquement : aucune règle métier, aucun calcul, aucun frais, aucune route modifiés** (`node tests/characterization/compare.mjs` : 0 échec).
- **Sons et effets** : interface silencieuse + une note douce pour les événements importants ; plus de confettis, pièces, ondes, compteurs depuis 0 ni célébration plein écran ; rebonds supprimés ; mouvements décoratifs coupés (`css/s-sober.css`). Détail : `SANAD_ANIMATIONS.md` §0.
- **Nouvelle couche `css/s-meta.css`** : surfaces pleines, angles de 10–16 px, bleu d'action unique, barre de navigation à cinq entrées égales (ligne d'horizon du logo), boutons rectangulaires.
- **Accueil** recomposé (en-tête, carte de compte, 4 actions dont « Ajouter des fonds », portefeuille, activité) ; **réglages** par catégories toutes visibles (compte et identité, sécurité, cartes et paiements, notifications, application, assistance) ; **services** avec recherche et **section « Transferts internationaux » dédiée** (Orange Money, Wave… lus dans le catalogue existant, visible seulement si le serveur annonce le service) ; **notifications** filtrées par catégorie ; **présentation** en aplats ; **reçu** sobre ; **cartes** aplat marine.
- **Écran de progression du transfert** : anneau par étapes réelles, textes bancaires (EN/FR/AR), aucun terme technique (« serveur » retiré des libellés).
- **Services** : le groupe « Crypto » n'est plus affiché quand la section crypto est désactivée (ses lignes menaient à l'accueil). Le groupe « Croissance » (Boost, vérification d'identité, retrait, crédit, chat, Amal, cinéma) reste masqué comme avant — **décalage d'index du code d'origine, décision du propriétaire en attente** (voir `STATUT_BARQ.md`).
- **Android** (Capacitor 8) : projet `android/`, manifeste (sauvegarde système désactivée), icônes adaptatives, écran de lancement, bouton Retour, barre d'état ; voir `docs/ANDROID.md`.
- Banc : `tests/ui/all-screens.mjs` (capture de chaque écran enregistré), motion mis à jour (28/28), le banc répond « service international disponible » (60 lignes fictives) pour pouvoir le montrer.
- Version **21.3.0** (`package.json`, `package-lock.json`, `CONFIG.APP.version`, `sw.js`).

---

## 21.2.0 (voir ci-dessous)

## 21.2.0 — logo officiel, mouvement centralisé, assistance Amal, cinq rôles d'agents
Reprise à partir de l'archive `sanad-pay-version-travail` et de la mission « transformation visuelle et animations complètes ». **Aucune fonction métier retirée** (`node tests/characterization/compare.mjs`, exceptions documentées en tête du fichier). Détail des animations : `SANAD_ANIMATIONS.md` ; état programmé / testé / connecté / déployé : `STATUT_BARQ.md`.
- **Logo officiel** (ruban en S) partout : application, ouverture, icônes, favicons, manifeste, images de partage, reçus exportés, notifications, pages hors ligne / 404 / installation, `site.html` (nouveau).
- **Système de mouvement** : jetons `--mo-*` (`css/s-tokens.css`), `css/s-motion.css` (couche finale), `js/ui/motion.js` (niveau `full`/`lite`, pause hors écran, origine des panneaux, inclinaison avec nettoyage). 20 `@keyframes` perdus depuis 21.0.0 restaurés ; contrôle statique ajouté.
- **Ouverture** autour du vrai logo (lumière sur les courbes, 3 variantes), **présentation en 5 scènes**, tableau de bord sans compteur depuis 0, indicateur de navigation glissant (LTR + RTL), panneaux depuis leur origine, scène de traitement « courbe » indéterminée, cartes (inclinaison, états), historique / reçus (états vide, erreur ; coche seulement pour un succès réel ; **la pastille « Confirmé et approuvé » n'apparaît plus sur un reçu en attente**), notifications, publicités / cinéma aux couleurs de marque.
- **Assistance Amal** : visuel PNG, états (accueil, traitement, réponse, indisponible, support humain), consentement, tri urgence / sensible sans appel au modèle (`js/features/amal-triage.js` généré), fonction `supabase/functions/sanad-agents` (**non déployée**), migration `20261101_sanad_agent_log.sql` (**non appliquée**), `sanad-agents/` (cinq rôles : assistance / contenu, données, supervision, diagnostic, maintenance) + écran admin avec l'état réel de chaque rôle.
- **Nettoyages automatiques** : périmètre exact documenté dans `Janitor` ; coffre du code retiré du nettoyage ; clé de consentement Amal protégée (`amal_ai_<id>`).
- **Qualité** : niveau `lite` automatique sur rendu logiciel ; banc de fluidité `tests/perf/motion.mjs` ; le banc fixe `sanad_fx=full`.
- Aide : un seul chevron ; textes arabes de marque corrigés.
- Version **21.2.0** (`package.json`, `package-lock.json`, `CONFIG.APP.version`, `sw.js`, cache `fp-shell-v21.2.0-…`).

---

## 21.1.0 — direction « Glass » (navigation et rendu à la Revolut, avec du verre dépoli)
Demande du propriétaire : la refonte 21.0.0 « n'était pas jolie » ; nouvelle direction visuelle inspirée de Revolut avec de la transparence. **Présentation uniquement** : aucun écran, RPC, table, clé de stockage ni minuterie n'est touché (`compare.mjs` 15/15).
- **Nouvelle feuille `css/s-glass.css`** (chargée en dernier) : jetons clair « jour de verre » et sombre « nuit de verre », fond « aurore » (4 halos bleu ciel / bleu / turquoise / bleu profond) porté par une couche fixe qui dérive lentement et suit l'inclinaison de l'appareil (transform seulement ; coupée en mouvement réduit).
- **Navigation** : barre de verre à 5 entrées égales (Accueil · Historique · **Envoyer** (bouton rond central surélevé) · Cartes · Services) avec libellé sous chaque icône ; plus de pastille glissante. Les écrans du parcours d'envoi, du reçu et de la connexion masquent la barre (plein écran, comme les applications bancaires).
- **Accueil** : barre du haut (avatar rond, **recherche en pilule**, cloche), **solde centré géant** (partie entière en grand, décimales plus petites, code monétaire discret), pastilles d'état / identifiant / mois, **4 boutons ronds** (Envoyer plein, Recevoir, Historique, Plus), puis cartes de verre (en cours, activité récente, graphique du mois, cartes, offres) qui apparaissent en cascade.
- **Composants** : cartes et listes en verre (flou + reflet intérieur + ombre longue), pastilles **rondes** pour les opérations et réglages, boutons en **pilule** (dégradé bleu, ombre colorée), champs de verre, contrôles segmentés, barre de glissement en pilule avec poignée ronde, clavier de code à **touches rondes** et points ronds, feuilles et fenêtres en verre, barre latérale de verre sur grand écran, colonne centrée sur tablette / ordinateur.
- **Accessibilité** : `prefers-reduced-transparency` et navigateurs sans flou → verre quasi opaque, mêmes formes ; `prefers-reduced-motion` coupe dérive, cascades et parallaxe.
- **Ouverture** : fond d'aurore identique à celui de l'application ; images de lancement iOS régénérées (`scripts/dev/splash.py`, dégradés reproduits en calcul).
- **Montants** : `splitMoney()` (présentation) sépare code, partie entière, décimales ; le texte exact et l'animation de solde sont conservés.
- Correctifs : l'identifiant de la barre latérale affichait `YOR-…` au lieu de `SP-…` ; les noms latins tronqués en arabe (`unicode-bidi: plaintext`).
- Version **21.1.0** (`package.json`, `CONFIG.APP.version`, cache `fp-shell-v21.1.0-…`).

---
## 21.0.0 — premier passage « Horizon » (conservé pour l'historique)


Ce journal liste **tout** ce qui a changé, y compris les écarts et les limites. Les vérifications citées ont réellement été exécutées dans le banc local (voir `docs/TEST_RESULTS.md`) ; ce qui n'a pas pu être fait ou vérifié est dit explicitement dans « Limites et actions du propriétaire ».

## 0. Règle d'or respectée
Aucune logique métier n'a été modifiée : mêmes écrans (85 identifiants), mêmes RPC (59), mêmes tables (13), mêmes fonctions serveur invoquées (4), mêmes clés de stockage, mêmes minuteries de traitement, mêmes validations, mêmes frais et limites. `tests/characterization/compare.mjs` compare l'inventaire à celui de 20.3.0 : **aucun symbole retiré**, seuls des ajouts de présentation et de moteur. Un transfert reste « confirmé » uniquement quand le serveur répond ; aucun solde, reçu, SMS ou e-mail n'est inventé.

## 1. Marque
- Nom **Sanad Pay** / **سند باي** partout où il est visible (interface EN/FR/AR, titres, manifeste, service worker, reçus, partage, e-mails et notifications dans le code source des fonctions).
- Logo du pack **inchangé** (carré arrondi dégradé, coche blanche, ligne horizontale claire) : `assets/brand/*`, icônes 192/512/maskable/apple-touch/favicons, images de partage `assets/share/og-{en,fr,ar}.png`.
- Identifiants affichés `YOR-XXXXXX` → `SP-XXXXXX` à l'écran uniquement (`dispId`) ; la base garde `YOR-…` (contrainte `profiles_yor_id_check`). `normId` accepte `SP / SANAD PAY / SANAD / FP / FREINDI PAY / LXD / LIVEX / FRD / FRIENDLY / YOR`.
- Palette du pack : #2596DE, #7ED8F6, #EAF8FF, #FFFFFF, #134F91, #102C4C, #38B9BE ; vert/ambre/rouge réservés au succès/attention/erreur. L'or et le vert de marque ont disparu (cartes, puce, e-mails, reçu exporté, publicités).
- Polices hébergées : Inter (latin), Tajawal (arabe) ; Manrope et Readex Pro retirées ; plus aucune requête vers Google Fonts (elles étaient de toute façon bloquées par la CSP).
- Rapport des occurrences restantes de l'ancienne marque : `docs/BRAND_OCCURRENCES.md` (identifiants techniques protégés, commentaires, adresse e-mail du propriétaire). Aucune ne figure dans un texte visible (contrôlé sur les écrans rendus EN/FR/AR).

## 2. Nouvelle apparence — « Horizon » (voir `VISUAL_DIFFERENTIATION.md`)
Refonte de la couche de présentation, pas un changement de couleurs :
- **Architecture d'écran** : ciel + feuille blanche qui s'élève (accueil, connexion, reçus), grand titre + recherche collée + contrôle segmenté (historique), liste groupée (services, réglages), « billet » à encoches et trait pointillé (confirmation d'envoi, reçu), barre de navigation « rail » à soulignement horizon et bouton Envoyer séparé.
- **Forme unique** : le carré arrondi du logo (rayon 28 %) pour tuiles, avatars, poignée de glissement ; la **ligne d'horizon** de 2 px comme séparateur, progression et soulignement.
- **Icônes** : jeu du pack (grille 48, trait 3,6) ; ombres décalées « duotone » supprimées.
- **Mouvement** (transform/opacité seulement) : glissement de 24 px entre écrans, fondu de 6 px entre onglets, révélation par masque, tracé de la coche, parallaxe douce de profondeur (inclinaison de l'appareil si déjà autorisée, sinon pointeur) sur le solde, le sigle et l'avatar, inclinaison 3D et reflet des cartes. `prefers-reduced-motion` : tout est neutralisé.
- **Thème sombre** refait avec les mêmes jetons (vérifié par captures).
- **Chiffres et historique** : chiffres tabulaires, code monétaire discret, ligne d'opération sur une ligne, statut sous le montant, séparateurs fins sans effet « papier ».
- **Réglages / profil / sigle** : réglages rapides (thème, langue, alertes…), groupes calmes, lignes plus aérées ; relief et anneau fin sur le sigle et les avatars.
- **Illustrations** : scènes de personnages et pièces remplacées par des scènes Horizon (onboarding, envoi, publicités) ; puce de carte neutre (plus d'or) ; anciennes illustrations et visuels de cartes supprimés.
- Feuilles de style : 22 anciennes feuilles (base, v12→v19, friendly, freindi, premium…) retirées ; nouvelle pile `s-tokens → s-shell → s-components → (modules fonctionnels conservés) → s-screens → s-extras → s-finish`.

## 3. Séquence d'ouverture inédite « Trait & Horizon »
- 1ʳᵉ ouverture ≈ 1,8 s ; ouvertures suivantes ≈ 0,6 s ; reprise depuis l'arrière-plan : aucune séquence (la page n'est pas rechargée) ; mouvement réduit : simple fondu 0,32 s.
- Première image **identique** à l'image de lancement iOS (dégradé ciel, sans logo) : les 24 images `assets/splash/*` sont régénérées (`scripts/dev/splash.py`).
- La première image est dessinée par un petit script en ligne dès l'arrivée du HTML (avant les scripts différés) ; la séquence est un habillage : fin = application prête ET dessin joué, un toucher la saute, aucun flux métier retardé. Mesure du banc (réseau lent + CPU ×4) : FCP 2116 → 1684 ms, LCP 3636 → 2868 ms.
- Trois pistes étudiées (A retenue) : `VISUAL_DIFFERENTIATION.md`, `design/storyboards/opening-tracks.{svg,png}`, pellicules réelles dans `docs/screenshots/opening/`.
- Transitions nouvelles : entrée du tableau de bord (révélation du solde), changement d'onglet (fondu + 6 px), ouverture de détail (glissement partagé), envoi (scène Horizon dont le succès n'apparaît qu'après la réponse du serveur, atterrissage 420 ms), apparition du reçu (feuille qui monte sur le ciel, coche tracée).

## 4. SanadEngine — moteur de données d'ouverture / fermeture (`js/core/sanad-engine.js`)
Ajout pur, sans toucher aux tables ni aux appels :
- **Ouverture instantanée** : lecture du cliché chiffré (`Snap`) lancée avant même `boot()` (l'utilisateur est lu dans `sb-*-auth-token`), puis réutilisée ; l'écran peut se dessiner avec les dernières données connues pendant que le réseau répond.
- **Fermeture sûre** : écriture du cliché et de l'état d'interface à `visibilitychange(hidden)`, `pagehide`, `freeze`.
- **Reprise** : au retour (visible / en ligne / `pageshow`), un seul rafraîchissement `AuthEngine.hydrateLive()` (une requête à la fois, écart minimal 8 s, repli exponentiel), redessin seulement si la signature des données a changé et si aucun écran de saisie n'est ouvert.
- **Mémoire d'interface** : onglet courant et filtres d'historique (`sanad_ui_<uid>`, effacés avec les données de l'utilisateur par `Janitor`), restaurés si l'application est rouverte dans les 30 min.
- Vérifié : `tests/ui/engine.mjs` (7 contrôles).

## 5. Face ID / code — une seule confirmation (exception de comportement demandée par le propriétaire)
Avant : Face ID **puis** code pour valider un transfert. Après (`js/features/pin.js`, `faceid.js`, `app-lock.js` inchangé en logique) :
- Face ID activé + code rangé dans le coffre de l'appareil → **Face ID seul** (le serveur vérifie toujours le code via `verify_pin`, rien n'est contourné).
- Face ID activé mais coffre vide (premier usage, code changé ailleurs) → **code seul**, puis le code est rangé : la fois suivante, Face ID seul.
- Face ID absent / annulé / refusé → code seul. Changement de code : le coffre est réalimenté avec le nouveau code.
- Mode « naturel » : l'invite système s'ouvre directement à partir du geste de l'utilisateur (plus d'écran intermédiaire quand le navigateur le permet).
- Vérifié avec un authentificateur WebAuthn virtuel : `tests/ui/faceid.mjs` (8 contrôles). **Pas testé sur un iPhone réel avec Face ID.**

## 6. Le mot « test » et assimilés (demande du propriétaire)
Plus aucun texte visible ne le contient (contrôle automatique EN/FR/AR sur 24 écrans, `tests/ui/checks.mjs`) :
- Bouton « envoyer une notification de test » retiré de `js/features/push.js` (et ses 4 clés de traduction) — **seul retrait de clés i18n**, documenté dans `compare.mjs`.
- Textes de la chaîne / portefeuille : « testnet / test » → « réseau Nile » / « expérimental » (clé `chain.testBalance` → `chain.expBalance`, `env:'testnet'` → `'nile'`, `assertTestnetConfig` → `assertNetworkConfig`). Fonctionnalité masquée par `FEATURES.crypto=false`, logique inchangée.
- Les données fictives du banc de test portent des noms neutres (Aisha Al Balushi, Salim Al Harthy…).
- Le banc de test lui-même (dossier `tests/`, non publié) garde le mot dans ses noms de fichiers/commentaires : il n'est pas servi aux utilisateurs.

## 7. Autres changements
- **Texte des e-mails / notifications** (source seulement) : `supabase/functions/send-email` (en-tête « SANAD PAY », palette bleue, coche à la place de « LX », encadré clair), `push-send/lib.ts`, `ai-assist` : « Live X Digitale » → « Sanad Pay ». **Déployé** le 27/10/2026 (voir §9).
- Reçu exporté PNG/PDF (`js/ui/receipt-export.js`) : sigle du pack à la place de l'ancienne initiale « F », bandeau en dégradé continu, couleurs Sanad ; mise en page d'origine conservée.
- Onboarding : 4 scènes, textes limités aux fonctions réelles (EN/FR/AR).
- `package.json`, `package-lock.json`, `CONFIG.APP.version`, `sw.js` : **21.0.0** ; cache `fp-shell-v21.0.0-<hash>` (nouveau nom attendu à chaque livraison, liste régénérée par le build : 27 fichiers précachés).
- Cibles tactiles : zone d'appui élargie à 44 px (carte, pastille, aide).
- Banc de test ajouté (`tests/ui/*`, `tests/characterization/*`, `tests/perf/*`, `scripts/dev/*`) — non publié.

## 8. Demandes NON exécutées, avec la raison
- **Expéditeur « Bankmct » pour les SMS des destinataires : refusé.** Ce serait faire passer des SMS pour ceux d'une banque (Bank Muscat) qui n'est pas l'émettrice : usurpation d'identité (hameçonnage potentiel), contraire au cahier des charges d'origine (« aucun SMS / e-mail au nom d'une banque sans autorisation vérifiée »). L'identifiant d'expéditeur n'est de toute façon pas dans ce dépôt : il se configure chez le fournisseur SMS. Si le propriétaire détient une **autorisation écrite** de la banque et un identifiant enregistré chez l'opérateur/le régulateur, il l'inscrit lui-même côté fournisseur ; le code client n'envoie aucun SMS. En attendant, le nom affiché reste « Sanad Pay ».
- **Figma** : le compte connecté (D Tr, siège « View » sur un plan Starter) n'a **pas le droit d'écrire** dans la planche demandée (`01cum4RMZ1Z3uyEwNaWmUi`) : elle n'a donc pas été modifiée. J'ai créé **un nouveau fichier** : https://www.figma.com/design/EmH0NM8WB5ArxIendxEwKb — contenu réel : variables (Primitives 28, Color Light 13, Color Dark 13, Radius 6, Spacing 7), 9 styles de texte (Inter / Tajawal), page « Brand & Foundations » (logo du pack, palette liée aux variables, couleurs sémantiques clair/sombre, typographie, rayons, mouvement), composants Button, Status badge, Transaction row, et le storyboard d'ouverture (3 pistes × 5 images, calques modifiables). **Incomplet** : le plan Starter limite à 1 mode par collection (Light/Dark = deux collections), 3 pages, et a atteint sa limite d'appels MCP avant la construction des écrans (Accueil, Historique, Confirmation, Reçu) : la page « Screens » est vide. Les captures « après » sont dans `docs/screenshots/after/`. Pour déplacer ce travail dans la planche d'origine, donner un accès éditeur au compte connecté puis relancer.
- **Capture comparative Freindi/Sanad** : fournie sous forme d'images côte à côte `docs/screenshots/compare/` (avant = baseline 20.3.0, après = 21.0.0).

## 9. Limites et actions du propriétaire
1. **Fonctions Edge déployées le 27/10/2026 sur le projet Supabase `gebjmguoauvutiqvoswl` (yor-wallet)**, à la demande du propriétaire : `send-email` v44, `push-send` v35 (index.ts + lib.ts), `ai-assist` v27. Le contenu déployé a été relu et comparé octet pour octet au dépôt (identique). **Point d'attention** : le code réellement en production pour `send-email` (version « Freindi Pay 20.3.1 ») était plus récent que celui du dépôt ; la version déployée est donc dérivée du code de production (pas de celui du dépôt, qui a été aligné dessus). Changements : textes « Sanad Pay / سند باي », palette bleue, coche à la place de l'initiale, identifiants `SP-`, référence `SP-` dans les alertes push, titre de repli « Sanad Pay », reconnaissance du nom d'expéditeur de chat ancien ET nouveau (`Live X Digitale` vient des données). `verify_jwt` conservé (false / true / false). **Non testé en conditions réelles** : aucun e-mail ni push n'a été envoyé pour vérifier (secrets et déclencheurs de production) ; à contrôler avec une opération réelle. Le front (`dist/`) reste à publier. Non modifiés : `send-notice`, `send-sms` (déployée mais absente du dépôt), `chain-notice`, `yor-devtools`, `tron-status`, `token-admin`. Aucune migration SQL.
2. **Adresse d'assistance / expédition `yordigitalefinance@gmail.com`** (écran Aide, `FROM_EMAIL`, `REPLY_TO`) : boîte réelle, vérifiée chez Brevo — **non modifiée**. Elle porte l'ancien nom ; la remplacer exige une nouvelle adresse vérifiée côté fournisseur.
3. **Nom DB affiché** : si un compte a une contrepartie enregistrée en base sous l'ancien nom (« Live X Digitale »), ce nom vient des données et s'affiche tel quel ; aucun alias d'affichage n'a été ajouté.
4. **Appareils réels** : tests sur Chromium (émulation iPhone 390/SE 320/Android 412/tablette 820). Pas de Safari/WebKit ni d'iPhone physique : Face ID réel, images de lancement iOS, `Add to Home Screen` et notifications push réelles n'ont pas été éprouvés.
5. **Performance** : sous le profil le plus sévère du banc (1,6 Mbit/s, CPU ×4) le LCP est 2868 ms (cible 2,5 s non atteinte, mais −21 % vs avant) ; INP ≈ 88–96 ms (< 200 ms) et CLS 0 sont dans les objectifs. Lighthouse officiel non exécuté (pas de connexion à un service externe depuis cette session).
6. Écrans secondaires non repris un à un (crypto/marchés, admin, chat, crédit, coffre, investissement, cinéma) : ils héritent des jetons et de l'habillage commun mais leur composition d'origine est conservée.
7. **Export PDF** : généré par le code existant à partir de l'image PNG ; le PNG a été relu, le PDF n'a pas été ouvert dans un lecteur.
8. Écran « Marchés » / Crypto : masqué par le drapeau d'origine, habillage non vérifié visuellement (les routes redirigent vers l'accueil dans le banc).
