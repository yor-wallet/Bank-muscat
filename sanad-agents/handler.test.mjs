import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import { createHandler, LIMITS } from '../supabase/functions/sanad-agents/handler.mjs';
import { CANNED } from './agents.mjs';

const USER = { id: 'u1', role: 'user', status: 'ACTIVE' }, ADMIN = { id: 'a1', role: 'admin', status: 'ACTIVE' };
function setup(over = {}) {
  const logs = [], calls = [];
  const deps = {
    getUser: async jwt => ({ user: USER, admin: ADMIN, off: { ...USER, status: 'BLOCKED' } }[jwt] || null),
    countRecent: async () => 0, writeLog: async r => { logs.push(r); },
    loadAggregates: async () => ({ requests: 10, errorsCount: 1, usersCount: 5, latencyMs: 300, errors: ['PROVIDER_ERROR'], queues: { kyc: 2, withdrawals: 0 } }),
    provider: async x => { calls.push(x); return 'Open History to find your receipts.'; }, now: () => 1_700_000_000_000, ...over
  };
  const h = createHandler(deps);
  const post = (body, jwt = 'user') => h(new Request('https://x.test/f', { method: 'POST', headers: jwt ? { authorization: 'Bearer ' + jwt, 'content-type': 'application/json' } : {}, body: JSON.stringify(body) }));
  return { h, post, logs, calls };
}
const j = async r => ({ s: r.status, b: await r.json() });

test('transport and identity checks', async () => {
  const { h, post } = setup();
  assert.equal((await h(new Request('https://x.test/f', { method: 'GET' }))).status, 405);
  assert.equal((await h(new Request('https://x.test/f', { method: 'OPTIONS' }))).status, 200);
  assert.equal((await post({ mode: 'support', message: 'hi' }, null)).status, 401);
  assert.equal((await post({ mode: 'support', message: 'hi' }, 'nope')).status, 401);
  assert.equal((await post({ mode: 'support', message: 'hi' }, 'off')).status, 403);
  assert.equal((await post({ mode: 'other' })).status, 400);
});
test('review is reserved to active administrators', async () => {
  const { post, calls } = setup();
  assert.deepEqual(await j(await post({ mode: 'review' }, 'user')), { s: 403, b: { error: 'admin_only' } });
  const r = await j(await post({ mode: 'review' }, 'admin')); assert.equal(r.s, 200); assert.equal(r.b.requiresHumanReview, true); assert.equal(Object.keys(r.b.agents).length, 5);
  assert.equal(calls.length, 5);
});
test('status: administrators only, tells whether the AI is configured, calls no model and writes no journal', async () => {
  let s = setup(); assert.deepEqual(await j(await s.post({ mode: 'status' }, 'user')), { s: 403, b: { error: 'admin_only' } });
  let r = await j(await s.post({ mode: 'status' }, 'admin')); assert.deepEqual([r.s, r.b.configured, r.b.roles], [200, true, ['support', 'data', 'supervision', 'diagnostics', 'maintenance']]); assert.equal(s.calls.length, 0); assert.equal(s.logs.length, 0);
  s = setup({ provider: undefined }); r = await j(await s.post({ mode: 'status' }, 'admin')); assert.deepEqual([r.s, r.b.configured], [200, false]);
});
test('quota: limit reached -> 429, journal unavailable -> 503 (fail closed, no model call)', async () => {
  let s = setup({ countRecent: async () => LIMITS.support }); assert.equal((await s.post({ mode: 'support', message: 'hello' })).status, 429); assert.equal(s.calls.length, 0);
  s = setup({ countRecent: async () => { throw new Error('down'); } }); assert.equal((await s.post({ mode: 'support', message: 'hello' })).status, 503); assert.equal(s.calls.length, 0);
});
test('support answers a normal question and journals without the message content', async () => {
  const { post, logs } = setup(); const r = await j(await post({ mode: 'support', message: 'How do I see my receipts?', lang: 'en' }));
  assert.deepEqual([r.s, r.b.ok, r.b.code, r.b.handoff], [200, true, 'answered', false]);
  assert.equal(logs.length, 1); assert.deepEqual(Object.keys(logs[0]).sort(), ['chars', 'lang', 'latency_ms', 'mode', 'outcome', 'user_id']); assert.equal(JSON.stringify(logs).includes('receipts'), false);
});
test('urgent and sensitive messages are answered with fixed text, hand off to a person and work even without an AI key', async () => {
  const { post, calls, logs } = setup({ provider: undefined });
  let r = await j(await post({ mode: 'support', message: 'my account was hacked', lang: 'en' })); assert.deepEqual([r.s, r.b.urgent, r.b.handoff, r.b.text], [200, true, true, CANNED.urgent.en]);
  r = await j(await post({ mode: 'support', message: 'my pin is 1234', lang: 'en' })); assert.deepEqual([r.s, r.b.ok, r.b.code, r.b.handoff], [200, false, 'sensitive_input', true]);
  assert.equal(calls.length, 0); assert.deepEqual(logs.map(l => l.outcome), ['urgent', 'sensitive']);
  r = await j(await post({ mode: 'support', message: 'How do I send money?', lang: 'en' })); assert.deepEqual([r.s, r.b.error], [503, 'ai_not_configured']);
});
test('a failing AI provider yields a fixed message and a handoff, never an invented answer', async () => {
  const { post, logs } = setup({ provider: async () => { throw new Error('ai_provider_unavailable'); } });
  const r = await j(await post({ mode: 'support', message: 'How do I send money?', lang: 'fr' })); assert.deepEqual([r.s, r.b.handoff, r.b.text], [502, true, CANNED.unavailable.fr]); assert.equal(logs[0].outcome, 'provider_error');
});
test('an answer that claims a result is replaced', async () => {
  const { post } = setup({ provider: async () => 'Your transfer has been completed.' });
  const r = await j(await post({ mode: 'support', message: 'did it work?', lang: 'en' })); assert.deepEqual([r.b.code, r.b.handoff, r.b.text], ['guarded', true, CANNED.guarded.en]);
});
test('the Edge entry point has no financial or destructive capability', () => {
  const src = fs.readFileSync(new URL('../supabase/functions/sanad-agents/index.ts', import.meta.url), 'utf8');
  for (const bad of ['.update(', '.delete(', '.upsert(', '.rpc(', 'storage', 'service_role_key:', 'functions.invoke']) assert.equal(src.includes(bad), false, bad);
  const writes = [...src.matchAll(/from\("([a-z_]+)"\)\s*\.insert\(/g)].map(m => m[1]); assert.deepEqual(writes, ['sanad_agent_log']);
  const reads = new Set([...src.matchAll(/(?:from|count)\("([a-z_]+)"/g)].map(m => m[1]));
  assert.deepEqual([...reads].sort(), ['credit_requests', 'investments', 'kyc_submissions', 'profiles', 'sanad_agent_log', 'withdrawal_requests']);
});
test('the migration is append-only and exposes nothing to members', () => {
  const sql = fs.readFileSync(new URL('../supabase/migrations/20261101_sanad_agent_log.sql', import.meta.url), 'utf8');
  assert.match(sql, /enable row level security/); assert.equal(/create policy/i.test(sql), false); assert.match(sql, /before update or delete/); assert.equal(/\bmessage\b|\bbody\b|\bcontent\b/.test(sql.replace(/--.*$/gm, '')), false);
});
