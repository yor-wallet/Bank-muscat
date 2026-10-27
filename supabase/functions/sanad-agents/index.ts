import { createClient } from "npm:@supabase/supabase-js@2";
import { createHandler } from "./handler.mjs";

/* ============================================================
   sanad-agents — assistance Amal (membres) et revue d'exploitation par cinq rôles (administrateurs).

   NON DÉPLOYÉE tant qu'un humain ne l'a pas décidé : voir docs/SANAD_AGENTS.md.
   Elle exige la migration supabase/migrations/20261101_sanad_agent_log.sql.

   - lit seulement : profil de l'appelant, compteurs agrégés (jamais de montant, de nom, de solde) ;
   - écrit seulement : une ligne d'audit sans contenu dans public.sanad_agent_log ;
   - la clé et le modèle viennent des variables d'environnement du serveur (AI_API_KEY ou ANTHROPIC_API_KEY, AI_MODEL).
   ============================================================ */

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const count = async (table: string, filter?: (q: any) => any) => {
  let q = sb.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: n, error } = await q;
  return error ? null : (n ?? 0);
};

const handle = createHandler({
  apiKey: (Deno.env.get("AI_API_KEY") ?? Deno.env.get("ANTHROPIC_API_KEY") ?? "").trim(),
  model: (Deno.env.get("AI_MODEL") ?? "claude-sonnet-5-5").trim(),

  async getUser(jwt: string) {
    const { data: u } = await sb.auth.getUser(jwt);
    const id = u?.user?.id;
    if (!id) return null;
    const { data: me } = await sb.from("profiles").select("role,status").eq("id", id).maybeSingle();
    return me ? { id, role: me.role, status: me.status } : null;
  },

  async countRecent(userId: string, mode: string, sinceIso: string) {
    const { count: n, error } = await sb.from("sanad_agent_log").select("id", { count: "exact", head: true })
      .eq("user_id", userId).eq("mode", mode).gte("created_at", sinceIso);
    if (error) throw new Error("log_unavailable");
    return n ?? 0;
  },

  async writeLog(row: Record<string, unknown>) {
    await sb.from("sanad_agent_log").insert(row);
  },

  /* uniquement des NOMBRES : requêtes de l'assistant, erreurs par catégorie, latence moyenne, dossiers en attente */
  async loadAggregates(windowMinutes: number) {
    const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
    const { data: rows } = await sb.from("sanad_agent_log").select("outcome,latency_ms").gte("created_at", since).limit(5000);
    const list = rows ?? [];
    const errs = list.filter((r: any) => r.outcome === "provider_error" || r.outcome === "not_configured");
    const lat = list.map((r: any) => Number(r.latency_ms)).filter((n: number) => Number.isFinite(n) && n >= 0);
    const cat: Record<string, number> = {};
    for (const r of errs) cat[String(r.outcome).toUpperCase()] = (cat[String(r.outcome).toUpperCase()] ?? 0) + 1;
    return {
      windowMinutes,
      requests: list.length,
      errorsCount: errs.length,
      usersCount: await count("profiles", (q) => q.eq("status", "ACTIVE")),
      latencyMs: lat.length ? Math.round(lat.reduce((a: number, b: number) => a + b, 0) / lat.length) : 0,
      errors: Object.keys(cat),
      queues: {
        kyc: await count("kyc_submissions", (q) => q.eq("status", "PENDING")),
        withdrawals: await count("withdrawal_requests", (q) => q.in("status", ["PENDING", "REVIEW"])),
        investments: await count("investments", (q) => q.in("status", ["PENDING", "RECEIPT_SUBMITTED"])),
        credit: await count("credit_requests", (q) => q.eq("status", "PENDING")),
      },
    };
  },
});

Deno.serve(handle);
