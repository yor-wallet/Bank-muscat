# BEFORE_AFTER_FEATURE_MATRIX — Freindi Pay 20.3.0 → Sanad Pay 21.0.0

Colonne **Avant** = fonctionnement documenté AVANT toute modification (lu dans le code et vérifié par captures, `docs/screenshots/before/`).
Colonne **Après / vérification** = remplie à la fin, uniquement avec ce qui a réellement été exécuté (voir `docs/TEST_RESULTS.md`).
Légende statut : ✅ vérifié inchangé côté métier · 🎨 apparence modifiée, comportement identique · ➕ ajout non intrusif · ⚠️ limite / à faire par le propriétaire.

Inventaire machine : `tests/characterization/inventory.baseline.json` (85 identifiants d'écran, 356 symboles JS de premier niveau, 59 RPC, 4 fonctions Edge invoquées, 13 tables, 6 clés de stockage littérales).

| # | Fonctionnalité | Avant (fonctionnement conservé) | Fichiers / identifiants protégés | Après / vérification |
|---|---|---|---|---|
| 1 | Ouverture / splash | `boot.js` remplace `#splash` par `OpeningArt.splash(LANG)`, attend `SPLASH_MIN` = 1900 ms (600 ms en mouvement réduit), crochet `__FP_SPLASH_MIN` | `boot.js`, `opening-art.js` | _à remplir_ |
| 2 | Choix de langue au 1er lancement | `DeviceLang` (EN / FR / AR), clés `yor_device_lang`, `yor_lang_chosen` | `utils-lang.js` | _à remplir_ |
| 3 | Présentation (onboarding) | `Onboarding.show(done)` → `'signup'` / `'login'`, 4 pages, glisser + clavier, RTL inversé | `onboarding.js` | _à remplir_ |
| 4 | Inscription / connexion / réinitialisation | `AuthEngine.signUp/signInWithPassword/resetPassword`, indicatif téléphone obligatoire (Oman en tête), écrans `login`, `signup`, `reset` | `auth.js`, `screens/auth.js`, `wire.js` | _à remplir_ |
| 5 | Code PIN (6 chiffres) + verrouillage | RPC `pin_status`, `set_pin`, `verify_pin`, `change_pin` ; `AppLock.gate` au démarrage, retour de l'arrière-plan > 5 s, échec = fermé | `pin.js`, `app-lock.js`, `keypad.js` | _à remplir_ |
| 6 | Face ID / WebAuthn | clé publique dans `friendly_faceid_v1`, `FaceId.gate`, obligatoire si l'appareil le permet, avant le PIN | `faceid.js` | _à remplir_ |
| 7 | Accueil | `V12.renderHomeV12` / `Premium` : carte de solde (œil masquer), 4 actions rapides, « ce mois-ci » (opérations confirmées seulement), carrousel `Promos`, activité récente, tirer pour actualiser | `v12.js`, `premium.js`, `v13.js`, `promos.js` | _à remplir_ |
| 8 | Solde / conversion | `displayCurrency()`, `balanceView()`, `balanceText()` ; conversion seulement avec un taux écrit (`FX_RATES`), montant d'origine toujours affiché ; OMR à 3 décimales | `helpers.js`, `domain.js`, `reference-data.js` | _à remplir_ |
| 9 | Comptes / détail du solde | `UserDataEngine.readAccounts` (table `accounts`, lecture seule côté client) | `engines.js` | _à remplir_ |
| 10 | Transfert d'argent (Oman, numéro mobile) | `country-select` → `tx-amount` → `tx-review` (PIN / Face ID) → `processing` → `receipt`, RPC `fiat_send_external` (`identifierType:'PHONE'`), limites 0,100–3000 OMR, frais 0 | `transfer-flow.js`, `transfer-engine.js`, `state.js` | _à remplir_ |
| 11 | États de traitement | `ProcessingEngine.run(work,{timeoutMs})` : démarre tout de suite, l'animation suit l'état réel ; phases `secure`, `send`, attente serveur après 1,6 s, `uncertain` après 30 s ; `SendAnim.setPhase` | `state.js`, `send-anim.js` | _à remplir_ |
| 12 | Reçu | `receipt.js` : statut réel (`txState`), pas de solde restant, état SMS / e-mail lu au serveur (`get_recipient_notice_status`), boutons PDF / PNG / Partager / Copier la référence / Imprimer | `receipt.js`, `receipt-export.js` | _à remplir_ |
| 13 | Historique + recherche | `HIST` (q, période, sens) + filtres de statut ; RPC `my_transactions` (200 dernières) | `history-cards.js`, `premium.js` | _à remplir_ |
| 14 | Cartes | `cards`, `cards-add`, `card-settings` ; carte « aperçu » tant qu'aucun émetteur réel (`c.issued !== true`), thèmes (`violet` = « Orange », identifiants de thème conservés) | `v12.js`, `card-metal.css` | _à remplir_ |
| 15 | Services / hub | `services`, tuiles masquées par `FEATURES.crypto=false` (crypto, banques, chaîne), capacités serveur (`LiveX.caps`) | `crypto-market.js`, `livex.js`, `hub.js` | _à remplir_ |
| 16 | Crypto & YOR-USDT | **Masqué** par `FEATURES.crypto=false` ; code intact derrière le drapeau | `crypto-*.js`, `chain-wallet.js`, `yor-chain.js`, `wallet-connect.js` | ✅ drapeau inchangé |
| 17 | Transfert international (`intl`) | `intl_send` idempotent, PIN, 0,5–3000 OMR, 48–72 h, visible seulement si `intl_countries` lisible | `screens/intl.js`, `intl-catalog.js` | _à remplir_ |
| 18 | Notifications (écran + alerte en direct) | `notifications` (table), lecture / suppression, types `TRANSFER_SENT/RECEIVED`, `DEPOSIT` | `notifications.js`, `v181.js`, `engines.js` | _à remplir_ |
| 19 | Web Push | `Push.enable/disable/sync/test`, `sw.js` événements `push`, `notificationclick`, `pushsubscriptionchange` ; clé VAPID publique | `push.js`, `sw.js`, `supabase/functions/push-send` | _à remplir_ |
| 20 | Profil, réglages, sécurité | `profile`, `profile-edit`, `settings`, `devices`, `sessions`, `privacy`, `help`, `about`, thème clair / sombre / système (`fp_theme`), langue, mode bureau (`yor_layout_mode`) | `profile-settings.js`, `info.js`, `premium.js` | _à remplir_ |
| 21 | KYC | `kyc_status`, `kyc_submit`, documents | `kyc.js` | _à remplir_ |
| 22 | Crédit, coffre, investissement, retrait | `credit_*`, `vault_*`, `invest_*`, `withdraw_*` (IBAN omanais, mod 97) | `credit.js`, `vault.js`, `invest.js`, `withdraw.js` | _à remplir_ |
| 23 | Chat / support, assistant | `chat_send`, `chat_mark_read`, fichiers PDF, assistant d'administration (`ai-assist`, humain décide) | `chat.js`, `ai19.js` | _à remplir_ |
| 24 | Cinéma / annonces / récompenses | films publicitaires animés, annonces admin, confettis de récompense, sons désactivés par défaut | `cinema.js`, `reward.js`, `sfx.js` | _à remplir_ |
| 25 | Panneaux administratifs | `admin*` (utilisateurs, KYC, retraits, crédit, investissement, chat, annonces, notifications, audit), réservés au rôle admin vérifié côté serveur | `admin.js`, `admin19.js` | _à remplir_ |
| 26 | Robustesse | écran de secours si un rendu échoue, `healServiceWorker`, `LOAD_FAILED`, hors ligne | `resilience.js`, `boot.js`, `sw.js` | _à remplir_ |
| 27 | PWA / installation | manifeste, raccourcis (envoyer / recevoir / cartes / historique), `install.html`, écrans de lancement iOS (24 JPEG), icônes | `manifest.webmanifest`, `install.html`, `assets/splash` | _à remplir_ |
| 28 | Cache / service worker | `SHELL` + nom de cache régénérés par le build ; réseau jamais mis en cache pour Supabase / API | `sw.js`, `scripts/build.mjs` | _à remplir_ |
| 29 | E-mails de transaction / sécurité | Fonction Edge `send-email` (Brevo), expéditeur vérifié inchangé, aucun solde dans les e-mails | `supabase/functions/send-email` | ⚠️ textes de marque mis à jour dans la source ; **déploiement par le propriétaire requis** |
| 30 | SMS | Déclenchés côté serveur uniquement ; aucun SMS depuis le client ; le code client n'envoie ni n'invente aucun expéditeur | (serveur) | ✅ non modifié |

## Marque : où chaque occurrence est classée
Voir `docs/BRAND_OCCURRENCES.md` (généré) : *texte visible* → remplacé ; *identifiant technique* → conservé ; *banque / bénéficiaire externe* → conservé ; *commentaire* → neutralisé quand sans risque.
