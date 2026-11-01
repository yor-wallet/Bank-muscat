# Barq — lisez-moi
Application web (PWA) statique. `npm run build` produit `dist/`.

| Besoin | Fichier |
|---|---|
| Nouvelle identité (nom, logo, palette), ce qui est conservé | `docs/BARQ.md` |
| iPhone (installation, application native) | `docs/IOS.md` |
| Android | `docs/ANDROID.md` |
| Règles du projet (à lire d'abord) | `PROJECT_RULES.md` |
| Ce qui est programmé / testé / connecté / déployé, mesures, liste des inachevés | `STATUT_BARQ.md` |
| Toutes les animations, leurs déclencheurs et leurs jetons | `SANAD_ANIMATIONS.md` |
| Historique des changements | `CHANGELOG_SANAD_PAY.md` |
| Assistance IA et cinq rôles (fonction serveur non déployée) | `sanad-agents/`, `supabase/functions/sanad-agents/` |
| Résultats des tests | `docs/TEST_RESULTS.md`, `tests/perf/motion.json` |

Vérifier : `npm run build`, `npm run test:agents`, puis `node tests/ui/<banc>.mjs dist` (voir `STATUT_BARQ.md` §2). Les bancs n'écrivent jamais en production.
