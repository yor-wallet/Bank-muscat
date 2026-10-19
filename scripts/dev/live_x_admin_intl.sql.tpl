-- Live X Digitale 16.0.0 — console admin, téléphone obligatoire, transfert international (retrait 48 h à 72 h)
-- Fichier GÉNÉRÉ par scripts/dev/gen-intl-sql.mjs à partir de js/data/intl-catalog.js et de ce modèle : ne pas modifier à la main.

-- ---------- téléphone : tout compte doit avoir un numéro ----------
-- Les comptes créés avant l'obligation n'en ont pas : l'application le demande une fois (écran bloquant). Une fois enregistré, le numéro identifie le compte :
-- il n'est plus modifiable par la personne.
create or replace function public.set_my_phone(p_phone text) returns jsonb
language plpgsql security definer set search_path to '' as $f$
declare v_u uuid := (select auth.uid()); v_p text := regexp_replace(btrim(coalesce(p_phone, '')), '[\s().-]', '', 'g'); v_cur text;
begin
  if v_u is null then raise exception 'unauthenticated' using errcode = '28000'; end if;
  if v_p !~ '^\+[0-9]{8,15}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
  select phone into v_cur from public.profiles where id = v_u;
  if v_cur is not null and v_cur ~ '^\+[0-9]{8,15}$' then raise exception 'phone_already_set' using errcode = '22023'; end if;
  update public.profiles set phone = v_p where id = v_u;
  insert into public.audit_log (actor_id, action, target_id, details) values (v_u, 'PHONE_SET', v_u, '{}'::jsonb);
  return jsonb_build_object('ok', true, 'phone', v_p);
end $f$;

-- ---------- console admin (réservée au rôle admin, jamais mélangée aux réglages d'un utilisateur) ----------
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path to '' as $f$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'users_today', (select count(*) from public.profiles where created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'),
    'users_7d', (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'no_phone', (select count(*) from public.profiles where phone is null or phone !~ '^\+[0-9]{8,15}$'),
    'bonus_count', (select count(*) from public.transactions where kind = 'SIGNUP_BONUS'),
    'bonus_paid_omr', coalesce((select sum(amount) from public.transactions where kind = 'SIGNUP_BONUS'), 0),
    'bonus_amount_omr', coalesce((select nullif(btrim(value), '')::numeric from public.app_private where key = 'signup_bonus_omr'), 10),
    'intl_open', (select count(*) from public.transactions where meta ->> 'flow' = 'INTL_TRANSFER' and status in ('PENDING', 'PROCESSING', 'UNDER_REVIEW')),
    'intl_done', (select count(*) from public.transactions where meta ->> 'flow' = 'INTL_TRANSFER' and status = 'COMPLETED'),
    'balances', coalesce((select jsonb_object_agg(currency, total) from (select currency, sum(balance) total from public.accounts group by currency) s), '{}'::jsonb));
end $f$;

create or replace function public.admin_recent_users(p_limit integer default 20)
returns table(yor_id text, first_name text, last_name text, email text, phone text, country text, status text, role text, created_at timestamp with time zone, email_confirmed boolean)
language plpgsql stable security definer set search_path to '' as $f$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select p.yor_id, p.first_name, p.last_name, p.email, p.phone, p.country, p.status, p.role, p.created_at, (u.email_confirmed_at is not null)
    from public.profiles p left join auth.users u on u.id = p.id
    order by p.created_at desc limit least(greatest(coalesce(p_limit, 20), 1), 100);
end $f$;

create or replace function public.admin_set_signup_bonus(p_amount numeric) returns jsonb
language plpgsql security definer set search_path to '' as $f$
declare v_admin uuid := (select auth.uid());
begin
  if v_admin is null then raise exception 'unauthenticated' using errcode = '28000'; end if;
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_amount is null or p_amount < 0 or p_amount > 100 then raise exception 'invalid_amount' using errcode = '22023'; end if;
  insert into public.app_private (key, value) values ('signup_bonus_omr', trim(trailing '.' from trim(trailing '0' from round(p_amount, 3)::text)))
    on conflict (key) do update set value = excluded.value;
  insert into public.audit_log (actor_id, action, target_id, details) values (v_admin, 'ADMIN_SET_SIGNUP_BONUS', null, jsonb_build_object('amount', p_amount));
  return jsonb_build_object('ok', true, 'amount', p_amount);
end $f$;

-- ---------- transfert international ----------
create table if not exists public.intl_countries (
  iso text primary key check (iso ~ '^[A-Z]{2}$'),
  region text not null check (region in ('GULF', 'NORTH_AFRICA', 'WEST_AFRICA', 'CENTRAL_AFRICA', 'EAST_AFRICA', 'SOUTH_AFRICA', 'NORTH_AMERICA')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  methods text[] not null check (methods <@ array['BANK', 'MOBILE_MONEY', 'CASH_PICKUP', 'INTERAC'] and cardinality(methods) > 0),
  providers jsonb not null default '{}'::jsonb,
  enabled boolean not null default true
);
alter table public.intl_countries enable row level security;
drop policy if exists intl_countries_read on public.intl_countries;
create policy intl_countries_read on public.intl_countries for select to authenticated using (enabled);
grant select on public.intl_countries to authenticated;
-- @@INTL_SEED@@

-- le moteur de statuts existant (bank_jobs) prend aussi le flux INTL_TRANSFER
drop trigger if exists bank_job_start on public.transactions;
create trigger bank_job_start after insert on public.transactions for each row
  when (new.kind = 'CRYPTO_TO_BANK' or (new.meta ->> 'flow') = any (array['OMAN_TRANSFER', 'YOR_TO_BANK', 'INTL_TRANSFER']))
  execute function public.trg_bank_job();

do $m$
declare d text;
begin
  d := pg_get_functiondef('public.trg_bank_job()'::regprocedure);
  /* INTL_TRANSFER : jamais rejeté par le scénario de démonstration ; PROCESSING tout de suite, UNDER_REVIEW, puis COMPLETED entre 48 h et 72 h */
  d := replace(d, E'  v_rej := coalesce(v_speed,',
    E'  if v_flow = ''INTL_TRANSFER'' then v_scn := ''SUCCESS''; end if;\n  v_rej := coalesce(v_speed,');
  d := replace(d, E'  v_ok  := coalesce(v_speed, case v_flow when ''CRYPTO_TO_BANK'' then 240 when ''OMAN_TRANSFER'' then 300 else 172800 end);',
    E'  v_ok  := coalesce(v_speed, case v_flow when ''CRYPTO_TO_BANK'' then 240 when ''OMAN_TRANSFER'' then 300 when ''INTL_TRANSFER'' then 172800 + floor(random() * 86400)::int else 172800 end);');
  d := replace(d, E'    when v_flow = ''YOR_TO_BANK'' then jsonb_build_array(',
    E'    when v_flow in (''YOR_TO_BANK'', ''INTL_TRANSFER'') then jsonb_build_array(');
  if d not like '%INTL_TRANSFER%' then raise exception 'patch trg_bank_job'; end if;
  execute d;
  d := pg_get_functiondef('public._bank_mail(uuid,uuid,text)'::regprocedure);
  d := replace(d, E'case v_flow when ''CRYPTO_TO_BANK'' then ''Crypto'' when ''OMAN_TRANSFER'' then ''Transfers'' else ''Bank'' end',
    E'case v_flow when ''CRYPTO_TO_BANK'' then ''Crypto'' when ''OMAN_TRANSFER'' then ''Transfers'' when ''INTL_TRANSFER'' then ''Transfers'' else ''Bank'' end');
  if d not like '%INTL_TRANSFER%' then raise exception 'patch _bank_mail'; end if;
  execute d;
end $m$;

create or replace function public._intl_send_impl(p_country text, p_method text, p_provider text, p_amount numeric, p_beneficiary jsonb, p_key text)
returns jsonb language plpgsql security definer set search_path to '' as $f$
declare
  v_u uuid := (select auth.uid()); v_yor text; v_cc text := upper(btrim(coalesce(p_country, ''))); v_m text := upper(btrim(coalesce(p_method, '')));
  c public.intl_countries; v_b jsonb := coalesce(p_beneficiary, '{}'::jsonb); v_amt numeric; v_today numeric; v_per numeric; v_dest numeric;
  v_first text := btrim(coalesce(v_b ->> 'firstName', '')); v_last text := btrim(coalesce(v_b ->> 'lastName', ''));
  v_acct text := upper(regexp_replace(coalesce(v_b ->> 'account', ''), '[\s-]', '', 'g')); v_phone text := btrim(coalesce(v_b ->> 'phone', ''));
  v_prov text := btrim(coalesce(p_provider, '')); v_name text; v_cached jsonb; v_tx uuid; v_ref text; v_res jsonb; v_mask text;
begin
  if v_u is null then raise exception 'unauthenticated' using errcode = '28000'; end if;
  select yor_id into v_yor from public.profiles where id = v_u and status = 'ACTIVE';
  if v_yor is null then raise exception 'sender_inactive' using errcode = '42501'; end if;
  select * into c from public.intl_countries where iso = v_cc and enabled;
  if c.iso is null then raise exception 'unsupported_country' using errcode = '22023'; end if;
  if not (v_m = any (c.methods)) then raise exception 'unsupported_method' using errcode = '22023'; end if;
  if v_first = '' then raise exception 'missing_field:first_name' using errcode = '22023'; end if;
  if v_last = '' then raise exception 'missing_field:last_name' using errcode = '22023'; end if;
  if v_m = 'BANK' then
    if length(coalesce(v_b ->> 'bankName', '')) < 2 then raise exception 'missing_field:bank_name' using errcode = '22023'; end if;
    if v_acct !~ '^[A-Z0-9]{6,34}$' then raise exception 'invalid_account' using errcode = '22023'; end if;
    if v_cc = 'US' and coalesce(v_b ->> 'routing', '') !~ '^[0-9]{9}$' then raise exception 'invalid_routing' using errcode = '22023'; end if;
  elsif v_m = 'MOBILE_MONEY' then
    if v_prov = '' then raise exception 'missing_field:service' using errcode = '22023'; end if;
    if v_phone !~ '^\+[0-9]{8,15}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
  elsif v_m = 'CASH_PICKUP' then
    if v_phone !~ '^\+[0-9]{8,15}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
    if length(coalesce(v_b ->> 'city', '')) < 2 then raise exception 'missing_field:city' using errcode = '22023'; end if;
  elsif v_m = 'INTERAC' then
    if coalesce(v_b ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email' using errcode = '22023'; end if;
  end if;
  if p_amount is null or p_amount < 0.5 then raise exception 'invalid_amount' using errcode = '22023'; end if;
  v_amt := round(p_amount, 3);
  if v_amt > 3000 then raise exception 'limit_per_transaction' using errcode = '22023'; end if;
  if p_key is null or length(p_key) < 8 then raise exception 'idempotency_key_required' using errcode = '22023'; end if;
  v_cached := public._idem_check(v_u, p_key); if v_cached is not null then return v_cached; end if;
  select coalesce(sum(amount), 0) into v_today from public.transactions
    where sender_id = v_u and kind in ('FIAT_TRANSFER', 'FIAT_EXTERNAL') and asset = 'OMR' and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  if v_today + v_amt > 5000 then raise exception 'limit_daily' using errcode = '22023'; end if;
  select per_omr into v_per from public.fx_rates where currency = c.currency;     -- taux CONFIGURÉ seulement ; sans taux, aucun montant estimé n'est inventé
  v_dest := case when v_per is null then null else round(v_amt * v_per, 8) end;
  v_name := left(btrim(v_first || ' ' || v_last), 80);
  v_mask := case when v_m = 'BANK' then '••••' || right(v_acct, 4) when v_m in ('MOBILE_MONEY', 'CASH_PICKUP') then '••••' || right(regexp_replace(v_phone, '\D', '', 'g'), 4) else '' end;
  v_ref := public.new_tx_reference();
  insert into public.transactions (reference, kind, sender_id, sender_yor_id, asset, amount, fee, total, status, meta)
    values (v_ref, 'FIAT_EXTERNAL', v_u, v_yor, 'OMR', v_amt, 0, v_amt, 'PENDING',
      jsonb_strip_nulls(jsonb_build_object('demo', true, 'flow', 'INTL_TRANSFER', 'region', c.region, 'country', c.iso, 'method', v_m,
        'bankName', left(coalesce(nullif(v_prov, ''), nullif(v_b ->> 'bankName', ''), initcap(replace(lower(v_m), '_', ' '))), 80), 'provider', nullif(left(v_prov, 80), ''),
        'accountMask', nullif(v_mask, ''), 'destinationCurrency', c.currency, 'destinationAmount', v_dest, 'rate', v_per,
        'rateSource', case when v_per is null then null else 'fx_rates table (configured, not a bank rate)' end,
        'etaHours', jsonb_build_array(48, 72),
        'beneficiary', jsonb_strip_nulls(jsonb_build_object('name', v_name, 'firstName', v_first, 'lastName', v_last, 'phone', nullif(left(v_phone, 32), ''), 'country', c.iso, 'city', nullif(left(coalesce(v_b ->> 'city', ''), 60), ''))))))
    returning id into v_tx;
  perform public._debit_account(v_u, 'OMR', v_amt, v_tx);
  insert into public.notifications (user_id, type, title, message, transaction_id, data) values
    (v_u, 'TRANSFER_SENT', 'Transfer sent', v_amt::text || ' OMR to ' || v_name || ' (' || c.iso || ')', v_tx,
     jsonb_build_object('amount', v_amt, 'currency', 'OMR', 'to', v_name, 'reference', v_ref, 'country', c.iso, 'eta_hours', jsonb_build_array(48, 72)));
  v_res := jsonb_build_object('ok', true, 'transaction_id', v_tx, 'reference', v_ref, 'status', 'PROCESSING', 'amount', v_amt, 'currency', 'OMR', 'flow', 'INTL_TRANSFER',
    'destination_currency', c.currency, 'destination_amount', v_dest, 'eta_hours', jsonb_build_array(48, 72), 'demo', true);
  update public.idempotency_keys set result = v_res where user_id = v_u and key = p_key;
  return v_res;
end $f$;

create or replace function public.intl_send(p_country text, p_method text, p_provider text, p_amount numeric, p_beneficiary jsonb, p_idempotency_key text, p_pin_grant uuid default null)
returns jsonb language plpgsql security definer set search_path to '' as $f$
declare c jsonb;
begin
  c := public._idem_replay(p_idempotency_key); if c is not null then return c; end if;
  perform public._consume_grant(p_pin_grant);
  return public._intl_send_impl(p_country, p_method, p_provider, p_amount, p_beneficiary, p_idempotency_key);
end $f$;

revoke all on function public._intl_send_impl(text, text, text, numeric, jsonb, text) from public, anon, authenticated;
revoke all on function public.intl_send(text, text, text, numeric, jsonb, text, uuid) from public, anon;
grant execute on function public.intl_send(text, text, text, numeric, jsonb, text, uuid) to authenticated;
revoke all on function public.set_my_phone(text) from public, anon; grant execute on function public.set_my_phone(text) to authenticated;
revoke all on function public.admin_stats() from public, anon; grant execute on function public.admin_stats() to authenticated;
revoke all on function public.admin_recent_users(integer) from public, anon; grant execute on function public.admin_recent_users(integer) to authenticated;
revoke all on function public.admin_set_signup_bonus(numeric) from public, anon; grant execute on function public.admin_set_signup_bonus(numeric) to authenticated;
