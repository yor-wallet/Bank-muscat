#!/bin/bash
cd /tmp/pgt
P="psql -h /tmp/pgt -p 5544 -U postgres -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "drop database if exists t" -c "create database t" 2>&1 | grep -v NOTICE
P="$P -d t"
$P -f stub.sql && $P -f prod_defs_split.sql && $P -f triggers.sql || exit 1
$P -f /home/user/REEW-Wallet-/supabase/migrations/20261019_live_x_core.sql && echo "migration 1 OK" || exit 2
node /home/user/REEW-Wallet-/scripts/dev/gen-intl-sql.mjs >/dev/null && $P -f /home/user/REEW-Wallet-/supabase/migrations/20261019_live_x_admin_intl.sql 2>&1 | grep -v NOTICE; echo "migration 2 done"
