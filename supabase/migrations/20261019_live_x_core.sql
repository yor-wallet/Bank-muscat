-- Live X Digitale 16.0.0 — noyau serveur
--  1. récompense de bienvenue (10 OMR) à la confirmation du compte, une seule fois par compte, montant réglable (app_private.signup_bonus_omr, 0 = coupé)
--  2. un seul e-mail « OK » par transfert : l'e-mail « Confirmation de votre transfert … le versement n'est pas encore effectué » n'est plus créé
--  3. alerte à chaque administrateur (notification + e-mail + push) à chaque nouvel inscrit
--  4. plus de compte « West Africa » créé à l'inscription (il n'apparaît plus sur l'accueil)
--  5. nouveau type d'opération SIGNUP_BONUS ; nouveau flux INTL_TRANSFER (retrait 48 h à 72 h) branché sur le moteur de statuts existant

-- ---------- 1. récompense de bienvenue ----------
alter table public.transactions drop constraint if exists transactions_kind_check;
alter table public.transactions add constraint transactions_kind_check check (kind = any (array[
  'FIAT_TRANSFER','CRYPTO_TRANSFER','ADMIN_DEPOSIT','FIAT_EXTERNAL','CRYPTO_BUY','CRYPTO_SELL','CRYPTO_SWAP','CRYPTO_SEND','CRYPTO_TO_BANK','SIGNUP_BONUS']));
create unique index if not exists transactions_one_signup_bonus on public.transactions (receiver_id) where kind = 'SIGNUP_BONUS';

insert into public.app_private (key, value) values ('signup_bonus_omr', '10') on conflict (key) do nothing;
insert into public.app_private (key, value) values ('signup_bonus_from', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) on conflict (key) do nothing;

create or replace function public._grant_signup_bonus(p_user uuid) returns void
language plpgsql security definer set search_path to '' as $f$
declare
  v_txt text; v_amt numeric; v_from timestamptz; p public.profiles; v_tx uuid; v_ref text; v_bal numeric;
begin
  select value into v_txt from public.app_private where key = 'signup_bonus_omr';
  v_amt := case when v_txt is null then 10 else coalesce(nullif(btrim(v_txt), '')::numeric, 0) end;
  if v_amt <= 0 then return; end if;
  select * into p from public.profiles where id = p_user and status = 'ACTIVE';
  if p.id is null then return; end if;
  select nullif(value, '')::timestamptz into v_from from public.app_private where key = 'signup_bonus_from';
  if v_from is not null and p.created_at < v_from then return; end if;           -- jamais rétroactif : seulement les comptes créés après la mise en service
  if exists (select 1 from public.transactions where kind = 'SIGNUP_BONUS' and receiver_id = p.id) then return; end if;
  if exists (select 1 from public.transactions t join public.profiles q on q.id = t.receiver_id
              where t.kind = 'SIGNUP_BONUS' and q.id <> p.id and q.phone = p.phone) then   -- un même numéro ne touche la récompense qu'une fois
    insert into public.audit_log (actor_id, action, target_id, details) values (null, 'SIGNUP_BONUS_SKIPPED', p.id, jsonb_build_object('reason', 'phone_already_rewarded'));
    return;
  end if;
  v_ref := public.new_tx_reference();
  insert into public.transactions (reference, kind, receiver_id, receiver_yor_id, asset, amount, fee, total, status, note, meta)
    values (v_ref, 'SIGNUP_BONUS', p.id, p.yor_id, 'OMR', v_amt, 0, v_amt, 'CONFIRMED', 'Welcome reward', jsonb_build_object('reward', true, 'source', 'signup'))
    returning id into v_tx;
  v_bal := public._credit_account(p.id, 'OMR', v_amt, v_tx);
  insert into public.notifications (user_id, type, title, message, transaction_id, data)
    values (p.id, 'REWARD', 'Welcome reward', trim(trailing '.' from trim(trailing '0' from v_amt::text)) || ' OMR added to your wallet as a welcome reward', v_tx,
            jsonb_build_object('amount', v_amt, 'currency', 'OMR', 'reference', v_ref, 'kind', 'SIGNUP_BONUS'));
  insert into public.audit_log (actor_id, action, target_id, details) values (null, 'SIGNUP_BONUS', p.id, jsonb_build_object('amount', v_amt, 'currency', 'OMR', 'reference', v_ref));
end $f$;

create or replace function public.trg_signup_bonus() returns trigger
language plpgsql security definer set search_path to '' as $f$
begin
  if new.email_confirmed_at is not null and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    begin perform public._grant_signup_bonus(new.id);
    exception when others then raise warning 'signup bonus failed: %', sqlerrm; end;   -- une erreur ici ne doit JAMAIS empêcher l'inscription
  end if;
  return new;
end $f$;
drop trigger if exists on_signup_bonus on auth.users;
create trigger on_signup_bonus after insert or update of email_confirmed_at on auth.users for each row execute function public.trg_signup_bonus();   -- après on_auth_user_created (ordre alphabétique) : profil et comptes existent déjà

-- ---------- 2. un seul e-mail « OK » ----------
do $m$
declare d text; v_start int; v_rel int; v_cut int;
begin
  -- e-mail « Confirmation de votre transfert … le versement n'est pas encore effectué » : retiré (un seul e-mail « OK » reste : TX_SENDER)
  d := pg_get_functiondef('public.enqueue_recipient_notices(uuid)'::regprocedure);
  v_start := strpos(d, E'      if v_sp.status = ''ACTIVE''');
  if v_start = 0 then raise exception 'patch enqueue_recipient_notices: début du bloc introuvable'; end if;
  v_rel := strpos(substr(d, v_start), E'\n      end if;');
  if v_rel = 0 then raise exception 'patch enqueue_recipient_notices: fin du bloc introuvable'; end if;
  v_cut := v_start + v_rel - 1 + length(E'\n      end if;');
  d := substr(d, 1, v_start - 1) || substr(d, v_cut + 1);
  if d like '%''EMAIL'', ''SENDER''%' then raise exception 'patch enqueue_recipient_notices: bloc encore présent'; end if;
  execute d;
  d := pg_get_functiondef('public.enqueue_tx_emails(uuid)'::regprocedure);
  d := replace(d, 'if t.id is null or t.status not in', E'if t.kind = ''SIGNUP_BONUS'' then return; end if;\n  if t.id is null or t.status not in');
  if d not like '%SIGNUP_BONUS%' then raise exception 'patch enqueue_tx_emails'; end if;
  execute d;
  d := pg_get_functiondef('public.handle_new_user()'::regprocedure);
  d := replace(d, E'(new.id, ''MAIN'', ''Main OMR'', ''OMR'', ''OM''), (new.id, ''WEST_AFRICA'', ''West Africa'', ''XOF'', ''CI'');', E'(new.id, ''MAIN'', ''Main OMR'', ''OMR'', ''OM'');');
  if d like '%WEST_AFRICA%' then raise exception 'patch handle_new_user'; end if;
  -- monnaie d'affichage de base : le dollar (USD) pour les nouveaux comptes ; la personne peut en changer dans les réglages (les comptes existants gardent leur choix)
  d := replace(d, '"primaryCurrency":"OMR"', '"primaryCurrency":"USD"');
  if d not like '%"primaryCurrency":"USD"%' then raise exception 'patch handle_new_user primaryCurrency'; end if;
  execute d;
  d := pg_get_functiondef('public._push_on_notification()'::regprocedure);
  d := replace(d, $s$('TRANSFER_SENT', 'TRANSFER_RECEIVED', 'DEPOSIT')$s$, $s$('TRANSFER_SENT', 'TRANSFER_RECEIVED', 'DEPOSIT', 'REWARD', 'NEW_USER')$s$);
  if d not like '%NEW_USER%' then raise exception 'patch _push_on_notification'; end if;
  execute d;
end $m$;
update public.recipient_notices set status = 'SKIPPED', error_message = 'sender_email_removed' where audience = 'SENDER' and channel = 'EMAIL' and status in ('PENDING', 'FAILED', 'SENDING');

-- ---------- 3. alerte administrateurs à chaque nouvel inscrit ----------
create or replace function public.trg_notify_admins_new_user() returns trigger
language plpgsql security definer set search_path to '' as $f$
declare a record; v_name text;
begin
  v_name := coalesce(nullif(btrim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, '')), ''), new.yor_id);
  for a in select id, email from public.profiles where role = 'admin' and status = 'ACTIVE' and id <> new.id loop
    insert into public.notifications (user_id, type, title, message, data)
      values (a.id, 'NEW_USER', 'New member', v_name || ' · ' || coalesce(new.phone, '') || ' · ' || coalesce(new.country, ''),
              jsonb_build_object('yor_id', new.yor_id, 'name', v_name, 'phone', new.phone, 'country', new.country));
    if nullif(btrim(coalesce(a.email, '')), '') is not null then
      insert into public.email_logs (user_id, email_type, recipient_email, idempotency_key, payload)
        values (a.id, 'ADMIN_NEW_USER', a.email, 'newuser:' || new.id || ':' || a.id,
                jsonb_build_object('name', v_name, 'phone', new.phone, 'country', new.country, 'email', new.email, 'yor_id', new.yor_id, 'at', now()))
        on conflict (idempotency_key) do nothing;
    end if;
  end loop;
  return new;
exception when others then
  raise warning 'notify admins new user failed: %', sqlerrm;
  return new;
end $f$;
drop trigger if exists profiles_notify_admins on public.profiles;
create trigger profiles_notify_admins after insert on public.profiles for each row execute function public.trg_notify_admins_new_user();

-- ---------- historique : la récompense est une entrée ----------
create or replace function public.my_transactions(p_limit integer default 200)
returns table(id uuid, reference text, kind text, direction text, asset text, network text, amount numeric, fee numeric, total numeric, status text, note text, meta jsonb,
              counterparty_yor_id text, counterparty_name text, created_at timestamp with time zone)
language sql stable security definer set search_path to '' as $f$
  select t.id, t.reference, t.kind,
         case when t.kind in ('ADMIN_DEPOSIT', 'SIGNUP_BONUS') then 'IN'
              when t.sender_id = (select auth.uid()) then 'OUT' else 'IN' end,
         t.asset, t.network, t.amount, t.fee, t.total, t.status, t.note, t.meta,
         case when t.kind in ('FIAT_TRANSFER','CRYPTO_TRANSFER') then
                (case when t.sender_id = (select auth.uid()) then t.receiver_yor_id else t.sender_yor_id end) end,
         case when t.kind in ('ADMIN_DEPOSIT', 'SIGNUP_BONUS') then 'Live X Digitale'
              when t.kind in ('FIAT_TRANSFER','CRYPTO_TRANSFER') then coalesce(nullif(btrim(cp.first_name || ' ' || cp.last_name), ''), cp.yor_id) end,
         t.created_at
  from public.transactions t
  left join public.profiles cp
    on cp.id = case when t.sender_id = (select auth.uid()) then t.receiver_id else t.sender_id end
  where (t.sender_id = (select auth.uid()) or t.receiver_id = (select auth.uid()))
  order by t.created_at desc
  limit least(greatest(coalesce(p_limit, 200), 1), 500);
$f$;

revoke all on function public._grant_signup_bonus(uuid) from public, anon, authenticated;
revoke all on function public.trg_signup_bonus() from public, anon, authenticated;
revoke all on function public.trg_notify_admins_new_user() from public, anon, authenticated;
