import { createAnthropicProvider,createCoordinator } from './agents.mjs';
const key=process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
const model=process.env.SANAD_AI_MODEL;
try {
  let raw=''; for await (const chunk of process.stdin) { raw+=chunk; if(raw.length>8192)throw new Error('input_too_large'); }
  const input=JSON.parse(raw||'{}');
  const coordinator=createCoordinator({provider:createAnthropicProvider({apiKey:key,model})});
  const result=input.mode==='support' ? await coordinator.support(input.message,input.lang) : await coordinator.review(input.metrics);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
} catch(e) { process.stderr.write(String(e.message||'agent_error')+'\n');process.exitCode=1; }
