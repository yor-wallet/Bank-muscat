# Tests serveur (PostgreSQL local)

Vérifient les migrations `supabase/migrations/20261019_*.sql` sur une base jetable qui reprend le schéma de production :

- `stub.sql` : tables et schéma `auth` minimaux (mêmes colonnes et contraintes que la production) ;
- `prod_defs_split.sql` (non versionné) : le texte des fonctions de production, lu avec `pg_get_functiondef` — les migrations de 16.0.0 modifient
  plusieurs de ces fonctions en place (`enqueue_recipient_notices`, `handle_new_user`, `trg_bank_job`, …), il faut donc les tester sur leur texte réel ;
- `triggers.sql` : déclencheurs de production ;
- `tests.sql` : 40 contrôles (récompense unique, numéro déjà récompensé, pas de bonus rétroactif, bonus coupé, e-mail « non versé » supprimé,
  alerte admin, transfert international 48 h à 72 h, rejeu idempotent, refus de pays / moyens / numéros invalides, droits admin…).

Lancer : démarrer un PostgreSQL 16 local, puis `./reset.sh` (recrée la base `t`) et `psql -d t -f tests.sql` → « ALL TESTS PASSED ».
