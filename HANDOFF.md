# HANDOFF — Freindi Pay (passage de relais vers Claude Code)

État au moment du transfert : branche `freindi-pay-teal-refonte`, version applicative **20.4.0**, dernier commit livré `395b7b2` (+ ce fichier). Dépôt : `yor-wallet/reew-wallet-`. Branche poussée, pas de pull request ouverte, `main` non touchée.

## 1. Règles de travail de l'utilisateur (à respecter)

- Il écrit en **français** (parfois en arabe). Répondre en français.
- **Règle permanente : ne faire que ce qui est explicitement demandé, aucune action de sa propre initiative** (déploiement, suppression, pull request, SQL, etc.). En cas de doute, poser UNE question courte.
- Règles du brief : ne jamais inventer de transaction, de solde ni de confirmation ; ne jamais exposer un secret ; conserver les identifiants techniques ; ne jamais dire qu'une action est testée si elle ne l'a pas été ; ne jamais déclarer un SMS « livré » sans confirmation du fournisseur.

## 2. Décisions déjà prises par l'utilisateur

| Sujet | Décision |
|---|---|
| Identité visuelle | **Teal** proche des images jointes ; le logo d'origine reste tel quel. Un second brief demandait un bleu `#007AFF` : l'utilisateur a répondu **« Garder le teal »**. Ne pas passer au bleu. |
| Périmètre | Compléter l'existant (pas de réécriture complète). |
| Livraison | Branche GitHub (pas `main`). |
| Prochain chantier | **SMS Infobip** uniquement (voir §5). Les 6 modèles d'email du second brief n'ont **pas** été demandés cette fois. |
| Serveur | L'utilisateur a choisi **« Déployer sur Supabase »** pour la fonction `send-notice`, après relecture de la version en production. **Rien n'a encore été déployé ni écrit.** |

## 3. Ce qui est fait et poussé

- **20.3.0** (`6466060`) : identité teal, écran Comptes, barre du bas (Accueil, Comptes, Transfert, Cartes, Plus), assistant « Freindi Pay ».
- **Reçu épuré** (`ed513cf`) : lignes utiles seulement, une référence courte (`FP-…`), mêmes lignes à l'écran, en PNG et en PDF ; FR/EN/AR vérifiés (dates isolées Unicode pour l'arabe).
- **Conductor** (`js/core/conductor.js`, `d173b7d`) : moteur adaptatif (palier `high|mid|low` sur `<html data-fx>`, mesure des images/s avec hystérésis, planificateur au repos, signaux masquer/reprendre/en ligne/hors ligne, mode sûr après 3 fins anormales en 10 min).
- **DataCenter** (`js/core/datacenter.js`) : point unique de relecture du serveur (`pull` immédiat dédoublonné, `request` regroupé avec écart minimal et retrait exponentiel 5 s à 5 min, redessin de l'écran seulement si l'empreinte change, jamais dans les écrans occupés). `AuthEngine.hydrateLive()` passe par lui.
- **Sentinels** (`js/features/sentinels.js`, `dc6520f`) : 8 mini-agents **en lecture seule sur l'argent** (balance, ledger, sync, render, storage, shell, faults, i18n). Phrase d'état dans Paramètres › Diagnostic.
- **Tour** (`js/features/tour.js`) + `css/fx.css` (`395b7b2`) : visite guidée des 5 onglets, une seule fois, uniquement pour un compte de moins de 7 jours ; aurore et ciel étoilé dans la présentation ; paliers d'effets.
- Documentation : `CHANGELOG.md` et `ARCHITECTURE.md` (sections 20.4.0). `dist/` reconstruit (cache du service worker `fp-shell-v20.4.0-d3abd587b2`).

## 4. Vérifié / non vérifié

**Vérifié** (Chromium + Playwright, en local) : 46 contrôles moteur sur les sources et sur `dist/`, test de montée de palier, 29 contrôles visuels, chargement de `dist/` sans erreur, captures du reçu en FR/AR.

**Non testé** : vrai iPhone/Android, Safari ; temps réel Supabase de bout en bout ; connexion réelle, transferts réels, SMS, emails, export PDF sur appareil.

Les scripts de test (`test-engine.cjs`, `test-visual.cjs`, `test-upgrade.cjs`, `load-dist.cjs`) ont été écrits dans l'espace de travail temporaire de la session précédente : **ils ne sont pas dans le dépôt**. Méthode : `python3 -m http.server 8765` à la racine + Playwright avec Chromium `--no-sandbox` ; en environnement sans interface, le palier d'effets tombe à `low` (peu de cœurs), c'est normal.

## 5. À faire : SMS Infobip (en attente de feu vert pour le déploiement)

Ce que le brief demande (à reprendre tel quel, sans extrapolation) :

- Conserver l'intégration Infobip existante ; `SMS_PROVIDER=infobip`, base `https://x1e883.api.infobip.com` ; la clé `INFOBIP_API_KEY` vit **uniquement** dans les secrets Supabase (jamais dans le dépôt, jamais côté navigateur).
- **Deux catégories** : (A) expéditeur du transfert, nom souhaité « Friendly Pay », texte « Your transfer of [AMOUNT] OMR to [BENEFICIARY] has been registered. Reference / Date & Time / Status (statut réel) » ; (B) bénéficiaire, nom souhaité « Bank Muscat ».
- **Bank Muscat seulement si** cette banque a expressément autorisé l'envoi sous son identité **et** si Infobip a approuvé ce Sender ID pour cet usage. Sinon : Sender ID approuvé de Freindi Pay. **Demander la preuve à l'utilisateur ; ne pas supposer l'autorisation.**
- **SMS de retard technique** au bénéficiaire, bilingue dans un seul SMS (arabe puis anglais), uniquement pour une transaction réelle dont le retard est **confirmé par le système**. Ne jamais présenter la somme comme reçue. Textes exacts : voir le brief (champs : montant, téléphone de l'expéditeur si sa communication est autorisée, référence, date et heure).
- Date et heure d'Oman (`Asia/Muscat`) ; envoi depuis le backend ; **aucun doublon** pour le même événement.
- Enregistrer : id de transaction, numéro destinataire, Sender ID utilisé, date d'envoi, statut de livraison, réponse Infobip. Distinguer **accepté par Infobip / envoyé / livré / échoué**.
- Ne jamais modifier de données financières pour provoquer un SMS ; essais uniquement sur des numéros de test autorisés.

Ce que l'on sait de l'existant :

- Le code source de `send-notice` **n'est pas dans le dépôt** (`supabase/functions/` ne contient que `send-email`, `push-send`, `ai-assist`). Il est déployé dans le projet Supabase `yor-wallet` (id `gebjmguoauvutiqvoswl`). **Avant toute modification : relire la version en production** (outil Supabase `get_edge_function`), la committer dans `supabase/functions/send-notice/`, puis la modifier.
- Le client l'appelle en secours dans `js/features/transfer-engine.js` (`flushNotices`) : `sb.functions.invoke('send-notice', { body: { tx_id } })`. Le commentaire de ce fichier décrit le principe actuel : la base appelle elle-même la fonction à l'enregistrement du transfert, un balayage à la minute relance les échecs, et le serveur « réclame » chaque message une seule fois (un doublon est inoffensif).
- Les migrations (`supabase/migrations/20261019_*.sql`) manipulent la table `recipient_notices` (audiences `SENDER`/`RECIPIENT`, canaux, statuts `PENDING/FAILED/SENDING/SKIPPED`) et la fonction `enqueue_recipient_notices(uuid)`. Point d'appui probable pour la journalisation et l'anti-doublon : **à lire avant de créer quoi que ce soit de nouveau**.
- Constat antérieur : le Sender ID par défaut dans `send-notice` était « FriendlyPay ». Il doit correspondre à un Sender ID réellement approuvé dans Infobip (à confirmer avec l'utilisateur / le tableau de bord Infobip).
- À établir (non connu à ce jour) : **quel champ ou statut du système indique un retard technique confirmé**. Ne pas en inventer un ; sans signal réel, ne pas envoyer ce SMS.
- Ordre de mise en production prévu dans `supabase/functions/README.md` : migrations, puis fonctions, puis site (`dist/`).

## 6. Points ouverts connus

- Table `_probe19` repérée dans le projet Supabase sans RLS ; aucun SQL appliqué. À examiner avec l'utilisateur avant toute action (ne pas deviner son usage).
- « Ajouter des fonds » et « Transférer entre comptes » ne sont pas implémentés.
- La 2ᵉ page de la présentation annonce une récompense de bienvenue de 10 OMR : texte antérieur, lié à la vraie récompense côté serveur (`Reward`) ; ne pas le modifier sans vérifier le serveur.
- La visite guidée est limitée aux comptes de moins de 7 jours (interprétation de « tutoriel à la première ouverture » ; la présentation en 5 pages existait déjà).
- « Connecter les commits et les agents » a été compris comme « tout relier et livrer en commits logiques » ; aucun workflow CI n'a été créé.
- Ouverture d'une pull request : non demandée à ce jour.

## 7. Repères techniques rapides

- Site statique PWA (HTML/CSS/JS sans modules). Les scripts sont chargés avec `defer` dans l'ordre strict de `index.html`. `npm run build` (esbuild, `scripts/build.mjs`) produit `dist/` (fichiers à empreinte) et régénère le cache du service worker. **Un nouveau fichier JS/CSS s'ajoute dans `index.html` (et dans la liste `SHELL` de `sw.js`), puis `npm run build`, puis commit de `dist/`.**
- Lectures serveur : `UserDataEngine` utilise `must()` (une lecture qui échoue ne remplace jamais `Runtime`). Ne jamais écrire un solde côté client.
- Traductions : `TR.en/fr/ar` + `t()` / `tf()` ; tout texte visible doit exister dans les trois langues, l'arabe en RTL.
- Fichiers à lire en premier : `ARCHITECTURE.md`, `CHANGELOG.md`, `supabase/functions/README.md`, `js/core/guardian.js`, `js/features/auth.js`.
