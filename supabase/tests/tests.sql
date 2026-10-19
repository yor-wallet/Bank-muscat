create function pg_temp.chk(c boolean, m text) returns void language plpgsql as $$ begin if c is not true then raise exception 'FAIL: %', m; end if; end $$;
\set ON_ERROR_STOP on
create function pg_temp.g() returns uuid language sql as $$ insert into public.pin_grants (user_id) values (auth.uid()) returning token $$;
-- ---- T0 : comptes existants (avant la mise en service) : aucun bonus
update public.app_private set value = '2099-01-01T00:00:00Z' where key = 'signup_bonus_from';
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@x.com', '{"first_name":"Ad","last_name":"Min","phone":"+96890000001","country":"OM"}', now()),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'legacy@x.com', '{"first_name":"Old","last_name":"User","phone":"+96890000002","country":"OM"}', now());
update public.profiles set role = 'admin' where email = 'admin@x.com';
update public.profiles set phone = null where email = 'legacy@x.com';
select pg_temp.chk((select count(*) from public.transactions where kind = 'SIGNUP_BONUS') = 0, 'T0 aucun bonus pour les comptes antérieurs');
update public.app_private set value = '2000-01-01T00:00:00Z' where key = 'signup_bonus_from';

-- ---- T1 : nouveau compte confirmé → 10 OMR, une fois
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('bbbbbbbb-0000-0000-0000-00000000000a', 'a@x.com', '{"first_name":"Awa","last_name":"Diop","phone":"+221771234567","country":"SN","language":"fr"}', now());
select pg_temp.chk((select count(*) from public.accounts where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a') = 1, 'T1 un seul compte (plus de West Africa)');
select pg_temp.chk((select balance from public.accounts where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and currency = 'OMR') = 10, 'T1 solde 10 OMR');
select pg_temp.chk((select data ->> 'primaryCurrency' from public.user_docs where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and doc_name = 'preferences') = 'USD', 'T1 monnaie d''affichage : USD');
select pg_temp.chk((select count(*) from public.transactions where kind = 'SIGNUP_BONUS' and receiver_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and amount = 10 and status = 'CONFIRMED') = 1, 'T1 une transaction SIGNUP_BONUS');
select pg_temp.chk((select count(*) from public.ledger_entries where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and delta = 10 and balance_after = 10) = 1, 'T1 écriture au registre');
select pg_temp.chk((select count(*) from public.notifications where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and type = 'REWARD' and (data ->> 'amount')::numeric = 10) = 1, 'T1 notification REWARD');
select pg_temp.chk((select count(*) from public.audit_log where action = 'SIGNUP_BONUS') = 1, 'T1 audit');
select pg_temp.chk((select count(*) from public.notifications where user_id = 'aaaaaaaa-0000-0000-0000-000000000001' and type = 'NEW_USER') = 1, 'T1 alerte NEW_USER à l''admin');
select pg_temp.chk((select count(*) from public.email_logs where email_type = 'ADMIN_NEW_USER' and recipient_email = 'admin@x.com') = 1, 'T1 e-mail ADMIN_NEW_USER');
select pg_temp.chk((select count(*) from public.email_logs where email_type = 'WELCOME' and recipient_email = 'a@x.com') = 1, 'T1 e-mail de bienvenue');
select pg_temp.chk((select count(*) from public.email_logs where email_type like 'TX\_%') = 0, 'T1 aucun e-mail « transaction » pour le bonus');
select pg_temp.chk((select count(*) from public.notifications where type = 'NEW_USER') = 1, 'T1 une seule alerte admin (l''admin ne s''alerte pas lui-même)');

-- ---- T2 : même numéro → pas de second bonus
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'b@x.com', '{"first_name":"Dup","last_name":"Phone","phone":"+221771234567","country":"SN"}', now());
select pg_temp.chk((select count(*) from public.transactions where kind = 'SIGNUP_BONUS') = 1, 'T2 pas de bonus pour un numéro déjà récompensé');
select pg_temp.chk((select count(*) from public.audit_log where action = 'SIGNUP_BONUS_SKIPPED') = 1, 'T2 refus journalisé');

-- ---- T3 : non confirmé → rien ; confirmation → bonus ; reconfirmation → pas de doublon
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('bbbbbbbb-0000-0000-0000-00000000000c', 'c@x.com', '{"first_name":"Cee","last_name":"Un","phone":"+221770000003","country":"SN"}', null);
select pg_temp.chk((select count(*) from public.transactions where receiver_id = 'bbbbbbbb-0000-0000-0000-00000000000c') = 0, 'T3 non confirmé : aucun bonus');
update auth.users set email_confirmed_at = now() where id = 'bbbbbbbb-0000-0000-0000-00000000000c';
select pg_temp.chk((select count(*) from public.transactions where receiver_id = 'bbbbbbbb-0000-0000-0000-00000000000c' and kind = 'SIGNUP_BONUS') = 1, 'T3 confirmé : bonus');
update auth.users set email_confirmed_at = now() + interval '1 second' where id = 'bbbbbbbb-0000-0000-0000-00000000000c';
select pg_temp.chk((select count(*) from public.transactions where receiver_id = 'bbbbbbbb-0000-0000-0000-00000000000c' and kind = 'SIGNUP_BONUS') = 1, 'T3 pas de second bonus');
-- compte existant dont on met à jour l'e-mail confirmé : jamais de bonus rétroactif
update auth.users set email_confirmed_at = now() + interval '2 seconds' where id = 'aaaaaaaa-0000-0000-0000-000000000002';
select pg_temp.chk((select count(*) from public.transactions where receiver_id = 'aaaaaaaa-0000-0000-0000-000000000002') = 0, 'T3 compte ancien : pas de bonus rétroactif');

-- ---- T4 : bonus coupé (0)
update public.app_private set value = '0' where key = 'signup_bonus_omr';
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('bbbbbbbb-0000-0000-0000-00000000000d', 'd@x.com', '{"first_name":"Dee","last_name":"Zero","phone":"+221770000004","country":"SN"}', now());
select pg_temp.chk((select count(*) from public.transactions where receiver_id = 'bbbbbbbb-0000-0000-0000-00000000000d') = 0, 'T4 bonus coupé');
update public.app_private set value = '10' where key = 'signup_bonus_omr';

-- ---- T5 : historique
select set_config('app.uid', 'bbbbbbbb-0000-0000-0000-00000000000a', false);
select pg_temp.chk((select direction from public.my_transactions(10) where kind = 'SIGNUP_BONUS') = 'IN', 'T5 direction IN');
select pg_temp.chk((select counterparty_name from public.my_transactions(10) where kind = 'SIGNUP_BONUS') = 'Live X Digitale', 'T5 contrepartie');

-- ---- T6 : téléphone
select set_config('app.uid', 'aaaaaaaa-0000-0000-0000-000000000002', false);
select pg_temp.chk((select public.set_my_phone('+968 9000 0002') ->> 'phone') = '+96890000002', 'T6 numéro enregistré (espaces retirés)');
do $$ begin begin perform public.set_my_phone('+96891111111'); raise exception 'FAIL: T6 second changement accepté'; exception when sqlstate '22023' then null; end; end $$;
select set_config('app.uid', 'bbbbbbbb-0000-0000-0000-00000000000c', false);
update public.profiles set phone = null where id = 'bbbbbbbb-0000-0000-0000-00000000000c';
do $$ begin begin perform public.set_my_phone('12345'); raise exception 'FAIL: T6 numéro invalide accepté'; exception when sqlstate '22023' then null; end; end $$;

-- ---- T7 : transfert international
select set_config('app.uid', 'bbbbbbbb-0000-0000-0000-00000000000a', false);
select public.intl_send('SN', 'MOBILE_MONEY', 'Wave', 3, '{"firstName":"Mamadou","lastName":"Ba","phone":"+221770001111"}'::jsonb, 'key-intl-0001', pg_temp.g()) as r \gset
select pg_temp.chk((select balance from public.accounts where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and currency = 'OMR') = 7, 'T7 débit de 3 OMR');
select pg_temp.chk((select count(*) from public.transactions where meta ->> 'flow' = 'INTL_TRANSFER' and status = 'PROCESSING') = 1, 'T7 statut PROCESSING');
select pg_temp.chk((select (stages -> (jsonb_array_length(stages) - 1) ->> 'at')::int between 172800 and 259200 from public.bank_jobs b join public.transactions t on t.id = b.tx_id where t.meta ->> 'flow' = 'INTL_TRANSFER'), 'T7 dernier statut entre 48 h et 72 h');
select pg_temp.chk((select (stages -> (jsonb_array_length(stages) - 1) ->> 'status') = 'COMPLETED' and scenario = 'SUCCESS' from public.bank_jobs b join public.transactions t on t.id = b.tx_id where t.meta ->> 'flow' = 'INTL_TRANSFER'), 'T7 jamais rejeté, finit COMPLETED');
select pg_temp.chk((select (meta ->> 'country') = 'SN' and (meta ->> 'method') = 'MOBILE_MONEY' and (meta ->> 'destinationCurrency') = 'XOF' and (meta ->> 'destinationAmount')::numeric = 4476 from public.transactions where meta ->> 'flow' = 'INTL_TRANSFER'), 'T7 pays, moyen, devise, montant estimé (taux configuré)');
select pg_temp.chk((select count(*) from public.notifications where type = 'TRANSFER_SENT' and user_id = 'bbbbbbbb-0000-0000-0000-00000000000a') = 1, 'T7 notification « envoyé »');
select pg_temp.chk((select count(*) from public.notifications where type = 'TRANSFER_STATUS' and user_id = 'bbbbbbbb-0000-0000-0000-00000000000a') = 1, 'T7 notification de suivi (moteur de statuts)');
select public.intl_send('SN', 'MOBILE_MONEY', 'Wave', 3, '{"firstName":"Mamadou","lastName":"Ba","phone":"+221770001111"}'::jsonb, 'key-intl-0001', pg_temp.g()) as r2 \gset
select pg_temp.chk((select balance from public.accounts where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and currency = 'OMR') = 7, 'T7 rejeu de la même clé : pas de second débit');
do $$ begin begin perform public.intl_send('FR', 'BANK', null, 1, '{}'::jsonb, 'key-intl-0002', pg_temp.g()); raise exception 'FAIL: pays non listé accepté'; exception when sqlstate '22023' then null; end; end $$;
do $$ begin begin perform public.intl_send('SN', 'INTERAC', null, 1, '{"firstName":"a","lastName":"b","email":"a@b.co"}'::jsonb, 'key-intl-0003', pg_temp.g()); raise exception 'FAIL: moyen non listé accepté'; exception when sqlstate '22023' then null; end; end $$;
do $$ begin begin perform public.intl_send('SN', 'MOBILE_MONEY', 'Wave', 1, '{"firstName":"a","lastName":"b","phone":"123"}'::jsonb, 'key-intl-0004', pg_temp.g()); raise exception 'FAIL: numéro invalide accepté'; exception when sqlstate '22023' then null; end; end $$;
do $$ begin begin perform public.intl_send('US', 'BANK', 'Chase', 1, '{"firstName":"a","lastName":"b","bankName":"Chase","account":"123456789"}'::jsonb, 'key-intl-0005', pg_temp.g()); raise exception 'FAIL: US sans routing accepté'; exception when sqlstate '22023' then null; end; end $$;
do $$ begin begin perform public.intl_send('SN', 'MOBILE_MONEY', 'Wave', 99999, '{"firstName":"a","lastName":"b","phone":"+221770001111"}'::jsonb, 'key-intl-0006', pg_temp.g()); raise exception 'FAIL: montant énorme accepté'; exception when sqlstate '22023' then null; end; end $$;
-- solde insuffisant : l'erreur vient du CHECK (balance >= 0)
do $$ begin begin perform public.intl_send('AE', 'BANK', 'Emirates NBD', 50, '{"firstName":"a","lastName":"b","bankName":"ENBD","account":"AE070331234567890123456"}'::jsonb, 'key-intl-0007', pg_temp.g()); raise exception 'FAIL: solde insuffisant accepté'; exception when others then if sqlerrm like 'FAIL%' then raise; end if; end; end $$;
select pg_temp.chk((select balance from public.accounts where user_id = 'bbbbbbbb-0000-0000-0000-00000000000a' and currency = 'OMR') = 7, 'T7 solde intact après les refus');

-- ---- T8 : plus d'e-mail « versement pas encore effectué » à l'expéditeur
insert into public.transactions (id, reference, kind, sender_id, sender_yor_id, asset, amount, fee, total, status, meta) values
  ('cccccccc-0000-0000-0000-000000000001', 'YOR-TX-TEST-0001', 'FIAT_EXTERNAL', 'bbbbbbbb-0000-0000-0000-00000000000a', 'YOR-X', 'OMR', 1, 0, 1, 'CONFIRMED',
   '{"beneficiary":{"phone":"+96891234567","country":"OM"},"provider":"Test"}');
select public.enqueue_recipient_notices('cccccccc-0000-0000-0000-000000000001');
select pg_temp.chk((select count(*) from public.recipient_notices where transaction_id = 'cccccccc-0000-0000-0000-000000000001' and audience = 'SENDER' and channel = 'EMAIL') = 0, 'T8 plus d''e-mail expéditeur « non versé »');
select pg_temp.chk((select count(*) from public.recipient_notices where transaction_id = 'cccccccc-0000-0000-0000-000000000001' and audience = 'SENDER' and channel = 'SMS') = 1, 'T8 le SMS de confirmation reste');
select pg_temp.chk((select count(*) from public.email_logs where transaction_id = 'cccccccc-0000-0000-0000-000000000001' and email_type = 'TX_SENDER') = 1, 'T8 l''e-mail « transaction réussie » (le seul) est en file');

-- ---- T9 : console admin
select set_config('app.uid', 'aaaaaaaa-0000-0000-0000-000000000001', false);
select pg_temp.chk((select (public.admin_stats() ->> 'bonus_count')::int) = 2, 'T9 admin_stats : bonus_count');
select pg_temp.chk((select count(*) from public.admin_recent_users(5)) = 5, 'T9 admin_recent_users');
select pg_temp.chk((select (public.admin_set_signup_bonus(12.5) ->> 'amount')::numeric) = 12.5, 'T9 réglage du bonus');
select pg_temp.chk((select value from public.app_private where key = 'signup_bonus_omr') = '12.5', 'T9 valeur écrite');
select public.admin_set_signup_bonus(10);
select set_config('app.uid', 'bbbbbbbb-0000-0000-0000-00000000000a', false);
do $$ begin begin perform public.admin_stats(); raise exception 'FAIL: admin_stats ouvert à un utilisateur'; exception when sqlstate '42501' then null; end; end $$;
do $$ begin begin perform public.admin_set_signup_bonus(50); raise exception 'FAIL: réglage ouvert à un utilisateur'; exception when sqlstate '42501' then null; end; end $$;
select 'ALL TESTS PASSED' as result;
