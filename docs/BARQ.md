# Barq — nouvelle identité (22.0.0)

Demande du propriétaire : changer le nom (**Barq / برق**) et l'allure, au niveau d'une grande banque, utilisable sur iPhone.

## Nom
- Visible : « Sanad Pay » → **Barq**, « سند باي » → **برق** (anglais, français, arabe) : application, pages statiques, site, manifeste, e-mails et notifications (sources), reçus, assistant, textes d'aide.
- Identifiant affiché d'un compte : `SP-XXXXXX` → **`BQ-XXXXXX`** (affichage seulement : la base garde `YOR-…`). La saisie accepte BQ-, BARQ-, SP-, SANAD-, FP-… et YOR- (anciens préfixes compris).
- **Conservés volontairement (identifiants techniques)** : clés de stockage `sanad_*` (les renommer effacerait l'état des utilisateurs), fonction serveur `sanad-agents`, noms de classes et d'objets (`SanadEngine`), tables et colonnes. Aucun n'est visible.

## Logo
Un éclair blanc (برق = éclair) sur une tuile bleu électrique ; une ligne cyan en filigrane rappelle le ruban de la version précédente. Dessiné en SVG (`design/barq/barq-mark.svg`), toutes les déclinaisons sont générées par `scripts/dev/barq-assets.mjs` : icônes PWA, apple-touch-icon, maskable, favicons, images de partage EN/FR/AR, écrans de lancement iOS, icônes Android (`scripts/dev/android-assets.py`) et iOS (`scripts/dev/ios-patch.py`).

## Palette
| Rôle | Valeur |
|---|---|
| Action principale (boutons) | `#1F4FD8` (clair), `#3D7BFF` (sombre) |
| Accent | `#2F6BFF` |
| Étincelle (liens clairs, ligne du logo) | `#38D4FF` |
| Encre (texte) | `#0B1B3A` |
| Fond | `#F3F6FA` (clair), `#08131F` (sombre) |
| États | vert `#14A879`, ambre `#E08A12`, rouge `#E84D65` |
La couche « banque » de la 21.3.0 (surfaces pleines, angles sobres, aucune animation ludique) est conservée : seul le bleu a changé, et l'ouverture trace maintenant le contour de l'éclair.

## Ce qui n'a PAS été changé (volontairement)
- Aucune règle métier, calcul, frais, route, table ou paramètre : `node tests/characterization/compare.mjs`.
- L'adresse web (`freindi-pay.vercel.app`), le nom du projet Vercel et du dépôt, l'adresse d'expédition des e-mails (`yordigitalefinance@gmail.com`) et le nom d'expéditeur des SMS (réglé chez le fournisseur) : à faire par le propriétaire.
- Les e-mails / notifications **déjà déployés** côté Supabase gardent l'ancien nom tant que `send-email` et `push-send` ne sont pas redéployés avec les sources mises à jour du dépôt.
