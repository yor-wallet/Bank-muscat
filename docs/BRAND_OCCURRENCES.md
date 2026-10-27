# BRAND_OCCURRENCES — occurrences restantes de l'ancienne marque (généré par `scripts/dev/brand-report.mjs`)

Règle : **aucun texte visible** ne contient l'ancienne marque (vérifié sur les écrans rendus EN/FR/AR par `tests/ui/checks.mjs` et par recherche dans `js/i18n/`, `index.html`, `manifest.webmanifest`). Les occurrences ci-dessous sont des identifiants protégés ou des commentaires.

| Catégorie | Lignes |
|---|---|
| Identifiant technique protégé (clé de stockage, identifiant JS/CSS, nom de fichier, préfixe d'identifiant de base) | 211 |
| Commentaire de code (aucun effet) | 32 |
| Adresse e-mail d'assistance / d'expédition du propriétaire (boîte réelle, non modifiée — voir CHANGELOG) | 2 |
| Documentation / outillage / bancs de test | 225 |
| À examiner (texte restant non classé) | 2 |

## Par fichier (hors documentation)

| Fichier | technique | commentaire | à examiner |
|---|---|---|---|
| `js/screens/chain-wallet.js` | 27 | 0 | 0 |
| `js/features/chat.js` | 14 | 0 | 0 |
| `supabase/functions/send-email/index.ts` | 12 | 1 | 0 |
| `js/features/yor-chain.js` | 7 | 5 | 0 |
| `js/features/transfer-engine.js` | 7 | 3 | 0 |
| `supabase/migrations/20261019_live_x_admin_intl.sql` | 10 | 0 | 0 |
| `js/features/credit.js` | 9 | 0 | 0 |
| `js/screens/admin.js` | 9 | 0 | 0 |
| `js/wire.js` | 7 | 2 | 0 |
| `js/features/admin19.js` | 8 | 0 | 0 |
| `js/ui/icons.js` | 4 | 4 | 0 |
| `supabase/migrations/20261019_live_x_core.sql` | 8 | 0 | 0 |
| `index.html` | 5 | 1 | 0 |
| `js/core/domain.js` | 6 | 0 | 0 |
| `js/features/premium.js` | 5 | 1 | 0 |
| `js/screens/receipt.js` | 5 | 0 | 0 |
| `js/boot.js` | 2 | 1 | 1 |
| `js/core/helpers.js` | 4 | 0 | 0 |
| `js/core/router.js` | 4 | 0 | 0 |
| `js/features/auth.js` | 4 | 0 | 0 |
| `js/screens/profile-settings.js` | 4 | 0 | 0 |
| `js/core/engines.js` | 3 | 0 | 0 |
| `js/features/hub.js` | 3 | 0 | 0 |
| `js/i18n/translations.js` | 3 | 0 | 0 |
| `js/screens/crypto-market.js` | 2 | 1 | 0 |
| `css/s-tokens.css` | 1 | 1 | 0 |
| `js/core/store19.js` | 2 | 0 | 0 |
| `js/data/reference-data.js` | 2 | 0 | 0 |
| `js/features/chain-notice.js` | 1 | 1 | 0 |
| `js/features/cinema.js` | 2 | 0 | 0 |
| `js/features/livex.js` | 2 | 0 | 0 |
| `js/features/pin.js` | 2 | 0 | 0 |
| `js/features/promos.js` | 2 | 0 | 0 |
| `js/screens/drawer.js` | 2 | 0 | 0 |
| `js/screens/home.js` | 1 | 1 | 0 |
| `js/ui/receipt-export.js` | 1 | 1 | 0 |
| `scripts/build.mjs` | 2 | 0 | 0 |
| `sw.js` | 1 | 0 | 1 |
| `404.html` | 1 | 0 | 0 |
| `css/admin.css` | 0 | 1 | 0 |
| `css/admin19.css` | 0 | 1 | 0 |
| `css/ai19.css` | 0 | 1 | 0 |
| `css/chain.css` | 0 | 1 | 0 |
| `css/cinema.css` | 0 | 1 | 0 |
| `css/intl.css` | 0 | 1 | 0 |
| `css/resilience.css` | 0 | 1 | 0 |
| `css/s-screens.css` | 1 | 0 | 0 |
| `css/wallet-connect.css` | 0 | 1 | 0 |
| `install.html` | 1 | 0 | 0 |
| `js/core/supabase-client.js` | 1 | 0 | 0 |
| `js/core/utils-lang.js` | 1 | 0 | 0 |
| `js/features/faceid.js` | 1 | 0 | 0 |
| `js/features/onboarding.js` | 1 | 0 | 0 |
| `js/features/v12.js` | 1 | 0 | 0 |
| `js/features/v18-core.js` | 1 | 0 | 0 |
| `js/features/wallet-connect.js` | 1 | 0 | 0 |
| `js/layout/sidebar.js` | 1 | 0 | 0 |
| `js/layout/viewport.js` | 1 | 0 | 0 |
| `js/screens/intl.js` | 1 | 0 | 0 |
| `js/ui/keypad.js` | 1 | 0 | 0 |
| `js/ui/send-anim.js` | 0 | 1 | 0 |
| `offline.html` | 1 | 0 | 0 |
| `package.json` | 1 | 0 | 0 |
| `supabase/functions/ai-assist/index.ts` | 1 | 0 | 0 |
| `supabase/functions/push-send/lib.ts` | 1 | 0 | 0 |

## Lignes « à examiner »

- `js/boot.js:46: const caches2 = window.caches ? caches.keys().then(ks => Promise.all(ks.filter(k => /^(yor|fp)-shell-/.test(k)).map(k => caches.delete(k)))) : Promise.resolve()`
- `sw.js:41: await Promise.all(keys.filter(k => k !== CACHE && /^(yor|fp)-shell-/.test(k)).map(k => caches.delete(k)));`
