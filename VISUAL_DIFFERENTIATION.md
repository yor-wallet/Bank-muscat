# VISUAL_DIFFERENTIATION — Sanad Pay n'est pas Freindi Pay repeint

Écrit AVANT de dessiner la nouvelle couche (règle n°0). Il fixe ce que Freindi Pay v20.3.0 faisait, ce que Sanad Pay fait à la place, et ce qui est **interdit** de reprendre.
Périmètre : présentation et mouvement uniquement. La logique métier (règle n°1) ne change pas ; seules les exceptions demandées par le propriétaire (Face ID, moteur de données) sont décrites dans `CHANGELOG_SANAD_PAY.md`.

Constat du propriétaire : *« on dirait que seuls le nom et les couleurs ont changé »*. Il est exact : la première passe de ce chantier (nom + conversion vert→bleu) laissait la même structure, les mêmes composants et la même animation. Elle est **refusée** et remplacée par ce qui suit.

---

## 1. Signature visuelle de Freindi Pay v20.3.0 (relevée dans le code et sur les captures « avant »)

| Domaine | Ce que faisait Freindi Pay | Où |
|---|---|---|
| Ouverture | Lettres « F-R-E-I-N-D-I » qui apparaissent une à une, anneau + barre de progression, sous-titre « PAY », 0,5–1,9 s, la même à chaque lancement | `opening-art.js`, `opening.css` |
| Présentation | Fond **noir**, grand titre en capitales sur deux lignes (blanc / couleur de marque), maquette de téléphone avec reflet, pastilles, 5 pages promettant « carte métal Visa », « Golfe · Afrique · USA · Canada » | `onboarding.js`, `phone-art.js`, `welcome.css` |
| Connexion | Barre de titre, logo centré, champs à bordure sur fond de page, deux boutons fantômes | `screens/auth.js` |
| Tableau de bord | En-tête (avatar rond + salut + 2 boutons ronds) → **carte de solde en dégradé** (puce de statut, œil, montant, ligne d'identifiant) → **4 actions rondes** → « Ce mois-ci » (barres) → carte d'installation → « Activité récente » → comptes → carrousel de pubs avec personnages → cartes | `premium.js`, `v12.js` |
| Navigation | Dock flottant arrondi, 5 entrées avec libellé permanent, **bulle circulaire centrale surélevée « Envoyer »**, pastille qui glisse | `v12.js`, `friendly.css` |
| Forme | Cercles pour les actions et les icônes, cartes à 28 px, boutons en dégradé avec halo coloré, quadrillage de fond, halos flous | `friendly.css`, `premium.css` |
| Icônes | Jeu « duotone » : contour + **ombre décalée de 1,4 px** teintée (`.d2`) | `icons.js` |
| Typographie | Titres de section en CAPITALES espacées, soldes lourds, libellés `px-*` | `premium.css` |
| Listes | Lignes dans des cartes de verre empilées, pastille de statut colorée dans la ligne | `transfer-flow.js` (`txRow`) |
| Services | Grille 3 colonnes de pastilles rondes + titres de groupe | `crypto-market.js` (`renderServices`) |
| Illustrations | Personnages / accessoires SVG (annonces, états vides), maquettes de téléphones | `assets/ads`, `assets/illustrations` |
| Transfert | Étapes numérotées 1-2-3 (bulles), champ montant centré, **glisser pour confirmer**, animation « deux téléphones + pièce » | `transfer-flow.js`, `send-anim.js` |
| Reçu | Bandeau d'en-tête de couleur, pastille de statut à cheval, lignes à plat, déchirure | `receipt.js`, `receipt-export.js` |
| Code / Face ID | Pavé de **grosses touches rondes** avec orbes qui volent vers des points, feuille Face ID plein écran avec orbe pulsante | `keypad.js`, `faceid.js` |
| Mouvement | Entrée d'écran « monte + flou », ressort sur les actions, confettis dorés, ondes | `motion.css`, `v18.css`, `premium.css` |

## 2. Ce que fait Sanad Pay à la place — le langage « Horizon »

Idée directrice : le logo fourni est une **coche posée sur une ligne d'horizon** dans un carré arrondi. Toute l'interface en est dérivée : *la coche* (ce qui est confirmé), *la ligne d'horizon* (le fil de l'action, la progression, la séparation), *le carré arrondi* (la seule forme de contenant), *le ciel* (le fond qui respire).

### 2.1 Architecture d'écrans (composition, pas couleurs)

| Écran | Freindi Pay | **Sanad Pay** |
|---|---|---|
| Tableau de bord | Cartes flottantes sur fond quadrillé ; solde dans une **carte** | **Ciel + feuille** : le solde est du *texte posé directement sur le ciel* (pas de carte), une ligne d'horizon porte le résumé du mois ; une **feuille blanche à coins supérieurs arrondis remonte par-dessus** et contient actions, opérations en cours, activité. Ordre : salut → solde-horizon → actions en bande → **en cours (si réel)** → activité → ce mois-ci → cartes → annonces. (Freindi : solde → actions → mois → activité → … ) |
| Actions rapides | 4 cercles avec libellé dessous | **Bande segmentée** de 4 carrés arrondis horizontaux (icône + libellé dans la même tuile), « Envoyer » plein, les autres teintés |
| Navigation | Dock flottant 5 entrées + bulle centrale ronde | **Barre « rail »** collée en bas (hairline), 4 onglets dont **seul l'onglet actif montre son libellé** (la pastille s'étire), et **« Envoyer » = carré arrondi plein en bout de rail** (jamais une bulle centrale). La ligne d'horizon glisse sous l'onglet actif |
| Historique | Puces de statut + champ + 2 rangées de puces | **Contrôle segmenté** (Tout / En cours / Échoué) + recherche collée en haut ; période et sens regroupés dans une rangée défilante unique de pastilles discrètes ; lignes **sans cartes empilées**, séparées par la ligne d'horizon |
| Services | Grille 3 colonnes de pastilles rondes | **Liste groupée** (type réglages) : tuiles carrées arrondies, libellé, chevron ; groupes avec titre en minuscules |
| Profil / Réglages | Carte de profil + liste de lignes | **Profil sur arc de ciel** (avatar carré arrondi centré) ; réglages en groupes ; thème et langue = **contrôles segmentés** ; interrupteurs ciel |
| Connexion / Inscription | Barre de titre + logo + champs à bordure | **Demi-écran de ciel** (marque + titre) et **feuille de formulaire** qui remonte ; champs **remplis** (sans bordure) avec ligne d'horizon au focus |
| Présentation | Fond noir, maquettes de téléphone, capitales | **Fond ciel clair**, 4 scènes illustrées « horizon », titres en casse normale, pastilles de page en traits, copie **limitée à ce qui existe réellement** (Freindi promettait Golfe/Afrique/USA/Canada et carte métal Visa : retiré) |
| Envoi (étapes) | Pastilles numérotées 1-2-3 | **Fil d'horizon** à 3 segments en haut de l'écran |
| Confirmation | Glisser sur une piste ronde | Piste « horizon » : la poignée est le **carré arrondi du logo** qui transporte la coche ; bouton clavier conservé |
| Traitement | Deux téléphones + pièce voyageuse | **Scène « Horizon »** (voir §2.5) |
| Reçu | Bandeau coloré + pastille à cheval | **Feuille-ticket claire** : grand glyphe de statut dessiné avec la coche du logo, montant en très grand, lignes en pointillés d'horizon, encoche latérale ; PNG/PDF repris dans la même composition |
| Code PIN | Grosses touches rondes + orbes volantes | **Touches carrées arrondies plates**, points de saisie = **barres d'horizon qui se remplissent** |
| Feuille Face ID | Plein écran avec orbe pulsante | **Feuille basse compacte** ; l'invite système est lancée directement depuis le toucher quand c'est possible (comme les autres applications) |
| Cartes | Métal / verre, puce, reflet holographique | **Cartes « verre ciel »** : aplat de dégradé, horizon en filigrane, aucune texture métal ; 4 thèmes redessinés |
| Vide / succès / erreur | Personnages SVG | **Scènes géométriques** (horizon, carrés arrondis, coche) dessinées une seule fois, sans personnage |

### 2.2 Langage de formes
- Un seul contenant : le **carré arrondi du logo** (rayon ≈ 24 % du côté). Tuiles d'icônes 44/56 px = carrés arrondis (Freindi : cercles). Cartes 24 px, boutons 16 px, champs 14 px.
- **Pas de halo coloré sur les boutons**, pas de quadrillage, pas de grain : aplats + une ombre bleutée très basse. Le contraste vient de l'encre marine et du bleu profond.
- Séparateur universel : la **ligne d'horizon** (trait de 2 px, bouts ronds, opacité 14 %).
- Libellés en casse normale ; **aucune capitale espacée** (Freindi en abusait).

### 2.3 Jeu d'icônes
- Source : les 35 icônes du pack (trait 2,6 sur grille 48, bouts ronds) — **plus de duotone / ombre décalée**. Les icônes absentes du pack sont redessinées sur la même grille (même trait). États : normal, pressé (échelle 0,96), focus (anneau), désactivé (40 %), chargement (rotation de trait), succès (coche), erreur (croix).

### 2.4 Illustration
- Scènes à base de **deux ou trois aplats** (ciel pâle, ciel doux, bleu profond) + la **coche** et la **ligne d'horizon**. Zéro personnage, zéro téléphone dessiné, zéro pièce.

### 2.5 Langage de mouvement « Horizon »
| Moment | Freindi Pay | **Sanad Pay** |
|---|---|---|
| Ouverture | Lettres + anneau + barre | **Séquence « Trait & Horizon »** (§3) |
| Entrée de l'accueil | Cartes qui montent en cascade, flou | **La feuille remonte** depuis le bas (translateY, 380 ms), le solde **apparaît par masque horizontal** (clip de gauche à droite, droite à gauche en RTL) |
| Onglets | Fondu + glissement générique | **Fondu croisé** 160 ms + déplacement de 6 px ; la ligne d'horizon de la barre glisse |
| Écran enfant | Glissement générique | **Axe partagé horizontal** (24 px + fondu) vers l'avant, inverse au retour, miroir en RTL |
| Détail / feuille | Pop | **Feuille qui monte** avec ressort amorti, fond qui s'éclaircit |
| Envoi | Pièce entre deux téléphones | Impulsion lumineuse qui court le long d'une ligne d'horizon ; **la coche se trace seulement quand le serveur confirme** |
| Reçu | Pastille qui pop | Le ticket **se déroule** (clip vertical) puis la coche se trace |
| Solde | Compteur | **Fondu + glissement de 6 px** du seul chiffre qui change, jamais de flash |
| Touche | Ressort + rotation | **Réduction à 0,98** seulement |
| Squelettes | Barres | Balayage horizontal (transform) |

## 3. Séquence d'ouverture — trois pistes, une retenue

Storyboards : `design/storyboards/opening-tracks.png` (et SVG source). Figma n'étant pas accessible depuis cette session, les trois pistes sont fournies en images + SVG, prêtes à être importées dans la planche.

- **Piste A — « Trait & Horizon »** : le fond est le ciel pâle (identique à l'écran de lancement iOS) ; la **coche se trace trait par trait**, la **ligne d'horizon s'étire** du centre vers les bords, puis le **carré arrondi se remplit** derrière et le nom se révèle par un masque horizontal. *(1,8 s au premier lancement.)*
- **Piste B — « Éclosion »** : un point devient carré arrondi qui grandit jusqu'à envahir l'écran en dégradé, puis la coche apparaît. *(Forte, mais le plein écran coloré saute à l'œil depuis un écran de lancement clair : rupture visuelle.)*
- **Piste C — « Aube »** : un dégradé monte du bas comme un lever de soleil, le nom se décale en lettres. *(Proche d'une animation de lettres, donc proche de Freindi.)*

**Retenue : A.** Justification : (1) elle est la seule à **reprendre le logo fourni tel quel** (coche + trait) au lieu d'ajouter un motif ; (2) sa première image est exactement l'écran de lancement iOS (ciel pâle sans aucun élément) : **aucun saut visuel** ; (3) elle se décline naturellement en version courte (coche + horizon seuls, 0,6 s) ; (4) en mouvement réduit elle devient un simple fondu du logo fixe ; (5) elle n'a aucun lien avec l'ouverture de Freindi.

Trois cas :
| Cas | Détection | Séquence |
|---|---|---|
| Premier lancement | aucune clé `sanad_opened` | complète, **1,8 s** (coche 0–620 ms, horizon 480–1100 ms, remplissage 900–1400 ms, nom 1100–1700 ms) |
| Lancements suivants | clé présente | version courte, **0,6 s** (coche + horizon), jamais plus de 0,8 s une fois l'application prête |
| Reprise depuis l'arrière-plan | `visibilitychange` / `pageshow` | **aucune séquence** (le verrouillage existant s'applique comme avant) |

Garanties : la séquence est un **habillage** posé sur l'application qui démarre en dessous ; elle se termine quand `application prête ET animation jouée` (jamais un `setTimeout` seul), un toucher la saute à l'instant, `prefers-reduced-motion` la remplace par un fondu, et elle n'attend ni l'authentification ni un flux métier (si la connexion est lente, le logo reste fixe ; en cas d'erreur de démarrage, l'écran d'erreur existant prend la main).

## 3 bis. Profondeur et matière (`css/s-finish.css`, `js/ui/depth.js`)
- Le solde, le sigle et l'avatar réagissent à l'inclinaison de l'appareil quand elle est disponible **sans demande d'autorisation**, sinon au pointeur : variables `--dx / --dy` (−1…1) lissées en `requestAnimationFrame`, appliquées en `transform` uniquement (3–18 px, 7–9° max). Rien n'est calculé si l'onglet est masqué ; `prefers-reduced-motion` supprime tout.
- Cartes : inclinaison 3D + reflet qui suit l'inclinaison, ombre en deux couches ; sigle : double ombre + anneau intérieur d'1 px ; listes : ombre longue + filet d'1 px, jamais de bordure « papier ».
- Limite assumée : la profondeur est mesurée (pas de WebGL, pas de flou animé) pour garder INP < 200 ms et aucune image perdue sur un téléphone d'entrée de gamme.

## 4. Liste de contrôle (état réel)
- [x] Chaque écran principal a une **composition** différente de Freindi (§2.1) — comparaison côte à côte : `docs/screenshots/compare/`.
- [x] Autre ordre de blocs sur le tableau de bord, autre séquence d'ouverture, autre barre de navigation, autres icônes, autres cartes, autre ticket de confirmation, autre reçu.
- [~] Les compositions neuves passent en `sx-*`, **mais** certains conteneurs de liste (`rv-list`, `rv-day`, `item`, `tx-row`) et les écrans secondaires non repris (admin, chat, crédit, coffre, cinéma, crypto) gardent leurs anciens noms de classe : seul leur habillage a changé (nouveaux jetons).
- [x] Aucun vert de marque, aucun or, aucune ombre décalée « duotone ».
- [x] Aucun identifiant `id` / `data-*` utilisé par un gestionnaire n'a été supprimé (`tests/characterization/compare.mjs`).

## 5. Ce qui ne change PAS (rappel règle n°1)
Routes, identifiants `id` / `data-action` / `data-nav` / `data-*` utilisés par les gestionnaires, appels réseau, calculs, validations, états initié / en cours / réussi / échoué / incertain, temporisations métier, clés de stockage, textes de traduction (les clés restent ; seuls des libellés de **présentation** sont réécrits : copie de la présentation, mentions de marque).


## 6. Mise à jour 21.1.0 — direction « Glass » (Revolut + verre dépoli)
Le premier langage (« Horizon » : ciel + feuille blanche, carré arrondi) a été jugé peu séduisant. Il est remplacé, sans toucher aux données ni aux flux, par :
- **Fond** : aurore bleu ciel / turquoise sur un gris-bleu très clair (clair) ou un bleu nuit profond (sombre), vivante mais discrète.
- **Navigation** : barre de verre à 5 entrées, bouton **Envoyer** rond au centre ; barre masquée dans les parcours plein écran.
- **Accueil** : solde centré géant, 4 boutons ronds, cartes de verre empilées — la hiérarchie est celle des applications bancaires modernes, mais rien n'est copié (pas de logo, de texte ni d'icône d'une autre marque ; la couleur et le logo restent ceux du pack Sanad Pay).
- **Formes** : cercles pour les actions et avatars, pilules pour boutons et champs, rayons de 24–30 px pour les cartes ; le carré arrondi du logo reste réservé à la marque.
- **Mouvement** : cascade d'apparition (≈ 60 ms entre éléments), ressort sur les touches, dérive lente de l'aurore, parallaxe d'inclinaison — transform + opacité uniquement.
Les captures « avant / après » de `docs/screenshots/compare/` montrent Freindi Pay 20.3.0 à gauche et Sanad Pay 21.1.0 à droite.
