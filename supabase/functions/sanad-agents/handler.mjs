/** Sanad Pay — logique de la fonction Edge `sanad-agents`, sans dépendance à Deno ni à Supabase (tout est injecté : testable sous Node).
 *
 *  mode "support" : un membre connecté pose une question ; réponse = TEXTE (urgence et données sensibles traitées sans appel IA).
 *  mode "review"  : administrateur actif ; les cinq rôles analysent des COMPTEURS agrégés lus côté serveur ; réponse = TEXTE à relire.
 *
 *  Jamais d'écriture sur les soldes, transferts, statuts, comptes, sessions ou sauvegardes. Le seul effet d'écriture est une ligne
 *  d'audit append-only SANS le contenu des messages (qui, quand, quel mode, quel résultat, durée). */
import { createCoordinator, createAnthropicProvider, triage, CANNED } from './core.mjs';

export const LIMITS = Object.freeze({ support: 20, review: 6 });     /* appels par heure et par personne */
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
const LANGS = ['ar', 'en', 'fr'];

/** deps : {
 *    getUser(jwt) -> { id, role, status } | null
 *    countRecent(userId, mode, sinceIso) -> number            (lève une erreur si le journal est indisponible : on refuse, jamais on laisse passer sans quota)
 *    writeLog({ user_id, mode, outcome, lang, chars, latency_ms })
 *    loadAggregates(windowMinutes) -> { requests, errorsCount, usersCount, latencyMs, errors[], queues{} }
 *    provider | { apiKey, model, fetchImpl }                   (clé et modèle : variables d'environnement du serveur)
 *    now() }                                                    */
export function createHandler(deps) {
  const now = deps.now || Date.now;
  const provider = typeof deps.provider === 'function' ? deps.provider : (deps.apiKey && deps.model ? createAnthropicProvider({ apiKey: deps.apiKey, model: deps.model, fetchImpl: deps.fetchImpl }) : null);
  const coordinator = provider ? createCoordinator({ provider }) : null;
  const log = async row => { try { await deps.writeLog(row); } catch { /* le journal ne doit jamais faire échouer la réponse */ } };

  return async function handle(req) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const t0 = now();

    const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!jwt) return json({ error: 'not_signed_in' }, 401);
    let me = null; try { me = await deps.getUser(jwt); } catch { me = null; }
    if (!me || !me.id) return json({ error: 'not_signed_in' }, 401);
    if (me.status !== 'ACTIVE') return json({ error: 'account_inactive' }, 403);

    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode ?? '');
    const lang = LANGS.includes(String(body?.lang)) ? String(body.lang) : 'ar';
    if (mode !== 'support' && mode !== 'review') return json({ error: 'bad_mode' }, 400);
    if (mode === 'review' && me.role !== 'admin') return json({ error: 'admin_only' }, 403);

    /* quota : indisponible = refus (on ne dépense pas de crédit IA sans pouvoir compter) */
    try { if ((await deps.countRecent(me.id, mode, new Date(now() - 3600_000).toISOString())) >= LIMITS[mode]) return json({ error: 'quota' }, 429); }
    catch { return json({ error: 'quota_unavailable' }, 503); }

    /* urgence et donnée sensible n'ont pas besoin du modèle : elles restent disponibles même sans clé IA */
    if (mode === 'support') {
      const message = String(body?.message ?? '');
      const pre = triage(message, lang);
      if (pre) {
        await log({ user_id: me.id, mode, outcome: pre.urgent ? 'urgent' : pre.code === 'empty' ? 'empty' : 'sensitive', lang, chars: message.length, latency_ms: now() - t0 });
        return json({ ok: pre.ok, code: pre.code, urgent: pre.urgent, handoff: pre.handoff, text: pre.text });
      }
      if (!coordinator) { await log({ user_id: me.id, mode, outcome: 'not_configured', lang, chars: message.length, latency_ms: now() - t0 }); return json({ error: 'ai_not_configured' }, 503); }
      try {
        const r = await coordinator.support(message, lang);
        await log({ user_id: me.id, mode, outcome: r.code, lang, chars: message.length, latency_ms: now() - t0 });
        return json({ ok: r.ok, code: r.code, urgent: !!r.urgent, handoff: !!r.handoff, text: r.text ?? '' });
      } catch (e) {
        await log({ user_id: me.id, mode, outcome: 'provider_error', lang, chars: message.length, latency_ms: now() - t0 });
        return json({ error: 'ai_unavailable', text: CANNED.unavailable[lang], handoff: true }, 502);
      }
    }

    /* review : administrateur seulement */
    if (!coordinator) return json({ error: 'ai_not_configured' }, 503);
    try {
      const agg = await deps.loadAggregates(Math.min(1440, Math.max(5, Number(body?.windowMinutes) || 60)));
      const r = await coordinator.review(agg);
      await log({ user_id: me.id, mode, outcome: 'review', lang, chars: 0, latency_ms: now() - t0 });
      return json({ ok: true, agents: r.agents, automaticActions: r.automaticActions, requiresHumanReview: true, metrics: agg });
    } catch (e) {
      await log({ user_id: me.id, mode, outcome: 'provider_error', lang, chars: 0, latency_ms: now() - t0 });
      return json({ error: 'ai_unavailable' }, 502);
    }
  };
}
