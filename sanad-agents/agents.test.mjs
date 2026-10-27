import test from 'node:test';import assert from 'node:assert/strict';
import {AGENTS,EphemeralCache,createCoordinator,createAnthropicProvider} from './agents.mjs';
test('five agents coordinate in a fixed order with only allowed aggregates',async()=>{
  const calls=[];const c=createCoordinator({provider:async x=>{calls.push(x);return 'ok '+x.role}});
  const r=await c.review({requests:12,errorsCount:1,usersCount:3,latencyMs:180,errors:['NETWORK'],privateData:'never send me',balances:[1234]});
  assert.deepEqual(Object.keys(AGENTS),['support','data','supervision','diagnostics','maintenance']);
  assert.deepEqual(calls.map(x=>x.role),['data','supervision','diagnostics','maintenance','support']);
  assert.equal(r.requiresHumanReview,true);assert.equal(JSON.stringify(calls.map(x=>x.input)).includes('never send me'),false);assert.equal(JSON.stringify(calls.map(x=>x.input)).includes('balances'),false);
});
test('support blocks common sensitive input before invoking the provider',async()=>{
  let calls=0;const c=createCoordinator({provider:async()=>{calls++;return 'response'}});
  for(const input of ['email user@example.com','my code otp: 123456','OM12 1234567890123456']) assert.equal((await c.support(input)).code,'sensitive_input');
  assert.equal(calls,0);assert.equal((await c.support('كيف أحوّل؟')).ok,true);assert.equal(calls,1);
});
test('cache cleanup only touches its own expired entries',()=>{
  const c=new EphemeralCache();c.put('old','value',100,0);c.put('current','value',500,0);
  assert.deepEqual(c.sweep(200),{removed:1,remaining:1});assert.equal(c.get('current',200),'value');assert.throws(()=>c.put('../unsafe','x',100));
});
test('provider requires explicit credentials and model',()=>{assert.throws(()=>createAnthropicProvider({}),/ai_not_configured/)});
test('provider reports remote errors without exposing details',async()=>{
  const p=createAnthropicProvider({apiKey:'fake',model:'fake',fetchImpl:async()=>({ok:false,status:500})});
  await assert.rejects(()=>p({system:'x',input:'x'}),/ai_provider_unavailable/);
});
