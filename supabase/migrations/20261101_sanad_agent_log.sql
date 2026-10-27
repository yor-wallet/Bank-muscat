-- Sanad Pay — journal d'audit des appels à la fonction `sanad-agents` (assistant Amal + revue d'exploitation).
-- NON APPLIQUÉE automatiquement. À relire et à appliquer par un humain, d'abord sur une base de test.
-- Aucun contenu de message n'est conservé : qui (user_id), quand, quel mode, quel résultat, quelle durée.
-- Ajout seul : aucune policy ne permet de modifier ou supprimer ; seul le rôle de service (fonction Edge) écrit et lit.

create table if not exists public.sanad_agent_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid not null,
  mode        text not null check (mode in ('support', 'review')),
  outcome     text not null check (outcome in ('answered','guarded','urgent','sensitive','empty','not_configured','provider_error','review')),
  lang        text check (lang in ('ar','en','fr')),
  chars       integer not null default 0 check (chars >= 0),
  latency_ms  integer check (latency_ms >= 0)
);

create index if not exists sanad_agent_log_user_mode_time on public.sanad_agent_log (user_id, mode, created_at desc);
create index if not exists sanad_agent_log_time on public.sanad_agent_log (created_at desc);

alter table public.sanad_agent_log enable row level security;
-- volontairement AUCUNE policy : les rôles anon/authenticated n'ont aucun accès ; le rôle de service contourne la RLS.

create or replace function public.sanad_agent_log_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'sanad_agent_log is append-only';
end $$;

drop trigger if exists sanad_agent_log_no_change on public.sanad_agent_log;
create trigger sanad_agent_log_no_change before update or delete on public.sanad_agent_log
  for each row execute function public.sanad_agent_log_append_only();
