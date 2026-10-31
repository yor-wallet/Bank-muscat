# Sanad Pay 21.3.0 — métamorphose : ce qui a vraiment changé, écran par écran

Règle suivie : **aucune règle métier, aucun calcul, aucun frais, aucune route, aucune table, aucun paramètre validé n'a été modifié** (`node tests/characterization/compare.mjs` : 0 échec ; liste des écarts documentés dans le fichier). Un écran n'est déclaré « recomposé » que si sa **composition** a changé ; s'il a seulement reçu les nouvelles formes et couleurs, il est classé « restylé ».

Orientation donnée par le propriétaire pour cette livraison : « que la personne y voie une banque, pas un jeu ; retire ce qui fait jeu d'enfants ; transforme tout avec le logo ; des animations familières ». La palette validée du projet (bleu `#2596DE`, bleu profond `#134F91`, encre `#102C4C`, glacier `#EAF8FF`) a été conservée ; la palette proposée dans la directive en est très proche et n'a pas été substituée.

## 1. Recomposés (nouvelle architecture visuelle)
| Écran | Avant (21.2.0) | Après (21.3.0) | Composants nouveaux | Animation | Vérification |
|---|---|---|---|---|---|
| **Accueil** | Solde centré sur fond d'aurore, 4 boutons ronds (Envoyer, Recevoir, Historique, Plus), cartes en verre | En-tête (profil, salutation selon l'heure, recherche, réglages, notifications) ; **carte de compte marine** (logo, nom du compte, œil masquer/afficher, ruban du logo en filigrane) ; 4 actions carrées **Envoyer · Recevoir · Ajouter des fonds · Plus** ; bande « Portefeuille » (cartes et comptes réels) ; activité récente | `mh-top`, `mh-card`, `mh-quick`, `mh-strip` | fondu + 8 px dans l'ordre de lecture ; carte immobile ; solde exact dès le premier rendu | `tests/ui/motion.mjs` (28/28), captures EN/AR/320 px, clair/sombre |
| **Réglages** | « Raccourcis » en tuiles colorées + un bloc « Paramètres avancés » replié contenant tout le reste | **Six catégories toutes visibles** : Compte et identité · Sécurité · Cartes et paiements · Notifications · Application · Assistance ; lignes icône / intitulé / état / flèche ou interrupteur | `set-sec`, `set-choice`, lignes régulières | aucune animation superflue | capture clair/sombre ; commandes inchangées (`data-action`, `data-theme`, `data-lang`, `data-currency`) |
| **Services** | Liste de groupes, transfert international mêlé aux autres lignes | **Recherche** ; section dédiée **« Transferts internationaux »** (destinations, services de retrait Orange Money / Wave / MTN MoMo… lus dans `js/data/intl-catalog.js`, action « Envoyer à l'étranger ») ; autres groupes en liste | `svc-search`, `svc-intl-card` | — | capture EN/AR ; la section n'apparaît que si le serveur annonce le service (règle d'origine conservée) |
| **Progression du transfert** | Logo + courbe + libellés « Vérifié / Envoyé / Réponse du serveur / Confirmé » | **Anneau** autour du logo qui avance par étapes réelles (1/4 préparation, 2/4 traitement, 3/4 finalisation si la réponse tarde, 4/4 confirmation) ; textes bancaires ; échec = anneau rouge, statut à vérifier = ambre | `sa-ring`, `sa-lit`, `sa-spin` | anneau qui avance (700 ms) ; lumière tournante seulement pendant l'attente | `tests/ui/proc-frames.mjs` : 7 états ; aucune coche avant la réponse confirmée |
| **Notifications** | Liste par jour | **Filtres** (toutes, argent, sécurité, informations), barre « non lu », pastille d'icône par catégorie | `nc-filters`, `data-cat` | — | capture ; déclencheurs, destinataires et envoi inchangés |
| **Présentation initiale** | 5 scènes en verre avec halos et boutons ronds | 5 scènes en **aplats** (carte de compte, actions, lignes ; transfert ; carte ; sécurité) | `PhoneArt` | entrée en fondu + glissement | `tests/ui/onboarding-shots.mjs` |

## 2. Restylés (même composition, nouvelles formes, couleurs et mouvements) — à ne pas compter comme « reconstruits »
Connexion, inscription, réinitialisation, reçu (coche en cercle, montant en premier), cartes (carte aplat marine, retournement recto/verso conservé), ajout de carte, détails de carte, historique, détail d'opération, envoi (numéro, montant, vérification), reçu, profil, modification du profil, appareils, sessions, confidentialité, aide, à propos, discussion d'assistance, Amal, Boost, crédit, retrait, vérification d'identité, investissement, cinéma, écrans d'erreur et hors ligne, administration (cinq rôles, centre de contrôle…), fenêtres et feuilles.
Ils héritent : boutons rectangulaires à angles de 12 px, surfaces pleines, lignes de liste régulières, pastilles d'icône à angles adoucis, barre de navigation, jetons de mouvement.

## 3. Boutons
Rectangles à angles adoucis (12 px), hauteur 52 px, **un seul bleu d'action** (bleu profond), retour tactile net (90 ms), états chargement (cercle), désactivé (aplat gris), secondaire (filet), discret (texte), destructif (teinte rouge). Les actions principales sont visibles ; les secondaires restent accessibles sans encombrer.

## 4. Animations : ce qui a été retiré, ce qui reste
Voir `SANAD_ANIMATIONS.md` §0. Retirés : sons ludiques, confettis, pièces, ondes, compteurs depuis 0, célébration plein écran, rebonds, flottements, orbites, étincelles, halos, reflets qui balaient, inclinaison de la carte de solde. Restent : entrées d'écran en fondu, panneaux depuis l'endroit touché, anneau de progression, chargement, secousse d'une saisie refusée.

## 5. Ce qui n'est PAS fait ou à décider
1. **Groupe « Croissance » du menu Services** (Boost, vérification d'identité, retrait, crédit, chat, Amal, cinéma) : masqué dans le code d'origine par un décalage d'index (`G.splice(1,1)` retire ce groupe au lieu du groupe Crypto). Les écrans existent et fonctionnent ; je ne les ai **pas** affichés sans votre accord. Pour les afficher : `GROW_IN_MENU = true` dans `js/screens/crypto-market.js`.
2. **« Échanger »** : n'existe que dans la section crypto, désactivée dans la configuration d'origine ; le bouton n'est donc pas affiché (quatrième action = « Plus »). Aucun bouton ne mène à une page vide.
3. **Écrans « restylés »** (§2) : leur composition n'a pas été reprise un à un.
4. **Figma** : fichier créé (jetons de couleur en variables, planche des jetons) ; **composants et écrans non construits** : le quota d'appels de l'outil Figma du plan Starter a été atteint, et ce plan n'autorise qu'un mode par collection (thème sombre = second jeu de variables). Lien : https://www.figma.com/design/z42AMfKj1PuCLGM4Np39CT
5. **Android** : voir `docs/ANDROID.md` (état exact du build).
6. Réception du **reçu PDF**, du partage et de la copie de référence : fonctions existantes conservées ; non revérifiées dans un lecteur PDF.
7. Aucun test sur appareil réel (iPhone, Android), ni Safari.
